import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminUserId = req.headers['x-admin-user-id'];

    if (!adminUserId) {
      return res.status(401).json({ error: 'Unauthorized: Missing admin user ID' });
    }

    // Verify admin status
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminUserId);
    
    if (adminError || !adminUser) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin user' });
    }

    const adminEmail = adminUser.user?.email;
    const isSpecificAdmin = adminEmail === 'dskhedekar7@gmail.com';

    // Check if user is in admin_users table
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', adminUserId)
      .single();

    if (!isSpecificAdmin && !adminRecord) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Fetch all schedules with user information
    const { data: schedules, error: schedulesError } = await supabase
      .from('user_schedules')
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .order('created_at', { ascending: false });

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return res.status(500).json({ error: 'Failed to fetch schedules', details: schedulesError.message });
    }

    // Format the response with user info
    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      userId: schedule.user_id,
      userEmail: schedule.user?.email || 'Unknown',
      userName: schedule.user?.user_metadata?.display_name || schedule.user?.email?.split('@')[0] || 'Unknown',
      scheduleName: schedule.schedule_name,
      startDate: schedule.start_date,
      endDate: schedule.end_date,
      isAIGenerated: schedule.is_ai_generated,
      blocksCount: Array.isArray(schedule.blocks) ? schedule.blocks.length : 0,
      setupData: schedule.setup_data,
      aiSummary: schedule.ai_summary,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
    }));

    return res.status(200).json({
      schedules: formattedSchedules,
      total: formattedSchedules.length
    });

  } catch (error) {
    console.error('Error in admin schedules API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

