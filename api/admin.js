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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

// ========== USERS RESOURCE ==========
async function listUsers(adminUserId) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    console.log('Fetching all users from Supabase...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Error listing users:', usersError);
      return { status: 400, body: { error: usersError.message } };
    }

    if (!users || !users.users) {
      return { status: 200, body: { users: [], total: 0 } };
    }

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('user_id, is_premium, xp, level, total_study_time, website_time_minutes');

    // Get accurate study time from study_sessions
    const { data: studySessions } = await supabase
      .from('study_sessions')
      .select('user_id, duration_minutes');

    const studyTimeByUser = new Map();
    if (studySessions) {
      studySessions.forEach(session => {
        const current = studyTimeByUser.get(session.user_id) || 0;
        studyTimeByUser.set(session.user_id, current + (session.duration_minutes || 0));
      });
    }

    // Get admin list
    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('user_id, email');

    const adminUserIds = new Set((adminUsers || []).map(a => a.user_id));

    const enrichedUsers = users.users.map(user => {
      const stats = (userStats || []).find(s => s.user_id === user.id);
      const isAdmin = adminUserIds.has(user.id);
      const calculatedStudyTime = studyTimeByUser.get(user.id) || stats?.total_study_time || 0;
      const websiteTimeMinutes = stats?.website_time_minutes || 0;
      const userXP = stats?.xp !== null && stats?.xp !== undefined ? stats.xp : 0;
      const userEmail = user.email || 'Unknown';

      return {
        id: user.id,
        email: userEmail,
        created_at: user.created_at,
        is_premium: user.user_metadata?.is_premium || stats?.is_premium || false,
        subscription_plan: user.user_metadata?.subscription_plan || 'scholar',
        xp: userXP,
        level: stats?.level || 1,
        total_study_time: calculatedStudyTime,
        website_time_minutes: websiteTimeMinutes,
        is_admin: isAdmin,
        mock_exams_used: user.user_metadata?.mock_exams_used || 0,
        blurt_tests_used: user.user_metadata?.blurt_tests_used || 0,
      };
    });

    return { status: 200, body: { users: enrichedUsers, total: enrichedUsers.length } };
  } catch (error) {
    console.error('Error listing users:', error);
    return { status: 500, body: { error: error.message } };
  }
}

