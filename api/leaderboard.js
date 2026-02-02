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

// Helper function to fetch all users with pagination
async function getAllUsers() {
  const allUsers = [];
  let page = 1;
  const perPage = 1000; // Fetch up to 1000 users per page
  
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });
    
    if (error) {
      console.error(`[Leaderboard] Error fetching users page ${page}:`, error);
      break;
    }
    
    if (!data || !data.users || data.users.length === 0) {
      // No more users to fetch
      break;
    }
    
    allUsers.push(...data.users);
    
    // If we got fewer users than perPage, we've reached the end
    if (data.users.length < perPage) {
      break;
    }
    
    page++;
  }
  
  console.log(`[Leaderboard] Fetched ${allUsers.length} total users across ${page} page(s)`);
  return allUsers;
}

// Fetch leaderboard data
async function getLeaderboard(timeframe, sortBy, currentUserId = null) {
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

    // Get all user stats - include all users even if XP is null
    const { data: allStats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, current_streak, longest_streak, total_study_time, level, xp, total_xp_earned');

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return { status: 500, body: { error: statsError.message } };
    }

    // Debug: Log XP values for first few users
    if (allStats && allStats.length > 0) {
      console.log(`[Leaderboard] Found ${allStats.length} users with stats. Sample XP values:`, 
        allStats.slice(0, 5).map(s => ({ 
          user_id: s.user_id?.substring(0, 8), 
          xp: s.xp, 
          total_xp_earned: s.total_xp_earned,
          level: s.level 
        })));
      
      // Check for users with XP but null values
      const usersWithXP = allStats.filter(s => (s.xp || 0) > 0);
      console.log(`[Leaderboard] Users with XP > 0: ${usersWithXP.length}`);
    }

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

    // Get user emails/display names - fetch all users with pagination
    let allAuthUsers = [];
    try {
      allAuthUsers = await getAllUsers();
    } catch (error) {
      console.error('[Leaderboard] Error fetching all users:', error);
      // Continue with empty array - will show Anonymous for users not found
    }
    
    const userMap = new Map();
    
    if (allAuthUsers && allAuthUsers.length > 0) {
      // Build user map with better fallback logic
      allAuthUsers.forEach(user => {
        let displayName = null;
        
        // Priority 1: Use display_name from metadata (if set and not empty)
        if (user.user_metadata?.display_name && user.user_metadata.display_name.trim()) {
          displayName = user.user_metadata.display_name.trim();
        } 
        // Priority 2: Use email username part (capitalized)
        else if (user.email) {
          const emailUsername = user.email.split('@')[0];
          if (emailUsername && emailUsername.length > 0) {
            // Capitalize first letter and lowercase the rest
            displayName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1).toLowerCase();
          }
        }
        
        userMap.set(user.id, {
          email: user.email || null,
          displayName: displayName // null if no display name or email, handled in fallback below
        });
      });
      
      console.log(`[Leaderboard] Loaded ${allAuthUsers.length} users from auth`);
    } else {
      console.warn('[Leaderboard] No users returned from auth (empty result)');
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
      
      // Try to get user info, with better fallback handling
      let userInfo = userMap.get(userId);
      
      if (!userInfo) {
        // User not found in auth - might be deleted but stats remain (shouldn't happen with CASCADE, but handle it)
        const shortUserId = userId ? userId.substring(0, 8) : 'unknown';
        console.warn(`[Leaderboard] User ${shortUserId} not found in auth users map (may be deleted)`);
        userInfo = { 
          email: null, 
          displayName: 'Anonymous'
        };
      } else if (!userInfo.displayName) {
        // User exists in auth but has no display name - this should have been handled above,
        // but if somehow displayName is still null, try to use email
        if (userInfo.email) {
          const emailUsername = userInfo.email.split('@')[0];
          if (emailUsername && emailUsername.length > 0) {
            userInfo.displayName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1).toLowerCase();
          } else {
            userInfo.displayName = 'Anonymous';
            console.warn(`[Leaderboard] User ${userId.substring(0, 8)} has invalid email format`);
          }
        } else {
          // User exists but has no email and no display name (very rare - OAuth without email?)
          userInfo.displayName = 'Anonymous';
          console.warn(`[Leaderboard] User ${userId.substring(0, 8)} has no email or display name`);
        }
      }
      
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

      // Include users if they have:
      // 1. Non-zero value for the sort metric (study_time or streak), OR
      // 2. Non-zero XP (so users with XP but no recent activity still show up)
      const userXP = stat.xp !== null && stat.xp !== undefined ? stat.xp : (stat.total_xp_earned || 0);
      
      if (value > 0 || userXP > 0) {
        const entry = {
          userId: stat.user_id,
          displayName: userInfo.displayName,
          email: userInfo.email,
          value,
          displayValue,
          level: stat.level || 1,
          xp: userXP, // Use current XP from user_stats (fallback to total_xp_earned if xp is null)
        };
        
        // Debug log for first few entries
        if (leaderboardData.length < 3) {
          console.log(`[Leaderboard] Adding entry:`, {
            name: entry.displayName,
            xp: entry.xp,
            level: entry.level,
            value: entry.value
          });
        }
        
        leaderboardData.push(entry);
      }
    }

    // Sort by value (descending) - this is the primary sort (study_time or streak)
    // For users with same value, sort by XP as secondary sort
    leaderboardData.sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      // If values are equal, sort by XP
      return (b.xp || 0) - (a.xp || 0);
    });
    
    // Debug: Log final leaderboard with XP
    console.log(`[Leaderboard] Final leaderboard (top 5):`, 
      leaderboardData.slice(0, 5).map(e => ({
        name: e.displayName,
        xp: e.xp,
        level: e.level,
        value: e.value
      }))
    );

    // Add rank to each entry
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    let userRank = -1;
    if (currentUserId) {
      userRank = leaderboardData.findIndex(entry => entry.userId === currentUserId);
    }

    // Return all data for the frontend to handle filtering/pinning
    return {
      status: 200,
      body: {
        leaderboard: leaderboardData,
        timeframe,
        sortBy,
        total: leaderboardData.length,
        userRank: userRank >= 0 ? userRank + 1 : null
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
    const userId = query.userId || null; // Current user ID for filtering

    if (!['daily', 'weekly', 'all-time'].includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }

    if (!['streak', 'study_time'].includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sortBy' });
    }

    const result = await getLeaderboard(timeframe, sortBy, userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
}

