import { generateAIContent, generateAIJSON } from "./aiService.js";

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

export async function generateMockExamNotes(topics, qualification, subject, examBoard) {
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

    const content = await generateAIContent(prompt, { preferredModel: 'gemini-2.5-flash' });

    return {
      notes: content.trim(),
      knowledgeMap: content.trim(),
    };
  } catch (error) {
    console.error('Error generating mock exam notes:', error);
    throw error;
  }
}

export async function generateMockExam(
  knowledgeMap,
  topics,
  qualification,
  subject,
  examBoard,
  tier,
  totalMarks
) {
  try {
    const topicsText = topics.join(', ');

    // Calculate number of questions based on total marks
    // Typical distribution: mix of 1-6 mark questions
    const prompt = `You are an expert exam writer creating a realistic GCSE ${subject} mock exam paper for ${examBoard} ${qualification} at ${tier} tier.

KNOWLEDGE MAP (Reference Material - MUST cover ALL aspects):
${knowledgeMap}

TOPICS TO COVER: ${topicsText}
QUALIFICATION: ${qualification}
SUBJECT: ${subject}
EXAM BOARD: ${examBoard}
TIER: ${tier}
TOTAL MARKS: ${totalMarks}

CRITICAL REQUIREMENTS:
1. Create a REALISTIC exam paper that covers EVERY part of the topics comprehensively
2. Total marks must equal exactly ${totalMarks} marks
3. Use a realistic mix of question types and mark allocations typical of ${examBoard} ${subject} papers:
   - 1-2 mark questions (short answer, multiple choice, definitions)
   - 3-4 mark questions (explain, describe, calculate)
   - 5-6 mark questions (extended response, analysis, evaluation)
4. Questions should progress from easier to harder
5. Include a variety of question formats:
   - Multiple choice (1-2 marks)
   - Short answer (1-3 marks)
   - Calculation/Problem solving (2-5 marks)
   - Extended writing (4-6 marks)
   - Data interpretation (2-4 marks)
6. Ensure ALL key concepts, formulas, processes, and important points from the knowledge map are tested
7. Questions should be exam-style and realistic for ${tier} tier
8. Include appropriate command words (state, explain, describe, calculate, evaluate, etc.)
9. Make sure the difficulty is appropriate for ${tier} tier students

You must respond with a JSON object in this exact format:
{
  "title": "<Exam title>",
  "instructions": "<Exam instructions>",
  "questions": [
    {
      "number": 1,
      "marks": <number>,
      "question": "<question text>",
      "type": "multiple_choice" | "short_answer" | "calculation" | "extended_writing" | "data_interpretation",
      "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple_choice),
      "correctAnswer": "<answer>" (for multiple_choice: "A", "B", "C", or "D"),
      "markScheme": {
        "points": ["point 1", "point 2"],
        "maxMarks": <number>
      },
      "keyPoints": ["key point 1", "key point 2"] (content points this question tests)
    },
    ... (more questions until total marks = ${totalMarks})
  ]
}

IMPORTANT: 
- The sum of all question marks MUST equal exactly ${totalMarks}
- Cover EVERY important aspect of the topics
- Make it realistic and exam-like
- Include proper mark schemes for marking

Return ONLY the JSON object, no additional text.`;

    const exam = await generateAIJSON(prompt, { preferredModel: 'gemini-2.5-flash' });

    // Validate and fix exam structure
    if (!exam.questions || !Array.isArray(exam.questions)) {
      throw new Error('Invalid exam structure: missing questions array');
    }

    // Calculate total marks and fix if needed
    const calculatedTotal = exam.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    if (calculatedTotal !== totalMarks) {
      console.warn(`Total marks mismatch: expected ${totalMarks}, got ${calculatedTotal}. Adjusting...`);
      // Adjust the last question's marks to match
      if (exam.questions.length > 0) {
        const difference = totalMarks - calculatedTotal;
        exam.questions[exam.questions.length - 1].marks = 
          (exam.questions[exam.questions.length - 1].marks || 0) + difference;
      }
    }

    // Fix missing fields in questions
    exam.questions = exam.questions.map((q, i) => {
      if (!q.number) q.number = i + 1;
      if (!q.marks) q.marks = 1;
      if (!q.type) {
        // Infer type from structure
        if (q.options) q.type = 'multiple_choice';
        else if (q.marks <= 2) q.type = 'short_answer';
        else if (q.marks >= 5) q.type = 'extended_writing';
        else q.type = 'calculation';
      }
      if (!q.markScheme) {
        q.markScheme = {
          points: [q.question.substring(0, 50)],
          maxMarks: q.marks
        };
      }
      if (!Array.isArray(q.keyPoints) || q.keyPoints.length === 0) {
        q.keyPoints = [q.question.substring(0, 50)];
      }
      return q;
    });

    return exam;
  } catch (error) {
    console.error('Error generating mock exam:', error);
    throw error;
  }
}

