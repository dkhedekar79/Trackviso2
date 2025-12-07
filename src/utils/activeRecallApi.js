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

export async function generateActiveRecallNotes(topics, qualification, subject, examBoard) {
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

    console.log('Active Recall Notes API Response:', response);

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
    console.error('Error generating active recall notes:', error);
    throw error;
  }
}

export async function generateActiveRecallQuestions(
  knowledgeMap,
  topics,
  qualification,
  subject,
  examBoard,
  previousQuestions = [],
  contentCoverage = {}
) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const topicsText = topics.join(', ');
    const previousQuestionsText = previousQuestions.length > 0 
      ? `\n\nPREVIOUS QUESTIONS (avoid repeating similar content):\n${previousQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}`
      : '';
    
    const coverageText = Object.keys(contentCoverage).length > 0
      ? `\n\nCONTENT COVERAGE (points tested - aim to test each point twice):\n${JSON.stringify(contentCoverage, null, 2)}`
      : '';

    const prompt = `You are an expert educational tutor creating active recall questions for grade 9 / GCSE level ${subject}.

KNOWLEDGE MAP (Reference Material):
${knowledgeMap}

TOPICS: ${topicsText}
QUALIFICATION: ${qualification}
SUBJECT: ${subject}
EXAM BOARD: ${examBoard}
${previousQuestionsText}
${coverageText}

Generate exactly 10 questions that test active recall. The questions should be roughly equally distributed across 3 types:
1. Multiple Choice (3-4 questions): Provide 4 options (A, B, C, D) with one correct answer
2. Open Ended (3-4 questions): Questions worth 2-4 marks that require written responses
3. Fill in the Gap (3-4 questions): Provide a passage with blanks to fill in

IMPORTANT REQUIREMENTS:
- Questions must test different aspects of the content
- Each question should focus on a specific key point or concept
- Difficulty should be appropriate for grade 9 / GCSE level
- Questions should encourage deep understanding, not just memorization
- For fill-in-the-gap, provide a meaningful passage (3-5 sentences) with 2-3 blanks
- For multiple choice, make distractors plausible but clearly wrong
- For open ended, specify the mark allocation (2-4 marks)

You must respond with a JSON array in this exact format:
[
  {
    "type": "multiple_choice" | "open_ended" | "fill_gap",
    "question": "<question text>",
    "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple_choice),
    "correctAnswer": "<correct answer>" (for multiple_choice: "A", "B", "C", or "D"),
    "passage": "<passage with [BLANK] markers>" (only for fill_gap),
    "blanks": ["answer1", "answer2"] (only for fill_gap, answers in order),
    "marks": <number 2-4> (only for open_ended),
    "keyPoints": ["point1", "point2"] (list of key content points this question tests)
  },
  ... (9 more questions)
]

Return ONLY the JSON array, no additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log('Active Recall Questions API Response:', response);

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

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse questions response');
    }

    let questions;
    try {
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0]);
      throw new Error('Could not parse questions');
    }

    // Validate and fix questions
    if (!Array.isArray(questions)) {
      throw new Error('Expected an array of questions');
    }

    // Filter and fix invalid questions
    const validQuestions = questions
      .map((q, i) => {
        // Skip questions without required fields
        if (!q || typeof q !== 'object') {
          console.warn(`Question ${i + 1}: Invalid question object, skipping`);
          return null;
        }

        // Fix or validate type
        if (!q.type || !['multiple_choice', 'open_ended', 'fill_gap'].includes(q.type)) {
          // Try to infer type from structure
          if (q.options && Array.isArray(q.options)) {
            q.type = 'multiple_choice';
          } else if (q.passage || (q.blanks && Array.isArray(q.blanks))) {
            q.type = 'fill_gap';
          } else {
            q.type = 'open_ended';
          }
        }

        // Fix missing question text
        if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
          console.warn(`Question ${i + 1}: Missing question text, skipping`);
          return null;
        }

        // Fix multiple choice questions
        if (q.type === 'multiple_choice') {
          if (!Array.isArray(q.options) || q.options.length < 4) {
            // Try to create default options if missing
            if (!Array.isArray(q.options)) {
              q.options = ['Option A', 'Option B', 'Option C', 'Option D'];
            } else {
              // Pad with default options if less than 4
              while (q.options.length < 4) {
                q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
              }
            }
          }
          // Ensure correctAnswer is valid
          if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
            q.correctAnswer = 'A'; // Default to first option
          }
        }

        // Fix fill gap questions
        if (q.type === 'fill_gap') {
          if (!q.passage || typeof q.passage !== 'string') {
            // Create a simple passage from the question
            q.passage = q.question + ' [BLANK]';
          }
          if (!Array.isArray(q.blanks) || q.blanks.length === 0) {
            // Count blanks in passage
            const blankCount = (q.passage.match(/\[BLANK\]/g) || []).length;
            q.blanks = blankCount > 0 ? new Array(blankCount).fill('answer') : ['answer'];
          }
        }

        // Fix open ended questions
        if (q.type === 'open_ended') {
          if (!q.marks || typeof q.marks !== 'number' || q.marks < 2 || q.marks > 4) {
            q.marks = 3; // Default to 3 marks
          }
        }

        // Ensure keyPoints exists
        if (!Array.isArray(q.keyPoints) || q.keyPoints.length === 0) {
          q.keyPoints = [q.question.substring(0, 50)]; // Use first 50 chars of question
        }

        return q;
      })
      .filter(q => q !== null); // Remove null questions

    // If we don't have enough questions, try to generate more or use what we have
    if (validQuestions.length < 10) {
      console.warn(`Only ${validQuestions.length} valid questions generated, expected 10`);
      if (validQuestions.length === 0) {
        throw new Error('No valid questions could be generated. Please try again.');
      }
      // If we have at least 5, we can proceed, otherwise it's too few
      if (validQuestions.length < 5) {
        throw new Error(`Only ${validQuestions.length} valid questions generated. Please try again.`);
      }
    }

    // Return exactly 10 questions (or as many as we have if less)
    return validQuestions.slice(0, 10);
  } catch (error) {
    console.error('Error generating active recall questions:', error);
    throw error;
  }
}

export async function markActiveRecallAnswer(
  question,
  userAnswer,
  knowledgeMap,
  topics,
  qualification,
  subject,
  examBoard
) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const topicsText = topics.join(', ');

    let answerContext = '';
    if (question.type === 'multiple_choice') {
      answerContext = `User selected: ${userAnswer}\nCorrect answer: ${question.correctAnswer}`;
    } else if (question.type === 'fill_gap') {
      answerContext = `User answers: ${JSON.stringify(userAnswer)}\nCorrect answers: ${JSON.stringify(question.blanks)}`;
    } else {
      answerContext = `User answer: ${userAnswer}`;
    }

    const prompt = `You are an expert educational tutor marking a student's answer for grade 9 / GCSE level ${subject}.

