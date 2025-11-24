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

    // Step 1: Search the web for "Specification at a Glance" section ONLY
    let webSearchResults = '';
    let specificationAtAGlanceContent = '';
    
    if (TAVILY_API_KEY) {
      try {
        // Focus ONLY on "Specification at a Glance" searches
        const searchQueries = [
          `"${examBoard}" "${qualification}" "${subject}" "specification at a glance"`,
          `"${examBoard}" "${qualification}" "${subject}" specification at a glance topics`,
          `${examBoard} ${qualification} ${subject} specification at a glance PDF`,
        ];
        
        // Collect only results that mention "specification at a glance"
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
                include_raw_content: true,
              }),
            });

            if (tavilyResponse.ok) {
              const tavilyData = await tavilyResponse.json();
              
              if (tavilyData.results && tavilyData.results.length > 0) {
                // Filter results to only include those with "specification at a glance" or similar
                const relevantResults = tavilyData.results.filter(result => {
                  const titleLower = (result.title || '').toLowerCase();
                  const urlLower = (result.url || '').toLowerCase();
                  const contentLower = (result.content || '').toLowerCase();
                  
                  return titleLower.includes('specification at a glance') ||
                         titleLower.includes('specification') && titleLower.includes('glance') ||
                         urlLower.includes('specification') || 
                         contentLower.includes('specification at a glance') ||
                         contentLower.includes('specification') && contentLower.includes('glance');
                });
                
                for (const result of relevantResults) {
                  const content = result.content || '';
                  const title = result.title || '';
                  const url = result.url || '';
                  
                  // Find the "Specification at a Glance" section in the content
                  // Look for the section header and extract until next major section
                  let sectionContent = '';
                  
                  // Try multiple patterns to find the "Specification at a Glance" section
                  const patterns = [
                    /specification\s+at\s+a\s+glance[:\s]*\n([^]*?)(?=\n\s*(?:assessment|content|subject|overview|resources|specification|teaching|assessment objectives|grade|level|paper|\d+\.\s+[A-Z]|$))/i,
                    /specification\s+at\s+a\s+glance[^]*?(?=\n\s*[A-Z]{2,}\s+[A-Z]{2,}|\n\s*\d+\.\s+assessment|\n\s*assessment objectives|$)/i,
                    /at\s+a\s+glance[:\s]*\n([^]*?)(?=\n\n[A-Z][a-z]+\s+[A-Z]|\n\s*assessment|$)/i,
                  ];
                  
                  for (const pattern of patterns) {
                    const match = content.match(pattern);
                    if (match && match[0] && match[0].length > 200) {
                      sectionContent = match[0];
                      break;
                    }
                  }
                  
                  // If no specific section found but title suggests it's the right page
                  if (!sectionContent && (title.toLowerCase().includes('specification at a glance') || 
                                         title.toLowerCase().includes('at a glance') ||
                                         url.toLowerCase().includes('specification') && url.toLowerCase().includes('glance'))) {
                    // Extract content before common section headers
                    const beforeAssessment = content.split(/\n\s*(?:assessment|content overview|subject content|teaching)/i)[0];
                    if (beforeAssessment && beforeAssessment.length > 300) {
                      sectionContent = beforeAssessment.substring(0, 2500);
                    }
                  }
                  
                  if (sectionContent) {
                    specificationAtAGlanceContent += `\n\n=== ${title} ===\nURL: ${url}\n${sectionContent}\n`;
                    
                    // Also add to webSearchResults for AI processing
                    webSearchResults += `\n\n=== ${title} ===\nURL: ${url}\n${sectionContent.substring(0, 1500)}\n`;
                  }
                }
              }
            }
          } catch (searchError) {
            console.error('Web search error for query:', searchQuery, searchError);
            // Continue with next search
          }
        }
        
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without web search if it fails
      }
    }

    // Step 2: Extract topics from "Specification at a Glance" section
    if (!specificationAtAGlanceContent && !webSearchResults) {
      // If no web search, we can't get accurate topics - use fallback
      console.log('No "Specification at a Glance" content found, using fallback topics');
      const fallbackTopics = generateFallbackTopics(qualification, subject, examBoard);
      return res.status(200).json({ 
        topics: fallbackTopics,
        fallback: true,
        message: 'Web search is required for accurate specification topics. Please ensure TAVILY_API_KEY is set.'
      });
    }
    
    // Extract topics directly from the "Specification at a Glance" content
    let extractedTopics = [];
    const contentToParse = specificationAtAGlanceContent || webSearchResults;
    
    // Try to extract topics using pattern matching from the "Specification at a Glance" section
    if (contentToParse) {
      // First, try to find a clear list section within the content
      const lines = contentToParse.split('\n');
      let inTopicList = false;
      let topicLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect start of topic list (numbered or bulleted)
        if ((/^\d+[\.\)]\s+[A-Z]/.test(line) || /^[-*•]\s+[A-Z]/.test(line)) && line.length > 10 && line.length < 120) {
          inTopicList = true;
          topicLines.push(line);
        } 
        // Continue collecting if we're in a topic list
        else if (inTopicList && (/^\d+[\.\)]\s+/.test(line) || /^[-*•]\s+/.test(line)) && line.length > 10 && line.length < 120) {
          topicLines.push(line);
        }
        // Stop if we hit a blank line and have enough topics, or hit a section header
        else if (inTopicList && (line === '' && topicLines.length >= 3) || 
                 /^[A-Z][A-Z\s]{5,}$/.test(line) && line.length < 50) {
          break;
        }
      }
      
      if (topicLines.length >= 3) {
        extractedTopics = topicLines.map(line => {
          return line.replace(/^\s*\d+[\.\)]\s+/, '')
                     .replace(/^\s*[-*•]\s+/, '')
                     .trim()
                     .replace(/^[^\w]*/, '')
                     .replace(/\s{2,}/g, ' ')
                     .trim();
        }).filter(topic => {
          const lower = topic.toLowerCase();
          return topic.length > 8 && 
                 topic.length < 100 &&
                 !lower.includes('http') &&
                 !lower.includes('download') &&
                 !lower.includes('click') &&
                 !lower.includes('page');
        });
      }
      
      // Fallback: regex patterns if line-by-line didn't work
      if (extractedTopics.length < 3) {
        const numberedMatches = contentToParse.match(/(?:^|\n)\s*\d+[\.\)]\s+([A-Z][^\n]{8,90}?)(?=\s*(?:\n\s*\d+[\.\)]|\n\s*[A-Z]{2,}\s|$))/gm);
        if (numberedMatches && numberedMatches.length >= 3) {
          extractedTopics = numberedMatches.map(match => {
            return match.replace(/^\s*\d+[\.\)]\s+/, '').trim()
              .replace(/^[^\w]*/, '')
              .replace(/\s{2,}/g, ' ')
              .trim();
          }).filter(topic => {
            const lower = topic.toLowerCase();
            return topic.length > 8 && topic.length < 100 &&
                   !lower.includes('http') && !lower.includes('www.');
          });
        }
      }
    }
    
    // Clean up extracted topics - remove duplicates and invalid entries
    extractedTopics = [...new Set(extractedTopics)]
      .filter(topic => {
        // Filter out common non-topic phrases
        const lowerTopic = topic.toLowerCase();
        return !lowerTopic.includes('http') &&
               !lowerTopic.includes('www.') &&
               !lowerTopic.includes('click here') &&
               !lowerTopic.includes('download') &&
               !lowerTopic.includes('page') &&
               topic.length > 5;
      })
      .slice(0, 30);
    
    // If we extracted enough topics directly, use them
    if (extractedTopics.length >= 5) {
      console.log(`Found ${extractedTopics.length} topics directly from "Specification at a Glance"`);
      return res.status(200).json({ 
        topics: extractedTopics,
        source: 'specification_at_a_glance'
      });
    }
    
    // Otherwise, use AI to extract topics from the "Specification at a Glance" section
    const prompt = `You are a specification extraction assistant. Extract ONLY the topic names from the "Specification at a Glance" section below.

SPECIFICATION AT A GLANCE CONTENT:
${contentToParse}

CRITICAL INSTRUCTIONS:
1. Find the "Specification at a Glance" section in the content above
2. Extract ONLY the topic names listed in that section
3. Use the EXACT topic names as written - do not modify or paraphrase
4. Ignore any other text outside the "Specification at a Glance" section
5. Do NOT extract topics from other sections like "Assessment", "Resources", etc.
6. If you cannot find a clear "Specification at a Glance" section with topic names, return empty array

Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Return ONLY a JSON object:
{
  "topics": ["Exact topic name 1", "Exact topic name 2", ...]
}

If no topics found in "Specification at a Glance", return: {"topics": []}
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
