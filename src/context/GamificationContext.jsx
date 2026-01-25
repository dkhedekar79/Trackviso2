import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import logger from '../utils/logger';
import { APP_CONFIG } from '../constants/appConfig';
import { supabase } from '../supabaseClient';

// Provide default value to prevent initialization errors
// Note: Most functions will be no-ops, but this prevents crashes
const defaultGamificationContext = {
  userStats: {
    xp: 0,
    level: 1,
    prestigeLevel: 0,
    totalSessions: 0,
    totalStudyTime: 0,
    sessionHistory: [],
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    streakSavers: 3,
    badges: [],
    achievements: [],
    unlockedTitles: [],
    currentTitle: "Rookie Scholar",
    dailyQuests: [],
    weeklyQuests: [],
    completedQuestsToday: 0,
    questStreak: 0,
    weeklyXP: 0,
    weeklyRank: 0,
    friends: [],
    challenges: [],
    isPremium: false,
    xpMultiplier: 1.0,
    premiumSkins: [],
    currentSkin: "default",
    subjectMastery: {},
    weeklyGoal: 0,
    weeklyProgress: 0,
    totalXPEarned: 0,
    lastRewardTime: null,
    rewardStreak: 0,
    luckyStreak: 0,
    jackpotCount: 0,
    gems: 0,
    xpEvents: [],
  },
  showRewards: false,
  rewardQueue: [],
  achievements: [],
  awardXP: () => ({ totalXP: 0, bonuses: {} }),
  grantXP: () => {},
  spendXP: () => {},
  addGems: () => {},
  spendGems: () => {},
  convertXPToGems: () => 0,
  purchaseItem: () => false,
  applyReward: () => {},
  updateStreak: () => ({ streak: 0, isNewDay: false, streakBroken: false }),
  useStreakSaver: () => false,
  addReward: () => {},
  addStudySession: () => {},
  getUserRank: () => "Rookie Scholar",
  getXPProgress: () => ({ current: 0, next: 100, percentage: 0 }),
  getStudyTimeForLevel: () => 0,
  generateDailyQuests: () => {},
  generateWeeklyQuests: () => {},
  updateQuestProgress: () => {},
  checkAchievements: () => {},
  unlockAchievement: () => {},
  dismissReward: () => {},
  prestige: () => false,
  setShowRewards: () => {},
  calculateXP: () => ({ totalXP: 0, bonuses: {} }),
  getTotalXPForLevel: () => 0,
  getXPForLevel: () => 0,
  getLevelFromXP: () => 1,
  awardMasteryXP: () => {},
  awardScheduleCompletionXP: () => {},
  checkSubjectMasteryMilestones: () => {},
  getTotalStudyTimeForLevel: () => 0,
  getLevelFromStudyTime: () => 1,
  getStudyTimeProgress: () => ({ current: 0, next: 100, percentage: 0 }),
  resetUserStats: async () => {},
  refreshQuestProgress: () => {},
};

const GamificationContext = createContext(defaultGamificationContext);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  // Return context even if provider isn't ready (defensive)
  return context || defaultGamificationContext;
};

