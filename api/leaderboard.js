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

    // Get all user stats - ensure we get XP even if it's 0
    const { data: allStats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, current_streak, longest_streak, total_study_time, level, xp, total_xp_earned')
      .not('xp', 'is', null); // Only get users who have an XP value (including 0)

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return { status: 500, body: { error: statsError.message } };
    }

    console.log(`Found ${allStats?.length || 0} users with stats, XP values:`, 
      allStats?.map(s => ({ user: s.user_id, xp: s.xp })).slice(0, 5));

    // If we need to filter by timeframe or calculate all-time more accurately, get study sessions
    let studySessions = [];
    const sessionsQuery = supabase
      .from('study_sessions')
      .select('user_id, duration_minutes, timestamp');

    if (timeframe === 'daily') {
      sessionsQuery.gte('timestamp', getStartOfDay(now).toISOString());
    } else if (timeframe === 'weekly') {
      sessionsQuery.gte('timestamp', getStartOfWeek(now).toISOString());
    }
    // For 'all-time', we fetch all sessions to ensure accurate study time calculation

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('Error fetching study sessions:', sessionsError);
    } else {
      studySessions = sessions || [];
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

    // We can also include users who have sessions but maybe no user_stats record yet
    const userIdsWithSessions = new Set(studySessions.map(s => s.user_id));
    const allUserIds = new Set([...(allStats || []).map(s => s.user_id), ...userIdsWithSessions]);

    for (const userId of allUserIds) {
      const stat = (allStats || []).find(s => s.user_id === userId) || {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_study_time: 0,
        level: 1,
        xp: 0,
        total_xp_earned: 0
      };
      
      const userInfo = userMap.get(userId) || { email: 'Anonymous', displayName: 'Anonymous' };
      
      let value = 0;
      let displayValue = '';

      if (sortBy === 'streak') {
        const userSessions = studySessions.filter(s => s.user_id === userId);
        
        if (timeframe === 'daily' || timeframe === 'weekly') {
          // For daily/weekly, use current_streak if they studied in the timeframe
          if (userSessions.length > 0) {
            value = stat.current_streak || 0;
          } else {
            value = 0;
          }
        } else {
          // All time - calculate longest streak from all sessions for maximum accuracy
          if (userSessions.length > 0) {
            // Get unique study days
            const studyDays = [...new Set(userSessions.map(s => 
              new Date(s.timestamp).toDateString()
            ))].map(d => new Date(d).getTime());
            
            // Sort days
            studyDays.sort((a, b) => a - b);
            
            let longest = 0;
            let current = 0;
            let lastDay = null;
            
            for (const day of studyDays) {
              if (lastDay === null) {
                current = 1;
              } else {
                const diff = (day - lastDay) / (1000 * 60 * 60 * 24);
                if (diff <= 1.1) { // 1 day difference (with some buffer for TZ)
                  current++;
                } else {
                  longest = Math.max(longest, current);
                  current = 1;
                }
              }
              lastDay = day;
            }
            longest = Math.max(longest, current);
            
            // Use the calculated longest streak, or the one in stats if it's somehow larger
            value = Math.max(longest, stat.longest_streak || 0);
          } else {
            value = stat.longest_streak || 0;
          }
        }
        displayValue = `${value} days`;
      } else if (sortBy === 'study_time') {
        // Always calculate study time from sessions if available for better accuracy
        const userSessions = studySessions.filter(s => s.user_id === userId);
        if (userSessions.length > 0) {
          value = userSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        } else if (timeframe === 'all-time') {
          // Fallback to stat.total_study_time if no sessions found (maybe legacy data)
          value = stat.total_study_time || 0;
        }
        
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        displayValue = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }

      // Only include users with non-zero values for the sort metric
      // But always include XP even if it's 0
      if (value > 0) {
        const userXP = stat.xp !== null && stat.xp !== undefined ? stat.xp : 0;
        leaderboardData.push({
          userId: stat.user_id,
          displayName: userInfo.displayName,
          email: userInfo.email,
          value,
          displayValue,
          level: stat.level || 1,
          xp: userXP, // Use current XP from user_stats (always include, even if 0)
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

