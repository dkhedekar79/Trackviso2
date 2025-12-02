import { GoogleGenAI } from "@google/genai";

export async function generateTopics(qualification, examBoard, subject) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log('API Response:', response);

    let content = null;
    
    // Handle different possible response structures
    if (response?.text && typeof response.text === 'string') {
      content = response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      content = response.candidates[0].content.parts[0].text;
    }

    if (!content) {
      console.error('Response structure:', JSON.stringify(response, null, 2));
      throw new Error('No content in API response. Please try again.');
    }

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', content);
      throw new Error('Could not parse response format');
    }

    let topics;
    try {
      topics = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0]);
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