export const GamificationProvider = ({ children }) => {
  const [userStats, setUserStats] = useState(() => {
    // Initialize from localStorage as fallback
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
      
      // Pomodoro tracking
      pomodoroCyclesCompleted: 0,

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
      gems: 0,
      xpEvents: [],
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
        gems: savedStats.gems ?? 0,
        pomodoroCyclesCompleted: savedStats.pomodoroCyclesCompleted ?? 0,
      };
    }

    return defaultStats;
  });

  const [rewardQueue, setRewardQueue] = useState([]);
  const [showRewards, setShowRewards] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState([]);
  const achievementsInProgress = useRef(new Set());
  const handleLevelUpRef = useRef(null);

  // Load initial XP from Supabase on mount to ensure we have the latest value
  useEffect(() => {
    const loadXPFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { fetchUserStats } = await import('../utils/supabaseDb');
        const stats = await fetchUserStats();
        
        if (stats && stats.xp !== undefined && stats.xp !== null) {
          // Only update if Supabase has a higher XP (to avoid overwriting with stale data)
          // Or if local XP is 0/undefined, use Supabase value
          const currentXP = userStats.xp || 0;
          const supabaseXP = stats.xp || 0;
          
          if (supabaseXP > currentXP || currentXP === 0) {
            logger.log('📥 Loading XP from Supabase:', supabaseXP);
            const calculatedLevel = getLevelFromXP(supabaseXP);
            const oldLevel = userStats.level || 1;
            
            setUserStats(prev => ({
              ...prev,
              xp: supabaseXP,
              level: calculatedLevel,
            }));
            lastSyncedXPRef.current = supabaseXP;
            
            // If level increased, trigger level up notification
            if (calculatedLevel > oldLevel) {
              setTimeout(() => {
                if (handleLevelUpRef.current) {
                  handleLevelUpRef.current(calculatedLevel);
                }
              }, 200);
            }
          } else {
            // Local XP is higher, sync it to Supabase
            logger.log('📤 Local XP is higher, will sync to Supabase:', currentXP);
          }
        }
      } catch (error) {
        logger.error('Error loading XP from Supabase:', error);
      }
    };

    // Load after a short delay to ensure auth is ready
    const loadTimeout = setTimeout(loadXPFromSupabase, 1000);
    return () => clearTimeout(loadTimeout);
  }, []); // Only run on mount

  // Initialize quests and check for daily/weekly resets - FIXED
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    // Check if we need to reset daily quests
    const lastDailyReset = localStorage.getItem('lastDailyQuestReset');
    const lastDailyResetDate = lastDailyReset ? new Date(parseInt(lastDailyReset)) : null;
    const needsDailyReset = !lastDailyResetDate || 
      lastDailyResetDate.toDateString() !== todayStr;
    
    // Check if we need to reset weekly quests
    const lastWeeklyReset = localStorage.getItem('lastWeeklyQuestReset');
    const lastWeeklyResetDate = lastWeeklyReset ? new Date(parseInt(lastWeeklyReset)) : null;
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const needsWeeklyReset = !lastWeeklyResetDate || 
      lastWeeklyResetDate < oneWeekAgo;
    
    // Initialize or reset daily quests
    if (needsDailyReset || !userStats.dailyQuests || userStats.dailyQuests.length === 0) {
      setTimeout(() => {
        generateDailyQuests();
        localStorage.setItem('lastDailyQuestReset', now.getTime().toString());
      }, 100);
    }
    
    // Initialize or reset weekly quests
    if (needsWeeklyReset || !userStats.weeklyQuests || userStats.weeklyQuests.length === 0) {
      setTimeout(() => {
        generateWeeklyQuests();
        localStorage.setItem('lastWeeklyQuestReset', now.getTime().toString());
      }, 150);
    }
    
    // Refresh quest progress to ensure accuracy
    setTimeout(() => {
      refreshQuestProgress();
    }, 300);
    
    // Check achievements on mount
    setTimeout(() => {
      checkAchievements();
    }, 500);

    // AUTO-HEAL: Fix doubled total study time if detected
    setTimeout(() => {
      setUserStats(prev => {
        const historyTime = (prev.sessionHistory || []).reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
        const reportedTime = prev.totalStudyTime || 0;
        
        // If reported time is significantly more than history (e.g. doubled), heal it
        // Allow for some buffer (60 mins) for manual adjustments or legacy data
        if (reportedTime > historyTime + 60 && historyTime > 0) {
          logger.warn(`🛠️ Study time mismatch detected! Reported: ${reportedTime}, History: ${historyTime}. Healing...`);
          return {
            ...prev,
            totalStudyTime: historyTime
          };
        }
        return prev;
      });
    }, 1000);
  }, []); // Only run on mount

  // Save stats to localStorage whenever they change (as backup)
  useEffect(() => {
    logger.log("💾 Saving userStats to localStorage:", userStats);
    localStorage.setItem("userStats", JSON.stringify(userStats));
  }, [userStats]);

  // AUTO-FIX: Ensure level is always synced with XP
  useEffect(() => {
    const calculatedLevel = getLevelFromXP(userStats.xp || 0);
    const currentLevel = userStats.level || 1;
    
    if (calculatedLevel !== currentLevel) {
      logger.log(`🛠️ Level Mismatch: XP=${userStats.xp}, Current=${currentLevel}, Calculated=${calculatedLevel}`);
      
      // Update the level immediately in state
      setUserStats(prev => ({
        ...prev,
        level: calculatedLevel
      }));
      
      // Background effects if level increased
      if (calculatedLevel > currentLevel) {
        setTimeout(() => {
          if (handleLevelUpRef.current) {
            handleLevelUpRef.current(calculatedLevel);
          }
        }, 100);
      }
    }
  }, [userStats.xp, userStats.level]);

  // Sync XP to Supabase whenever it changes (debounced)
  // This ensures the leaderboard always shows the current XP value
  // XP is the source of truth - includes XP from sessions, quests, achievements, etc.
  const lastSyncedXPRef = useRef(null);
  useEffect(() => {
    // Only sync if XP is defined (including 0) and has actually changed
    if (userStats.xp === undefined || userStats.xp === null) return;
    if (lastSyncedXPRef.current === userStats.xp) return; // Skip if already synced

    const syncXPTimeout = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          logger.warn('No session available for XP sync');
          return;
        }

        const { updateUserStats, checkReferralCompletion } = await import('../utils/supabaseDb');
        const result = await updateUserStats({
          xp: userStats.xp || 0,
          level: userStats.level || 1
        });
        
        if (result) {
          lastSyncedXPRef.current = userStats.xp;
          logger.log('✅ XP synced to Supabase:', userStats.xp, 'Level:', userStats.level);
          
          // Check referral completion when level changes (especially when reaching level 10)
          if (userStats.level >= 10) {
            checkReferralCompletion(session.user.id, userStats.level).catch(err => {
              logger.error('Error checking referral completion:', err);
            });
          }
        } else {
          logger.warn('Failed to sync XP to Supabase');
        }
      } catch (error) {
        logger.error('Error syncing XP to Supabase:', error);
      }
    }, 1500); // Debounce by 1.5 seconds to avoid too many requests

    return () => clearTimeout(syncXPTimeout);
  }, [userStats.xp, userStats.level]);

  // Advanced XP calculation with variable rewards
  // Base rate: 10 XP per minute (600 XP per hour)
  // With bonuses, typical session can give 15-30 XP/min (900-1800 XP/hour)
  // This makes level 100 (~80k XP) achievable in 3-4 months with 1 hour/day
  const calculateXP = (sessionDuration, subjectName, difficulty = 1.0) => {
    // Base XP: 10 XP per minute (600 XP per hour)
    const baseXP = Math.floor(sessionDuration * 10);

    // Focus multiplier: longer sessions get bonus (encourages deep focus)
    // 25-60 min: 1.2x, 60-120 min: 1.5x, 120+ min: 2.0x max
    let focusMultiplier = 1.0;
    if (sessionDuration >= 120) {
      focusMultiplier = 2.0; // 2x for 2+ hour sessions
    } else if (sessionDuration >= 60) {
      focusMultiplier = 1.0 + (sessionDuration - 60) / 120; // Scales from 1.0x to 2.0x
    } else if (sessionDuration >= 25) {
      focusMultiplier = 1.0 + (sessionDuration - 25) / 100; // Scales from 1.0x to 1.35x
    }

    // Streak bonus: rewards consistency (max +50% for 30+ day streak)
    const streakMultiplier = Math.min(1.5, 1.0 + (userStats.currentStreak || 0) / 60);

    // Subject mastery bonus: 10% bonus for subjects with 10+ hours studied
    const subjectHours = (userStats.subjectMastery[subjectName] || 0) / 60;
    const masteryBonus = subjectHours >= 10 ? baseXP * 0.1 : 0;

    // Prestige multiplier: +10% per prestige level
    const prestigeMultiplier = 1.0 + (userStats.prestigeLevel || 0) * 0.1;

    // Premium multiplier
    const premiumMultiplier = userStats.isPremium
      ? (userStats.xpMultiplier || 1.2)
      : 1.0;

    // Calculate total XP with all multipliers
    let totalXP = Math.floor(
      (baseXP * focusMultiplier * streakMultiplier + masteryBonus) *
        prestigeMultiplier *
        premiumMultiplier
    );

    // Variable reward system (can add bonus XP)
    const variableReward = calculateVariableReward(totalXP, sessionDuration);
    totalXP += variableReward.bonusXP;

    return {
      baseXP,
      totalXP,
      bonuses: {
        focus: Math.floor(baseXP * (focusMultiplier - 1)),
        streak: Math.floor(baseXP * (streakMultiplier - 1)),
        mastery: Math.floor(masteryBonus),
        prestige: Math.floor((baseXP * focusMultiplier * streakMultiplier + masteryBonus) * (prestigeMultiplier - 1)),
        premium: Math.floor((baseXP * focusMultiplier * streakMultiplier + masteryBonus) * prestigeMultiplier * (premiumMultiplier - 1)),
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

  // XP required to REACH a specific level (cumulative)
  // Much harder progression: Level 100 requires ~600,000+ XP
  // A 10-minute session (100 XP) is not enough to level up - need consistent study
  // This encourages long-term dedication and mastery integration
  const getTotalXPForLevel = (level) => {
    if (level <= 1) return 0;

    let totalXP = 500; // XP required to reach Level 2
    if (level === 2) return totalXP;

    // Levels 3-10: 500 XP per level (8 levels: 2->3, 3->4, ..., 9->10)
    if (level <= 10) {
      return totalXP + (level - 2) * 500;
    }
    totalXP += 8 * 500; // 4000 XP for levels 3-10. Total at L10 = 4500

    // Levels 11-25: 1000 XP per level (15 levels: 10->11, ..., 24->25)
    if (level <= 25) {
      return totalXP + (level - 10) * 1000;
    }
    totalXP += 15 * 1000; // 15000 XP for levels 11-25. Total at L25 = 19500

    // Levels 26-50: 2000 XP per level (25 levels: 25->26, ..., 49->50)
    if (level <= 50) {
      return totalXP + (level - 25) * 2000;
    }
    totalXP += 25 * 2000; // 50000 XP for levels 26-50. Total at L50 = 69500

    // Levels 51-75: 6000 XP per level (25 levels: 50->51, ..., 74->75)
    if (level <= 75) {
      return totalXP + (level - 50) * 6000;
    }
    totalXP += 25 * 6000; // 150000 XP for levels 51-75. Total at L75 = 219500

    // Levels 76-100: 10000 XP per level (25 levels: 75->76, ..., 99->100)
    return totalXP + (level - 75) * 10000;
  };

  // XP required to go from one level to the next
  const getXPForLevel = (level) => {
    if (level <= 1) return 0;
    return getTotalXPForLevel(level) - getTotalXPForLevel(level - 1);
  };

  // Calculate current level from total XP - FIXED to perfectly match getTotalXPForLevel
  const getLevelFromXP = (totalXP) => {
    if (totalXP <= 0) return 1;
    
    // Simple loop to ensure perfect sync with getTotalXPForLevel
    // This is safer than binary search for this range and handles any changes
    let level = 1;
    for (let l = 2; l <= 100; l++) {
      if (totalXP >= getTotalXPForLevel(l)) {
        level = l;
      } else {
        break;
      }
    }
    return level;
  };

  // Get XP progress to next level
  const getXPProgress = () => {
    const currentLevel = userStats.level || 1;
    const totalXP = userStats.xp || 0;
    const nextLevel = Math.min(100, currentLevel + 1);

    const currentLevelRequiredXP = getTotalXPForLevel(currentLevel);
    const nextLevelRequiredXP = getTotalXPForLevel(nextLevel);

    const progressXP = Math.max(0, totalXP - currentLevelRequiredXP);
    const neededXP = nextLevelRequiredXP - currentLevelRequiredXP;

    return {
      current: progressXP,
      needed: neededXP,
      percentage: Math.min(100, Math.max(0, neededXP > 0 ? (progressXP / neededXP) * 100 : 0)),
      currentXP: totalXP,
      nextLevelXP: nextLevelRequiredXP,
    };
  };

  // Legacy functions for backward compatibility (now based on XP conversion)
  // Approximate: 1 minute = 10 XP base, so time ≈ XP / 10
  const getStudyTimeForLevel = (level) => {
    const xpRequired = getXPForLevel(level);
    return Math.round(xpRequired / 10); // Convert XP to approximate minutes
  };

  const getTotalStudyTimeForLevel = (level) => {
    const xpRequired = getTotalXPForLevel(level);
    return Math.round(xpRequired / 10); // Convert XP to approximate minutes
  };

  const getLevelFromStudyTime = (totalMinutes) => {
    // Convert minutes to approximate XP (10 XP per minute base)
    const approximateXP = totalMinutes * 10;
    return getLevelFromXP(approximateXP);
  };

  const getStudyTimeProgress = () => {
    const xpProgress = getXPProgress();
    // Convert XP progress to approximate time progress
    return {
      current: Math.round(xpProgress.current / 10),
      needed: Math.round(xpProgress.needed / 10),
      percentage: xpProgress.percentage,
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
      { days: 7, title: "Week Warrior", icon: "⚔��", xp: 100 },
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

    /*
    addReward({
      type: "PRESTIGE",
      title: `🌟 PRESTIGE ${newPrestigeLevel}!`,
      description: "Welcome to the elite! +10% permanent XP bonus",
      tier: "legendary",
      animation: "prestige",
    });
    */

    return true;
  };

  // Spend raw XP without affecting lifetime totals (used for conversions)
  const spendXP = (amount, source = "spend") => {
    if (!amount || amount <= 0) return false;
    let ok = false;
    setUserStats((prev) => {
      const current = prev.xp || 0;
      if (current < amount) return prev;
      const newXP = current - amount;
      ok = true;
      return {
        ...prev,
        xp: newXP,
        level: getLevelFromXP(newXP),
        xpEvents: [
          { amount: -amount, source, timestamp: new Date().toISOString() },
          ...(prev.xpEvents || []),
        ].slice(0, 500),
      };
    });
    return ok;
  };

  // Grant raw XP (e.g., from rewards, quests)
  const grantXP = (amount, source = "reward") => {
    if (!amount || amount <= 0) return;
    
    let levelsToGrant = [];
    let isPomodoroCycle = source === "pomodoro_cycle";

    setUserStats((prev) => {
      const oldLevel = prev.level || 1;
      const oldXP = prev.xp || 0;
      const newXP = oldXP + amount;
      const newLevel = getLevelFromXP(newXP);
      const event = { amount, source, timestamp: new Date().toISOString() };
      
      // Track levels gained for side effects
      if (newLevel > oldLevel) {
        for (let i = oldLevel + 1; i <= newLevel; i++) {
          levelsToGrant.push(i);
        }
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalXPEarned: (prev.totalXPEarned || 0) + amount,
        weeklyXP: (prev.weeklyXP || 0) + amount,
        xpEvents: [event, ...(prev.xpEvents || [])].slice(0, 500),
        pomodoroCyclesCompleted: isPomodoroCycle 
          ? (prev.pomodoroCyclesCompleted || 0) + 1 
          : (prev.pomodoroCyclesCompleted || 0),
      };
    });

    // Handle side effects outside of the functional update
    // Only show the most recent/highest level, not all intermediate levels
    if (levelsToGrant.length > 0) {
      const highestLevel = levelsToGrant[levelsToGrant.length - 1];
      setTimeout(() => handleLevelUp(highestLevel), 100);
    }

    if (isPomodoroCycle) {
      setTimeout(() => checkAchievements(), 200);
    }
  };

  // Currency helpers and shop operations
  const addGems = (amount) => {
    if (!amount || amount <= 0) return;
    setUserStats((prev) => ({ ...prev, gems: (prev.gems || 0) + amount }));
  };
  const spendGems = (amount) => {
    if (!amount || amount <= 0) return false;
    let ok = false;
    setUserStats((prev) => {
      if ((prev.gems || 0) < amount) return prev;
      ok = true;
      return { ...prev, gems: (prev.gems || 0) - amount };
    });
    return ok;
  };
  const convertXPToGems = (tier) => {
    const options = {
      small: { xp: 500, gems: 5 },
      medium: { xp: 2000, gems: 25 },
      large: { xp: 5000, gems: 80 },
    };
    const opt = options[tier];
    if (!opt) return false;
    const ok = spendXP(opt.xp, `convert_${tier}`);
    if (!ok) return false;
    addGems(opt.gems);
    addReward({ type: "SHOP", title: `Converted ${opt.xp} XP → ${opt.gems} 💎`, description: "XP to Gems", tier: "uncommon" });
    return true;
  };
  const purchaseItem = (item) => {
    const pricing = { streak_saver: 20, study_time: 150, quest_pack: 200, achievement: 400 };
    const cost = pricing[item];
    if (!cost) return false;
    if (!spendGems(cost)) return false;
    switch (item) {
      case 'streak_saver':
        setUserStats((prev) => ({ ...prev, streakSavers: (prev.streakSavers || 0) + 1 }));
        addReward({ type: "SHOP", title: "+1 Streak Saver", description: "Streak protected once", tier: "rare" });
        break;
      case 'study_time':
        setUserStats((prev) => ({ ...prev, totalStudyTime: (prev.totalStudyTime || 0) + 60 }));
        addReward({ type: "SHOP", title: "+60 min Study Time", description: "Time boost applied", tier: "epic" });
        break;
      case 'quest_pack':
        generateDailyQuests();
        addReward({ type: "SHOP", title: "Quest Pack", description: "Daily quests refreshed", tier: "epic" });
        break;
      case 'achievement':
        addReward({ type: "SHOP", title: "Achievement Token", description: "Special achievement coming soon", tier: "legendary" });
        break;
      default:
        break;
    }
    return true;
  };

  // Apply generic reward payloads (mystery box, etc)
  const applyReward = (reward) => {
    if (!reward) return;
    switch (reward.type) {
      case 'xp': {
        const xp = typeof reward.actualValue === 'number' ? reward.actualValue : 0;
        grantXP(xp, 'reward');
        break;
      }
      case 'streak_saver': {
        setUserStats((prev) => ({ ...prev, streakSavers: (prev.streakSavers || 0) + 1 }));
        break;
      }
      case 'title': {
        const title = reward.actualValue;
        setUserStats((prev) => ({
          ...prev,
          unlockedTitles: [...(prev.unlockedTitles || []), title],
          currentTitle: title,
        }));
        break;
      }
      case 'multiplier': {
        const endTime = Date.now() + (reward.value?.duration || 0);
        setUserStats((prev) => ({
          ...prev,
          xpMultiplier: reward.value?.multiplier || 1.0,
          multiplierEndTime: endTime,
        }));
        break;
      }
      case 'jackpot': {
        const xp = reward.value?.xp || 0;
        const title = reward.value?.title;
        const streakSavers = reward.value?.streakSavers || 0;
        grantXP(xp, 'jackpot');
        setUserStats((prev) => ({
          ...prev,
          streakSavers: (prev.streakSavers || 0) + streakSavers,
          unlockedTitles: [...(prev.unlockedTitles || []), title],
          currentTitle: title,
          jackpotCount: (prev.jackpotCount || 0) + 1,
        }));
        break;
      }
      default:
        break;
    }
  };

  // Award XP for study session with enhanced rewards - UPDATED TO RETURN DATA
  const awardXP = (sessionDuration, subjectName, difficulty = 1.0) => {
    const xpData = calculateXP(sessionDuration, subjectName, difficulty);
    return xpData;
  };

  // Handle level up rewards - UPDATED: Removed popups
  const handleLevelUp = (newLevel) => {
    // Remove any existing LEVEL_UP notifications from the queue to avoid duplicates
    setRewardQueue((prev) => prev.filter((r) => r.type !== "LEVEL_UP"));
    
    // Level up popup removed as per user request
    /*
    addReward({
      type: "LEVEL_UP",
      title: `🎉 LEVEL ${newLevel}!`,
      description: "You're getting stronger!",
      level: newLevel,
      tier: "epic",
      animation: "levelup",
      sound: "levelup",
    });
    */

    // Track weekly level-up quest
    setTimeout(() => {
    updateQuestProgress("level", 1);
    }, 100);

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
      }));

      // Still grant the bonus XP but without the popup
      grantXP(milestone.xp, "milestone");

      /*
      addReward({
        type: "MILESTONE",
        title: `👑 ${milestone.title}`,
        description: `Level ${newLevel} milestone! +${milestone.xp} bonus XP`,
        tier: newLevel >= 100 ? "legendary" : newLevel >= 50 ? "epic" : "rare",
      });
      */
    }
    
    // Check achievements after level up
    setTimeout(() => {
      checkAchievements();
    }, 150);
  };

  // Store handleLevelUp in ref so it can be called from effects
  useEffect(() => {
    handleLevelUpRef.current = handleLevelUp;
  }, []);

  // Check and award XP for subject mastery milestones
  // Called when topic progress is updated
  const checkSubjectMasteryMilestones = (subjectName, topicProgressData) => {
    if (!topicProgressData || !subjectName) return;

    // Calculate overall subject mastery as average of all topics
    const topicScores = Object.values(topicProgressData)
      .map(tp => tp.completionPercent || 0)
      .filter(score => score > 0);

    if (topicScores.length === 0) return;

    const overallMastery = topicScores.reduce((sum, score) => sum + score, 0) / topicScores.length;

    // Award XP for subject mastery milestones
    const milestones = [
      { percent: 25, xp: 500, title: "Bronze Subject" },
      { percent: 50, xp: 1000, title: "Silver Subject" },
      { percent: 75, xp: 1500, title: "Gold Subject" },
      { percent: 90, xp: 2000, title: "Diamond Subject" },
    ];

    let milestonesToGrant = [];

    // Check if we hit a new milestone
    setUserStats((prev) => {
      const subjectKey = `subject_milestone_${subjectName}`;
      const previousMilestone = prev[subjectKey] || 0;
      const newMilestoneValue = Math.max(previousMilestone, Math.round(overallMastery));

      milestones.forEach((milestone) => {
        if (overallMastery >= milestone.percent && previousMilestone < milestone.percent) {
          milestonesToGrant.push(milestone);
        }
      });

      if (milestonesToGrant.length === 0 && previousMilestone === newMilestoneValue) return prev;

      return {
        ...prev,
        [subjectKey]: newMilestoneValue,
      };
    });

    // Grant XP and rewards outside of setUserStats
    milestonesToGrant.forEach((milestone) => {
      grantXP(milestone.xp, `subject_milestone_${subjectName}`);

      addReward({
        type: "SUBJECT_MILESTONE",
        title: `${milestone.title}: ${subjectName}`,
        description: `Achieved ${milestone.percent}% mastery in ${subjectName}`,
        tier: milestone.percent >= 75 ? "epic" : "rare",
        xp: milestone.xp,
      });
    });
  };

  // Award XP for mastery activities
  // Integrated with gamification system to encourage learning
  const awardMasteryXP = (activity, score, metadata = {}) => {
    let xpAmount = 0;
    let bonusMultiplier = 1.0;
    let title = "";
    let description = "";

    // Score-based XP calculation (higher scores = more XP)
    const scoreMultiplier = Math.max(0.5, Math.min(2.0, score / 100));

    switch (activity) {
      case "blurt_complete": {
        // Blurt test: 200-500 XP based on score
        const baseBlurtXP = 200;
        xpAmount = Math.floor(baseBlurtXP + score * 3);
        title = `⚡ Blurt Mode Complete!`;
        description = `+${xpAmount} XP for ${Math.round(score)}% accuracy`;

        // Bonus for high scores (90%+)
        if (score >= 90) {
          bonusMultiplier = 1.3;
          xpAmount = Math.floor(xpAmount * bonusMultiplier);
          title = `⚡ Perfect Recall!`;
          description = `+${xpAmount} XP for exceptional ${Math.round(score)}% accuracy`;
        }
        break;
      }

      case "mock_exam_complete": {
        // Mock exam: 400-1000 XP based on score
        const baseMockXP = 400;
        xpAmount = Math.floor(baseMockXP + score * 6);
        title = `📋 Mock Exam Complete!`;
        description = `+${xpAmount} XP for ${Math.round(score)}% score`;

        // Bonus for passing (70%+)
        if (score >= 70) {
          bonusMultiplier = 1.4;
          xpAmount = Math.floor(xpAmount * bonusMultiplier);
          title = `🏆 Exam Passed!`;
          description = `+${xpAmount} XP for achieving ${Math.round(score)}%`;
        }
        break;
      }

      case "active_recall_complete": {
        // Active recall: 250-600 XP based on score
        const baseRecallXP = 250;
        xpAmount = Math.floor(baseRecallXP + score * 3.5);
        title = `🧠 Active Recall Complete!`;
        description = `+${xpAmount} XP for ${Math.round(score)}% coverage`;
        break;
      }

      case "topic_completed": {
        // Topic fully completed (all modes done): 300 XP
        xpAmount = 300;
        title = `🎯 Topic Mastered!`;
        description = `+${xpAmount} XP for completing all revision modes`;
        break;
      }

      case "score_improvement": {
        // Score improved on retake: 150-300 XP
        const improvement = metadata.currentScore - metadata.previousScore;
        xpAmount = Math.floor(100 + improvement * 2);
        title = `📈 Score Improved!`;
        description = `+${xpAmount} XP for improving ${Math.round(improvement)}%`;
        break;
      }

      case "deterioration_recovery": {
        // Recovered from memory deterioration: 100-200 XP
        xpAmount = Math.floor(100 + metadata.recoveryPercent * 1.5);
        title = `💪 Memory Recovery!`;
        description = `+${xpAmount} XP for overcoming memory decay`;
        break;
      }

      case "subject_milestone": {
        // Subject milestone (e.g., 80%+ mastery): 500-2000 XP
        const masteryPercent = metadata.masteryPercent || 0;
        xpAmount = Math.floor(500 + masteryPercent * 15);
        title = `👑 Subject Milestone!`;
        description = `+${xpAmount} XP for achieving ${Math.round(masteryPercent)}% subject mastery`;
        bonusMultiplier = 1.2;
        xpAmount = Math.floor(xpAmount * bonusMultiplier);
        break;
      }

      default:
        return;
    }

    // Apply prestige multiplier
    const prestigeBonus = userStats.prestigeLevel > 0 ? (1.0 + userStats.prestigeLevel * 0.1) : 1.0;
    const premiumBonus = userStats.isPremium ? (userStats.xpMultiplier || 1.2) : 1.0;

    const finalXP = Math.floor(xpAmount * prestigeBonus * premiumBonus);

    grantXP(finalXP, `mastery_${activity}`);

    addReward({
      type: "MASTERY_XP",
      title,
      description,
      tier: score >= 80 ? "epic" : score >= 60 ? "rare" : "uncommon",
      xp: finalXP,
      animation: "achievement",
    });

    return {
      baseXP: xpAmount,
      finalXP,
      prestigeMultiplier: prestigeBonus,
      premiumMultiplier: premiumBonus,
    };
  };

  // Award XP for adhering to the AI Schedule
  const awardScheduleCompletionXP = (block) => {
    const isBreak = block.type?.toLowerCase() === 'break';
    if (isBreak) return;

    // Base adherence reward: 50 XP
    const baseReward = 50;
    
    // Bonus for high priority tasks
    const priorityBonus = block.priority === 'high' ? 30 : block.priority === 'medium' ? 15 : 0;
    
    // Bonus for longer sessions (extra discipline)
    const durationBonus = Math.floor((block.duration || 0) / 30) * 10;

    const totalReward = baseReward + priorityBonus + durationBonus;
    
    grantXP(totalReward, "schedule_adherence");

    addReward({
      type: "SCHEDULE_COMPLETE",
      title: "📅 Schedule Adherence!",
      description: `+${totalReward} XP for staying on track with ${block.topic || block.name}`,
      tier: "uncommon",
      xp: totalReward,
      animation: "achievement",
    });

    return totalReward;
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
  };

  // Dismiss the current reward and move to next in queue
  const dismissReward = (rewardId) => {
    setRewardQueue((prev) => {
      const newQueue = prev.filter((r) => r.id !== rewardId);
      if (newQueue.length === 0) {
        setShowRewards(false);
      }
      return newQueue;
    });
  };

  // Enhanced achievement system - FIXED to accept stats parameter
  const achievements = {
    // Session achievements
    first_session: {
      id: "first_session",
      name: "First Steps",
      description: "Complete your first study session",
      icon: "🎯",
      xp: 25,
      condition: (stats) => (stats.totalSessions || 0) >= 1,
      tier: "common",
    },
    session_marathon: {
      id: "session_marathon",
      name: "Marathon Master",
      description: "Study for 3+ hours in one session",
      icon: "🏃‍♂️",
      xp: 200,
      condition: (stats) =>
        (stats.sessionHistory || []).some((s) => s && s.durationMinutes >= 180),
      tier: "rare",
    },

    // Level achievements
    level_10: {
      id: "level_10",
      name: "Rising Star",
      description: "Reach level 10",
      icon: "⭐",
      xp: 100,
      condition: (stats) => (stats.level || 1) >= 10,
      tier: "uncommon",
    },
    level_50: {
      id: "level_50",
      name: "Academic Weapon",
      description: "Reach level 50",
      icon: "⚡",
      xp: 500,
      condition: (stats) => (stats.level || 1) >= 50,
      tier: "epic",
    },

    // Time achievements
    hundred_hours: {
      id: "hundred_hours",
      name: "Century Scholar",
      description: "Study for 100+ total hours",
      icon: "💯",
      xp: 300,
      condition: (stats) => (stats.totalStudyTime || 0) >= 6000, // 100 hours in minutes
      tier: "rare",
    },

    // Special achievements
    night_owl: {
      id: "night_owl",
      name: "Night Owl",
      description: "Study after 10 PM",
      icon: "🦉",
      xp: 50,
      condition: (stats) =>
        (stats.sessionHistory || []).some(
          (s) => s && s.timestamp && new Date(s.timestamp).getHours() >= 22,
        ),
      tier: "uncommon",
    },
    early_bird: {
      id: "early_bird",
      name: "Early Bird",
      description: "Study before 6 AM",
      icon: "🐦",
      xp: 75,
      condition: (stats) =>
        (stats.sessionHistory || []).some(
          (s) => s && s.timestamp && new Date(s.timestamp).getHours() < 6,
        ),
      tier: "uncommon",
    },
    
    // Pomodoro achievements
    pomodoro_beginner: {
      id: "pomodoro_beginner",
      name: "Pomodoro Beginner",
      description: "Complete your first Pomodoro cycle",
      icon: "🍅",
      xp: 50,
      condition: (stats) => (stats.pomodoroCyclesCompleted || 0) >= 1,
      tier: "common",
    },
    pomodoro_focused: {
      id: "pomodoro_focused",
      name: "Focused Mind",
      description: "Complete 10 Pomodoro cycles",
      icon: "🍅",
      xp: 150,
      condition: (stats) => (stats.pomodoroCyclesCompleted || 0) >= 10,
      tier: "uncommon",
    },
    pomodoro_master: {
      id: "pomodoro_master",
      name: "Pomodoro Master",
      description: "Complete 50 Pomodoro cycles",
      icon: "🍅",
      xp: 400,
      condition: (stats) => (stats.pomodoroCyclesCompleted || 0) >= 50,
      tier: "rare",
    },
    pomodoro_legend: {
      id: "pomodoro_legend",
      name: "Pomodoro Legend",
      description: "Complete 200 Pomodoro cycles",
      icon: "🍅",
      xp: 1000,
      condition: (stats) => (stats.pomodoroCyclesCompleted || 0) >= 200,
      tier: "epic",
    },
  };

  // Check and unlock achievements - ROBUST FUNCTIONAL VERSION
  const checkAchievements = () => {
    setUserStats((prev) => {
      const newlyUnlocked = [];
      
      Object.values(achievements).forEach((achievement) => {
        // Check if already unlocked in state OR already being processed
        if (prev.achievements.includes(achievement.id) || 
            achievementsInProgress.current.has(achievement.id)) {
          return;
        }
        
        // Use PREV state for checking condition
        try {
          if (achievement.condition(prev)) {
            newlyUnlocked.push(achievement);
            achievementsInProgress.current.add(achievement.id);
          }
        } catch (error) {
          logger.error(`Error checking achievement ${achievement.id}:`, error);
        }
      });
      
      if (newlyUnlocked.length === 0) return prev;

      // Handle side effects in a timeout to avoid recursive state updates
      setTimeout(() => {
        let totalXPToGrant = 0;
        newlyUnlocked.forEach((achievement) => {
          totalXPToGrant += achievement.xp || 0;
          
          addReward({
            type: "ACHIEVEMENT",
            title: `🏆 ${achievement.name}`,
            description: achievement.description,
            tier: achievement.tier,
            xp: achievement.xp,
            icon: achievement.icon,
            animation: "achievement",
          });
        });

        if (totalXPToGrant > 0) {
          grantXP(totalXPToGrant, "achievement");
        }

        updateQuestProgress("achievement", newlyUnlocked.length);
      }, 100);

      return {
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked.map(a => a.id)],
      };
    });
  };

  // Unlock achievement - DEPRECATED, use checkAchievements instead
  const unlockAchievement = (achievement) => {
    setUserStats((prev) => {
      // Check if already unlocked
      if (prev.achievements.includes(achievement.id)) {
        return prev;
      }
      
      // Grant XP immediately
      grantXP(achievement.xp || 0, "achievement");

    // Track weekly achievement quest
      setTimeout(() => {
    updateQuestProgress("achievement", 1);
      }, 100);

      // Show reward
    addReward({
      type: "ACHIEVEMENT",
      title: `🏆 ${achievement.name}`,
      description: achievement.description,
      tier: achievement.tier,
      xp: achievement.xp,
      icon: achievement.icon,
      animation: "achievement",
      });
      
      return {
        ...prev,
        achievements: [...prev.achievements, achievement.id],
      };
    });
  };

  // Get user rank/title
  const getUserRank = () => {
    if (userStats.prestigeLevel > 0) {
      return `Prestige ${userStats.prestigeLevel} ${userStats.currentTitle}`;
    }
    return userStats.currentTitle;
  };

  // Add study session with enhanced tracking - FIXED
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

    // Update state once with everything
    setUserStats((prev) => {
      const oldLevel = prev.level || 1;
      const oldXP = prev.xp || 0;
      const newXP = oldXP + xpData.totalXP;
      const newLevel = getLevelFromXP(newXP);
      
      const newStats = {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalSessions: (prev.totalSessions || 0) + 1,
        totalStudyTime: (prev.totalStudyTime || 0) + session.durationMinutes,
        totalXPEarned: (prev.totalXPEarned || 0) + xpData.totalXP,
        weeklyXP: (prev.weeklyXP || 0) + xpData.totalXP,
        xpEvents: [
          { amount: xpData.totalXP, source: "session", timestamp: new Date().toISOString() },
          ...(prev.xpEvents || []),
        ].slice(0, 500),
        sessionHistory: [enhancedSession, ...(prev.sessionHistory || []).slice(0, 99)],
        subjectMastery: {
          ...prev.subjectMastery,
          [session.subjectName]:
            (prev.subjectMastery[session.subjectName] || 0) + session.durationMinutes,
        },
      };

      // Handle side effects that were in awardXP
      setTimeout(() => {
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

        // Update streak
        updateStreak();

        // Check for level up rewards - only show the highest/most recent level
        if (newLevel > oldLevel) {
          handleLevelUp(newLevel);
          
          // Check referral completion when level changes (especially when reaching level 10)
          if (newLevel >= 10) {
            setTimeout(async () => {
              try {
                const { checkReferralCompletion } = await import('../utils/supabaseDb');
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  await checkReferralCompletion(session.user.id, newLevel);
                }
              } catch (error) {
                logger.error('Error checking referral completion on level up:', error);
              }
            }, 2000); // Wait 2 seconds for stats to sync
          }
        }

        // Check achievements after state update
        checkAchievements();

        // Update quest progress
        updateQuestProgress("time", session.durationMinutes);
        updateQuestProgress("sessions", 1);
        updateQuestProgress("subjects", 1, session.subjectName);
        updateQuestProgress("xp", xpData.totalXP);
        updateQuestProgress("streak", 1);
        updateQuestProgress("early_bird");
        updateQuestProgress("night_owl");
        updateQuestProgress("personal_best", session.durationMinutes);
        updateQuestProgress("new_subject", 1, session.subjectName);
        updateQuestProgress("week_balance");
        updateQuestProgress("double_days");
      }, 100);

      // Save to Supabase asynchronously
      // Note: The database trigger will automatically update total_study_time and total_xp_earned
      // from the study_sessions table, so we don't need to manually update those here
      (async () => {
        try {
          const { addStudySession: addSupabaseSession, updateUserStats } = await import('../utils/supabaseDb');
          
          // Save session to Supabase - this will trigger the database function to update totals
          const supabaseSession = await addSupabaseSession({
            subject_name: session.subjectName,
            duration_minutes: session.durationMinutes,
            difficulty: session.difficulty,
            mood: session.mood,
            xp_earned: xpData.totalXP,
            bonuses: xpData.bonuses,
          });

          if (supabaseSession) {
            // Update other stats that aren't auto-calculated by the trigger
            // The trigger handles: total_study_time, total_xp_earned, total_sessions
            // IMPORTANT: Always sync XP - it's the source of truth that includes all XP sources
            const syncResult = await updateUserStats({ 
              xp: newStats.xp,  // Current XP (includes sessions, quests, achievements, etc.)
              level: newStats.level,
              current_streak: newStats.currentStreak,
              longest_streak: newStats.longestStreak,
              last_study_date: newStats.lastStudyDate,
              total_sessions: newStats.totalSessions
            });
            
            if (syncResult) {
              lastSyncedXPRef.current = newStats.xp;
              logger.log('✅ Study session saved and XP synced:', newStats.xp);
            }
          } else {
            logger.warn('Failed to save study session to Supabase');
          }
        } catch (error) {
          logger.error('Error saving study session to Supabase:', error);
        }
      })();

      return newStats;
    });

    return enhancedSession;
  };

  // Daily quest templates
  // Balanced to give 60-150 XP each (roughly 10-25% of an hour's study)
  // Average study session: 600 XP/hour, so quests give ~10-25% bonus
  const dailyQuestTemplates = [
    {
      id: "complete_session",
      name: "Complete 1 study session today",
      description: "Complete 1 study session today",
      type: "sessions",
      target: 1,
      xp: 75,
      icon: "✅",
    },
    {
      id: "study_25_min",
      name: "Study for at least 25 minutes",
      description: "Study for at least 25 minutes (Pomodoro length)",
      type: "time",
      target: 25,
      xp: 100,
      icon: "⏰",
    },
    {
      id: "finish_task",
      name: "Finish 1 assigned task",
      description: "Finish 1 assigned task",
      type: "tasks",
      target: 1,
      xp: 80,
      icon: "📋",
    },
    {
      id: "maintain_streak",
      name: "Maintain your streak",
      description: "Maintain your streak (log in + study)",
      type: "streak",
      target: 1,
      xp: 125,
      icon: "🔥",
    },
    {
      id: "earn_50_xp",
      name: "Earn at least 50 XP today",
      description: "Earn at least 50 XP today",
      type: "xp",
      target: 50,
      xp: 50,
      icon: "⭐",
    },
    {
      id: "beat_personal_best",
      name: "Beat your personal best",
      description: "Beat your personal best focus time from yesterday",
      type: "personal_best",
      target: 1,
      xp: 100,
      icon: "🏆",
    },
    {
      id: "early_bird",
      name: "Early bird bonus",
      description: "Use the app before 10 AM (early bird bonus)",
      type: "early_bird",
      target: 1,
      xp: 75,
      icon: "🐦",
    },
    {
      id: "night_owl",
      name: "Night owl bonus",
      description: "Study after 8 PM (night owl bonus)",
      type: "night_owl",
      target: 1,
      xp: 75,
      icon: "🦉",
    },
    {
      id: "new_subject",
      name: "Explore a new subject",
      description: "Explore a new subject/topic (not yesterday's)",
      type: "new_subject",
      target: 1,
      xp: 90,
      icon: "🌟",
    },
    {
      id: "two_subjects",
      name: "Study two different subjects",
      description: "Study two different subjects in one day",
      type: "subjects",
      target: 2,
      xp: 100,
      icon: "📚",
    },
    {
      id: "three_sessions",
      name: "Three separate sessions",
      description: "Use the app for 3 separate study sessions",
      type: "sessions",
      target: 3,
      xp: 150,
      icon: "🔄",
    },
    {
      id: "complete_2_pomodoros",
      name: "Complete 2 Pomodoro cycles",
      description: "Complete 2 full Pomodoro cycles (25min work + 5min break)",
      type: "pomodoro_cycles",
      target: 2,
      xp: 120,
      icon: "🍅",
    },
    {
      id: "complete_4_pomodoros",
      name: "Complete 4 Pomodoro cycles",
      description: "Complete 4 full Pomodoro cycles for deep focus",
      type: "pomodoro_cycles",
      target: 4,
      xp: 200,
      icon: "🍅",
    },
  ];

  // Weekly quest templates
  // Balanced to give 500-1200 XP each (roughly 1-2 hours' worth of study)
  // Study: ~600 XP/hour, so weekly quests give substantial bonus for consistency
  const weeklyQuestTemplates = [
    {
      id: "weekly_7_sessions",
      name: "Complete 7 study sessions this week",
      description: "Complete 7 study sessions this week",
      type: "sessions",
      target: 7,
      xp: 600,
      icon: "🏆",
    },
    {
      id: "weekly_5_hours",
      name: "Study for 5+ total hours this week",
      description: "Study for 5+ total hours this week",
      type: "time",
      target: 300,
      xp: 800,
      icon: "⏳",
    },
    {
      id: "weekly_1000_xp",
      name: "Earn 1,000 XP this week",
      description: "Earn 1,000 XP this week",
      type: "xp",
      target: 1000,
      xp: 500,
      icon: "💎",
    },
    {
      id: "weekly_5_day_streak",
      name: "Hit your streak 5 days in a row",
      description: "Hit your streak at least 5 days in a row",
      type: "streak",
      target: 5,
      xp: 700,
      icon: "🔥",
    },
    {
      id: "weekly_finish_tasks",
      name: "Finish 5 tasks this week",
      description: "Finish 5 tasks this week",
      type: "tasks",
      target: 5,
      xp: 500,
      icon: "✅",
    },
    {
      id: "weekly_new_level",
      name: "Reach a new level",
      description: "Reach a new level",
      type: "level",
      target: 1,
      xp: 1000,
      icon: "📈",
    },
    {
      id: "weekly_achievement",
      name: "Unlock at least 1 achievement",
      description: "Unlock at least 1 achievement",
      type: "achievement",
      target: 1,
      xp: 400,
      icon: "🏅",
    },
    {
      id: "weekly_weekend_study",
      name: "Study on weekend and weekday",
      description: "Study on both a weekday and a weekend",
      type: "week_balance",
      target: 1,
      xp: 500,
      icon: "📅",
    },
    {
      id: "weekly_double_days",
      name: "Two double study days",
      description: "Do two double study days (2+ hours each)",
      type: "double_days",
      target: 2,
      xp: 900,
      icon: "⚡",
    },
    {
      id: "weekly_10_pomodoros",
      name: "Complete 10 Pomodoro cycles",
      description: "Complete 10 Pomodoro cycles this week for maximum focus",
      type: "pomodoro_cycles",
      target: 10,
      xp: 800,
      icon: "🍅",
    },
    {
      id: "weekly_20_pomodoros",
      name: "Complete 20 Pomodoro cycles",
      description: "Master productivity with 20 Pomodoro cycles",
      type: "pomodoro_cycles",
      target: 20,
      xp: 1200,
      icon: "🍅",
    },
  ];

  // Generate contextual daily quests based on user's actual performance - FIXED
  const generateDailyQuests = () => {
    setUserStats((prev) => {
    const avgSessionLength =
        (prev.sessionHistory || []).length > 0
        ? Math.round(
              (prev.sessionHistory || []).reduce(
                (sum, s) => sum + (s.durationMinutes || 0),
              0,
              ) / (prev.sessionHistory || []).length,
          )
        : 25;

    const availableQuests = dailyQuestTemplates.map((quest) => {
      if (quest.type === "time" && quest.target === 25) {
        return {
          ...quest,
          target: Math.max(15, Math.min(60, avgSessionLength)),
          xp: Math.round(Math.max(15, Math.min(60, avgSessionLength)) * 2),
        };
      }
      return quest;
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

      return {
      ...prev,
      dailyQuests: selectedQuests,
      };
    });
  };

  // Generate weekly quests - FIXED
  const generateWeeklyQuests = () => {
    setUserStats((prev) => {
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

      return {
      ...prev,
      weeklyQuests: selectedQuests,
      };
    });
  };

  // Update quest progress for both daily and weekly quests - COMPLETELY REVAMPED
  const updateQuestProgress = (type, amount = 1, subjectName = null) => {
    setUserStats((prev) => {
      const todayStr = new Date().toDateString();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const todaysSessions = (prev.sessionHistory || []).filter(
        (s) => s && s.timestamp && new Date(s.timestamp).toDateString() === todayStr,
      );
      const weeklySessions = (prev.sessionHistory || []).filter(
        (s) => s && s.timestamp && new Date(s.timestamp) > oneWeekAgo,
      );

      const getTasks = () => {
        try {
          return JSON.parse(localStorage.getItem("tasks") || "[]");
        } catch {
          return [];
        }
      };

      const dailyCompletions = [];
      const weeklyCompletions = [];

      // Update daily quests
      const updatedDailyQuests = (prev.dailyQuests || []).map((quest) => {
        if (!quest || quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress || 0;
        switch (type) {
          case "time":
            newProgress = Math.max(0, (quest.progress || 0) + (typeof amount === "number" ? amount : 0));
            break;
          case "sessions":
            newProgress = (quest.progress || 0) + 1;
            break;
          case "subjects": {
            const uniqueSet = new Set(todaysSessions.map((s) => s.subjectName).filter(Boolean));
            if (subjectName) uniqueSet.add(subjectName);
            newProgress = uniqueSet.size;
            break;
          }
          case "tasks": {
            const tasks = getTasks();
            newProgress = tasks.filter((t) => t && t.done && t.doneAt && new Date(t.doneAt).toDateString() === todayStr).length;
            break;
          }
          case "streak":
            newProgress = (prev.currentStreak || 0) > 0 ? 1 : 0;
            break;
          case "xp": {
            const xpToday = todaysSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
            newProgress = xpToday + (typeof amount === "number" ? amount : 0);
            break;
          }
          case "early_bird": {
            const now = new Date();
            const hasEarly = now.getHours() < 10 || todaysSessions.some((s) => s.timestamp && new Date(s.timestamp).getHours() < 10);
            newProgress = hasEarly ? 1 : 0;
            break;
          }
          case "night_owl": {
            const now = new Date();
            const hasLate = now.getHours() >= 20 || todaysSessions.some((s) => s.timestamp && new Date(s.timestamp).getHours() >= 20);
            newProgress = hasLate ? 1 : 0;
            break;
          }
          case "new_subject": {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            const ySubjects = new Set((prev.sessionHistory || []).filter((s) => s && s.timestamp && new Date(s.timestamp).toDateString() === yStr).map((s) => s.subjectName).filter(Boolean));
            const tSubjects = new Set(todaysSessions.map((s) => s.subjectName).filter(Boolean));
            if (subjectName) tSubjects.add(subjectName);
            const hasNew = [...tSubjects].some((subj) => !ySubjects.has(subj));
            newProgress = hasNew ? 1 : 0;
            break;
          }
          case "pomodoro_cycles":
            newProgress = (quest.progress || 0) + (typeof amount === "number" ? amount : 1);
            break;
          default:
            newProgress = (quest.progress || 0) + (typeof amount === "number" ? amount : 0);
        }

        newProgress = Math.min(newProgress, quest.target || 1);
        const completed = newProgress >= (quest.target || 1);

        if (completed && !quest.completed) {
          dailyCompletions.push({ quest, xp: quest.xp || 0 });
        }

        return { ...quest, progress: newProgress, completed };
      });

      // Update weekly quests
      const updatedWeeklyQuests = (prev.weeklyQuests || []).map((quest) => {
        if (!quest || quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress || 0;
        switch (type) {
          case "time":
            newProgress = weeklySessions.reduce((total, s) => total + (s.durationMinutes || 0), 0);
            break;
          case "sessions":
            newProgress = weeklySessions.length;
            break;
          case "xp":
            newProgress = weeklySessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
            break;
          case "streak":
            newProgress = prev.currentStreak || 0;
            break;
          case "tasks": {
            const tasks = getTasks();
            newProgress = tasks.filter((t) => t && t.done && t.doneAt && new Date(t.doneAt) > oneWeekAgo).length;
            break;
          }
          case "level":
          case "achievement":
          case "pomodoro_cycles":
            newProgress = (quest.progress || 0) + (typeof amount === "number" ? amount : 1);
            break;
          case "week_balance": {
            const hasWeekday = weeklySessions.some((s) => { const d = new Date(s.timestamp).getDay(); return d >= 1 && d <= 5; });
            const hasWeekend = weeklySessions.some((s) => { const d = new Date(s.timestamp).getDay(); return d === 0 || d === 6; });
            newProgress = hasWeekday && hasWeekend ? 1 : 0;
            break;
          }
          case "double_days": {
            const minutesByDay = weeklySessions.reduce((map, s) => { const key = new Date(s.timestamp).toDateString(); map[key] = (map[key] || 0) + (s.durationMinutes || 0); return map; }, {});
            newProgress = Object.values(minutesByDay).filter((m) => m >= 120).length;
            break;
          }
          default:
            newProgress = (quest.progress || 0) + (typeof amount === "number" ? amount : 0);
        }

        newProgress = Math.min(newProgress, quest.target || 1);
        const completed = newProgress >= (quest.target || 1);

        if (completed && !quest.completed) {
          weeklyCompletions.push({ quest, xp: quest.xp || 0 });
        }

        return { ...quest, progress: newProgress, completed };
      });

      // Handle side effects in a timeout to avoid recursive state updates
      if (dailyCompletions.length > 0 || weeklyCompletions.length > 0) {
        setTimeout(() => {
          const totalXP = dailyCompletions.reduce((sum, c) => sum + c.xp, 0) + weeklyCompletions.reduce((sum, c) => sum + c.xp, 0);
          
          if (totalXP > 0) {
            grantXP(totalXP, "quest");
          }

          dailyCompletions.forEach(({ quest, xp }) => {
            addReward({
              type: "QUEST_COMPLETE",
              title: `✅ ${quest.name}`,
              description: quest.description,
              tier: "uncommon",
              xp: xp,
            });
          });

          weeklyCompletions.forEach(({ quest, xp }) => {
            addReward({
              type: "QUEST_COMPLETE",
              title: `🏆 ${quest.name}`,
              description: quest.description,
              tier: "epic",
              xp: xp,
            });
          });
        }, 150);
      }

      return {
        ...prev,
        dailyQuests: updatedDailyQuests,
        weeklyQuests: updatedWeeklyQuests,
        completedQuestsToday: updatedDailyQuests.filter(q => q.completed).length,
      };
    });
  };

  // Refresh quest progress - recalculates all quest progress from current stats
  const refreshQuestProgress = () => {
    setUserStats((prev) => {
      const todayStr = new Date().toDateString();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const todaysSessions = (prev.sessionHistory || []).filter(
        (s) => s && s.timestamp && new Date(s.timestamp).toDateString() === todayStr,
      );
      const weeklySessions = (prev.sessionHistory || []).filter(
        (s) => s && s.timestamp && new Date(s.timestamp) > oneWeekAgo,
      );

      const getTasks = () => {
        try {
          return JSON.parse(localStorage.getItem("tasks") || "[]");
        } catch {
          return [];
        }
      };

      // Recalculate all daily quest progress
      const refreshedDailyQuests = (prev.dailyQuests || []).map((quest) => {
        if (!quest || quest.completed) return quest;

        let newProgress = 0;

        switch (quest.type) {
          case "time":
            newProgress = todaysSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
            break;
          case "sessions":
            newProgress = todaysSessions.length;
            break;
          case "subjects": {
            const uniqueSet = new Set(todaysSessions.map((s) => s.subjectName).filter(Boolean));
            newProgress = uniqueSet.size;
            break;
          }
          case "tasks": {
            const tasks = getTasks();
            newProgress = tasks.filter(
              (t) => t && t.done && t.doneAt && new Date(t.doneAt).toDateString() === todayStr,
            ).length;
            break;
          }
          case "streak":
            newProgress = (prev.currentStreak || 0) > 0 ? 1 : 0;
            break;
          case "xp": {
            newProgress = todaysSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
            break;
          }
          case "early_bird": {
            const hasEarly = todaysSessions.some(
              (s) => s.timestamp && new Date(s.timestamp).getHours() < 10,
            ) || new Date().getHours() < 10;
            newProgress = hasEarly ? 1 : 0;
            break;
          }
          case "night_owl": {
            const hasLate = todaysSessions.some(
              (s) => s.timestamp && new Date(s.timestamp).getHours() >= 20,
            ) || new Date().getHours() >= 20;
            newProgress = hasLate ? 1 : 0;
            break;
          }
          case "new_subject": {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            const ySubjects = new Set(
              (prev.sessionHistory || [])
                .filter((s) => s && s.timestamp && new Date(s.timestamp).toDateString() === yStr)
                .map((s) => s.subjectName)
                .filter(Boolean),
            );
            const tSubjects = new Set(todaysSessions.map((s) => s.subjectName).filter(Boolean));
            newProgress = [...tSubjects].some((subj) => !ySubjects.has(subj)) ? 1 : 0;
            break;
          }
          case "personal_best": {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            const yMax = (prev.sessionHistory || [])
              .filter((s) => s && s.timestamp && new Date(s.timestamp).toDateString() === yStr)
              .reduce((max, s) => Math.max(max, s.durationMinutes || 0), 0);
            const todayMax = todaysSessions.reduce(
              (max, s) => Math.max(max, s.durationMinutes || 0),
              0,
            );
            newProgress = todayMax > yMax ? 1 : 0;
            break;
          }
          default:
            newProgress = quest.progress || 0;
        }

        newProgress = Math.min(newProgress, quest.target || 1);
        const completed = newProgress >= (quest.target || 1);

        return {
          ...quest,
          progress: newProgress,
          completed,
        };
      });

      // Recalculate all weekly quest progress
      const refreshedWeeklyQuests = (prev.weeklyQuests || []).map((quest) => {
        if (!quest || quest.completed) return quest;

        let newProgress = 0;

        switch (quest.type) {
          case "time":
            newProgress = weeklySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
            break;
          case "sessions":
            newProgress = weeklySessions.length;
            break;
          case "xp": {
            newProgress = weeklySessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
            break;
          }
          case "streak":
            newProgress = prev.currentStreak || 0;
            break;
          case "tasks": {
            const tasks = getTasks();
            newProgress = tasks.filter(
              (t) => t && t.done && t.doneAt && new Date(t.doneAt) > oneWeekAgo,
            ).length;
            break;
          }
          case "level":
            newProgress = quest.progress || 0; // Keep existing progress for level quests
            break;
          case "achievement":
            newProgress = quest.progress || 0; // Keep existing progress for achievement quests
            break;
          case "week_balance": {
            const hasWeekday = weeklySessions.some(
              (s) => {
                const d = new Date(s.timestamp).getDay();
                return d >= 1 && d <= 5;
              },
            );
            const hasWeekend = weeklySessions.some((s) => {
              const d = new Date(s.timestamp).getDay();
              return d === 0 || d === 6;
            });
            newProgress = hasWeekday && hasWeekend ? 1 : 0;
            break;
          }
          case "double_days": {
            const minutesByDay = weeklySessions.reduce((map, s) => {
              const key = new Date(s.timestamp).toDateString();
              map[key] = (map[key] || 0) + (s.durationMinutes || 0);
              return map;
            }, {});
            newProgress = Object.values(minutesByDay).filter((m) => m >= 120).length;
            break;
          }
          default:
            newProgress = quest.progress || 0;
        }

        newProgress = Math.min(newProgress, quest.target || 1);
        const completed = newProgress >= (quest.target || 1);

        return {
          ...quest,
          progress: newProgress,
          completed,
        };
      });

      return {
        ...prev,
        dailyQuests: refreshedDailyQuests,
        weeklyQuests: refreshedWeeklyQuests,
        completedQuestsToday: refreshedDailyQuests.filter((q) => q && q.completed).length,
      };
    });
  };


  // Debug function to reset user stats - COMPLETELY RESET EVERYTHING
  const resetUserStats = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem("userStats");
      localStorage.removeItem("lastDailyQuestReset");
      localStorage.removeItem("lastWeeklyQuestReset");
      
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
        gems: 0,
        xpEvents: [],
      };
      
      // Update local state
      setUserStats(defaultStats);
      
      // Reset XP and stats in Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Update user_stats in Supabase
        const { updateUserStats } = await import('../utils/supabaseDb');
        await updateUserStats({
          xp: 0,
          level: 1,
          total_study_time: 0,
          total_sessions: 0,
          current_streak: 0,
          longest_streak: 0,
          last_study_date: null,
          weekly_xp: 0,
          total_xp_earned: 0,
          subject_mastery: {},
          current_title: 'Rookie Scholar',
          prestige_level: 0,
          gems: 0,
          reward_streak: 0,
          lucky_streak: 0,
          jackpot_count: 0,
          completed_quests_today: 0,
        });

        // Delete all study sessions from Supabase
        const { error: deleteError } = await supabase
          .from('study_sessions')
          .delete()
          .eq('user_id', session.user.id);

        if (deleteError) {
          logger.error('Error deleting study sessions:', deleteError);
        } else {
          logger.log('✅ All study sessions deleted from Supabase');
        }

        logger.log('✅ User stats reset in Supabase');
      }
      
      // Reset the sync ref to ensure next XP change triggers a sync
      lastSyncedXPRef.current = null;
      
      // Generate fresh quests after reset
      setTimeout(() => {
        generateDailyQuests();
        generateWeeklyQuests();
      }, 100);
    } catch (error) {
      logger.error('Error resetting user stats:', error);
      throw error;
    }
  };

  const value = {
    userStats,
    showRewards,
    rewardQueue,
    achievements,
    awardXP,
    grantXP,
    spendXP,
    addGems,
    spendGems,
    convertXPToGems,
    purchaseItem,
    applyReward,
    updateStreak,
    useStreakSaver,
    addReward,
    addStudySession,
    getUserRank,
    getXPProgress,
    getStudyTimeForLevel,
    generateDailyQuests,
    generateWeeklyQuests,
    updateQuestProgress,
    checkAchievements,
    unlockAchievement,
    dismissReward,
    prestige,
    setShowRewards,
    calculateXP,
    getTotalXPForLevel,
    getXPForLevel,
    getLevelFromXP,
    awardMasteryXP,
    awardScheduleCompletionXP,
    checkSubjectMasteryMilestones,
    // Legacy time-based functions (now XP-based internally)
    getTotalStudyTimeForLevel,
    getLevelFromStudyTime,
    getStudyTimeProgress,
    resetUserStats, // Debug function
    refreshQuestProgress, // Refresh quest progress from current stats
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
