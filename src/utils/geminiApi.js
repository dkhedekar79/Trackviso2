
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function generateTopics(qualification, examBoard, subject) {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured');
  }

  const prompt = `You are an educational curriculum expert. Generate a comprehensive list of main topics for ${subject} at ${qualification} level with ${examBoard} exam board.

Return ONLY a JSON array with objects containing "id" and "name" fields. Each topic should be a main topic/unit that students need to master. 
The id should be a lowercase slug (e.g., "algebra", "cell-biology").
Aim for 6-10 main topics.

Example format:
[
  { "id": "topic-one", "name": "Topic One Description" },
  { "id": "topic-two", "name": "Topic Two Description" }
]

Generate topics for ${subject}:`;

  const requestBody = {
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
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Failed to parse API response. Please try again.');
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || `API Error: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No topics generated. Please try again.');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse response format');
    }

    let topics;
    try {
      topics = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error('Could not parse topics from response');
    }

    if (!Array.isArray(topics)) {
      throw new Error('Invalid topics format');
    }

    if (topics.length === 0) {
      throw new Error('No topics were generated');
    }

    return topics.map(topic => ({
      id: topic.id || topic.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: topic.name,
    }));
  } catch (error) {
    console.error('Error generating topics:', error);
    throw error;
  }
}
