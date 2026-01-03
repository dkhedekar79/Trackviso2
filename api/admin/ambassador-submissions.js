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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    // Handle GET - fetch all submissions
    if (req.method === 'GET') {
      const { status } = req.query; // Optional filter by status

      let query = supabase
        .from('ambassador_submissions')
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: submissions, error: submissionsError } = await query;

      if (submissionsError) {
        console.error('Error fetching ambassador submissions:', submissionsError);
        return res.status(500).json({ error: 'Failed to fetch submissions', details: submissionsError.message });
      }

      // Format the response with user info
      const formattedSubmissions = submissions.map(submission => ({
        id: submission.id,
        userId: submission.user_id,
        userEmail: submission.user?.email || 'Unknown',
        userName: submission.user?.user_metadata?.display_name || submission.user?.email?.split('@')[0] || 'Unknown',
        videoUrl: submission.video_url,
        platform: submission.platform,
        views: submission.views || 0,
        status: submission.status || 'pending',
        adminFeedback: submission.admin_feedback || null,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
      }));

      return res.status(200).json({
        submissions: formattedSubmissions,
        total: formattedSubmissions.length,
        pending: formattedSubmissions.filter(s => s.status === 'pending').length,
        approved: formattedSubmissions.filter(s => s.status === 'approved').length,
        rejected: formattedSubmissions.filter(s => s.status === 'rejected').length,
      });
    }

    // Handle POST - approve or reject submission
    if (req.method === 'POST') {
      const { submissionId, action, feedback } = req.body; // action: 'approve' or 'reject'

      if (!submissionId || !action) {
        return res.status(400).json({ error: 'Missing required fields: submissionId and action' });
      }

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Update submission status
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
        console.error('Error updating submission:', updateError);
        return res.status(500).json({ error: 'Failed to update submission', details: updateError.message });
      }

      // If approved, grant premium to the user
      if (action === 'approve' && updatedSubmission.user_id) {
        const { error: premiumError } = await supabase
          .from('user_stats')
          .update({ is_premium: true })
          .eq('user_id', updatedSubmission.user_id);

        if (premiumError) {
          console.error('Error granting premium:', premiumError);
          // Don't fail the request, just log the error
        } else {
          console.log('Premium granted to user:', updatedSubmission.user_id);
        }
      }

      return res.status(200).json({
        success: true,
        submission: {
          id: updatedSubmission.id,
          status: updatedSubmission.status,
          adminFeedback: updatedSubmission.admin_feedback,
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in admin ambassador submissions API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

