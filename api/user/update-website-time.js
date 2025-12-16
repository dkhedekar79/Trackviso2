import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For now, we'll use the body to get user_id and website_time_minutes
    // In production, you'd verify the session token
    const { user_id, website_time_minutes } = req.body;

    if (!user_id || website_time_minutes === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update website time in user_stats
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        website_time_minutes: website_time_minutes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (error) {
      console.error('Error updating website time:', error);
      return res.status(500).json({ error: 'Failed to update website time' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in update-website-time:', error);
    return res.status(500).json({ error: error.message });
  }
}