KNOWLEDGE MAP (Reference Material):
${knowledgeMap}

QUESTION:
Type: ${question.type}
${question.type === 'multiple_choice' ? `Options: ${question.options.join(', ')}` : ''}
${question.type === 'fill_gap' ? `Passage: ${question.passage}` : ''}
Question: ${question.question}
${question.type === 'open_ended' ? `Marks available: ${question.marks}` : ''}
Correct Answer: ${question.type === 'multiple_choice' ? question.correctAnswer : question.type === 'fill_gap' ? question.blanks.join(', ') : 'See knowledge map'}

STUDENT'S ANSWER:
${answerContext}

TOPICS: ${topicsText}
QUALIFICATION: ${qualification}
SUBJECT: ${subject}
EXAM BOARD: ${examBoard}

Mark the student's answer and provide detailed feedback. You must respond with a JSON object in this exact format:
{
  "isCorrect": <boolean>,
  "score": <number 0-100>,
  "marksAwarded": <number> (for open_ended, out of ${question.marks || 'N/A'}),
  "explanation": "<detailed explanation of why the answer is correct/incorrect>",
  "feedback": "<constructive feedback for the student>",
  "keyPoints": ["point1", "point2"] (list of key content points covered by this answer)
}

Guidelines for marking:
1. For multiple choice: isCorrect is true only if exact match
2. For fill_gap: Check each blank - award partial credit if some are correct
3. For open_ended: Award marks based on accuracy, completeness, and understanding (0-${question.marks || 'N/A'} marks)
4. Provide encouraging but honest feedback
5. Explain what was correct/incorrect and why
6. Suggest improvements if needed
7. Be specific about which key points were covered

