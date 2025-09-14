import React, { createContext, useContext, useState, useEffect } from "react";

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
      };
    }

    return defaultStats;
  });

  const [rewardQueue, setRewardQueue] = useState([]);
  const [showRewards, setShowRewards] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState([]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    console.log("💾 Saving userStats to localStorage:", userStats);
    localStorage.setItem("userStats", JSON.stringify(userStats));
  }, [userStats]);

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

  // Get cumulative XP required to REACH a given level (level 1 requires 0)
  const getTotalXPForLevel = (level) => {
    if (level <= 1) return 0;
    let total = 0;
    for (let i = 2; i <= level; i++) {
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

  // Grant raw XP (e.g., from rewards)
  const grantXP = (amount, source = "reward") => {
    if (!amount || amount <= 0) return;
    setUserStats((prev) => {
      const newXP = (prev.xp || 0) + amount;
      const newLevel = getLevelFromXP(newXP);
      const event = { amount, source, timestamp: new Date().toISOString() };
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalXPEarned: (prev.totalXPEarned || prev.xp || 0) + amount,
        weeklyXP: (prev.weeklyXP || 0) + amount,
        xpEvents: [event, ...(prev.xpEvents || [])].slice(0, 500),
      };
    });
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
        xpEvents: [
          { amount: xpData.totalXP, source: "session", timestamp: new Date().toISOString() },
          ...(prev.xpEvents || []),
        ].slice(0, 500),
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

    // Track weekly level-up quest
    updateQuestProgress("level", 1);

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

      grantXP(milestone.xp, "milestone");

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
    }));

    grantXP(achievement.xp, "achievement");

    // Track weekly achievement quest
    updateQuestProgress("achievement", 1);

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

    // Update quest progress signals
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
      name: "Finish 5 tasks this week",
      description: "Finish 5 tasks this week",
      type: "tasks",
      target: 5,
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
    const avgSessionLength =
      userStats.sessionHistory.length > 0
        ? Math.round(
            userStats.sessionHistory.reduce(
              (sum, s) => sum + s.durationMinutes,
              0,
            ) / userStats.sessionHistory.length,
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
      const todayStr = new Date().toDateString();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const todaysSessions = prev.sessionHistory.filter(
        (s) => new Date(s.timestamp).toDateString() === todayStr,
      );
      const weeklySessions = prev.sessionHistory.filter(
        (s) => new Date(s.timestamp) > oneWeekAgo,
      );

      const getTasks = () => {
        try {
          return JSON.parse(localStorage.getItem("tasks") || "[]");
        } catch {
          return [];
        }
      };

      // Update daily quests
      const updatedDailyQuests = prev.dailyQuests.map((quest) => {
        if (!quest || quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress || 0;

        switch (type) {
          case "time":
            newProgress += amount; // minutes increment
            break;
          case "sessions":
            newProgress += 1; // per session
            break;
          case "subjects": {
            // unique subjects studied today (include current subjectName if provided)
            const uniqueSet = new Set(todaysSessions.map((s) => s.subjectName));
            if (subjectName) uniqueSet.add(subjectName);
            newProgress = uniqueSet.size;
            break;
          }
          case "tasks": {
            const tasks = getTasks();
            const completedToday = tasks.filter(
              (t) => t.done && t.doneAt && new Date(t.doneAt).toDateString() === todayStr,
            ).length;
            newProgress = completedToday;
            break;
          }
          case "streak":
            newProgress = prev.currentStreak > 0 ? 1 : 0;
            break;
          case "xp": {
            const xpToday = todaysSessions.reduce(
              (sum, s) => sum + (s.xpEarned || 0),
              0,
            );
            newProgress = xpToday + (typeof amount === "number" ? amount : 0);
            break;
          }
          case "early_bird": {
            const hasEarly = [...todaysSessions].some(
              (s) => new Date(s.timestamp).getHours() < 10,
            );
            newProgress = hasEarly ? 1 : 0;
            break;
          }
          case "night_owl": {
            const hasLate = [...todaysSessions].some(
              (s) => new Date(s.timestamp).getHours() >= 20,
            );
            newProgress = hasLate ? 1 : 0;
            break;
          }
          case "new_subject": {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            const ySubjects = new Set(
              prev.sessionHistory
                .filter((s) => new Date(s.timestamp).toDateString() === yStr)
                .map((s) => s.subjectName),
            );
            const tSubjects = new Set(todaysSessions.map((s) => s.subjectName));
            if (subjectName) tSubjects.add(subjectName);
            const hasNew = [...tSubjects].some((subj) => !ySubjects.has(subj));
            newProgress = hasNew ? 1 : 0;
            break;
          }
          case "personal_best": {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toDateString();
            const yMax = prev.sessionHistory
              .filter((s) => new Date(s.timestamp).toDateString() === yStr)
              .reduce((max, s) => Math.max(max, s.durationMinutes || 0), 0);
            const todayMax = todaysSessions.reduce(
              (max, s) => Math.max(max, s.durationMinutes || 0),
              0,
            );
            const withCurrent = Math.max(
              todayMax,
              typeof amount === "number" ? amount : 0,
            );
            newProgress = withCurrent > yMax ? 1 : 0;
            break;
          }
          default:
            newProgress += amount || 0;
        }

        const completed = newProgress >= quest.target;

        if (completed && !quest.completed) {
          const questXP = quest.xp || 0;
          setTimeout(() => {
            grantXP(questXP, "quest");

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

      // Update weekly quests
      const updatedWeeklyQuests = prev.weeklyQuests.map((quest) => {
        if (!quest || quest.completed || quest.type !== type) return quest;

        let newProgress = quest.progress || 0;

        switch (type) {
          case "time": {
            newProgress = weeklySessions.reduce(
              (total, s) => total + (s.durationMinutes || 0),
              0,
            );
            break;
          }
          case "sessions": {
            newProgress = weeklySessions.length;
            break;
          }
          case "xp": {
            const weeklyXPFromSessions = weeklySessions.reduce(
              (sum, s) => sum + (s.xpEarned || 0),
              0,
            );
            newProgress = weeklyXPFromSessions;
            break;
          }
          case "streak": {
            newProgress = prev.currentStreak;
            break;
          }
          case "tasks": {
            const tasks = getTasks();
            const completedThisWeek = tasks.filter(
              (t) => t.done && t.doneAt && new Date(t.doneAt) > oneWeekAgo,
            ).length;
            newProgress = completedThisWeek;
            break;
          }
          case "level": {
            newProgress += typeof amount === "number" ? amount : 0; // increment on level ups
            break;
          }
          case "achievement": {
            newProgress += typeof amount === "number" ? amount : 0; // increment on unlocks
            break;
          }
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
            // count days in last 7 where total minutes >= 120
            const minutesByDay = weeklySessions.reduce((map, s) => {
              const key = new Date(s.timestamp).toDateString();
              map[key] = (map[key] || 0) + (s.durationMinutes || 0);
              return map;
            }, {});
            const count = Object.values(minutesByDay).filter((m) => m >= 120)
              .length;
            newProgress = count;
            break;
          }
          default:
            newProgress += amount || 0;
        }

        const completed = newProgress >= quest.target;

        if (completed && !quest.completed) {
          const questXP = quest.xp || 0;
          setTimeout(() => {
            grantXP(questXP, "quest");

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
      xpEvents: [],
    });
  };

  const value = {
    userStats,
    showRewards,
    rewardQueue,
    achievements,
    awardXP,
    grantXP,
    applyReward,
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
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
