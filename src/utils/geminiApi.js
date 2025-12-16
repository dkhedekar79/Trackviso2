import { generateAIJSON } from "./aiService.js";

export async function generateTopics(qualification, examBoard, subject) {
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
    const topics = await generateAIJSON(prompt, { preferredModel: 'gemini-2.5-flash' });

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
