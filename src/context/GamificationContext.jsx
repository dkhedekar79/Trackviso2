import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamification must be used within a GamificationProvider",
    );
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem("userStats");
    const defaultStats = {
      // Core progression
      xp: 0,
      level: 1,
      prestigeLevel: 0,

      // Session tracking
      totalSessions: 0,
      totalStudyTime: 0,
      sessionHistory: [],

      // Streak system
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakSavers: 3, // Premium streak protection

      // Achievement & badge system
      badges: [],
      achievements: [],
      unlockedTitles: [],
      currentTitle: "Rookie Scholar",

      // Quest system
      dailyQuests: [],
      weeklyQuests: [],
      completedQuestsToday: 0,
      questStreak: 0,

      // Social & competition
      weeklyXP: 0,
      weeklyRank: 0,
      friends: [],
      challenges: [],

      // Premium features
      isPremium: false,
      xpMultiplier: 1.0,
      premiumSkins: [],
      currentSkin: "default",

      // Statistics
      subjectMastery: {},
      weeklyGoal: 0,
      weeklyProgress: 0,
      totalXPEarned: 0,

      // Variable reward tracking
      lastRewardTime: null,
      rewardStreak: 0,
      luckyStreak: 0,
      jackpotCount: 0,
    };

    if (saved) {
      const savedStats = JSON.parse(saved);
      // Migrate old data that might be missing required fields
      return {
        ...defaultStats,
        ...savedStats,
        // Ensure required fields are present
        totalXPEarned: savedStats.totalXPEarned ?? savedStats.xp ?? 0,
        totalSessions: savedStats.totalSessions ?? 0,
        totalStudyTime: savedStats.totalStudyTime ?? 0,
        subjectMastery: savedStats.subjectMastery ?? {},
        achievements: savedStats.achievements ?? [],
        dailyQuests: savedStats.dailyQuests ?? [],
        weeklyQuests: savedStats.weeklyQuests ?? [],
      };
    }

    return defaultStats;
  });

  const [rewardQueue, setRewardQueue] = useState([]);
  const [showRewards, setShowRewards] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState([]);
  const syncingRef = useRef(false);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    console.log("💾 Saving userStats to localStorage:", userStats);
    localStorage.setItem("userStats", JSON.stringify(userStats));
  }, [userStats]);

  // Migration function to move localStorage data to Supabase
  const migrateLocalStorageData = async () => {
    if (!user?.id) {
      console.log('❌ No user ID for migration');
      return;
    }
    
    try {
      console.log('🔄 Starting migration for user:', user.id);
      
      // Check what data exists in localStorage
      const savedStats = localStorage.getItem('userStats');
      const savedSessions = localStorage.getItem('studySessions');
      const savedSubjects = localStorage.getItem('subjects');
      const savedTasks = localStorage.getItem('tasks');
      
      console.log('📊 LocalStorage data found:', {
        stats: !!savedStats,
        sessions: !!savedSessions,
        subjects: !!savedSubjects,
        tasks: !!savedTasks
      });
      
      // Migrate user stats
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        console.log('📈 Migrating user stats:', stats);
        
        const { error: statsError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: user.id,
            xp: stats.xp || 0,
            level: stats.level || 1,
            prestige_level: stats.prestigeLevel || 0,
            total_sessions: stats.totalSessions || 0,
            total_study_time: stats.totalStudyTime || 0,
            total_xp_earned: stats.totalXPEarned || stats.xp || 0,
            current_streak: stats.currentStreak || 0,
            longest_streak: stats.longestStreak || 0,
            last_study_date: stats.lastStudyDate,
            weekly_xp: stats.weeklyXP || 0,
            subject_mastery: stats.subjectMastery || {},
            achievements: stats.achievements || [],
            daily_quests: stats.dailyQuests || [],
            weekly_quests: stats.weeklyQuests || [],
          });
        
        if (statsError) {
          console.error('❌ Stats migration error:', statsError);
          throw statsError;
        }
        console.log('✅ Migrated user stats');
      }
      
      // Migrate study sessions
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        console.log('📚 Migrating study sessions:', sessions.length);
        
        if (sessions.length > 0) {
          // Use upsert to handle duplicates
          for (const s of sessions) {
            const { error: sessionsError } = await supabase
              .from('study_sessions')
              .upsert({
                user_id: user.id,
                subject_name: s.subjectName,
                duration_minutes: s.durationMinutes,
                timestamp: s.timestamp,
                difficulty: s.difficulty || 'medium',
                xp_earned: s.xpEarned || 0,
                bonuses: s.bonuses || {},
                notes: s.notes || '',
              }, {
                onConflict: 'user_id,subject_name,timestamp'
              });
            
            if (sessionsError) {
              console.error('❌ Session migration error for:', s.subjectName, s.timestamp, sessionsError);
              // Continue with other sessions instead of failing completely
            }
          }
          console.log('✅ Migrated study sessions');
        }
      }
      
      // Migrate subjects
      if (savedSubjects) {
        const subjects = JSON.parse(savedSubjects);
        console.log('📖 Migrating subjects:', subjects.length);
        
        if (subjects.length > 0) {
          // Use upsert to handle duplicates
          for (const s of subjects) {
            const { error: subjectsError } = await supabase
              .from('subjects')
              .upsert({
                user_id: user.id,
                name: s.name,
                color: s.color,
                goal_hours: s.goalHours || 0,
              }, {
                onConflict: 'user_id,name'
              });
            
            if (subjectsError) {
              console.error('❌ Subject migration error for:', s.name, subjectsError);
              // Continue with other subjects instead of failing completely
            }
          }
          console.log('✅ Migrated subjects');
        }
      }
      
      // Migrate tasks
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        console.log('✅ Migrating tasks:', tasks.length);
        
        if (tasks.length > 0) {
          // Use upsert to handle duplicates
          for (const t of tasks) {
            const { error: tasksError } = await supabase
              .from('tasks')
              .upsert({
                user_id: user.id,
                name: t.name,
                subject: t.subject,
                duration_minutes: parseInt(t.time) || 0,
                priority: t.priority || 'Low',
                scheduled_date: t.scheduledDate || null,
                completed: t.done || false,
                done_at: t.doneAt ? new Date(t.doneAt).toISOString() : null,
              }, {
                onConflict: 'user_id,name,created_at'
              });
            
            if (tasksError) {
              console.error('❌ Task migration error for:', t.name, tasksError);
              // Continue with other tasks instead of failing completely
            }
          }
          console.log('✅ Migrated tasks');
        }
      }
      
      console.log('🎉 Migration completed successfully!');
      
      // Mark migration as completed
      localStorage.setItem('migrationCompleted', 'true');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      // Don't mark as completed if there was an error
    }
  };

  // Load stats and sessions from Supabase when user logs in
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!user?.id) return;
      try {
        // Fetch or init user_stats
        const { data: statsRow, error: statsErr } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (statsErr) throw statsErr;

        let mergedStats = { ...userStats };
        // Check if we need to migrate localStorage data (always check for existing users)
        const migrationCompleted = localStorage.getItem('migrationCompleted');
        const hasLocalData = localStorage.getItem('userStats') || localStorage.getItem('studySessions') || localStorage.getItem('subjects') || localStorage.getItem('tasks');
        
        if (!migrationCompleted && hasLocalData) {
          console.log('🔄 Found localStorage data, starting migration...');
          await migrateLocalStorageData();
          // Reload after migration
          const { data: newStatsRow } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (newStatsRow) {
            mergedStats = {
              ...mergedStats,
              xp: newStatsRow.xp ?? mergedStats.xp,
              level: newStatsRow.level ?? mergedStats.level,
              prestigeLevel: newStatsRow.prestige_level ?? mergedStats.prestigeLevel,
              totalSessions: newStatsRow.total_sessions ?? mergedStats.totalSessions,
              totalStudyTime: newStatsRow.total_study_time ?? mergedStats.totalStudyTime,
              totalXPEarned: newStatsRow.total_xp_earned ?? mergedStats.totalXPEarned,
              currentStreak: newStatsRow.current_streak ?? mergedStats.currentStreak,
              longestStreak: newStatsRow.longest_streak ?? mergedStats.longestStreak,
              lastStudyDate: newStatsRow.last_study_date ?? mergedStats.lastStudyDate,
              weeklyXP: newStatsRow.weekly_xp ?? mergedStats.weeklyXP,
              subjectMastery: newStatsRow.subject_mastery ?? mergedStats.subjectMastery,
              achievements: newStatsRow.achievements ?? mergedStats.achievements,
              dailyQuests: newStatsRow.daily_quests ?? mergedStats.dailyQuests,
              weeklyQuests: newStatsRow.weekly_quests ?? mergedStats.weeklyQuests,
            };
          }
        } else if (!statsRow) {
          // Create default row for this user
          const insertPayload = {
            user_id: user.id,
            xp: 0,
            level: 1,
            prestige_level: 0,
            total_sessions: 0,
            total_study_time: 0,
            total_xp_earned: 0,
            current_streak: 0,
            longest_streak: 0,
            weekly_xp: 0,
            subject_mastery: {},
            achievements: [],
            daily_quests: [],
            weekly_quests: [],
          };
          const { error: insertErr } = await supabase.from("user_stats").insert(insertPayload);
          if (insertErr) throw insertErr;
          mergedStats = { ...mergedStats };
        } else {
          // Merge supabase row into state (excluding sessionHistory which is separate)
          mergedStats = {
            ...mergedStats,
            xp: statsRow.xp ?? mergedStats.xp,
            level: statsRow.level ?? mergedStats.level,
            prestigeLevel: statsRow.prestige_level ?? mergedStats.prestigeLevel,
            totalSessions: statsRow.total_sessions ?? mergedStats.totalSessions,
            totalStudyTime: statsRow.total_study_time ?? mergedStats.totalStudyTime,
            totalXPEarned: statsRow.total_xp_earned ?? mergedStats.totalXPEarned,
            currentStreak: statsRow.current_streak ?? mergedStats.currentStreak,
            longestStreak: statsRow.longest_streak ?? mergedStats.longestStreak,
            lastStudyDate: statsRow.last_study_date ?? mergedStats.lastStudyDate,
            weeklyXP: statsRow.weekly_xp ?? mergedStats.weeklyXP,
            subjectMastery: statsRow.subject_mastery ?? mergedStats.subjectMastery,
            achievements: statsRow.achievements ?? mergedStats.achievements,
            dailyQuests: statsRow.daily_quests ?? mergedStats.dailyQuests,
            weeklyQuests: statsRow.weekly_quests ?? mergedStats.weeklyQuests,
          };
        }

        // Fetch recent study sessions
        const { data: sessions, error: sessErr } = await supabase
          .from("study_sessions")
          .select("id, subject_name, duration_minutes, timestamp, notes, task, mood, reflection, difficulty, is_task_complete, xp_earned, bonuses")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(100);
        if (sessErr) throw sessErr;

        const mappedSessions = (sessions || []).map((s) => ({
          id: s.id,
          subjectName: s.subject_name,
          durationMinutes: Number(s.duration_minutes),
          timestamp: s.timestamp,
          notes: s.notes,
          task: s.task,
          mood: s.mood,
          reflection: s.reflection,
          difficulty: s.difficulty,
          isTaskComplete: s.is_task_complete,
          xpEarned: s.xp_earned,
          bonuses: s.bonuses || {},
        }));

        syncingRef.current = true;
        setUserStats((prev) => ({
          ...mergedStats,
          sessionHistory: mappedSessions,
        }));
        syncingRef.current = false;
      } catch (e) {
        console.error("Failed loading from Supabase:", e);
      }
    };

    loadFromSupabase();

    // Realtime subscription for cross-tab updates
    const channel = user?.id
      ? supabase
          .channel(`study_sessions_${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${user.id}` },
            (payload) => {
              if (!payload?.new && !payload?.old) return;
              setUserStats((prev) => {
                let history = prev.sessionHistory || [];
                if (payload.eventType === 'INSERT') {
                  const s = payload.new;
                  const session = {
                    id: s.id,
                    subjectName: s.subject_name,
                    durationMinutes: Number(s.duration_minutes),
                    timestamp: s.timestamp,
                    notes: s.notes,
                    task: s.task,
                    mood: s.mood,
                    reflection: s.reflection,
                    difficulty: s.difficulty,
                    isTaskComplete: s.is_task_complete,
                    xpEarned: s.xp_earned,
                    bonuses: s.bonuses || {},
                  };
                  // Avoid duplicate if already present
                  if (history.find((h) => h.id === session.id)) return prev;
                  return { ...prev, sessionHistory: [session, ...history].slice(0, 100) };
                }
                if (payload.eventType === 'DELETE') {
                  const deletedId = payload.old.id;
                  return { ...prev, sessionHistory: history.filter((h) => h.id !== deletedId) };
                }
                if (payload.eventType === 'UPDATE') {
                  const s = payload.new;
                  return {
                    ...prev,
                    sessionHistory: history.map((h) => h.id === s.id ? {
                      ...h,
                      subjectName: s.subject_name,
                      durationMinutes: Number(s.duration_minutes),
                      timestamp: s.timestamp,
                      notes: s.notes,
                      task: s.task,
                      mood: s.mood,
                      reflection: s.reflection,
                      difficulty: s.difficulty,
                      isTaskComplete: s.is_task_complete,
                      xpEarned: s.xp_earned,
                      bonuses: s.bonuses || {},
                    } : h)
                  };
                }
                return prev;
              });
            }
          )
          .subscribe()
      : null;

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Advanced XP calculation with variable rewards
  const calculateXP = (sessionDuration, subjectName, difficulty = 1.0) => {
    const baseXP = Math.floor(sessionDuration / 0.1); // 10 XP per minute

    // Focus multiplier scales with session length (longer sessions = higher multiplier)
    const focusMultiplier = Math.min(3.0, 1.0 + sessionDuration / 120); // Max 3x at 2+ hours

    // Streak bonus scales exponentially with current streak
    const streakBonus = Math.floor(
      userStats.currentStreak * (Math.log(userStats.currentStreak + 1) * 5),
    );

    // Subject mastery bonus (20% bonus for well-studied subjects)
    const masteryBonus =
      userStats.subjectMastery[subjectName] >= 1000 ? baseXP * 0.2 : 0;

    // Prestige multiplier
    const prestigeMultiplier = 1.0 + userStats.prestigeLevel * 0.1;

    // Premium multiplier
    const premiumMultiplier = userStats.isPremium
      ? userStats.xpMultiplier
      : 1.0;

    // Calculate base XP with all multipliers
    let totalXP = Math.floor(
      (baseXP * focusMultiplier + streakBonus + masteryBonus) *
        prestigeMultiplier *
        premiumMultiplier,
    );

    // Variable reward system
    const variableReward = calculateVariableReward(totalXP, sessionDuration);
    totalXP += variableReward.bonusXP;

    return {
      baseXP,
      totalXP,
      bonuses: {
        focus: Math.floor(baseXP * (focusMultiplier - 1)),
        streak: streakBonus,
        mastery: Math.floor(masteryBonus),
        prestige: Math.floor(totalXP * (prestigeMultiplier - 1)),
        premium: Math.floor(totalXP * (premiumMultiplier - 1)),
        variable: variableReward.bonusXP,
      },
      reward: variableReward,
    };
  };

  // Variable reward system with probability tiers based on real performance
  const calculateVariableReward = (baseXP, sessionDuration) => {
    const rand = Math.random();
    const sessionBonus = Math.min(2.0, sessionDuration / 60); // Up to 2x for longer sessions

    // Adjust probabilities based on user's recent performance
    const recentSessions = userStats.sessionHistory.slice(0, 10);
    const avgRecentDuration =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0) /
          recentSessions.length
        : sessionDuration;

    // Better chance of bonus for longer than average sessions
    const performanceMultiplier =
      sessionDuration > avgRecentDuration ? 1.5 : 1.0;

    // Legendary (0.1% base chance, increased for exceptional performance)
    if (rand < 0.1 * performanceMultiplier) {
      return {
        tier: "legendary",
        type: "XP_JACKPOT",
        bonusXP: Math.floor(baseXP * 5 * sessionBonus),
        title: "🏆 LEGENDARY JACKPOT!",
        description: `+500% bonus XP for ${sessionDuration}min session!`,
        animation: "jackpot",
        sound: "legendary",
        extras: { title: "Jackpot Hunter", badge: "legendary_jackpot" },
      };
    }

    // Epic (1% base chance)
    if (rand < 0.2 * performanceMultiplier) {
      return {
        tier: "epic",
        type: "XP_BONUS",
        bonusXP: Math.floor(baseXP * 2 * sessionBonus),
        title: "✨ EPIC BONUS!",
        description: `+200% bonus XP for great focus!`,
        animation: "epic",
        sound: "epic",
      };
    }

    // Rare (5% base chance)
    if (rand < 0.3 * performanceMultiplier) {
      return {
        tier: "rare",
        type: "XP_BONUS",
        bonusXP: Math.floor(baseXP * 1.5 * sessionBonus),
        title: "🌟 RARE BONUS!",
        description: `+150% bonus XP for consistency!`,
        animation: "rare",
        sound: "rare",
      };
    }

    // Uncommon (15% base chance)
    if (rand < 0.4 * performanceMultiplier) {
      return {
        tier: "uncommon",
        type: "XP_BONUS",
        bonusXP: Math.floor(baseXP * 0.5 * sessionBonus),
        title: "⭐ Lucky Scholar!",
        description: `+50% bonus XP for good work!`,
        animation: "uncommon",
        sound: "uncommon",
      };
    }

    // No bonus (remaining chance)
    return {
      tier: "none",
      bonusXP: 0,
    };
  };

  // Advanced leveling formula: XP needed = 50 × Level^1.5
  const getXPForLevel = (level) => {
    return Math.floor(50 * Math.pow(level, 1.5));
  };

  // Get total XP needed from level 1 to target level
  const getTotalXPForLevel = (level) => {
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += getXPForLevel(i);
    }
    return total;
  };

  // Calculate current level from total XP
  const getLevelFromXP = (xp) => {
    let level = 1;
    let totalXPNeeded = 0;

    while (totalXPNeeded <= xp) {
      totalXPNeeded += getXPForLevel(level + 1);
      if (totalXPNeeded <= xp) level++;
    }

    return level;
  };

  // Get XP progress to next level
  const getXPProgress = () => {
    const currentLevel = userStats.level;
    const totalXPForCurrentLevel = getTotalXPForLevel(currentLevel);
    const totalXPForNextLevel = getTotalXPForLevel(currentLevel + 1);
    const progressXP = Math.max(0, userStats.xp - totalXPForCurrentLevel);
    const neededXP = totalXPForNextLevel - totalXPForCurrentLevel;

    return {
      current: progressXP,
      needed: neededXP,
      percentage: Math.min(100, Math.max(0, (progressXP / neededXP) * 100)),
    };
  };

  // Advanced streak tracking with decay
  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastStudy = userStats.lastStudyDate
      ? new Date(userStats.lastStudyDate).toDateString()
      : null;

    if (lastStudy === today) {
      return {
        streak: userStats.currentStreak,
        isNewDay: false,
        streakBroken: false,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak;
    let streakBroken = false;

    if (lastStudy === yesterdayStr) {
      // Continuing streak
      newStreak = userStats.currentStreak + 1;
    } else if (lastStudy && userStats.streakSavers > 0) {
      // Offer streak saver for premium users
      return {
        streak: userStats.currentStreak,
        isNewDay: true,
        streakBroken: true,
        canUseSaver: true,
      };
    } else {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
    }

    setUserStats((prev) => ({
      ...prev,
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastStudyDate: new Date().toISOString(),
    }));

    // Check streak achievements
    checkStreakAchievements(newStreak);

    return { streak: newStreak, isNewDay: true, streakBroken };
  };

  // Use streak saver (premium feature)
  const useStreakSaver = () => {
    if (userStats.streakSavers > 0) {
      setUserStats((prev) => ({
        ...prev,
        streakSavers: prev.streakSavers - 1,
        lastStudyDate: new Date().toISOString(),
      }));

      addReward({
        type: "STREAK_SAVED",
        title: "🛡️ Streak Protected!",
        description: `Used streak saver! ${userStats.streakSavers - 1} remaining`,
        tier: "premium",
      });

      return true;
    }
    return false;
  };

  // Check streak achievements
  const checkStreakAchievements = (streak) => {
    const milestones = [
      { days: 3, title: "Getting Started", icon: "🌱", xp: 50 },
      { days: 7, title: "Week Warrior", icon: "⚔️", xp: 100 },
      { days: 14, title: "Fortnight Fighter", icon: "🏰", xp: 200 },
      { days: 30, title: "Month Master", icon: "👑", xp: 500 },
      { days: 50, title: "Unstoppable Force", icon: "🌪️", xp: 750 },
      { days: 100, title: "Century Club", icon: "💎", xp: 1500 },
      { days: 365, title: "Year Champion", icon: "🏆", xp: 5000 },
    ];

    milestones.forEach((milestone) => {
      if (streak === milestone.days) {
        unlockAchievement({
          id: `streak_${milestone.days}`,
          name: milestone.title,
          description: `Maintained a ${milestone.days}-day study streak!`,
          icon: milestone.icon,
          xp: milestone.xp,
          type: "streak",
          tier:
            milestone.days >= 100
              ? "legendary"
              : milestone.days >= 30
                ? "epic"
                : "rare",
        });
      }
    });
  };

  // Prestige system - reset progress for exclusive rewards
  const prestige = () => {
    if (userStats.level < 100) return false; // Must be level 100 to prestige

    const newPrestigeLevel = userStats.prestigeLevel + 1;

    setUserStats((prev) => ({
      ...prev,
      level: 1,
      xp: 0,
      prestigeLevel: newPrestigeLevel,
      currentTitle: `Prestige ${newPrestigeLevel} Scholar`,
      // Keep achievements, badges, and stats
      // Reset only level and XP
    }));

    addReward({
      type: "PRESTIGE",
      title: `🌟 PRESTIGE ${newPrestigeLevel}!`,
      description: "Welcome to the elite! +10% permanent XP bonus",
      tier: "legendary",
      animation: "prestige",
    });

    return true;
  };

  // Award XP for study session with enhanced rewards
  const awardXP = (sessionDuration, subjectName, difficulty = 1.0) => {
    const xpData = calculateXP(sessionDuration, subjectName, difficulty);
    const oldLevel = userStats.level;
    const newXP = userStats.xp + xpData.totalXP;
    const newLevel = getLevelFromXP(newXP);

    // Update user stats
    setUserStats((prev) => {
      const newStats = {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalSessions: (prev.totalSessions || 0) + 1,
        totalStudyTime: (prev.totalStudyTime || 0) + sessionDuration,
        totalXPEarned: (prev.totalXPEarned || prev.xp || 0) + xpData.totalXP,
        weeklyXP: (prev.weeklyXP || 0) + xpData.totalXP,
        subjectMastery: {
          ...prev.subjectMastery,
          [subjectName]:
            (prev.subjectMastery[subjectName] || 0) + sessionDuration,
        },
      };

      console.log("🎯 Awarding XP:", {
        sessionDuration,
        subjectName,
        oldXP: prev.xp,
        newXP,
        xpGained: xpData.totalXP,
        oldTotalXPEarned: prev.totalXPEarned,
        newTotalXPEarned: newStats.totalXPEarned,
      });

      // Persist to Supabase (user_stats)
      (async () => {
        try {
          if (user?.id) {
            await supabase.from('user_stats').upsert({
              user_id: user.id,
              xp: newStats.xp,
              level: newStats.level,
              prestige_level: newStats.prestigeLevel || 0,
              total_sessions: newStats.totalSessions,
              total_study_time: newStats.totalStudyTime,
              total_xp_earned: newStats.totalXPEarned,
              current_streak: newStats.currentStreak || 0,
              longest_streak: newStats.longestStreak || 0,
              last_study_date: new Date().toISOString(),
              weekly_xp: newStats.weeklyXP || 0,
              subject_mastery: newStats.subjectMastery || {},
              achievements: newStats.achievements || [],
              daily_quests: newStats.dailyQuests || [],
              weekly_quests: newStats.weeklyQuests || [],
            }, { onConflict: 'user_id' });
          }
        } catch (e) {
          console.error('Failed to upsert user_stats:', e);
        }
      })();

      return newStats;
    });

    // Show XP reward
    addReward({
      type: "XP_EARNED",
      title: `+${xpData.totalXP} XP`,
      description: "Great work!",
      tier: "common",
      details: xpData.bonuses,
    });

    // Show variable reward if any
    if (xpData.reward.tier !== "none") {
      addReward(xpData.reward);
    }

    // Check for level up
    if (newLevel > oldLevel) {
      const levelsGained = newLevel - oldLevel;
      for (let i = 1; i <= levelsGained; i++) {
        handleLevelUp(oldLevel + i);
      }
    }

    // Update streak
    const streakResult = updateStreak();

    // Check achievements
    checkAchievements();

    return xpData;
  };

  // Handle level up rewards
  const handleLevelUp = (newLevel) => {
    addReward({
      type: "LEVEL_UP",
      title: `🎉 LEVEL ${newLevel}!`,
      description: "You're getting stronger!",
      tier: "epic",
      animation: "levelup",
      sound: "levelup",
    });

    // Level milestone rewards
    const milestones = {
      5: { title: "Rising Scholar", xp: 100 },
      10: { title: "Dedicated Learner", xp: 250 },
      25: { title: "Knowledge Seeker", xp: 500 },
      50: { title: "Academic Elite", xp: 1000 },
      75: { title: "Master Scholar", xp: 2000 },
      100: { title: "Academic Legend", xp: 5000, canPrestige: true },
    };

    if (milestones[newLevel]) {
      const milestone = milestones[newLevel];
      setUserStats((prev) => ({
        ...prev,
        currentTitle: milestone.title,
        xp: prev.xp + milestone.xp,
      }));

      addReward({
        type: "MILESTONE",
        title: `👑 ${milestone.title}`,
        description: `Level ${newLevel} milestone! +${milestone.xp} bonus XP`,
        tier: newLevel >= 100 ? "legendary" : newLevel >= 50 ? "epic" : "rare",
      });
    }
  };

  // Add reward to queue
  const addReward = (reward) => {
    const rewardWithId = {
      ...reward,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
    };

    setRewardQueue((prev) => [...prev, rewardWithId]);
    setShowRewards(true);

    // Auto-remove after delay
    setTimeout(
      () => {
        setRewardQueue((prev) => prev.filter((r) => r.id !== rewardWithId.id));
      },
      reward.tier === "legendary" ? 5000 : 3000,
    );
  };

  // Enhanced achievement system
  const achievements = {
    // Session achievements
    first_session: {
      id: "first_session",
      name: "First Steps",
      description: "Complete your first study session",
      icon: "🎯",
      xp: 25,
      condition: () => userStats.totalSessions >= 1,
      tier: "common",
    },
    session_marathon: {
      id: "session_marathon",
      name: "Marathon Master",
      description: "Study for 3+ hours in one session",
      icon: "🏃‍♂️",
      xp: 200,
      condition: () =>
        userStats.sessionHistory.some((s) => s.durationMinutes >= 180),
      tier: "rare",
    },

    // Level achievements
    level_10: {
      id: "level_10",
      name: "Rising Star",
      description: "Reach level 10",
      icon: "⭐",
      xp: 100,
      condition: () => userStats.level >= 10,
      tier: "uncommon",
    },
    level_50: {
      id: "level_50",
      name: "Academic Weapon",
      description: "Reach level 50",
      icon: "⚡",
      xp: 500,
      condition: () => userStats.level >= 50,
      tier: "epic",
    },

    // Time achievements
    hundred_hours: {
      id: "hundred_hours",
      name: "Century Scholar",
      description: "Study for 100+ total hours",
      icon: "💯",
      xp: 300,
      condition: () => userStats.totalStudyTime >= 6000, // 100 hours in minutes
      tier: "rare",
    },

    // Special achievements
    night_owl: {
      id: "night_owl",
      name: "Night Owl",
      description: "Study after 10 PM",
      icon: "🦉",
      xp: 50,
      condition: () =>
        userStats.sessionHistory.some(
          (s) => new Date(s.timestamp).getHours() >= 22,
        ),
      tier: "uncommon",
    },
    early_bird: {
      id: "early_bird",
      name: "Early Bird",
      description: "Study before 6 AM",
      icon: "🐦",
      xp: 75,
      condition: () =>
        userStats.sessionHistory.some(
          (s) => new Date(s.timestamp).getHours() < 6,
        ),
      tier: "uncommon",
    },
  };

  // Check and unlock achievements
  const checkAchievements = () => {
    Object.values(achievements).forEach((achievement) => {
      if (
        !userStats.achievements.includes(achievement.id) &&
        achievement.condition()
      ) {
        unlockAchievement(achievement);
      }
    });
  };

  // Unlock achievement
  const unlockAchievement = (achievement) => {
    setUserStats((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievement.id],
      xp: prev.xp + achievement.xp,
    }));

    addReward({
      type: "ACHIEVEMENT",
      title: `🏆 ${achievement.name}`,
      description: achievement.description,
      tier: achievement.tier,
      xp: achievement.xp,
      icon: achievement.icon,
      animation: "achievement",
    });
  };

  // Get user rank/title
  const getUserRank = () => {
    if (userStats.prestigeLevel > 0) {
      return `Prestige ${userStats.prestigeLevel} ${userStats.currentTitle}`;
    }
    return userStats.currentTitle;
  };

  // Add study session with enhanced tracking
  const addStudySession = (sessionData) => {
    const session = {
      ...sessionData,
      timestamp: new Date().toISOString(),
      difficulty: sessionData.difficulty || 1.0,
      mood: sessionData.mood || "neutral",
    };

    const xpData = awardXP(
      session.durationMinutes,
      session.subjectName,
      session.difficulty,
    );

    const enhancedSession = {
      ...session,
      xpEarned: xpData.totalXP,
      bonuses: xpData.bonuses,
    };

    setUserStats((prev) => ({
      ...prev,
      sessionHistory: [enhancedSession, ...prev.sessionHistory.slice(0, 99)],
    }));

    // Persist to Supabase table
    (async () => {
      try {
        if (user?.id) {
          await supabase.from('study_sessions').insert({
            user_id: user.id,
            subject_name: session.subjectName,
            duration_minutes: session.durationMinutes,
            timestamp: session.timestamp,
            notes: session.notes,
            task: session.task,
            mood: session.mood,
            reflection: session.reflection,
            difficulty: session.difficulty,
            is_task_complete: session.isTaskComplete || false,
            xp_earned: xpData.totalXP,
            bonuses: xpData.bonuses || {},
          });
        }
      } catch (e) {
        console.error('Failed inserting study_session:', e);
      }
    })();

    return enhancedSession;
  };

  // Daily quest templates
  const dailyQuestTemplates = [
    {
      id: "complete_session",
      name: "Complete 1 study session today",
      description: "Complete 1 study session today",
      type: "sessions",
      target: 1,
      xp: 50,
      icon: "✅",
    },
    {
      id: "study_25_min",
      name: "Study for at least 25 minutes",
      description: "Study for at least 25 minutes (Pomodoro length)",
      type: "time",
      target: 25,
      xp: 75,
      icon: "⏰",
    },
    {
      id: "finish_task",
      name: "Finish 1 assigned task",
      description: "Finish 1 assigned task",
      type: "tasks",
      target: 1,
      xp: 60,
      icon: "📋",
    },
    {
      id: "log_reflection",
      name: "Log a reflection/note",
      description: "Log a reflection/note about your study",
      type: "reflection",
      target: 1,
      xp: 30,
      icon: "📝",
    },
    {
      id: "maintain_streak",
      name: "Maintain your streak",
      description: "Maintain your streak (log in + study)",
      type: "streak",
      target: 1,
      xp: 100,
      icon: "🔥",
    },
    {
      id: "earn_50_xp",
      name: "Earn at least 50 XP today",
      description: "Earn at least 50 XP today",
      type: "xp",
      target: 50,
      xp: 25,
      icon: "⭐",
    },
    {
      id: "beat_personal_best",
      name: "Beat your personal best",
      description: "Beat your personal best focus time from yesterday",
      type: "personal_best",
      target: 1,
      xp: 80,
      icon: "🏆",
    },
    {
      id: "early_bird",
      name: "Early bird bonus",
      description: "Use the app before 10 AM (early bird bonus)",
      type: "early_bird",
      target: 1,
      xp: 60,
      icon: "🐦",
    },
    {
      id: "night_owl",
      name: "Night owl bonus",
      description: "Study after 8 PM (night owl bonus)",
      type: "night_owl",
      target: 1,
      xp: 60,
      icon: "🦉",
    },
    {
      id: "new_subject",
      name: "Explore a new subject",
      description: "Explore a new subject/topic (not yesterday's)",
      type: "new_subject",
      target: 1,
      xp: 70,
      icon: "🌟",
    },
    {
      id: "two_subjects",
      name: "Study two different subjects",
      description: "Study two different subjects in one day",
      type: "subjects",
      target: 2,
      xp: 80,
      icon: "📚",
    },
    {
      id: "three_sessions",
      name: "Three separate sessions",
      description: "Use the app for 3 separate study sessions",
      type: "sessions",
      target: 3,
      xp: 120,
      icon: "🔄",
    },
  ];

  // Weekly quest templates
  const weeklyQuestTemplates = [
    {
      id: "weekly_7_sessions",
      name: "Complete 7 study sessions this week",
      description: "Complete 7 study sessions this week",
      type: "sessions",
      target: 7,
      xp: 300,
      icon: "🏆",
    },
    {
      id: "weekly_5_hours",
      name: "Study for 5+ total hours this week",
      description: "Study for 5+ total hours this week",
      type: "time",
      target: 300,
      xp: 400,
      icon: "⏳",
    },
    {
      id: "weekly_1000_xp",
      name: "Earn 1,000 XP this week",
      description: "Earn 1,000 XP this week",
      type: "xp",
      target: 1000,
      xp: 200,
      icon: "💎",
    },
    {
      id: "weekly_5_day_streak",
      name: "Hit your streak 5 days in a row",
      description: "Hit your streak at least 5 days in a row",
      type: "streak",
      target: 5,
      xp: 350,
      icon: "🔥",
    },
    {
      id: "weekly_finish_tasks",
      name: "Finish all scheduled tasks",
      description: "Finish all your scheduled tasks",
      type: "tasks",
      target: 1,
      xp: 250,
      icon: "✅",
    },

    {
      id: "weekly_new_level",
      name: "Reach a new level",
      description: "Reach a new level",
      type: "level",
      target: 1,
      xp: 500,
      icon: "📈",
    },
    {
      id: "weekly_achievement",
      name: "Unlock at least 1 achievement",
      description: "Unlock at least 1 achievement",
      type: "achievement",
      target: 1,
      xp: 200,
      icon: "🏅",
    },
    {
      id: "weekly_weekend_study",
      name: "Study on weekend and weekday",
      description: "Study on both a weekday and a weekend",
      type: "week_balance",
      target: 1,
      xp: 150,
      icon: "📅",
    },
    {
      id: "weekly_mood_tracking",
      name: "Record mood after every session",
      description: "Record your mood/energy level after every study session",
      type: "mood",
      target: 1,
      xp: 180,
      icon: "😊",
    },
    {
      id: "weekly_double_days",
      name: "Two double study days",
      description: "Do two double study days (2+ hours each)",
      type: "double_days",
      target: 2,
      xp: 400,
      icon: "⚡",
    },
  ];

  // Generate contextual daily quests based on user's actual performance
  const generateDailyQuests = () => {
    // Calculate user's average performance to set realistic targets
    const avgSessionLength =
      userStats.sessionHistory.length > 0
        ? Math.round(
            userStats.sessionHistory.reduce(
              (sum, s) => sum + s.durationMinutes,
              0,
            ) / userStats.sessionHistory.length,
          )
        : 25;

    // Filter and select 3 random daily quests
    const availableQuests = dailyQuestTemplates.filter((quest) => {
      // Customize quest targets based on user performance
      if (quest.type === "time" && quest.target === 25) {
        quest.target = Math.max(15, Math.min(60, avgSessionLength));
        quest.xp = Math.round(quest.target * 2);
      }
      return true;
    });

    const selectedQuests = availableQuests
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((template) => ({
        id: template.id + "_" + Date.now(),
        name: template.name,
        description: template.description,
        type: template.type,
        target: template.target,
        progress: 0,
        completed: false,
        xp: template.xp,
        icon: template.icon,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));

    setUserStats((prev) => ({
      ...prev,
      dailyQuests: selectedQuests,
    }));
  };

  // Generate weekly quests
  const generateWeeklyQuests = () => {
    const selectedQuests = weeklyQuestTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((template) => ({
        id: template.id + "_" + Date.now(),
        name: template.name,
        description: template.description,
        type: template.type,
        target: template.target,
        progress: 0,
        completed: false,
        xp: template.xp,
        icon: template.icon,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

    setUserStats((prev) => ({
      ...prev,
      weeklyQuests: selectedQuests,
    }));
  };

  // Update quest progress for both daily and weekly quests
  const updateQuestProgress = (type, amount = 1, subjectName = null) => {
    setUserStats((prev) => {
      // Update daily quests
      const updatedDailyQuests = prev.dailyQuests.map((quest) => {
        if (quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress;

        switch (type) {
          case "time":
            newProgress += amount;
            break;
          case "sessions":
            newProgress += 1;
            break;
          case "subjects":
            // Track unique subjects studied today, include the current subject optimistically
            const todayStr = new Date().toDateString();
            const todaysSessions = prev.sessionHistory.filter(
              (s) => new Date(s.timestamp).toDateString() === todayStr,
            );
            const uniqueSubjects = new Set(
              todaysSessions.map((s) => s.subjectName),
            );
            if (subjectName) uniqueSubjects.add(subjectName);
            newProgress = uniqueSubjects.size;
            break;
          case "streak":
            newProgress = prev.currentStreak > 0 ? 1 : 0;
            break;
          case "xp":
            newProgress = prev.weeklyXP || 0;
            break;
        }

        const completed = newProgress >= quest.target;

        if (completed && !quest.completed) {
          const questXP = quest.xp || 0;
          setTimeout(() => {
            setUserStats((prevStats) => ({
              ...prevStats,
              xp: prevStats.xp + questXP,
              totalXPEarned:
                (prevStats.totalXPEarned || prevStats.xp || 0) + questXP,
              weeklyXP: (prevStats.weeklyXP || 0) + questXP,
              level: getLevelFromXP(prevStats.xp + questXP),
            }));

            addReward({
              type: "QUEST_COMPLETE",
              title: `✅ ${quest.name}`,
              description: quest.description,
              tier: "uncommon",
              xp: questXP,
            });
          }, 100);
        }

        return {
          ...quest,
          progress: Math.min(newProgress, quest.target),
          completed,
        };
      });

      // Update weekly quests (incremental, to reflect immediately after a session)
      const updatedWeeklyQuests = prev.weeklyQuests.map((quest) => {
        if (quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress;

        switch (type) {
          case "time":
            newProgress += amount; // minutes
            break;
          case "sessions":
            newProgress += 1;
            break;
          case "xp":
            newProgress = prev.weeklyXP || 0;
            break;
          case "streak":
            newProgress = prev.currentStreak;
            break;
        }

        const completed = newProgress >= quest.target;

        if (completed && !quest.completed) {
          const questXP = quest.xp || 0;
          setTimeout(() => {
            setUserStats((prevStats) => ({
              ...prevStats,
              xp: prevStats.xp + questXP,
              totalXPEarned:
                (prevStats.totalXPEarned || prevStats.xp || 0) + questXP,
              weeklyXP: (prevStats.weeklyXP || 0) + questXP,
              level: getLevelFromXP(prevStats.xp + questXP),
            }));

            addReward({
              type: "WEEKLY_QUEST_COMPLETE",
              title: `🏆 ${quest.name}`,
              description: quest.description,
              tier: "epic",
              xp: questXP,
            });
          }, 100);
        }

        return {
          ...quest,
          progress: Math.min(newProgress, quest.target),
          completed,
        };
      });

      return {
        ...prev,
        dailyQuests: updatedDailyQuests,
        weeklyQuests: updatedWeeklyQuests,
      };
    });
  };

  // Debug function to reset user stats
  const resetUserStats = () => {
    localStorage.removeItem("userStats");
    setUserStats({
      // Core progression
      xp: 0,
      level: 1,
      prestigeLevel: 0,

      // Session tracking
      totalSessions: 0,
      totalStudyTime: 0,
      sessionHistory: [],

      // Streak system
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakSavers: 3,

      // Achievement & badge system
      badges: [],
      achievements: [],
      unlockedTitles: [],
      currentTitle: "Rookie Scholar",

      // Quest system
      dailyQuests: [],
      weeklyQuests: [],
      completedQuestsToday: 0,
      questStreak: 0,

      // Social & competition
      weeklyXP: 0,
      weeklyRank: 0,
      friends: [],
      challenges: [],

      // Premium features
      isPremium: false,
      xpMultiplier: 1.0,
      premiumSkins: [],
      currentSkin: "default",

      // Statistics
      subjectMastery: {},
      weeklyGoal: 0,
      weeklyProgress: 0,
      totalXPEarned: 0,

      // Variable reward tracking
      lastRewardTime: null,
      rewardStreak: 0,
      luckyStreak: 0,
      jackpotCount: 0,
    });
  };

  // Manual migration function (exposed for debugging)
  const forceMigration = async () => {
    console.log('🔄 Forcing migration...');
    try {
      localStorage.removeItem('migrationCompleted');
      await migrateLocalStorageData();
      console.log('✅ Migration completed, reloading page...');
      // Reload the page to trigger fresh data load
      window.location.reload();
    } catch (error) {
      console.error('❌ Migration failed:', error);
      alert('Migration failed: ' + error.message);
    }
  };

  // Expose migration function to window for debugging
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.forceMigration = forceMigration;
      console.log('🔧 Migration function exposed to window.forceMigration');
    }
  }, []);

  const value = {
    userStats,
    showRewards,
    rewardQueue,
    achievements,
    awardXP,
    updateStreak,
    useStreakSaver,
    addReward,
    addStudySession,
    getUserRank,
    getXPProgress,
    getXPForLevel,
    generateDailyQuests,
    generateWeeklyQuests,
    updateQuestProgress,
    checkAchievements,
    unlockAchievement,
    prestige,
    setShowRewards,
    calculateXP,
    getTotalXPForLevel,
    resetUserStats, // Debug function
    forceMigration, // Expose for debugging
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