async function makeUserAdmin(adminUserId, targetUserId, targetEmail) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

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

    return { status: 200, body: { success: true, message: 'User promoted to admin' } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

async function removeUserAdmin(adminUserId, targetUserId) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', targetUserId);

    if (error) {
      return { status: 400, body: { error: error.message } };
    }

    return { status: 200, body: { success: true, message: 'Admin status removed' } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

async function updateUserSubscription(adminUserId, targetUserId, plan) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        subscription_plan: plan,
        is_premium: plan === 'professor'
      }
    });

    if (authError) {
      return { status: 400, body: { error: authError.message } };
    }

    await supabase
      .from('user_stats')
      .update({ is_premium: plan === 'professor' })
      .eq('user_id', targetUserId);

    return { status: 200, body: { success: true, message: `Updated subscription to ${plan}` } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

async function resetUserUsage(adminUserId, targetUserId) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

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

    return { status: 200, body: { success: true, message: 'Daily usage reset' } };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

// ========== SCHEDULES RESOURCE ==========
async function listSchedules(adminUserId) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    const { data: schedules, error: schedulesError } = await supabase
      .from('user_schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (schedulesError) {
      return { status: 500, body: { error: 'Failed to fetch schedules', details: schedulesError.message } };
    }

    // Fetch user data separately for each unique user_id
    const uniqueUserIds = [...new Set(schedules.map(s => s.user_id))];
    const userMap = new Map();

    for (const userId of uniqueUserIds) {
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (!userError && userData?.user) {
          userMap.set(userId, {
            email: userData.user.email || 'Unknown',
            displayName: userData.user.user_metadata?.display_name || userData.user.email?.split('@')[0] || 'Unknown'
          });
        }
      } catch (e) {
        console.warn(`Error fetching user ${userId}:`, e.message);
        userMap.set(userId, { email: 'Unknown', displayName: 'Unknown' });
      }
    }

    const formattedSchedules = schedules.map(schedule => {
      const userInfo = userMap.get(schedule.user_id) || { email: 'Unknown', displayName: 'Unknown' };
      return {
        id: schedule.id,
        userId: schedule.user_id,
        userEmail: userInfo.email,
        userName: userInfo.displayName,
        scheduleName: schedule.schedule_name,
        startDate: schedule.start_date,
        endDate: schedule.end_date,
        isAIGenerated: schedule.is_ai_generated,
        blocksCount: Array.isArray(schedule.blocks) ? schedule.blocks.length : (typeof schedule.blocks === 'string' ? JSON.parse(schedule.blocks || '[]').length : 0),
        setupData: schedule.setup_data,
        aiSummary: schedule.ai_summary,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      };
    });

    return { status: 200, body: { schedules: formattedSchedules, total: formattedSchedules.length } };
  } catch (error) {
    console.error('Error in listSchedules:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// ========== AMBASSADOR SUBMISSIONS RESOURCE ==========
async function listAmbassadorSubmissions(adminUserId, status = null) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    let query = supabase
      .from('ambassador_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      return { status: 500, body: { error: 'Failed to fetch submissions', details: submissionsError.message } };
    }

    // Fetch user data separately for each unique user_id
    const uniqueUserIds = [...new Set(submissions.map(s => s.user_id))];
    const userMap = new Map();

    for (const userId of uniqueUserIds) {
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (!userError && userData?.user) {
          userMap.set(userId, {
            email: userData.user.email || 'Unknown',
            displayName: userData.user.user_metadata?.display_name || userData.user.email?.split('@')[0] || 'Unknown'
          });
        }
      } catch (e) {
        console.warn(`Error fetching user ${userId}:`, e.message);
        userMap.set(userId, { email: 'Unknown', displayName: 'Unknown' });
      }
    }

    const formattedSubmissions = submissions.map(submission => {
      const userInfo = userMap.get(submission.user_id) || { email: 'Unknown', displayName: 'Unknown' };
      return {
        id: submission.id,
        userId: submission.user_id,
        userEmail: userInfo.email,
        userName: userInfo.displayName,
        videoUrl: submission.video_url,
        platform: submission.platform,
        views: submission.views || 0,
        status: submission.status || 'pending',
        adminFeedback: submission.admin_feedback || null,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
      };
    });

    return {
      status: 200,
      body: {
        submissions: formattedSubmissions,
        total: formattedSubmissions.length,
        pending: formattedSubmissions.filter(s => s.status === 'pending').length,
        approved: formattedSubmissions.filter(s => s.status === 'approved').length,
        rejected: formattedSubmissions.filter(s => s.status === 'rejected').length,
      }
    };
  } catch (error) {
    console.error('Error in listAmbassadorSubmissions:', error);
    return { status: 500, body: { error: error.message } };
  }
}

