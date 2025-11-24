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
    // Try alternative models if default fails - use models that support inference API
    const MODEL_ID = process.env.HUGGINGFACE_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.2';
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY environment variable.' });
    }

    // Step 1: Search the web for current specification and topics
    let webSearchResults = '';
    if (TAVILY_API_KEY) {
      try {
        const searchQuery = `${qualification} ${subject} ${examBoard} specification topics syllabus`;
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
              .map((result, idx) => `${idx + 1}. ${result.title}: ${result.content.substring(0, 300)}`)
              .join('\n\n');
          }
        }
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without web search if it fails
      }
    }

    // Step 2: Generate topics using HuggingFace
    const prompt = `You are an expert educational assistant. ${webSearchResults ? `Based on the following web search results:\n${webSearchResults}\n\n` : ''}Your task is to provide a comprehensive list of main topics that students need to study for a specific qualification, subject, and exam board.

Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Please provide a comprehensive list of all main topics that students need to study for this qualification and subject. Base your response on the official specification and syllabus information.

Return ONLY a valid JSON object with this structure:
{
  "topics": ["Topic 1", "Topic 2", "Topic 3", ...]
}

Make sure the list is comprehensive and includes all major topics. Respond ONLY with the JSON object, no other text.`;

    // Try using the Text Generation Inference API first, fallback to inference API
    let hfApiUrl = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
    
    // First, try with wait_for_model parameter to handle model loading
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
      console.error('HuggingFace API error:', errorText);
      console.error('Response status:', hfResponse.status);
      
      // Handle model loading errors
      if (hfResponse.status === 503) {
        throw new Error('HuggingFace model is loading. Please wait a moment and try again.');
      }
      
      // Handle "Gone" (410) - model endpoint no longer available
      if (hfResponse.status === 410) {
        throw new Error(`The HuggingFace model "${MODEL_ID}" is no longer available at this endpoint. Please try a different model or contact support.`);
      }
      
      throw new Error(`HuggingFace API error: ${hfResponse.statusText} (Status: ${hfResponse.status})`);
    }

    const hfData = await hfResponse.json();
    
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
