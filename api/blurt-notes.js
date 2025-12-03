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

    const GOOGLE_API_KEY = process.env.VITE_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google AI API key not configured' });
    }

    // Step 1: Fetch grade 9 notes from web search for all topics
    let allWebResults = '';

    try {
      if (TAVILY_API_KEY) {
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
      }
    } catch (searchError) {
      console.error('Web search error:', searchError);
      // Continue without web search if it fails
      allWebResults = '';
    }

    // Step 2: Generate comprehensive notes using Google Gemini API
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

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

    const googleResponseWithKey = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!googleResponseWithKey.ok) {
      const errorText = await googleResponseWithKey.text();
      console.error('Google Gemini API error:', errorText);

      if (googleResponseWithKey.status === 401 || googleResponseWithKey.status === 403) {
        return res.status(500).json({ error: 'Authentication failed. Please check Google API key.' });
      }

      const exampleNotes = generateExampleNotes(topics, qualification, subject, examBoard);
      return res.status(200).json({
        notes: exampleNotes,
        knowledgeMap: exampleNotes,
        fallback: true,
      });
    }

    const googleData = await googleResponseWithKey.json();

    let content = '';
    if (googleData?.candidates?.[0]?.content?.parts?.[0]?.text) {
      content = googleData.candidates[0].content.parts[0].text;
    } else if (googleData?.text) {
      content = googleData.text;
    }

    if (!content || content.trim().length === 0) {
      const exampleNotes = generateExampleNotes(topics, qualification, subject, examBoard);
      return res.status(200).json({
        notes: exampleNotes,
        knowledgeMap: exampleNotes,
        fallback: true,
      });
    }

    return res.status(200).json({
      notes: content.trim(),
      knowledgeMap: content.trim(),
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
