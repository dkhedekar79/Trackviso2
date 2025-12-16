import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get user_id and website_time_minutes from request body
    // This endpoint is called via sendBeacon which doesn't send auth headers
    const { user_id, website_time_minutes } = req.body;

    if (!user_id || website_time_minutes === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update website time in user_stats using service role (bypasses RLS)
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        website_time_minutes: website_time_minutes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (error) {
      console.error('Error updating website time:', error);
      return res.status(500).json({ error: 'Failed to update website time', details: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in update-website-time:', error);
    return res.status(500).json({ error: error.message });
  }
}

