// Get API base URL - use relative path in production, full URL in development if needed
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || '/api');

export async function fetchTopicsFromHuggingFace(qualification, subject, examBoard) {
  try {
    const response = await fetch(`${API_BASE_URL}/fetchTopics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qualification,
        subject,
        examBoard,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !result.topics || !Array.isArray(result.topics)) {
      throw new Error('Invalid response from API: topics array not found');
    }

    if (result.topics.length === 0) {
      throw new Error('No topics found for this qualification and subject combination');
    }

    return result.topics;
  } catch (error) {
    console.error('Error fetching topics:', error);
    // Re-throw with a more user-friendly message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw error;
  }
}

export async function generateNotesFromHuggingFace(topic, qualification, subject, examBoard) {
  try {
    const response = await fetch(`${API_BASE_URL}/generateNotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        qualification,
        subject,
        examBoard,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !result.practiceQuestions || !Array.isArray(result.practiceQuestions)) {
      throw new Error('Invalid response from API: practiceQuestions array not found');
    }

    // The API now directly returns practiceQuestions
    const practiceQuestions = result.practiceQuestions;

    return practiceQuestions;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Re-throw with a more user-friendly message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw error;
  }
}
