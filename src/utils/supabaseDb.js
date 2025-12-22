import { supabase } from '../supabaseClient';
import logger from './logger';

export const initializeDatabase = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.warn('No session available for database initialization');
      return;
    }

    const userId = session.user.id;

    // Check if user_stats record exists
    // Use minimal select to avoid schema issues
    const { data: userStatsData, error: selectError } = await supabase
      .from('user_stats')
      .select('user_id, xp, level')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors

    // If no record found, create one with only essential columns
    // This avoids schema mismatch errors
    if ((selectError && selectError.code === 'PGRST116') || !userStatsData) {
      // Start with minimal required fields
      const minimalStats = {
          user_id: userId,
          xp: 0,
          level: 1,
          prestige_level: 0,
          total_sessions: 0,
          total_study_time: 0,
          current_streak: 0,
          longest_streak: 0,
          last_study_date: null,
          streak_savers: 3,
          current_title: 'Rookie Scholar',
          weekly_xp: 0,
          weekly_rank: 0,
          is_premium: false,
          xp_multiplier: 1.0,
          subject_mastery: {},
          weekly_goal: 0,
          weekly_progress: 0,
          total_xp_earned: 0,
          reward_streak: 0,
          lucky_streak: 0,
          jackpot_count: 0,
          gems: 0,
        completed_quests_today: 0,
        website_time_minutes: 0,
      };

      // Try to insert minimal stats first
      // If that fails due to missing columns, try with even fewer columns
      let insertData, insertError;
      
      // First attempt: try with minimal stats
      ({ data: insertData, error: insertError } = await supabase
        .from('user_stats')
        .insert([minimalStats])
        .select()
        .single());

      // If insert fails due to missing columns, try with absolute minimum
      if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('column'))) {
        logger.warn('Some columns missing, trying with minimal set:', insertError.message);
        const absoluteMinimal = {
          user_id: userId,
          xp: 0,
          level: 1,
          total_sessions: 0,
          total_study_time: 0,
        };
        
        ({ data: insertData, error: insertError } = await supabase
          .from('user_stats')
          .insert([absoluteMinimal])
          .select()
          .single());
      }

      if (insertError) {
        logger.error('Error creating user_stats record:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          status: insertError.status,
        });
        // Don't return - let the app continue even if initialization fails
        // The user can still use the app, and we'll retry on next load
        return;
      }

      logger.log('✅ User stats record created for user:', userId);
    } else if (selectError) {
      logger.error('Error checking user_stats:', {
        message: selectError.message,
        code: selectError.code,
      });
      return;
    } else {
      logger.log('✅ User stats already exists for user:', userId);
    }
  } catch (error) {
    logger.error('Exception initializing database:', {
      message: error.message,
      stack: error.stack,
    });
  }
};

// Fetch user stats from Supabase
export const fetchUserStats = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    logger.error('Error fetching user stats:', error);
    return null;
  }

  return data;
};

// Update user stats in Supabase
export const updateUserStats = async (updates) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      logger.error('No active session when updating user stats');
      return null;
    }

    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user stats:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status,
        fullError: error
      });
      return null;
    }

    // Check for referral completion if level was updated
    if (updates.level >= 10) {
      checkReferralCompletion(session.user.id, updates.level);
    }

    return data;
  } catch (error) {
    logger.error('Exception updating user stats:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    return null;
  }
};

// Add a study session
export const addStudySession = async (sessionData) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('study_sessions')
    .insert([{
      user_id: session.user.id,
      ...sessionData,
      timestamp: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error adding study session:', error);
    return null;
  }

  return data;
};

// Fetch study sessions
export const fetchStudySessions = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('timestamp', { ascending: false });

  if (error) {
    logger.error('Error fetching study sessions:', error);
    return [];
  }

  return data || [];
};

// Update topic progress for mastery
export const updateTopicProgress = async (subject, topicProgress) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('topic_progress')
    .upsert([{
      user_id: session.user.id,
      subject,
      progress_data: topicProgress,
      updated_at: new Date().toISOString(),
    }], { onConflict: 'user_id,subject' })
    .select()
    .single();

  if (error) {
    logger.error('Error updating topic progress:', error);
    return null;
  }

  return data;
};

// Fetch topic progress for a subject
export const fetchTopicProgress = async (subject) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('subject', subject)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching topic progress:', error);
  }

  return data?.progress_data || null;
};

