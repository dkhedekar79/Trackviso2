import { GoogleGenAI } from "@google/genai";

/**
 * Unified AI Service with fallback models
 * Tries Google/Gemini models in order: gemini-2.5-flash -> gemini-1.5-pro -> gemini-1.5-flash -> gemini-pro
 */

// Model configurations - all Google/Gemini models
const MODEL_CONFIGS = [
  {
    name: 'gemini-3-flash',
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
 * JSON repair helper function to fix truncated or malformed JSON
 */
function attemptJsonRepair(jsonString) {
  let repaired = jsonString.trim();
  
  // Count opening and closing braces/brackets
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  
  // Remove trailing incomplete data after last complete object
  // Look for patterns like incomplete strings or values
  const lastCompletePattern = /,\s*"[^"]*$|,\s*$/;
  repaired = repaired.replace(lastCompletePattern, '');
  
  // Add missing closing brackets/braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }
  
  // Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  return repaired;
}

/**
 * Generate content with JSON response (extracts JSON from response)
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object|Array>} The parsed JSON response
 */
export async function generateAIJSON(prompt, options = {}) {
  const content = await generateAIContent(prompt, options);
  
  // Try to extract JSON from markdown code blocks if present
  let jsonString = content.trim();
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  } else {
    // Try to extract JSON from response using standard regex as fallback
    const jsonMatch = content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
  }

  if (!jsonString || jsonString.length < 2) {
    throw new Error('Could not find JSON in AI response');
  }

  // First attempt: parse as-is
  try {
    return JSON.parse(jsonString);
  } catch (firstParseError) {
    console.warn('Initial JSON parse failed, attempting repair...', firstParseError.message);
    
    // Second attempt: try to repair the JSON
    const repairedJson = attemptJsonRepair(jsonString);
    
    try {
      return JSON.parse(repairedJson);
    } catch (repairError) {
      console.error('JSON repair also failed:', repairError);
      console.error('Original JSON length:', jsonString.length);
      throw new Error('The AI generated an incomplete response. Please try again with fewer topics.');
    }
  }
}