async function updateAmbassadorSubmission(adminUserId, submissionId, action, feedback) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    if (action !== 'approve' && action !== 'reject') {
      return { status: 400, body: { error: 'Invalid action. Must be "approve" or "reject"' } };
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('ambassador_submissions')
      .update({
        status: newStatus,
        admin_feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      return { status: 500, body: { error: 'Failed to update submission', details: updateError.message } };
    }

    // If approved, grant premium to the user
    if (action === 'approve' && updatedSubmission.user_id) {
      await supabase
        .from('user_stats')
        .update({ is_premium: true })
        .eq('user_id', updatedSubmission.user_id);
    }

    return {
      status: 200,
      body: {
        success: true,
        submission: {
          id: updatedSubmission.id,
          status: updatedSubmission.status,
          adminFeedback: updatedSubmission.admin_feedback,
        }
      }
    };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

// ========== RECALCULATE STATS RESOURCE ==========
async function recalculateStats(adminUserId) {
  try {
    const isAdmin = await verifyAdmin(adminUserId);
    if (!isAdmin) {
      return { status: 403, body: { error: 'Unauthorized: Not an admin' } };
    }

    const { data, error } = await supabase.rpc('recalculate_all_user_stats');

    if (error) {
      return { status: 500, body: { error: error.message || 'Failed to recalculate user stats' } };
    }

    const { count } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true });

    return {
      status: 200,
      body: {
        success: true,
        message: 'User stats recalculated successfully',
        usersUpdated: count || 0
      }
    };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

// ========== INITIALIZE RESOURCE ==========
async function initializeAdmin() {
  try {
    // Check if any admins exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (checkError) {
      return { status: 400, body: { error: checkError.message } };
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return { status: 400, body: { error: 'Admin already exists. Use /api/admin?resource=users to manage admins.' } };
    }

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      return { status: 400, body: { error: listError.message } };
    }

    const adminUser = users.users.find(u => u.email === 'dskhedekar7@gmail.com');

    if (!adminUser) {
      return { status: 404, body: { error: 'User dskhedekar7@gmail.com not found. Please sign up first.' } };
    }

    // Create admin record
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([{
        user_id: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        permissions: {
          manage_users: true,
          manage_subscriptions: true,
          view_analytics: true
        }
      }]);

    if (insertError) {
      return { status: 400, body: { error: insertError.message } };
    }

    // Also make sure user_stats exists and is_premium is true
    await supabase
      .from('user_stats')
      .upsert({
        user_id: adminUser.id,
        is_premium: true,
        xp_multiplier: 2.0
      }, { onConflict: 'user_id' });

    // Update auth metadata
    await supabase.auth.admin.updateUserById(adminUser.id, {
      user_metadata: {
        subscription_plan: 'professor',
        is_premium: true,
        is_admin: true
      }
    });

    return {
      status: 200,
      body: {
        success: true,
        message: 'Admin initialized successfully',
        admin: {
          email: adminUser.email,
          userId: adminUser.id
        }
      }
    };
  } catch (error) {
    return { status: 500, body: { error: error.message } };
  }
}

// ========== MAIN HANDLER ==========
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: 'Server configuration error: Missing Supabase credentials',
        details: 'Check that SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL are set'
      });
    }

    const { method, query, body } = req;
    const adminUserId = req.headers['x-admin-user-id'];
    const resource = Array.isArray(query.resource) ? query.resource[0] : query.resource;

    // Initialize doesn't require admin auth
    if (resource === 'initialize' && method === 'POST') {
      const result = await initializeAdmin();
      return res.status(result.status).json(result.body);
    }

    if (!adminUserId) {
      return res.status(401).json({ error: 'Missing admin user ID' });
    }

    // Handle different resources
    switch (resource) {
      case 'users':
        if (method === 'GET') {
          const result = await listUsers(adminUserId);
          return res.status(result.status).json(result.body);
        }
        if (method === 'POST') {
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
        break;

      case 'schedules':
        if (method === 'GET') {
          const result = await listSchedules(adminUserId);
          return res.status(result.status).json(result.body);
        }
        break;

      case 'ambassador-submissions':
        if (method === 'GET') {
          const status = Array.isArray(query.status) ? query.status[0] : query.status;
          const result = await listAmbassadorSubmissions(adminUserId, status);
          return res.status(result.status).json(result.body);
        }
        if (method === 'POST') {
          const result = await updateAmbassadorSubmission(adminUserId, body.submissionId, body.action, body.feedback);
          return res.status(result.status).json(result.body);
        }
        break;

      case 'recalculate-stats':
        if (method === 'POST') {
          const result = await recalculateStats(adminUserId);
          return res.status(result.status).json(result.body);
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid resource. Valid resources: users, schedules, ambassador-submissions, recalculate-stats, initialize' });
    }

    return res.status(405).json({ error: 'Method not allowed for this resource' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

