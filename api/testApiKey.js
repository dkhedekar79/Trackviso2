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
    // Test with gpt2 - simplest model, should always work
    const testResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: 'Hello',
        parameters: {
          max_new_tokens: 10,
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    const status = testResponse.status;
    const responseText = await testResponse.text();
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = { raw: responseText };
    }
    
    return res.status(200).json({
      status,
      statusText: testResponse.statusText,
      response: parsedResponse,
      responseText: responseText.substring(0, 1000),
      apiKeyPresent: !!HF_API_KEY,
      apiKeyPrefix: HF_API_KEY ? HF_API_KEY.substring(0, 5) + '...' : 'none',
      apiKeyLength: HF_API_KEY ? HF_API_KEY.length : 0,
      success: testResponse.ok,
      error: !testResponse.ok ? parsedResponse : null
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      apiKeyPresent: !!HF_API_KEY,
      apiKeyPrefix: HF_API_KEY ? HF_API_KEY.substring(0, 5) + '...' : 'none'
    });
  }
}
