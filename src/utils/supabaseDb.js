import { supabase } from '../supabaseClient';

export const initializeDatabase = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No session available for database initialization');
      return;
    }

    const userId = session.user.id;

    // Check if user_stats record exists
    const { data: userStatsData, error: selectError } = await supabase
      .from('user_stats')
      .select('id')
      .eq('user_id', userId)
      .single();

    // If no record found, create one
    if (selectError && selectError.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('user_stats')
        .insert([{
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
          badges: [],
          achievements: [],
          unlocked_titles: [],
          current_title: 'Rookie Scholar',
          weekly_xp: 0,
          weekly_rank: 0,
          friends: [],
          challenges: [],
          is_premium: false,
          xp_multiplier: 1.0,
          premium_skins: [],
          current_skin: 'default',
          subject_mastery: {},
          weekly_goal: 0,
          weekly_progress: 0,
          total_xp_earned: 0,
          last_reward_time: null,
          reward_streak: 0,
          lucky_streak: 0,
          jackpot_count: 0,
          gems: 0,
          xp_events: [],
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user_stats record:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          status: insertError.status,
        });
        return;
      }

      console.log('✅ User stats record created for user:', userId);
    } else if (selectError) {
      console.error('Error checking user_stats:', {
        message: selectError.message,
        code: selectError.code,
      });
      return;
    } else {
      console.log('✅ User stats already exists for user:', userId);
    }
  } catch (error) {
    console.error('Exception initializing database:', {
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
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
};

// Update user stats in Supabase
export const updateUserStats = async (updates) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session when updating user stats');
      return null;
    }

    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user stats:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status,
        fullError: error
      });
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception updating user stats:', {
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
    console.error('Error adding study session:', error);
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
    console.error('Error fetching study sessions:', error);
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
    console.error('Error updating topic progress:', error);
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
    console.error('Error fetching topic progress:', error);
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
    console.error('Error upserting subject:', error);
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
    console.error('Error fetching subjects:', error);
    return [];
  }

  return data || [];
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
    console.error('Error fetching tasks:', error);
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
    console.error('Error upserting task:', error);
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
