import React, { createContext, useContext, useState, useEffect } from 'react';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('userStats');
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
      currentTitle: 'Rookie Scholar',
      
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
      currentSkin: 'default',
      
      // Statistics
      subjectMastery: {},
      weeklyGoal: 0,
      weeklyProgress: 0,
      totalXPEarned: 0,
      
      // Variable reward tracking
      lastRewardTime: null,
      rewardStreak: 0,
      luckyStreak: 0,
      jackpotCount: 0
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
        weeklyQuests: savedStats.weeklyQuests ?? []
      };
    }

    return defaultStats;
  });

  const [rewardQueue, setRewardQueue] = useState([]);
  const [showRewards, setShowRewards] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState([]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    console.log('💾 Saving userStats to localStorage:', userStats);
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);

  // Advanced XP calculation with variable rewards
  const calculateXP = (sessionDuration, subjectName, difficulty = 1.0) => {
    const baseXP = Math.floor(sessionDuration / 0.1); // 10 XP per minute
    
    // Focus multiplier scales with session length (longer sessions = higher multiplier)
    const focusMultiplier = Math.min(3.0, 1.0 + (sessionDuration / 120)); // Max 3x at 2+ hours
    
    // Streak bonus scales exponentially with current streak
    const streakBonus = Math.floor(userStats.currentStreak * (Math.log(userStats.currentStreak + 1) * 5));
    
    // Subject mastery bonus (20% bonus for well-studied subjects)
    const masteryBonus = userStats.subjectMastery[subjectName] >= 1000 ? baseXP * 0.2 : 0;
    
    // Prestige multiplier
    const prestigeMultiplier = 1.0 + (userStats.prestigeLevel * 0.1);
    
    // Premium multiplier
    const premiumMultiplier = userStats.isPremium ? userStats.xpMultiplier : 1.0;
    
    // Calculate base XP with all multipliers
    let totalXP = Math.floor((baseXP * focusMultiplier + streakBonus + masteryBonus) * prestigeMultiplier * premiumMultiplier);
    
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
        variable: variableReward.bonusXP
      },
      reward: variableReward
    };
  };

  // Variable reward system with probability tiers based on real performance
  const calculateVariableReward = (baseXP, sessionDuration) => {
    const rand = Math.random();
    const sessionBonus = Math.min(2.0, sessionDuration / 60); // Up to 2x for longer sessions

    // Adjust probabilities based on user's recent performance
    const recentSessions = userStats.sessionHistory.slice(0, 10);
    const avgRecentDuration = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / recentSessions.length
      : sessionDuration;

    // Better chance of bonus for longer than average sessions
    const performanceMultiplier = sessionDuration > avgRecentDuration ? 1.5 : 1.0;

    // Legendary (0.1% base chance, increased for exceptional performance)
    if (rand < (0.1 * performanceMultiplier)) {
      return {
        tier: 'legendary',
        type: 'XP_JACKPOT',
        bonusXP: Math.floor(baseXP * 5 * sessionBonus),
        title: '🏆 LEGENDARY JACKPOT!',
        description: `+500% bonus XP for ${sessionDuration}min session!`,
        animation: 'jackpot',
        sound: 'legendary',
        extras: { title: 'Jackpot Hunter', badge: 'legendary_jackpot' }
      };
    }

    // Epic (1% base chance)
    if (rand < (0.2 * performanceMultiplier)) {
      return {
        tier: 'epic',
        type: 'XP_BONUS',
        bonusXP: Math.floor(baseXP * 2 * sessionBonus),
        title: '✨ EPIC BONUS!',
        description: `+200% bonus XP for great focus!`,
        animation: 'epic',
        sound: 'epic'
      };
    }

    // Rare (5% base chance)
    if (rand < (0.3 * performanceMultiplier)) {
      return {
        tier: 'rare',
        type: 'XP_BONUS',
        bonusXP: Math.floor(baseXP * 1.5 * sessionBonus),
        title: '🌟 RARE BONUS!',
        description: `+150% bonus XP for consistency!`,
        animation: 'rare',
        sound: 'rare'
      };
    }

    // Uncommon (15% base chance)
    if (rand < (0.4 * performanceMultiplier)) {
      return {
        tier: 'uncommon',
        type: 'XP_BONUS',
        bonusXP: Math.floor(baseXP * 0.5 * sessionBonus),
        title: '⭐ Lucky Scholar!',
        description: `+50% bonus XP for good work!`,
        animation: 'uncommon',
        sound: 'uncommon'
      };
    }

    // No bonus (remaining chance)
    return {
      tier: 'none',
      bonusXP: 0
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
      percentage: Math.min(100, Math.max(0, (progressXP / neededXP) * 100))
    };
  };

  // Advanced streak tracking with decay
  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastStudy = userStats.lastStudyDate ? new Date(userStats.lastStudyDate).toDateString() : null;
    
    if (lastStudy === today) {
      return { streak: userStats.currentStreak, isNewDay: false, streakBroken: false };
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
        canUseSaver: true 
      };
    } else {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
    }

    setUserStats(prev => ({
      ...prev,
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastStudyDate: new Date().toISOString()
    }));

    // Check streak achievements
    checkStreakAchievements(newStreak);

    return { streak: newStreak, isNewDay: true, streakBroken };
  };

  // Use streak saver (premium feature)
  const useStreakSaver = () => {
    if (userStats.streakSavers > 0) {
      setUserStats(prev => ({
        ...prev,
        streakSavers: prev.streakSavers - 1,
        lastStudyDate: new Date().toISOString()
      }));
      
      addReward({
        type: 'STREAK_SAVED',
        title: '🛡️ Streak Protected!',
        description: `Used streak saver! ${userStats.streakSavers - 1} remaining`,
        tier: 'premium'
      });
      
      return true;
    }
    return false;
  };

  // Check streak achievements
  const checkStreakAchievements = (streak) => {
    const milestones = [
      { days: 3, title: 'Getting Started', icon: '🌱', xp: 50 },
      { days: 7, title: 'Week Warrior', icon: '⚔️', xp: 100 },
      { days: 14, title: 'Fortnight Fighter', icon: '🏰', xp: 200 },
      { days: 30, title: 'Month Master', icon: '👑', xp: 500 },
      { days: 50, title: 'Unstoppable Force', icon: '🌪️', xp: 750 },
      { days: 100, title: 'Century Club', icon: '💎', xp: 1500 },
      { days: 365, title: 'Year Champion', icon: '🏆', xp: 5000 }
    ];

    milestones.forEach(milestone => {
      if (streak === milestone.days) {
        unlockAchievement({
          id: `streak_${milestone.days}`,
          name: milestone.title,
          description: `Maintained a ${milestone.days}-day study streak!`,
          icon: milestone.icon,
          xp: milestone.xp,
          type: 'streak',
          tier: milestone.days >= 100 ? 'legendary' : milestone.days >= 30 ? 'epic' : 'rare'
        });
      }
    });
  };

  // Prestige system - reset progress for exclusive rewards
  const prestige = () => {
    if (userStats.level < 100) return false; // Must be level 100 to prestige
    
    const newPrestigeLevel = userStats.prestigeLevel + 1;
    
    setUserStats(prev => ({
      ...prev,
      level: 1,
      xp: 0,
      prestigeLevel: newPrestigeLevel,
      currentTitle: `Prestige ${newPrestigeLevel} Scholar`,
      // Keep achievements, badges, and stats
      // Reset only level and XP
    }));

    addReward({
      type: 'PRESTIGE',
      title: `🌟 PRESTIGE ${newPrestigeLevel}!`,
      description: 'Welcome to the elite! +10% permanent XP bonus',
      tier: 'legendary',
      animation: 'prestige'
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
    setUserStats(prev => {
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
          [subjectName]: (prev.subjectMastery[subjectName] || 0) + sessionDuration
        }
      };

      console.log('🎯 Awarding XP:', {
        sessionDuration,
        subjectName,
        oldXP: prev.xp,
        newXP,
        xpGained: xpData.totalXP,
        oldTotalXPEarned: prev.totalXPEarned,
        newTotalXPEarned: newStats.totalXPEarned
      });

      return newStats;
    });

    // Show XP reward
    addReward({
      type: 'XP_EARNED',
      title: `+${xpData.totalXP} XP`,
      description: 'Great work!',
      tier: 'common',
      details: xpData.bonuses
    });

    // Show variable reward if any
    if (xpData.reward.tier !== 'none') {
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
      type: 'LEVEL_UP',
      title: `🎉 LEVEL ${newLevel}!`,
      description: 'You\'re getting stronger!',
      tier: 'epic',
      animation: 'levelup',
      sound: 'levelup'
    });

    // Level milestone rewards
    const milestones = {
      5: { title: 'Rising Scholar', xp: 100 },
      10: { title: 'Dedicated Learner', xp: 250 },
      25: { title: 'Knowledge Seeker', xp: 500 },
      50: { title: 'Academic Elite', xp: 1000 },
      75: { title: 'Master Scholar', xp: 2000 },
      100: { title: 'Academic Legend', xp: 5000, canPrestige: true }
    };

    if (milestones[newLevel]) {
      const milestone = milestones[newLevel];
      setUserStats(prev => ({
        ...prev,
        currentTitle: milestone.title,
        xp: prev.xp + milestone.xp
      }));

      addReward({
        type: 'MILESTONE',
        title: `👑 ${milestone.title}`,
        description: `Level ${newLevel} milestone! +${milestone.xp} bonus XP`,
        tier: newLevel >= 100 ? 'legendary' : newLevel >= 50 ? 'epic' : 'rare'
      });
    }
  };

  // Add reward to queue
  const addReward = (reward) => {
    const rewardWithId = {
      ...reward,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };

    setRewardQueue(prev => [...prev, rewardWithId]);
    setShowRewards(true);

    // Auto-remove after delay
    setTimeout(() => {
      setRewardQueue(prev => prev.filter(r => r.id !== rewardWithId.id));
    }, reward.tier === 'legendary' ? 5000 : 3000);
  };

  // Enhanced achievement system
  const achievements = {
    // Session achievements
    first_session: {
      id: 'first_session',
      name: 'First Steps',
      description: 'Complete your first study session',
      icon: '🎯',
      xp: 25,
      condition: () => userStats.totalSessions >= 1,
      tier: 'common'
    },
    session_marathon: {
      id: 'session_marathon',
      name: 'Marathon Master',
      description: 'Study for 3+ hours in one session',
      icon: '🏃‍♂️',
      xp: 200,
      condition: () => userStats.sessionHistory.some(s => s.durationMinutes >= 180),
      tier: 'rare'
    },
    
    // Level achievements
    level_10: {
      id: 'level_10',
      name: 'Rising Star',
      description: 'Reach level 10',
      icon: '⭐',
      xp: 100,
      condition: () => userStats.level >= 10,
      tier: 'uncommon'
    },
    level_50: {
      id: 'level_50',
      name: 'Academic Weapon',
      description: 'Reach level 50',
      icon: '⚡',
      xp: 500,
      condition: () => userStats.level >= 50,
      tier: 'epic'
    },
    
    // Time achievements
    hundred_hours: {
      id: 'hundred_hours',
      name: 'Century Scholar',
      description: 'Study for 100+ total hours',
      icon: '💯',
      xp: 300,
      condition: () => userStats.totalStudyTime >= 6000, // 100 hours in minutes
      tier: 'rare'
    },
    
    // Special achievements
    night_owl: {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 10 PM',
      icon: '🦉',
      xp: 50,
      condition: () => userStats.sessionHistory.some(s => new Date(s.timestamp).getHours() >= 22),
      tier: 'uncommon'
    },
    early_bird: {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 6 AM',
      icon: '🐦',
      xp: 75,
      condition: () => userStats.sessionHistory.some(s => new Date(s.timestamp).getHours() < 6),
      tier: 'uncommon'
    }
  };

  // Check and unlock achievements
  const checkAchievements = () => {
    Object.values(achievements).forEach(achievement => {
      if (!userStats.achievements.includes(achievement.id) && achievement.condition()) {
        unlockAchievement(achievement);
      }
    });
  };

  // Unlock achievement
  const unlockAchievement = (achievement) => {
    setUserStats(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement.id],
      xp: prev.xp + achievement.xp
    }));

    addReward({
      type: 'ACHIEVEMENT',
      title: `🏆 ${achievement.name}`,
      description: achievement.description,
      tier: achievement.tier,
      xp: achievement.xp,
      icon: achievement.icon,
      animation: 'achievement'
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
      mood: sessionData.mood || 'neutral'
    };

    const xpData = awardXP(session.durationMinutes, session.subjectName, session.difficulty);
    
    const enhancedSession = {
      ...session,
      xpEarned: xpData.totalXP,
      bonuses: xpData.bonuses
    };

    setUserStats(prev => ({
      ...prev,
      sessionHistory: [enhancedSession, ...prev.sessionHistory.slice(0, 99)]
    }));

    return enhancedSession;
  };

  // Generate contextual daily quests based on user's actual performance
  const generateDailyQuests = () => {
    // Calculate user's average performance to set realistic targets
    const avgSessionLength = userStats.sessionHistory.length > 0
      ? Math.round(userStats.sessionHistory.reduce((sum, s) => sum + s.durationMinutes, 0) / userStats.sessionHistory.length)
      : 25;

    const avgSessionsPerDay = userStats.totalSessions > 0 && userStats.sessionHistory.length > 0
      ? Math.max(1, Math.round(userStats.totalSessions / Math.max(1, Math.floor((Date.now() - new Date(userStats.sessionHistory[userStats.sessionHistory.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))))
      : 1;

    const userSubjectCount = Object.keys(userStats.subjectMastery || {}).length;

    const questTemplates = [
      {
        id: 'study_time',
        name: 'Time Master',
        description: 'Study for {target} minutes today',
        type: 'time',
        targets: [
          Math.max(15, avgSessionLength - 10),
          avgSessionLength,
          Math.min(120, avgSessionLength + 15),
          Math.min(180, avgSessionLength + 30)
        ],
        xp: (target) => Math.round(target * 1.5),
        icon: '⏰'
      },
      {
        id: 'session_count',
        name: 'Session Warrior',
        description: 'Complete {target} study sessions',
        type: 'sessions',
        targets: [
          Math.max(1, avgSessionsPerDay),
          Math.max(2, avgSessionsPerDay + 1),
          Math.max(3, avgSessionsPerDay + 2),
          Math.max(4, avgSessionsPerDay + 3)
        ],
        xp: (target) => target * 25,
        icon: '🎯'
      },
      {
        id: 'subject_variety',
        name: 'Scholar\'s Variety',
        description: 'Study {target} different subjects',
        type: 'subjects',
        targets: userSubjectCount > 0 ? [
          Math.min(userSubjectCount, 2),
          Math.min(userSubjectCount, 3),
          Math.min(userSubjectCount + 1, 4)
        ] : [2, 3],
        xp: (target) => target * 30,
        icon: '📚'
      },
      {
        id: 'streak_maintain',
        name: 'Streak Guardian',
        description: 'Maintain your daily streak',
        type: 'streak',
        targets: [1],
        xp: () => 50 + Math.max(0, userStats.currentStreak) * 5,
        icon: '����'
      }
    ];

    const selectedQuests = questTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(template => {
        const target = template.targets[Math.floor(Math.random() * template.targets.length)];
        return {
          id: template.id + '_' + Date.now(),
          name: template.name,
          description: template.description.replace('{target}', target),
          type: template.type,
          target,
          progress: 0,
          completed: false,
          xp: template.xp(target),
          icon: template.icon,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      });

    setUserStats(prev => ({
      ...prev,
      dailyQuests: selectedQuests
    }));
  };

  // Update quest progress
  const updateQuestProgress = (type, amount = 1, subjectName = null) => {
    setUserStats(prev => {
      const updatedQuests = prev.dailyQuests.map(quest => {
        if (quest.completed || quest.type !== type) return quest;
        
        let newProgress = quest.progress;
        
        switch (type) {
          case 'time':
            newProgress += amount;
            break;
          case 'sessions':
            newProgress += 1;
            break;
          case 'subjects':
            // Track unique subjects studied today
            const todaysSessions = prev.sessionHistory.filter(s => 
              new Date(s.timestamp).toDateString() === new Date().toDateString()
            );
            const uniqueSubjects = [...new Set(todaysSessions.map(s => s.subjectName))];
            newProgress = uniqueSubjects.length;
            break;
          case 'streak':
            newProgress = prev.currentStreak > 0 ? 1 : 0;
            break;
        }
        
        const completed = newProgress >= quest.target;
        
        if (completed && !quest.completed) {
          // Award quest completion XP
          const questXP = quest.xp || 0;
          setTimeout(() => {
            // Actually add XP to user stats
            setUserStats(prevStats => ({
              ...prevStats,
              xp: prevStats.xp + questXP,
              totalXPEarned: (prevStats.totalXPEarned || prevStats.xp || 0) + questXP,
              weeklyXP: (prevStats.weeklyXP || 0) + questXP,
              level: getLevelFromXP(prevStats.xp + questXP)
            }));

            addReward({
              type: 'QUEST_COMPLETE',
              title: `✅ ${quest.name}`,
              description: quest.description,
              tier: 'uncommon',
              xp: questXP
            });
          }, 100);
        }
        
        return {
          ...quest,
          progress: Math.min(newProgress, quest.target),
          completed
        };
      });
      
      return {
        ...prev,
        dailyQuests: updatedQuests
      };
    });
  };

  // Debug function to reset user stats
  const resetUserStats = () => {
    localStorage.removeItem('userStats');
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
      currentTitle: 'Rookie Scholar',

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
      currentSkin: 'default',

      // Statistics
      subjectMastery: {},
      weeklyGoal: 0,
      weeklyProgress: 0,
      totalXPEarned: 0,

      // Variable reward tracking
      lastRewardTime: null,
      rewardStreak: 0,
      luckyStreak: 0,
      jackpotCount: 0
    });
  };

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
    updateQuestProgress,
    checkAchievements,
    unlockAchievement,
    prestige,
    setShowRewards,
    calculateXP,
    getTotalXPForLevel,
    resetUserStats // Debug function
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
