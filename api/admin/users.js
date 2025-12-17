import { createClient } from '@supabase/supabase-js';

// Get environment variables - try both Vercel and Vite naming conventions
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verify admin status
async function verifyAdmin(userId) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Cannot verify admin: Missing Supabase credentials');
    return false;
  }

  // Also check if user email is the specific admin email (check this first for speed)
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (!userError && userData?.user?.email === 'dskhedekar7@gmail.com') {
      return true;
    }
  } catch (e) {
    console.warn('Error checking user email for admin:', e.message);
  }

  // Check if user is in admin_users table
  try {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single();

    if (data && !error) {
      return true;
    }
  } catch (e) {
    // Table might not exist, that's okay
    console.warn('Error checking admin_users table:', e.message);
  }

  return false;
}

// List all users
async function listUsers(adminUserId) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      console.log('Admin verification failed for user:', adminUserId);
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    console.log('Fetching all users from Supabase...');
    // Get all users from auth.users table
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Error listing users:', usersError);
      return { status: 400, body: { error: usersError.message } };
    }

    console.log('Users response:', {
      hasData: !!users,
      hasUsers: !!users?.users,
      userCount: users?.users?.length || 0,
      dataKeys: users ? Object.keys(users) : []
    });

    if (!users || !users.users) {
      console.warn('No users found in response:', users);
      return { status: 200, body: { users: [], total: 0 } };
    }

    // Get user stats for each user
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, is_premium, xp, level, total_study_time, website_time_minutes');

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      // Continue without stats rather than failing completely
    } else {
      console.log('User stats fetched:', userStats?.length || 0, 'records');
    }

    // Get admin list
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, email');

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      // Continue without admin list
    } else {
      console.log('Admin users fetched:', adminUsers?.length || 0, 'records');
    }

    const adminUserIds = new Set((adminUsers || []).map(a => a.user_id));

    console.log('Processing', users.users.length, 'users...');
    // Combine data - use users array directly
    const enrichedUsers = users.users.map(user => {
      const stats = (userStats || []).find(s => s.user_id === user.id);
      const isAdmin = adminUserIds.has(user.id);
      
      // Get website time from user_stats (tracked accurately)
      const websiteTimeMinutes = stats?.website_time_minutes || 0;

      // Get email from user object or identities
      const userEmail = user.email || 
        (users.identities?.find(i => i.user_id === user.id)?.identity_data?.email) || 
        'Unknown';

      return {
        id: user.id,
        email: userEmail,
        created_at: user.created_at,
        is_premium: user.user_metadata?.is_premium || stats?.is_premium || false,
        subscription_plan: user.user_metadata?.subscription_plan || 'scholar',
        xp: stats?.xp || 0,
        level: stats?.level || 1,
        total_study_time: stats?.total_study_time || 0,
        website_time_minutes: websiteTimeMinutes,
        is_admin: isAdmin,
        mock_exams_used: user.user_metadata?.mock_exams_used || 0,
        blurt_tests_used: user.user_metadata?.blurt_tests_used || 0,
      };
    });

    console.log('Returning', enrichedUsers.length, 'enriched users');
    return {
      status: 200,
      body: { users: enrichedUsers, total: enrichedUsers.length }
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Make user admin
async function makeUserAdmin(adminUserId, targetUserId, targetEmail) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    // Add to admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert([{
        user_id: targetUserId,
        email: targetEmail,
        role: 'admin',
        permissions: {
          manage_users: true,
          manage_subscriptions: true,
          view_analytics: true
        }
      }]);

    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    // Log action
    await supabase
      .from('user_logs')
      .insert([{
        admin_id: adminUserId,
        action: 'make_admin',
        target_user_id: targetUserId,
        details: { email: targetEmail }
      }]);

    return { status: 200, body: { success: true, message: 'User promoted to admin' } };
  } catch (error) {
    console.error('Error making user admin:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Remove admin status
async function removeUserAdmin(adminUserId, targetUserId) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    // Remove from admin_users table
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', targetUserId);

    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    // Log action
    await supabase
      .from('user_logs')
      .insert([{
        admin_id: adminUserId,
        action: 'remove_admin',
        target_user_id: targetUserId
      }]);

    return { status: 200, body: { success: true, message: 'Admin status removed' } };
  } catch (error) {
    console.error('Error removing admin:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Update user subscription
async function updateUserSubscription(adminUserId, targetUserId, plan) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    // Update auth metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        subscription_plan: plan,
        is_premium: plan === 'professor'
      }
    });

    if (authError) {
      return { status: 400, body: { error: authError.message } };
    }

    // Update user_stats table
    await supabase
      .from('user_stats')
      .update({ is_premium: plan === 'professor' })
      .eq('user_id', targetUserId);

    // Log action
    await supabase
      .from('user_logs')
      .insert([{
        admin_id: adminUserId,
        action: 'update_subscription',
        target_user_id: targetUserId,
        details: { plan }
      }]);

    return { status: 200, body: { success: true, message: `Updated subscription to ${plan}` } };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Reset daily usage for a user
async function resetUserUsage(adminUserId, targetUserId) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    // Reset usage in auth metadata
    const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        mock_exams_used: 0,
        blurt_tests_used: 0,
        usage_reset_date: new Date().toISOString()
      }
    });

    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    // Log action
    await supabase
      .from('user_logs')
      .insert([{
        admin_id: adminUserId,
        action: 'reset_usage',
        target_user_id: targetUserId
      }]);

    return { status: 200, body: { success: true, message: 'Daily usage reset' } };
  } catch (error) {
    console.error('Error resetting usage:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Main handler
export default async function handler(req, res) {
  try {
    // Check environment variables first
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Supabase credentials',
        details: 'Check that SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL are set'
      });
    }

    const { method, query, body } = req;
    const adminUserId = req.headers['x-admin-user-id'];

    if (!adminUserId) {
      return res.status(401).json({ error: 'Missing admin user ID' });
    }

    if (method === 'GET') {
      const result = await listUsers(adminUserId);
      if (result.status === 200) {
        return res.status(200).json(result.body);
      } else {
        return res.status(result.status).json(result.body);
      }
    }

    if (method === 'POST') {
      // Handle both array and string query parameters
      const action = Array.isArray(query.action) ? query.action[0] : query.action;
      const userId = Array.isArray(query.userId) ? query.userId[0] : query.userId;

      if (action === 'make-admin') {
        const result = await makeUserAdmin(adminUserId, userId, body.email);
        return res.status(result.status).json(result.body);
      }

      if (action === 'remove-admin') {
        const result = await removeUserAdmin(adminUserId, userId);
        return res.status(result.status).json(result.body);
      }

      if (action === 'update-subscription') {
        const result = await updateUserSubscription(adminUserId, userId, body.plan);
        return res.status(result.status).json(result.body);
      }

      if (action === 'reset-usage') {
        const result = await resetUserUsage(adminUserId, userId);
        return res.status(result.status).json(result.body);
      }
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('Admin API error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
