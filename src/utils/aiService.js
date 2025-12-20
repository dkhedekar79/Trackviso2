import { GoogleGenAI } from "@google/genai";

/**
 * Unified AI Service with fallback models
 * Tries Google/Gemini models in order: gemini-2.5-flash -> gemini-1.5-pro -> gemini-1.5-flash -> gemini-pro
 */

// Model configurations - all Google/Gemini models
const MODEL_CONFIGS = [
  {
    name: 'gemini-2.5-flash-lite',
  },
  {
    name: 'gemini-2.5-pro',
  },
  {
    name: 'gemini-3-flash-preview',
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
    let jsonStr = jsonMatch[0];
    
    // Basic repair for truncated JSON (common with large AI responses)
    if (jsonStr.endsWith(',')) {
      jsonStr = jsonStr.slice(0, -1);
    }
    
    // Count opening and closing braces/brackets to see if it's truncated
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;
    
    // Try to close hanging structures if they are obviously missing
    if (openBraces > closeBraces) {
      jsonStr += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      jsonStr += ']'.repeat(openBrackets - closeBrackets);
    }

    try {
      return JSON.parse(jsonStr);
    } catch (innerError) {
      // If basic repair failed, try a more aggressive one
      // This is a last resort - just return what we have if it's a partial array
      console.warn('Initial JSON parse failed, trying aggressive repair...', innerError.message);
      return JSON.parse(jsonMatch[0]); // Fallback to original match if repair made it worse
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Content length:', content.length);
    throw new Error('Could not parse JSON from AI response');
  }
}

