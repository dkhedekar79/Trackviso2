const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
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
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in API response');
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const topics = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(topics)) {
      throw new Error('Topics is not an array');
    }

    return topics.map(topic => ({
      id: topic.id || topic.name?.toLowerCase().replace(/\s+/g, '-'),
      name: topic.name,
    }));
  } catch (error) {
    console.error('Error generating topics:', error);
    throw error;
  }
}
