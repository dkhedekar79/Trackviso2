const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const MODEL_ID = 'meta-llama/Llama-3.1-8B-Instruct';
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

export async function fetchTopicsFromHuggingFace(qualification, subject, examBoard) {
  try {
    const prompt = `You are an educational assistant. You search the internet based on the following qualification, subject, and exam board, provide a JSON list of all the main topics that have been detailed in the specification subject overview that students need to study.

Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Please respond ONLY with a valid JSON array of topic names like this format:
["Topic 1", "Topic 2", "Topic 3", ...]

Make sure the list is comprehensive and includes all major topics for this qualification and subject. Respond ONLY with the JSON array, no other text.`;

    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid response from API');
    }

    const generatedText = result[0]?.generated_text || '';
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse topics from response');
    }

    const topics = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('No topics found for this qualification');
    }

    return topics;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
}

export async function generateNotesFromHuggingFace(topic, qualification, subject, examBoard) {
  try {
    const prompt = `You are an expert educational tutor. Create comprehensive study notes for the following topic at the specified level.

Topic: ${topic}
Qualification: ${qualification}
Subject: ${subject}
Exam Board: ${examBoard}

Please provide the response as a valid JSON object with the following structure (respond ONLY with valid JSON, no markdown, no extra text):
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

Make the notes clear, concise, and suitable for exam preparation. Include at least 3 main points, 5 key terms, and 4 practice questions.`;

    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid response from API');
    }

    const generatedText = result[0]?.generated_text || '';
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse notes from response');
    }

    const notes = JSON.parse(jsonMatch[0]);
    return notes;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw error;
  }
}
