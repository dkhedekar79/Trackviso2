export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // We use Brevo's REST API directly - no extra libraries needed
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        // IMPORTANT: The "sender" email MUST be the one you verify in Brevo
        sender: { 
          name: "Trackviso", 
          email: process.env.SENDER_EMAIL || "dskhedekar7@gmail.com" 
        },
        to: [{ email: email }],
        subject: 'Your Trackviso Desktop Link 💻',
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
            <h1 style="color: #6366f1;">Ready to study?</h1>
            <p>You requested a link to open Trackviso on your desktop. Click the button below to get started:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://trackviso-beta.vercel.app" 
                 style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                Open Trackviso on Desktop
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">
              Note: Trackviso is optimized for large screens. Please switch to a laptop or tablet for the best experience.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 10px; color: #aaa; text-align: center;">
              © 2025 Trackviso. All rights reserved.
            </p>
          </div>
        `
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', result);
      return res.status(response.status).json({ 
        error: result.message || 'Failed to send email via Brevo' 
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Network Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