// Add or update user subject
export const upsertUserSubject = async (subjectData) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_subjects')
    .upsert([{
      user_id: session.user.id,
      ...subjectData,
      updated_at: new Date().toISOString(),
    }], { onConflict: 'user_id,id' })
    .select()
    .single();

  if (error) {
    logger.error('Error upserting subject:', error);
    return null;
  }

  return data;
};

// Fetch user subjects
export const fetchUserSubjects = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('user_subjects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching subjects:', error);
    return [];
  }

  return data || [];
};

// Delete a user subject
export const deleteUserSubject = async (subjectId) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { error } = await supabase
    .from('user_subjects')
    .delete()
    .eq('user_id', session.user.id)
    .eq('id', subjectId);

  if (error) {
    logger.error('Error deleting subject:', error);
    return null;
  }

  return true;
};

// Fetch all tasks
export const fetchUserTasks = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
};

// Add or update task
export const upsertUserTask = async (taskData) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_tasks')
    .upsert([{
      user_id: session.user.id,
      ...taskData,
      updated_at: new Date().toISOString(),
    }], { onConflict: 'user_id,id' })
    .select()
    .single();

  if (error) {
    logger.error('Error upserting task:', error);
    return null;
  }

  return data;
};

// Subscribe to real-time user stats updates
export const subscribeToUserStats = (userId, callback) => {
  const subscription = supabase
    .channel(`user-stats-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_stats',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Subscribe to real-time study sessions updates
export const subscribeToStudySessions = (userId, callback) => {
  const subscription = supabase
    .channel(`study-sessions-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'study_sessions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

// Referral System Functions

/**
 * Creates a referral record
 * @param {string} referrerId - The ID of the user who referred the new user
 */
export const createReferral = async (referrerId) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const referredId = session.user.id;
    
    // Don't refer yourself
    if (referrerId === referredId) return null;

    const { data, error } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referred_id: referredId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already referred
        return null;
      }
      logger.error('Error creating referral:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Exception creating referral:', error);
    return null;
  }
};

/**
 * Fetches referrals for a user (as a referrer)
 */
export const fetchReferrals = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('referrals')
      .select('*, referred_stats:user_stats!referred_id(level)')
      .eq('referrer_id', session.user.id);

    if (error) {
      logger.error('Error fetching referrals:', error);
      return [];
    }

    return data;
  } catch (error) {
    logger.error('Exception fetching referrals:', error);
    return [];
  }
};

/**
 * Checks and updates referral status when a user reaches level 10
 */
export const checkReferralCompletion = async (userId, level) => {
  if (level < 10) return;

  try {
    // Check if this user was referred and status is still pending
    const { data: referral, error: fetchError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError || !referral) return;

    // Update referral status to completed
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ status: 'completed' })
      .eq('id', referral.id);

    if (updateError) {
      logger.error('Error completing referral:', updateError);
      return;
    }

    // Now check if the referrer has hit the 3 referrals milestone
    const referrerId = referral.referrer_id;
    const { data: completedReferrals, error: countError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('status', 'completed');

    if (countError) return;

    if (completedReferrals.length >= 3) {
      // Grant premium to referrer
      // Note: In a real app, this should be done via a secure server-side function
      const { error: premiumError } = await supabase.auth.updateUser({
        data: { is_premium: true }
      });
      
      // Also update user_stats table for the referrer
      await supabase
        .from('user_stats')
        .update({ is_premium: true })
        .eq('user_id', referrerId);
        
      if (premiumError) {
        logger.error('Error granting premium via referral:', premiumError);
      } else {
        logger.log('Premium granted to referrer:', referrerId);
      }
    }
  } catch (error) {
    logger.error('Exception in checkReferralCompletion:', error);
  }
};

// Ambassador Program Functions

/**
 * Submits a video link for the ambassador program
 */
export const submitAmbassadorLink = async (videoUrl, platform, views) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('ambassador_submissions')
      .insert([{
        user_id: session.user.id,
        video_url: videoUrl,
        platform,
        views: parseInt(views) || 0,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error submitting ambassador link:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Exception submitting ambassador link:', error);
    return null;
  }
};

/**
 * Fetches all ambassador submissions for the current user
 */
export const fetchAmbassadorSubmissions = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('ambassador_submissions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching ambassador submissions:', error);
      return [];
    }

    return data;
  } catch (error) {
    logger.error('Exception fetching ambassador submissions:', error);
    return [];
  }
};
