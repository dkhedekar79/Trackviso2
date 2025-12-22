import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Trackviso <onboarding@resend.dev>', // You can update this once you have a domain
      to: email,
      subject: 'Your Trackviso Desktop Link 💻',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
          <h1 style="color: #6366f1;">Ready to study?</h1>
          <p>You requested a link to open Trackviso on your desktop. Click the button below to get started:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://trackviso-beta.vercel.app" 
               style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; borderRadius: 12px; fontWeight: bold; display: inline-block;">
              Open Trackviso on Desktop
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            Note: Trackviso is optimized for large screens. If you're on a mobile device, please switch to a laptop or tablet for the best experience.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 10px; color: #aaa; text-align: center;">
            © 2025 Trackviso. All rights reserved.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

