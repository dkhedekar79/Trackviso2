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
    // Use Llama 3 8B Instruct - much better for instruction following and question generation
    const PRIMARY_MODEL = process.env.HUGGINGFACE_MODEL_ID || 'meta-llama/Meta-Llama-3-8B-Instruct';
    const FALLBACK_MODELS = [
      'meta-llama/Meta-Llama-3-8B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.2',
      'google/flan-t5-xxl',
    ];
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY environment variable.' });
    }

    // Step 1: Search the web for current information about the topic
    let webSearchResults = '';
    if (TAVILY_API_KEY) {
      try {
        // Multiple targeted searches for better results
        const searchQueries = [
          `"${examBoard}" "${qualification}" "${subject}" "${topic}" specification content`,
          `"${examBoard}" "${qualification}" "${subject}" "${topic}" study guide notes`,
          `${qualification} ${subject} ${topic} ${examBoard} revision notes`,
          `${examBoard} ${qualification} ${subject} ${topic} exam content`,
        ];
        
        let allResults = [];
        
        for (const searchQuery of searchQueries) {
          try {
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
                include_answer: true,
              }),
            });

            if (tavilyResponse.ok) {
              const tavilyData = await tavilyResponse.json();
              
              // Use Tavily's AI-generated answer if available
              if (tavilyData.answer) {
                webSearchResults += `\n\nAI Summary: ${tavilyData.answer}\n\n`;
              }
              
              if (tavilyData.results && tavilyData.results.length > 0) {
                const results = tavilyData.results.map((result, idx) => 
                  `${idx + 1}. ${result.title}\nURL: ${result.url}\n${result.content.substring(0, 600)}`
                );
                allResults.push(...results);
              }
            }
          } catch (searchError) {
            console.error('Web search error for query:', searchQuery, searchError);
            // Continue with next search
          }
        }
        
        // Combine all results, remove duplicates
        webSearchResults += allResults
          .filter((v, i, a) => a.indexOf(v) === i)
          .join('\n\n');
          
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without web search if it fails
      }
    }

    // Step 2: Generate comprehensive notes using HuggingFace
    // Determine if this is GCSE/grade 9 level (age 13-14)
    const isGrade9Level = qualification === 'GCSE' || qualification?.toLowerCase().includes('gcse') || 
                          qualification?.toLowerCase().includes('grade 9') || 
                          qualification?.toLowerCase().includes('year 9');
    
    const prompt = `You are an expert educational tutor specializing in ${qualification} level ${subject}. Create multiple practice questions using ONLY the information from the web search results below.

${webSearchResults ? `WEB SEARCH RESULTS (USE THIS INFORMATION):\n${webSearchResults}\n\n` : 'WARNING: No web search results available. Use your knowledge but note that information may not be current.\n\n'}CRITICAL INSTRUCTIONS:
1. Base your questions PRIMARILY on the web search results above
2. Use accurate information from official sources and exam board specifications
3. Create practice questions that test understanding of the actual content
${isGrade9Level ? '4. IMPORTANT: All content must be appropriate for Grade 9/GCSE level (age 13-14). Use clear, straightforward language. Questions should test core concepts without being overly complex.' : ''}

Create practice questions for:

Topic: ${topic}
Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}
${isGrade9Level ? 'Target Level: Grade 9 / GCSE (age 13-14)' : ''}

Please provide the response as a valid JSON object with this EXACT structure (respond ONLY with valid JSON, no markdown, no extra text):
{
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
- Include at least 6-8 practice questions with multiple choice options
${isGrade9Level ? '- Questions MUST be appropriate for Grade 9/GCSE level: clear, straightforward, testing core concepts, using age-appropriate language (age 13-14)' : ''}
${isGrade9Level ? '- Each question should test ONE key concept clearly - avoid overly complex or multi-part questions' : ''}
${isGrade9Level ? '- Use simple, direct language in questions - avoid unnecessary jargon or complex phrasing' : ''}
- Make the content accurate, clear, and suitable for exam preparation
- Base content on official specifications and syllabus
- Questions should test actual understanding of the topic content, not generic knowledge

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
        
        // For Llama 3 Instruct and other chat models, use chat format
        const isChatModel = MODEL_ID.includes('llama') || MODEL_ID.includes('instruct') || MODEL_ID.includes('chat');
        
        const requestBody = isChatModel ? {
          inputs: [
            {
              role: 'user',
              content: prompt
            }
          ],
          parameters: {
            max_new_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
            do_sample: true,
          },
          options: {
            wait_for_model: true,
          },
        } : {
          inputs: prompt,
          parameters: {
            max_new_tokens: 3000,
            temperature: 0.7,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        };
        
        const hfResponse = await fetch(hfApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HF_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
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
        practiceQuestions: fallbackNotes.practiceQuestions,
        fallback: true,
        message: 'Note: Using example questions structure. HuggingFace API is currently unavailable. Please check your API key or try again later.'
      });
    }
    
    // Handle HuggingFace response format (array of objects with generated_text)
    // For chat models, response might be in different format
    let content = '';
    if (Array.isArray(hfData) && hfData.length > 0) {
      // Check for chat response format first
      if (hfData[0]?.generated_text) {
        content = hfData[0].generated_text;
      } else if (hfData[0]?.message?.content) {
        content = hfData[0].message.content;
      } else if (typeof hfData[0] === 'string') {
        content = hfData[0];
      } else {
        content = hfData[0]?.summary || JSON.stringify(hfData[0]);
      }
    } else if (hfData.generated_text) {
      content = hfData.generated_text;
    } else if (hfData.message?.content) {
      content = hfData.message.content;
    } else if (typeof hfData === 'string') {
      content = hfData;
    } else if (hfData.choices && hfData.choices[0]?.message?.content) {
      content = hfData.choices[0].message.content;
    }

    if (!content || content.trim().length === 0) {
      throw new Error('No response from HuggingFace API. The model may still be loading. Please try again in a moment.');
    }

    console.log('Raw content from HuggingFace API:', content.substring(0, 1000)); // Log first 1000 chars
    // Parse the JSON response - HuggingFace may include the prompt, so extract JSON
    let questions;
    try {
      // Try to extract JSON object from the response (HuggingFace may include prompt)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Try direct parse if no match found
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content.substring(0, 500));
      throw new Error('Could not parse questions from response. The model response may be invalid.');
    }

    // Validate required fields
    if (!questions.practiceQuestions) {
      throw new Error('Invalid questions structure received');
    }

    // Ensure arrays exist
    questions.practiceQuestions = questions.practiceQuestions || [];

    return res.status(200).json({ practiceQuestions: questions.practiceQuestions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate questions',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
