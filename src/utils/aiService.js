import { GoogleGenAI } from "@google/genai";

/**
 * Unified AI Service with fallback models
 * Tries Google/Gemini models in order: gemini-2.5-flash -> gemini-1.5-pro -> gemini-1.5-flash -> gemini-pro
 */

// Model configurations - all Google/Gemini models
const MODEL_CONFIGS = [
  {
    name: 'gemini-2.5-flash',
  },
  {
    name: 'gemini-1.5-pro',
  },
  {
    name: 'gemini-1.5-flash',
  },
  {
    name: 'gemini-pro',
  },
];

/**
 * Extract text content from Google Gemini response
 */
function extractGeminiContent(response) {
  if (response?.text && typeof response.text === 'string') {
    return response.text;
  }
  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  return null;
}

/**
 * Call Google Gemini API
 */
async function callGemini(prompt, modelName) {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  const content = extractGeminiContent(response);
  if (!content) {
    throw new Error('No content in Gemini response');
  }

  return content;
}


/**
 * Generate content using AI with automatic fallback
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Optional configuration
 * @param {string} options.preferredModel - Skip to a specific model (optional)
 * @returns {Promise<string>} The generated content
 */
export async function generateAIContent(prompt, options = {}) {
  const { preferredModel } = options;
  
  // If preferred model is specified, try it first
  let modelsToTry = MODEL_CONFIGS;
  if (preferredModel) {
    const preferredIndex = MODEL_CONFIGS.findIndex(m => m.name === preferredModel);
    if (preferredIndex >= 0) {
      modelsToTry = [
        MODEL_CONFIGS[preferredIndex],
        ...MODEL_CONFIGS.slice(0, preferredIndex),
        ...MODEL_CONFIGS.slice(preferredIndex + 1),
      ];
    }
  }

  let lastError = null;
  let attemptedModels = [];

  for (const modelConfig of modelsToTry) {
    const { name } = modelConfig;
    
    // Check if API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API key is not configured');
    }

    try {
      console.log(`Attempting to generate content with ${name}...`);
      
      const content = await callGemini(prompt, name);

      console.log(`Successfully generated content with ${name}`);
      return content;
    } catch (error) {
      console.error(`Error with ${name}:`, error.message);
      lastError = error;
      attemptedModels.push({ model: name, error: error.message });
      
      // Continue to next model
      continue;
    }
  }

  // If we get here, all models failed
  const errorMessage = `All AI models failed. Attempted: ${attemptedModels.map(m => m.model).join(', ')}. Last error: ${lastError?.message || 'Unknown error'}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Generate content with JSON response (extracts JSON from response)
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object|Array>} The parsed JSON response
 */
export async function generateAIJSON(prompt, options = {}) {
  const content = await generateAIContent(prompt, options);
  
  // Try to extract JSON from response
  const jsonMatch = content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON in AI response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Content:', jsonMatch[0]);
    throw new Error('Could not parse JSON from AI response');
  }
}

