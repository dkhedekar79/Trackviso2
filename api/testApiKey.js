// Simple test endpoint to verify HuggingFace API key
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'No API key found in environment variables' });
  }

  try {
    // Test with a simple model
    const testResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: 'Hello',
        parameters: {
          max_new_tokens: 5,
        },
      }),
    });

    const status = testResponse.status;
    const responseText = await testResponse.text();
    
    return res.status(200).json({
      status,
      statusText: testResponse.statusText,
      response: responseText.substring(0, 500),
      apiKeyPresent: !!HF_API_KEY,
      apiKeyPrefix: HF_API_KEY.substring(0, 5) + '...',
      success: testResponse.ok
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      apiKeyPresent: !!HF_API_KEY,
      apiKeyPrefix: HF_API_KEY ? HF_API_KEY.substring(0, 5) + '...' : 'none'
    });
  }
}
