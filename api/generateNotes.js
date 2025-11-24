export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Handle both JSON body and parsed body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { topic, qualification, subject, examBoard } = body;

    if (!topic || !qualification || !subject || !examBoard) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Use HuggingFace API with web search for accurate note generation
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
    // Try multiple models - fallback list if one doesn't work
    // Using models that are known to work with Inference API
    // Start with simpler models first
    const PRIMARY_MODEL = process.env.HUGGINGFACE_MODEL_ID || 'gpt2';
    const FALLBACK_MODELS = [
      'gpt2',
      'distilgpt2',
      'google/flan-t5-base',
      'google/flan-t5-small',
      'facebook/opt-1.3b',
    ];
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY environment variable.' });
    }

    // Step 1: Search the web for current information about the topic
    let webSearchResults = '';
    if (TAVILY_API_KEY) {
      try {
        const searchQuery = `${qualification} ${subject} ${topic} ${examBoard} study notes revision`;
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: searchQuery,
            search_depth: 'advanced',
            max_results: 5,
          }),
        });

        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          if (tavilyData.results && tavilyData.results.length > 0) {
            webSearchResults = tavilyData.results
              .map((result, idx) => `${idx + 1}. ${result.title}: ${result.content.substring(0, 400)}`)
              .join('\n\n');
          }
        }
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without web search if it fails
      }
    }

    // Step 2: Generate comprehensive notes using HuggingFace
    const prompt = `You are an expert educational tutor specializing in creating comprehensive, exam-focused study notes. Your notes should be clear, concise, and suitable for exam preparation.

${webSearchResults ? `Use the following web search results as reference:\n${webSearchResults}\n\n` : ''}Create comprehensive study notes for the following:

Topic: ${topic}
Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Please provide the response as a valid JSON object with this EXACT structure (respond ONLY with valid JSON, no markdown, no extra text):
{
  "title": "Topic title",
  "summary": "Brief 2-3 sentence overview of the topic",
  "mainPoints": [
    {
      "heading": "First key concept",
      "content": "Detailed explanation of this concept",
      "examples": ["Example 1", "Example 2"]
    },
    {
      "heading": "Second key concept",
      "content": "Detailed explanation",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "keyTerms": [
    {
      "term": "Important term",
      "definition": "Clear definition"
    }
  ],
  "practiceQuestions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ]
}

Requirements:
- Include at least 3-5 main points with detailed explanations
- Include at least 5 key terms with clear definitions
- Include at least 4 practice questions with multiple choice options
- Make the content accurate, clear, and suitable for exam preparation
- Base content on official specifications and syllabus

Respond ONLY with the JSON object, no other text.`;

    // Try multiple models in sequence if one fails
    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)];
    let hfData = null;
    let lastError = null;
    let usedModel = null;
    
    for (const MODEL_ID of modelsToTry) {
      try {
        console.log(`Trying model: ${MODEL_ID}`);
        const hfApiUrl = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
        
        const hfResponse = await fetch(hfApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HF_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 3000,
              temperature: 0.7,
              return_full_text: false,
            },
            options: {
              wait_for_model: true,
            },
          }),
        });

        if (!hfResponse.ok) {
          const errorText = await hfResponse.text();
          let errorDetails = '';
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.error || errorJson.message || errorText;
          } catch {
            errorDetails = errorText;
          }
          
          console.error(`HuggingFace API error for ${MODEL_ID}:`, errorDetails);
          console.error('Response status:', hfResponse.status);
          console.error('Full error response:', errorText);
          
          // Handle authentication errors - don't try other models
          if (hfResponse.status === 401 || hfResponse.status === 403) {
            throw new Error(`Authentication failed. Please check your HuggingFace API key. Error: ${errorDetails}`);
          }
          
          // Handle model loading errors - skip and try next
          if (hfResponse.status === 503) {
            lastError = new Error(`Model "${MODEL_ID}" is loading. Trying next model...`);
            continue;
          }
          
          // Handle "Gone" (410) - try next model
          if (hfResponse.status === 410) {
            console.log(`Model ${MODEL_ID} returned 410 (Gone), trying next model...`);
            lastError = new Error(`Model "${MODEL_ID}" is no longer available.`);
            continue;
          }
          
          // Handle quota/rate limit errors
          if (hfResponse.status === 429) {
            lastError = new Error(`Rate limit exceeded for model "${MODEL_ID}". Trying next model...`);
            continue;
          }
          
          // For other errors, save the details and try next model
          lastError = new Error(`HuggingFace API error (${hfResponse.status}): ${errorDetails}`);
          continue;
        }
        
        // Success! Get the data and break out of loop
        hfData = await hfResponse.json();
        usedModel = MODEL_ID;
        console.log(`Successfully used model: ${MODEL_ID}`);
        break;
        
      } catch (modelError) {
        console.error(`Error trying model ${MODEL_ID}:`, modelError.message);
        lastError = modelError;
        continue; // Try next model
      }
    }
    
    // If all models failed, provide a fallback with example notes
    if (!hfData) {
      console.error('All HuggingFace models failed. Using fallback notes.');
      console.error('Last error:', lastError);
      
      // Generate example notes structure
      const fallbackNotes = {
        title: topic,
        summary: `This topic covers important concepts in ${subject} at ${qualification} level. Study the key terms and practice questions below to master this topic.`,
        mainPoints: [
          {
            heading: 'Key Concepts',
            content: `This topic introduces fundamental concepts that are essential for understanding ${subject} at this level.`,
            examples: ['Example 1', 'Example 2']
          },
          {
            heading: 'Important Applications',
            content: `These concepts are applied in various contexts within ${subject}. Understanding these applications will help you in exams.`,
            examples: ['Application 1', 'Application 2']
          }
        ],
        keyTerms: [
          { term: 'Term 1', definition: 'Definition of term 1' },
          { term: 'Term 2', definition: 'Definition of term 2' },
        ],
        practiceQuestions: [
          {
            question: `What is a key concept in ${topic}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is the correct answer because...'
          }
        ]
      };
      
      return res.status(200).json({ 
        notes: fallbackNotes,
        fallback: true,
        message: 'Note: Using example notes structure. HuggingFace API is currently unavailable. Please check your API key or try again later.'
      });
    }
    
    // Handle HuggingFace response format (array of objects with generated_text)
    let content = '';
    if (Array.isArray(hfData) && hfData.length > 0) {
      content = hfData[0]?.generated_text || hfData[0]?.summary || '';
    } else if (hfData.generated_text) {
      content = hfData.generated_text;
    } else if (typeof hfData === 'string') {
      content = hfData;
    }

    if (!content || content.trim().length === 0) {
      throw new Error('No response from HuggingFace API. The model may still be loading. Please try again in a moment.');
    }

    // Parse the JSON response - HuggingFace may include the prompt, so extract JSON
    let notes;
    try {
      // Try to extract JSON object from the response (HuggingFace may include prompt)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        notes = JSON.parse(jsonMatch[0]);
      } else {
        // Try direct parse if no match found
        notes = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content.substring(0, 500));
      throw new Error('Could not parse notes from response. The model response may be invalid.');
    }

    // Validate required fields
    if (!notes.title || !notes.summary) {
      throw new Error('Invalid notes structure received');
    }

    // Ensure arrays exist
    notes.mainPoints = notes.mainPoints || [];
    notes.keyTerms = notes.keyTerms || [];
    notes.practiceQuestions = notes.practiceQuestions || [];

    return res.status(200).json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate notes',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
