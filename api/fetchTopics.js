// Fallback function to generate example topics when HuggingFace is unavailable
function generateFallbackTopics(qualification, subject, examBoard) {
  // Common topics by qualification level
  const topicsByLevel = {
    'GCSE': [
      'Introduction to the Subject',
      'Core Concepts and Fundamentals',
      'Key Skills and Techniques',
      'Applications and Real-World Examples',
      'Analysis and Evaluation',
      'Revision and Exam Preparation',
    ],
    'A-Level': [
      'Advanced Concepts',
      'Theoretical Frameworks',
      'Critical Analysis',
      'Research Methods',
      'Case Studies',
      'Extended Writing',
      'Independent Study Skills',
    ],
    'IB': [
      'Core Topics',
      'Higher Level Extensions',
      'Internal Assessment',
      'Extended Essay',
      'Theory of Knowledge Connections',
      'International Perspectives',
    ],
    'AP': [
      'Course Content Overview',
      'Essential Knowledge',
      'Skills and Practices',
      'Exam Format and Strategies',
      'Sample Questions',
    ],
  };
  
  // Subject-specific topics
  const subjectTopics = {
    'Mathematics': ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Number Theory'],
    'Science': ['Scientific Method', 'Experiments', 'Data Analysis', 'Theories', 'Applications'],
    'English': ['Literature Analysis', 'Writing Skills', 'Language Study', 'Creative Writing'],
    'History': ['Historical Events', 'Source Analysis', 'Essay Writing', 'Historical Context'],
  };
  
  // Combine qualification and subject topics
  const baseTopics = topicsByLevel[qualification] || topicsByLevel['GCSE'];
  const specificTopics = subjectTopics[subject] || [];
  
  return [...baseTopics, ...specificTopics].slice(0, 12);
}

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
    const { qualification, subject, examBoard } = body;

    if (!qualification || !subject || !examBoard) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Use HuggingFace API with web search for accurate topic generation
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
    
    // Log for debugging (don't log the full key)
    console.log('API Key check:', {
      hasKey: !!HF_API_KEY,
      keyLength: HF_API_KEY ? HF_API_KEY.length : 0,
      keyPrefix: HF_API_KEY ? HF_API_KEY.substring(0, 5) : 'none',
      envVars: {
        HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
        VITE_HUGGINGFACE_API_KEY: !!process.env.VITE_HUGGINGFACE_API_KEY
      }
    });
    // Try multiple models - use basic models that should be available
    // Note: HuggingFace free tier has limited models available
    const PRIMARY_MODEL = process.env.HUGGINGFACE_MODEL_ID || 'gpt2';
    const FALLBACK_MODELS = [
      'gpt2',  // OpenAI's GPT-2 - most basic, should work
      'distilgpt2',  // Distilled version
    ];
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY environment variable.' });
    }
    
    // Validate API key format
    if (!HF_API_KEY.startsWith('hf_')) {
      console.warn('Warning: HuggingFace API key should start with "hf_". Current key starts with:', HF_API_KEY.substring(0, 3));
    }

    // Step 1: Search the web for current specification and topics
    let webSearchResults = '';
    let specificationTopics = [];
    
    if (TAVILY_API_KEY) {
      try {
        // Search for official specification documents - multiple targeted searches
        const searchQueries = [
          `"${examBoard}" "${qualification}" "${subject}" specification "at a glance" topics`,
          `"${examBoard}" "${qualification}" "${subject}" specification overview topics list`,
          `"${examBoard}" "${qualification}" "${subject}" syllabus content topics`,
          `site:${examBoard.toLowerCase()}.org.uk ${qualification} ${subject} specification topics`,
          `${examBoard} ${qualification} ${subject} specification document topics`,
        ];
        
        // Try multiple searches to find the best results
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
                max_results: 8,
                include_answer: true,
                include_raw_content: false,
              }),
            });

            if (tavilyResponse.ok) {
              const tavilyData = await tavilyResponse.json();
              
              // Use the answer if available (Tavily's AI-generated summary)
              if (tavilyData.answer) {
                webSearchResults += `\n\nAnswer: ${tavilyData.answer}\n\n`;
              }
              
              if (tavilyData.results && tavilyData.results.length > 0) {
                const results = tavilyData.results
                  .map((result, idx) => {
                    const content = result.content || '';
                    
                    // Extract topics from content - look for various patterns
                    // Pattern 1: Numbered lists (1. Topic, 2. Topic, etc.)
                    const numberedTopics = content.match(/(?:^|\n)\s*\d+[\.\)]\s*([A-Z][^\n]{10,100}?)(?=\n|$)/g);
                    if (numberedTopics && numberedTopics.length > 2) {
                      specificationTopics.push(...numberedTopics.map(t => t.replace(/^\s*\d+[\.\)]\s*/, '').trim()));
                    }
                    
                    // Pattern 2: Bullet points (- Topic, * Topic, • Topic)
                    const bulletTopics = content.match(/(?:^|\n)\s*[-*•]\s*([A-Z][^\n]{10,100}?)(?=\n|$)/g);
                    if (bulletTopics && bulletTopics.length > 2) {
                      specificationTopics.push(...bulletTopics.map(t => t.replace(/^\s*[-*•]\s*/, '').trim()));
                    }
                    
                    // Pattern 3: Lines that look like topics (capitalized, reasonable length)
                    const topicLines = content.split('\n')
                      .filter(line => {
                        const trimmed = line.trim();
                        return trimmed.length > 10 && 
                               trimmed.length < 100 && 
                               /^[A-Z]/.test(trimmed) &&
                               !trimmed.includes('http') &&
                               !trimmed.includes('www.');
                      })
                      .slice(0, 20);
                    
                    if (topicLines.length > 3) {
                      specificationTopics.push(...topicLines.map(t => t.trim()));
                    }
                    
                    return `${idx + 1}. ${result.title}\nURL: ${result.url}\n${content.substring(0, 800)}`;
                  })
                  .join('\n\n');
                
                webSearchResults += results;
              }
            }
          } catch (searchError) {
            console.error('Web search error for query:', searchQuery, searchError);
            // Continue with next search
          }
        }
        
        // Remove duplicates from specification topics
        specificationTopics = [...new Set(specificationTopics)].slice(0, 30);
        
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without web search if it fails
      }
    }

    // Step 2: Generate topics using HuggingFace with web search results
    // If we found topics directly in search results, use those
    if (specificationTopics.length >= 5) {
      console.log('Found topics directly from web search, using those');
      return res.status(200).json({ 
        topics: specificationTopics.slice(0, 30),
        source: 'web_search'
      });
    }
    
    let prompt = '';
    
    if (webSearchResults) {
      prompt = `You are a specification extraction assistant. Your ONLY job is to extract the EXACT topic names from the official ${examBoard} ${qualification} ${subject} specification documents provided below.

WEB SEARCH RESULTS FROM OFFICIAL SPECIFICATIONS:
${webSearchResults}

YOUR TASK:
1. Read the web search results above carefully
2. Find the section that lists topics (look for "Specification at a Glance", "Topics", "Content", "Syllabus", etc.)
3. Extract ONLY the exact topic names as they appear in the specification
4. Do NOT create, invent, or guess topics
5. Do NOT use generic topics - only use what's actually in the specification
6. If you see a numbered list or bullet list of topics, extract those EXACTLY

Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Return ONLY a JSON object with this structure:
{
  "topics": ["Topic 1 exactly as written", "Topic 2 exactly as written", ...]
}

CRITICAL: If the web search results do not contain a clear list of topics, return an empty array: {"topics": []}
Do NOT make up topics. Only extract what is actually written in the specification documents above.
Respond ONLY with the JSON object, no other text.`;
    } else {
      // If no web search, we can't get accurate topics - use fallback
      console.log('No web search results available, using fallback topics');
      const fallbackTopics = generateFallbackTopics(qualification, subject, examBoard);
      return res.status(200).json({ 
        topics: fallbackTopics,
        fallback: true,
        message: 'Web search is required for accurate specification topics. Please ensure TAVILY_API_KEY is set.'
      });
    }

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
              max_new_tokens: 1000,
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
          
          // Handle authentication errors
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
    
    // If all models failed, provide helpful error with fallback
    if (!hfData) {
      const errorMsg = lastError?.message || 'Unknown error';
      
      // If even gpt2 failed, the API might not be accessible
      if (errorMsg.includes('410') || errorMsg.includes('no longer available')) {
        console.error('All HuggingFace models returned 410. Free tier may have limited model access.');
        
        // Provide fallback topics so app still works
        const exampleTopics = generateFallbackTopics(qualification, subject, examBoard);
        
        return res.status(200).json({ 
          topics: exampleTopics,
          fallback: true,
          warning: 'HuggingFace Inference API models are not available on the free tier. Using example topics. To use AI-generated topics, consider upgrading your HuggingFace account or using a different AI service.'
        });
      }
      
      throw new Error(`All HuggingFace models failed: ${errorMsg}. Please verify your API key is valid and has Inference API access.`);
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
    let topics;
    try {
      // First, try to extract JSON object from the response (HuggingFace may include prompt)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        topics = parsed.topics || parsed.topics_list;
      } else {
        // Try to extract JSON array directly
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          topics = JSON.parse(arrayMatch[0]);
        } else {
          // Try direct parse if no match found
          const parsed = JSON.parse(content);
          topics = parsed.topics || parsed.topics_list;
        }
      }
      
      // Fallback: try to extract array if structure is different
      if (!Array.isArray(topics)) {
        // Last resort: look for any array in the object
        const values = Object.values(JSON.parse(jsonMatch ? jsonMatch[0] : content));
        topics = values.find(v => Array.isArray(v));
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content received:', content.substring(0, 500));
      
      // Final fallback: try to extract array from text
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          topics = JSON.parse(arrayMatch[0]);
        } catch (e) {
          throw new Error('Could not parse topics from response. The model response may be invalid.');
        }
      } else {
        throw new Error('Could not parse topics from response. The model response may be invalid.');
      }
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('No topics found in response');
    }

    return res.status(200).json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch topics',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