Return ONLY the JSON object, no additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log('Active Recall Marking API Response:', response);

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

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse marking response');
    }

    let marking;
    try {
      marking = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0]);
      throw new Error('Could not parse marking results');
    }

    // Validate and ensure all required fields exist
    if (typeof marking.isCorrect !== 'boolean') {
      marking.isCorrect = false;
    }
    if (typeof marking.score !== 'number' || marking.score < 0 || marking.score > 100) {
      marking.score = marking.isCorrect ? 100 : 0;
    }
    if (question.type === 'open_ended' && typeof marking.marksAwarded !== 'number') {
      marking.marksAwarded = marking.isCorrect ? question.marks : 0;
    }
    if (!marking.explanation || typeof marking.explanation !== 'string') {
      marking.explanation = marking.isCorrect ? 'Correct!' : 'Incorrect. Review the material.';
    }
    if (!marking.feedback || typeof marking.feedback !== 'string') {
      marking.feedback = 'Keep practicing!';
    }
    if (!Array.isArray(marking.keyPoints)) {
      marking.keyPoints = question.keyPoints || [];
    }

    return marking;
  } catch (error) {
    console.error('Error marking active recall answer:', error);
    throw error;
  }
}

export async function generateActiveRecallSummary(
  allQuestions,
  allAnswers,
  allMarkings,
  knowledgeMap,
  topics,
  qualification,
  subject,
  examBoard,
  contentCoverage
) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  try {
    const topicsText = topics.join(', ');
    const totalScore = allMarkings.reduce((sum, m) => sum + (m.score || 0), 0) / allMarkings.length;
    const correctCount = allMarkings.filter(m => m.isCorrect).length;
    
    const questionsSummary = allQuestions.map((q, i) => ({
      number: i + 1,
      type: q.type,
      question: q.question,
      correct: allMarkings[i]?.isCorrect || false,
      score: allMarkings[i]?.score || 0,
    }));

    const prompt = `You are an expert educational tutor providing a summary of an active recall test session for grade 9 / GCSE level ${subject}.

KNOWLEDGE MAP (Reference Material):
${knowledgeMap}

QUESTIONS AND ANSWERS:
${questionsSummary.map(q => `
Question ${q.number} (${q.type}): ${q.question}
Correct: ${q.correct ? 'Yes' : 'No'} | Score: ${q.score}%
`).join('\n')}

OVERALL PERFORMANCE:
Total Score: ${Math.round(totalScore)}%
Correct Answers: ${correctCount}/10

CONTENT COVERAGE:
${JSON.stringify(contentCoverage, null, 2)}

TOPICS: ${topicsText}
QUALIFICATION: ${qualification}
SUBJECT: ${subject}
EXAM BOARD: ${examBoard}

Provide a comprehensive summary and analysis. You must respond with a JSON object in this exact format:
{
  "overallScore": <number 0-100>,
  "summary": "<overall summary paragraph>",
  "strengths": ["strength1", "strength2"],
  "weakAreas": ["weak area1", "weak area2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "contentCoverage": <number 0-100> (percentage of content points tested at least twice)
}

Guidelines:
1. Calculate overallScore based on average performance
2. Provide an encouraging but honest summary
3. Identify 2-3 key strengths
4. Identify 2-3 areas that need improvement
5. Provide 2-3 specific recommendations for next steps
6. Calculate contentCoverage based on how many key points were tested twice (each point needs 2 tests to be complete)

Return ONLY the JSON object, no additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log('Active Recall Summary API Response:', response);

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

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse summary response');
    }

    let summary;
    try {
      summary = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0]);
      throw new Error('Could not parse summary results');
    }

    // Validate and ensure all required fields exist
    if (typeof summary.overallScore !== 'number' || summary.overallScore < 0 || summary.overallScore > 100) {
      summary.overallScore = Math.round(totalScore);
    }
    if (!summary.summary || typeof summary.summary !== 'string') {
      summary.summary = `You scored ${Math.round(totalScore)}% on this active recall test.`;
    }
    if (!Array.isArray(summary.strengths)) {
      summary.strengths = [];
    }
    if (!Array.isArray(summary.weakAreas)) {
      summary.weakAreas = [];
    }
    if (!Array.isArray(summary.recommendations)) {
      summary.recommendations = [];
    }
    if (typeof summary.contentCoverage !== 'number' || summary.contentCoverage < 0 || summary.contentCoverage > 100) {
      // Calculate content coverage: points tested twice / total unique points
      const allPoints = new Set();
      Object.values(contentCoverage).forEach(count => {
        if (count >= 2) allPoints.add(true);
      });
      summary.contentCoverage = Math.round((allPoints.size / Math.max(1, Object.keys(contentCoverage).length)) * 100);
    }

    return summary;
  } catch (error) {
    console.error('Error generating active recall summary:', error);
    throw error;
  }
}

