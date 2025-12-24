import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API endpoint to recalculate all user stats from study_sessions
export default async function handler(req, res) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Supabase credentials'
      });
    }

    const { method } = req;

    if (method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Call the database function to recalculate all stats
    const { data, error } = await supabase.rpc('recalculate_all_user_stats');

    if (error) {
      console.error('Error recalculating user stats:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to recalculate user stats'
      });
    }

    // Get updated stats count
    const { count } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      message: 'User stats recalculated successfully',
      usersUpdated: count || 0
    });
  } catch (error) {
    console.error('Recalculate stats API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
}

