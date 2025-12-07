import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verify admin status
async function verifyAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data && !error;
}

// List all users
async function listUsers(adminUserId) {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    // Get all users from auth.users table
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    // Get user stats for each user
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('user_id, is_premium, xp, level, total_study_time');

    // Get admin list
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('user_id, email');

    const adminUserIds = new Set(adminUsers?.map(a => a.user_id) || []);

    // Combine data
    const enrichedUsers = users.identities.map(identity => {
      const stats = userStats?.find(s => s.user_id === identity.user_id);
      const isAdmin = adminUserIds.has(identity.user_id);
      const user = users.users.find(u => u.id === identity.user_id);

      return {
        id: identity.user_id,
        email: identity.identity_data?.email || user?.email || 'Unknown',
        created_at: user?.created_at,
        is_premium: user?.user_metadata?.is_premium || stats?.is_premium || false,
        subscription_plan: user?.user_metadata?.subscription_plan || 'scholar',
        xp: stats?.xp || 0,
        level: stats?.level || 1,
        total_study_time: stats?.total_study_time || 0,
        is_admin: isAdmin,
        mock_exams_used: user?.user_metadata?.mock_exams_used || 0,
        blurt_tests_used: user?.user_metadata?.blurt_tests_used || 0,
      };
    });

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
    const { method, query, body } = req;
    const adminUserId = req.headers['x-admin-user-id'];

    if (!adminUserId) {
      return res.status(401).json({ error: 'Missing admin user ID' });
    }

    if (method === 'GET') {
      const { users, total } = (await listUsers(adminUserId)).body;
      if (users) {
        return res.status(200).json({ users, total });
      }
    }

    if (method === 'POST') {
      const action = query.action?.[0];
      const userId = query.userId?.[0];

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
    return res.status(500).json({ error: error.message });
  }
}