export async function markMockExam(
  exam,
  userAnswers,
  knowledgeMap,
  topics,
  qualification,
  subject,
  examBoard,
  tier
) {
  try {
    const topicsText = topics.join(', ');
    const totalMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    // Create answer summary
    const answersSummary = exam.questions.map((q, i) => ({
      questionNumber: q.number,
      question: q.question,
      marks: q.marks,
      type: q.type,
      userAnswer: userAnswers[i] || '',
      correctAnswer: q.correctAnswer || 'See mark scheme',
      markScheme: q.markScheme
    }));

    const prompt = `You are an expert examiner marking a GCSE ${subject} mock exam paper for ${examBoard} ${qualification} at ${tier} tier.

KNOWLEDGE MAP (Reference Material):
${knowledgeMap}

EXAM DETAILS:
Subject: ${subject}
Exam Board: ${examBoard}
Qualification: ${qualification}
Tier: ${tier}
Total Marks: ${totalMarks}

QUESTIONS AND STUDENT ANSWERS:
${answersSummary.map(a => `
Question ${a.questionNumber} (${a.marks} marks, ${a.type}):
Question: ${a.question}
Student Answer: ${a.userAnswer}
Correct Answer/Mark Scheme: ${JSON.stringify(a.markScheme)}
`).join('\n')}

TOPICS: ${topicsText}

Mark each answer according to the mark scheme. You must respond with a JSON object in this exact format:
{
  "totalMarks": ${totalMarks},
  "marksAwarded": <total marks awarded>,
  "percentage": <percentage score 0-100>,
  "questionMarkings": [
    {
      "questionNumber": 1,
      "marksAwarded": <marks for this question>,
      "maxMarks": <max marks for this question>,
      "isCorrect": <boolean>,
      "feedback": "<specific feedback for this answer>",
      "keyPoints": ["point covered", "point missed"]
    },
    ... (one for each question)
  ],
  "overallFeedback": "<overall feedback paragraph>",
  "strengths": ["strength1", "strength2"],
  "weakAreas": ["weak area1", "weak area2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Guidelines for marking:
1. Award marks strictly according to the mark scheme
2. Be fair but accurate - award partial marks where appropriate
3. For multiple choice: full marks if correct, 0 if incorrect
4. For short answer: award marks based on key points covered
5. For extended writing: award marks based on depth, accuracy, and completeness
6. Provide specific, constructive feedback for each question
7. Identify which key points were covered and which were missed
8. Be encouraging but honest in overall feedback
9. Calculate percentage as (marksAwarded / totalMarks) * 100

Return ONLY the JSON object, no additional text.`;

    const marking = await generateAIJSON(prompt, { preferredModel: 'gemini-2.5-flash' });

    // Validate and ensure all required fields exist
    if (typeof marking.marksAwarded !== 'number') {
      marking.marksAwarded = 0;
    }
    if (typeof marking.percentage !== 'number' || marking.percentage < 0 || marking.percentage > 100) {
      marking.percentage = totalMarks > 0 ? Math.round((marking.marksAwarded / totalMarks) * 100) : 0;
    }
    if (!Array.isArray(marking.questionMarkings)) {
      marking.questionMarkings = [];
    }
    if (!marking.overallFeedback || typeof marking.overallFeedback !== 'string') {
      marking.overallFeedback = `You scored ${marking.marksAwarded} out of ${totalMarks} marks (${marking.percentage}%).`;
    }
    if (!Array.isArray(marking.strengths)) {
      marking.strengths = [];
    }
    if (!Array.isArray(marking.weakAreas)) {
      marking.weakAreas = [];
    }
    if (!Array.isArray(marking.recommendations)) {
      marking.recommendations = [];
    }

    return marking;
  } catch (error) {
    console.error('Error marking mock exam:', error);
    throw error;
  }
}

