export default async function handler(req, res) {
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { topics, qualification, subject, examBoard } = body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'Topics array is required' });
    }

    if (!qualification || !subject || !examBoard) {
      return res.status(400).json({ error: 'Missing required parameters: qualification, subject, examBoard' });
    }

    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
    const MODEL_ID = process.env.HUGGINGFACE_MODEL_ID || 'meta-llama/Meta-Llama-3-8B-Instruct';

    if (!TAVILY_API_KEY) {
      return res.status(500).json({ error: 'Web search API key not configured' });
    }

    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'HuggingFace API key not configured' });
    }

    // Step 1: Fetch grade 9 notes from web search for all topics
    let allWebResults = '';

    try {
      for (const topic of topics) {
        const searchQueries = [
          `"${examBoard}" "${qualification}" "${subject}" "${topic}" grade 9 notes`,
          `${examBoard} ${qualification} ${subject} ${topic} grade 9 study guide`,
          `${subject} "${topic}" GCSE grade 9 revision notes`,
          `${topic} grade 9 ${subject} ${examBoard} key concepts`,
        ];

        let topicResults = [];

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

              // Use Tavily's AI summary if available
              if (tavilyData.answer) {
                topicResults.push(`\n=== AI Summary for "${topic}" ===\n${tavilyData.answer}`);
              }

              // Collect search results
              if (tavilyData.results && tavilyData.results.length > 0) {
                const results = tavilyData.results.map(result =>
                  `Source: ${result.title}\nURL: ${result.url}\n${result.content.substring(0, 500)}`
                );
                topicResults.push(...results);
              }
            }
          } catch (searchError) {
            console.error('Search error for query:', searchQuery, searchError.message);
            // Continue with next search
          }
        }

        // Add topic results to all results
        if (topicResults.length > 0) {
          allWebResults += `\n\n### TOPIC: ${topic} ###\n`;
          allWebResults += topicResults.filter((v, i, a) => a.indexOf(v) === i).join('\n---\n');
        }
      }
    } catch (searchError) {
      console.error('Web search error:', searchError);
      // Continue without web search if it fails
      allWebResults = '';
    }

    // Step 2: Generate comprehensive notes using AI
    const topicsText = topics.join(', ');

    const prompt = `You are an expert educational tutor specializing in grade 9 / GCSE level ${subject}. Create comprehensive study notes for students at this level.

${allWebResults ? `WEB SEARCH RESULTS (USE THIS INFORMATION):\n${allWebResults}\n\n` : ''}

IMPORTANT: All notes must be appropriate for Grade 9 / GCSE level (age 13-14). Use clear, straightforward language.

Create study notes for:
Topics: ${topicsText}
Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Please provide comprehensive but concise notes in this format:
1. Start with a brief overview of each topic
2. Include key concepts and definitions
3. Add important formulas or processes
4. Highlight what grade 9 students need to know
5. Include common misconceptions to avoid
6. Add exam-relevant examples

Use clear, simple language suitable for 13-14 year old students. Organize the information logically with headings and bullet points. Focus on the essential content needed to understand these topics at GCSE level.`;

    const hfApiUrl = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

    const requestBody = {
      inputs: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false,
        do_sample: true,
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
      console.error('HuggingFace API error:', errorText);

      if (hfResponse.status === 401 || hfResponse.status === 403) {
        return res.status(500).json({ error: 'Authentication failed. Please check HuggingFace API key.' });
      }

      // Return example notes if model is loading
      if (hfResponse.status === 503) {
        const exampleNotes = generateExampleNotes(topics, qualification, subject, examBoard);
        return res.status(200).json({
          notes: exampleNotes,
          knowledgeMap: exampleNotes,
          fallback: true,
        });
      }

      return res.status(500).json({ error: 'Failed to generate notes from AI model' });
    }

    const hfData = await hfResponse.json();

    let content = '';
    if (Array.isArray(hfData) && hfData.length > 0) {
      if (hfData[0]?.generated_text) {
        content = hfData[0].generated_text;
      } else if (hfData[0]?.message?.content) {
        content = hfData[0].message.content;
      } else if (typeof hfData[0] === 'string') {
        content = hfData[0];
      } else {
        content = JSON.stringify(hfData[0]);
      }
    } else if (hfData.generated_text) {
      content = hfData.generated_text;
    } else if (hfData.message?.content) {
      content = hfData.message.content;
    } else if (typeof hfData === 'string') {
      content = hfData;
    }

    if (!content || content.trim().length === 0) {
      const exampleNotes = generateExampleNotes(topics, qualification, subject, examBoard);
      return res.status(200).json({
        notes: exampleNotes,
        knowledgeMap: exampleNotes,
        fallback: true,
      });
    }

    // Clean up the content (remove prompt echoing if present)
    const notes = content.includes('Create study notes') ? content.split('Create study notes')[1] : content;

    return res.status(200).json({
      notes: notes.trim(),
      knowledgeMap: notes.trim(),
    });
  } catch (error) {
    console.error('Error generating blurt notes:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate notes',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

function generateExampleNotes(topics, qualification, subject, examBoard) {
  const topicsText = topics.join(', ');
  return `Grade 9 / GCSE ${subject} Study Notes
Exam Board: ${examBoard}

Topics: ${topicsText}

=== Overview ===
These notes cover the essential content for grade 9 / GCSE level ${subject}. Focus on understanding the key concepts and principles rather than just memorizing facts.

=== Key Concepts ===
${topics.map((topic, idx) => `
${idx + 1}. ${topic}
   - Key definition: Understand what this topic is about
   - Main concepts: Focus on core principles
   - Exam tips: Remember to explain your answers clearly
   - Common mistake: Avoid oversimplifying complex ideas
`).join('\n')}

=== Important Points ===
- Use clear language in your explanations
- Always show your working in calculations
- Practice applying concepts to different scenarios
- Review past papers for exam-style questions

=== Revision Strategy ===
1. Read through these notes carefully
2. Make flashcards of key terms
3. Practice drawing diagrams where relevant
4. Test yourself with past papers
5. Review areas you find difficult`;
}
