import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get start of day
function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to get start of week (Monday)
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Fetch leaderboard data
async function getLeaderboard(timeframe, sortBy) {
  try {
    const now = new Date();
    let startDate = null;

    // Determine start date based on timeframe
    if (timeframe === 'daily') {
      startDate = getStartOfDay(now);
    } else if (timeframe === 'weekly') {
      startDate = getStartOfWeek(now);
    }
    // 'all-time' doesn't need a start date

    // Get all user stats
    const { data: allStats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, current_streak, longest_streak, total_study_time, level, xp, total_xp_earned');

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return { status: 500, body: { error: statsError.message } };
    }

    // If we need to filter by timeframe, get study sessions
    let studySessions = [];
    if (timeframe === 'daily' || timeframe === 'weekly') {
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('user_id, duration_minutes, timestamp')
        .gte('timestamp', startDate.toISOString());

      if (sessionsError) {
        console.error('Error fetching study sessions:', sessionsError);
        // Continue without filtering by sessions
      } else {
        studySessions = sessions || [];
      }
    }

    // Get user emails/display names
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    const userMap = new Map();
    if (users && !usersError) {
      users.forEach(user => {
        userMap.set(user.id, {
          email: user.email || 'Anonymous',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous'
        });
      });
    }

    // Process leaderboard data
    const leaderboardData = [];

    for (const stat of allStats || []) {
      const userInfo = userMap.get(stat.user_id) || { email: 'Anonymous', displayName: 'Anonymous' };
      
      let value = 0;
      let displayValue = '';

      if (sortBy === 'streak') {
        if (timeframe === 'daily' || timeframe === 'weekly') {
          // For daily/weekly, we need to calculate streak from sessions
          // For simplicity, use current_streak if they studied today/this week
          const userSessions = studySessions.filter(s => s.user_id === stat.user_id);
          if (userSessions.length > 0) {
            value = stat.current_streak || 0;
          } else {
            value = 0; // No sessions in timeframe = 0 streak
          }
        } else {
          // All time - use longest streak
          value = stat.longest_streak || 0;
        }
        displayValue = `${value} days`;
      } else if (sortBy === 'study_time') {
        if (timeframe === 'daily' || timeframe === 'weekly') {
          // Sum up study time from sessions in timeframe
          const userSessions = studySessions.filter(s => s.user_id === stat.user_id);
          value = userSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        } else {
          // All time - use total_study_time
          value = stat.total_study_time || 0;
        }
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        displayValue = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }

      // Only include users with non-zero values
      if (value > 0) {
        leaderboardData.push({
          userId: stat.user_id,
          displayName: userInfo.displayName,
          email: userInfo.email,
          value,
          displayValue,
          level: stat.level || 1,
          xp: stat.total_xp_earned || stat.xp || 0,
        });
      }
    }

    // Sort by value (descending)
    leaderboardData.sort((a, b) => b.value - a.value);

    // Limit to top 100
    const topUsers = leaderboardData.slice(0, 100);

    return {
      status: 200,
      body: {
        leaderboard: topUsers,
        timeframe,
        sortBy,
        total: topUsers.length
      }
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { status: 500, body: { error: error.message } };
  }
}

// Main handler
export default async function handler(req, res) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Supabase credentials'
      });
    }

    const { method, query } = req;

    if (method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const timeframe = query.timeframe || 'all-time'; // daily, weekly, all-time
    const sortBy = query.sortBy || 'study_time'; // streak, study_time

    if (!['daily', 'weekly', 'all-time'].includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }

    if (!['streak', 'study_time'].includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sortBy' });
    }

    const result = await getLeaderboard(timeframe, sortBy);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
}

