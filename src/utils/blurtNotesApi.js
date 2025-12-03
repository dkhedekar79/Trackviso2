import { GoogleGenAI } from "@google/genai";

async function searchWebForGrade9Notes(topics, qualification, subject, examBoard) {
  const TAVILY_API_KEY = import.meta.env.TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    console.warn('Tavily API key not configured. Proceeding without web search.');
    return '';
  }

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

            if (tavilyData.answer) {
              topicResults.push(`\n=== AI Summary for "${topic}" ===\n${tavilyData.answer}`);
            }

            if (tavilyData.results && tavilyData.results.length > 0) {
              const results = tavilyData.results.map(result =>
                `Source: ${result.title}\nURL: ${result.url}\n${result.content.substring(0, 500)}`
              );
              topicResults.push(...results);
            }
          }
        } catch (searchError) {
          console.error('Search error for query:', searchQuery, searchError.message);
        }
      }

      if (topicResults.length > 0) {
        allWebResults += `\n\n### TOPIC: ${topic} ###\n`;
        allWebResults += topicResults.filter((v, i, a) => a.indexOf(v) === i).join('\n---\n');
      }
    }
  } catch (searchError) {
    console.error('Web search error:', searchError);
  }

  return allWebResults;
}

export async function generateBlurtNotes(topics, qualification, subject, examBoard) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    let webSearchResults = '';
    
    try {
      webSearchResults = await searchWebForGrade9Notes(topics, qualification, subject, examBoard);
    } catch (error) {
      console.warn('Web search failed, proceeding with AI-only generation:', error.message);
    }

    const topicsText = topics.join(', ');

    const prompt = `You are an expert educational tutor specializing in grade 9 / GCSE level ${subject}. Create comprehensive study notes for students at this level.

${webSearchResults ? `WEB SEARCH RESULTS (USE THIS INFORMATION):\n${webSearchResults}\n\n` : ''}

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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log('Blurt Notes API Response:', response);

    let content = null;
    
    if (response?.text && typeof response.text === 'string') {
      content = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      content = response.candidates[0].content.parts[0].text;
    }

    if (!content) {
      console.error('Response structure:', JSON.stringify(response, null, 2));
      throw new Error('No content in API response. Please try again.');
    }

    return {
      notes: content.trim(),
      knowledgeMap: content.trim(),
    };
  } catch (error) {
    console.error('Error generating blurt notes:', error);
    throw error;
  }
}
