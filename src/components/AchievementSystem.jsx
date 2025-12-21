import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Crown, Zap, Flame, Target, Clock, BookOpen,
  Users, Calendar, Award, Shield, Gem, Sparkles, TrendingUp,
  Moon, Sun, Coffee, Brain, Heart, ThumbsUp, Gift, Lock,
  CheckCircle, Circle, RotateCcw, Timer
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

// Badge rarity definitions
const RARITY_TIERS = {
  common: {
    name: 'Common',
    color: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-600',
    glowColor: 'shadow-gray-500/20',
    probability: 70
  },
  uncommon: {
    name: 'Uncommon',
    color: 'from-green-400 to-green-600',
    borderColor: 'border-green-400',
    textColor: 'text-green-600',
    glowColor: 'shadow-green-500/30',
    probability: 20
  },
  rare: {
    name: 'Rare',
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600',
    glowColor: 'shadow-blue-500/40',
    probability: 7
  },
  epic: {
    name: 'Epic',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-600',
    glowColor: 'shadow-purple-500/50',
    probability: 2.5
  },
  legendary: {
    name: 'Legendary',
    color: 'from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-600',
    glowColor: 'shadow-yellow-500/60',
    probability: 0.5
  }
};

// Comprehensive achievement definitions
const ACHIEVEMENT_CATEGORIES = {
  getting_started: {
    name: 'Getting Started',
    icon: Target,
    color: 'blue',
    achievements: [
      {
        id: 'first_session',
        name: 'First Steps',
        description: 'Complete your first study session',
        icon: '🎯',
        xp: 25,
        tier: 'common',
        condition: (stats) => stats.totalSessions >= 1
      },
      {
        id: 'first_hour',
        name: 'Hour Scholar',
        description: 'Study for 1 total hour',
        icon: '⏰',
        xp: 50,
        tier: 'common',
        condition: (stats) => stats.totalStudyTime >= 60
      },
      {
        id: 'first_week',
        name: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        icon: '📅',
        xp: 100,
        tier: 'uncommon',
        condition: (stats) => stats.currentStreak >= 7
      }
    ]
  },
  
  session_mastery: {
    name: 'Session Mastery',
    icon: Clock,
    color: 'green',
    achievements: [
      {
        id: 'short_burst',
        name: 'Quick Learner',
        description: 'Complete a 15-minute focused session',
        icon: '⚡',
        xp: 30,
        tier: 'common',
        condition: (stats) => stats.sessionHistory.some(s => s.durationMinutes >= 15)
      },
      {
        id: 'pomodoro_master',
        name: 'Pomodoro Pro',
        description: 'Complete 4 Pomodoro sessions in one day',
        icon: '🍅',
        xp: 75,
        tier: 'uncommon',
        condition: (stats) => {
          const today = new Date().toDateString();
          const todaySessions = stats.sessionHistory.filter(s => 
            new Date(s.timestamp).toDateString() === today && s.durationMinutes >= 25
          );
          return todaySessions.length >= 4;
        }
      },
      {
        id: 'marathon_session',
        name: 'Marathon Master',
        description: 'Study for 3+ hours in one session',
        icon: '🏃‍♂️',
        xp: 200,
        tier: 'rare',
        condition: (stats) => stats.sessionHistory.some(s => s.durationMinutes >= 180)
      },
      {
        id: 'endurance_beast',
        name: 'Endurance Beast',
        description: 'Study for 6+ hours in one session',
        icon: '🦍',
        xp: 500,
        tier: 'epic',
        condition: (stats) => stats.sessionHistory.some(s => s.durationMinutes >= 360)
      },
      {
        id: 'legendary_focus',
        name: 'Legendary Focus',
        description: 'Study for 12+ hours in one session',
        icon: '👑',
        xp: 1000,
        tier: 'legendary',
        condition: (stats) => stats.sessionHistory.some(s => s.durationMinutes >= 720)
      }
    ]
  },
  
  streak_achievements: {
    name: 'Streak Master',
    icon: Flame,
    color: 'orange',
    achievements: [
      {
        id: 'streak_3',
        name: 'Getting Warmed Up',
        description: 'Maintain a 3-day study streak',
        icon: '🌱',
        xp: 50,
        tier: 'common',
        condition: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '⚔️',
        xp: 100,
        tier: 'uncommon',
        condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7
      },
      {
        id: 'streak_30',
        name: 'Month Master',
        description: 'Maintain a 30-day study streak',
        icon: '👑',
        xp: 300,
        tier: 'rare',
        condition: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30
      },
      {
        id: 'streak_100',
        name: 'Century Club',
        description: 'Maintain a 100-day study streak',
        icon: '💎',
        xp: 1000,
        tier: 'epic',
        condition: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100
      },
      {
        id: 'streak_365',
        name: 'Year Champion',
        description: 'Maintain a 365-day study streak',
        icon: '🏆',
        xp: 5000,
        tier: 'legendary',
        condition: (stats) => stats.currentStreak >= 365 || stats.longestStreak >= 365
      }
    ]
  },
  
  level_progression: {
    name: 'Level Progression',
    icon: TrendingUp,
    color: 'purple',
    achievements: [
      {
        id: 'level_5',
        name: 'Rising Scholar',
        description: 'Reach level 5',
        icon: '⭐',
        xp: 75,
        tier: 'common',
        condition: (stats) => stats.level >= 5
      },
      {
        id: 'level_10',
        name: 'Dedicated Learner',
        description: 'Reach level 10',
        icon: '🌟',
        xp: 150,
        tier: 'uncommon',
        condition: (stats) => stats.level >= 10
      },
      {
        id: 'level_25',
        name: 'Knowledge Seeker',
        description: 'Reach level 25',
        icon: '💫',
        xp: 300,
        tier: 'rare',
        condition: (stats) => stats.level >= 25
      },
      {
        id: 'level_50',
        name: 'Academic Weapon',
        description: 'Reach level 50',
        icon: '⚡',
        xp: 750,
        tier: 'epic',
        condition: (stats) => stats.level >= 50
      },
      {
        id: 'level_100',
        name: 'Legend Ascended',
        description: 'Reach level 100',
        icon: '🔥',
        xp: 2000,
        tier: 'legendary',
        condition: (stats) => stats.level >= 100
      }
    ]
  },
  
  time_dedication: {
    name: 'Time Dedication',
    icon: BookOpen,
    color: 'indigo',
    achievements: [
      {
        id: 'hours_10',
        name: 'Ten Hour Scholar',
        description: 'Study for 10 total hours',
        icon: '🕙',
        xp: 100,
        tier: 'common',
        condition: (stats) => stats.totalStudyTime >= 600
      },
      {
        id: 'hours_50',
        name: 'Fifty Hour Hero',
        description: 'Study for 50 total hours',
        icon: '📚',
        xp: 250,
        tier: 'uncommon',
        condition: (stats) => stats.totalStudyTime >= 3000
      },
      {
        id: 'hours_100',
        name: 'Century Scholar',
        description: 'Study for 100 total hours',
        icon: '💯',
        xp: 500,
        tier: 'rare',
        condition: (stats) => stats.totalStudyTime >= 6000
      },
      {
        id: 'hours_500',
        name: 'Dedication Master',
        description: 'Study for 500 total hours',
        icon: '🏆',
        xp: 1500,
        tier: 'epic',
        condition: (stats) => stats.totalStudyTime >= 30000
      },
      {
        id: 'hours_1000',
        name: 'Time Lord',
        description: 'Study for 1000 total hours',
        icon: '⏳',
        xp: 5000,
        tier: 'legendary',
        condition: (stats) => stats.totalStudyTime >= 60000
      }
    ]
  },
  
  special_occasions: {
    name: 'Special Occasions',
    icon: Sparkles,
    color: 'pink',
    achievements: [
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Study after 10 PM',
        icon: '🦉',
        xp: 50,
        tier: 'uncommon',
        condition: (stats) => stats.sessionHistory.some(s => new Date(s.timestamp).getHours() >= 22)
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Study before 6 AM',
        icon: '🐦',
        xp: 75,
        tier: 'uncommon',
        condition: (stats) => stats.sessionHistory.some(s => new Date(s.timestamp).getHours() < 6)
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Study on both Saturday and Sunday',
        icon: '🏋️',
        xp: 100,
        tier: 'rare',
        condition: (stats) => {
          const weekendSessions = stats.sessionHistory.filter(s => {
            const day = new Date(s.timestamp).getDay();
            return day === 0 || day === 6; // Sunday or Saturday
          });
          const hasWeekend = weekendSessions.some(s => new Date(s.timestamp).getDay() === 0) &&
                            weekendSessions.some(s => new Date(s.timestamp).getDay() === 6);
          return hasWeekend;
        }
      },
      {
        id: 'midnight_scholar',
        name: 'Midnight Scholar',
        description: 'Study during midnight hour (12-1 AM)',
        icon: '🌙',
        xp: 150,
        tier: 'epic',
        condition: (stats) => stats.sessionHistory.some(s => {
          const hour = new Date(s.timestamp).getHours();
          return hour === 0; // Midnight hour
        })
      }
    ]
  },
  
  social_achievements: {
    name: 'Social & Competition',
    icon: Users,
    color: 'cyan',
    achievements: [
      {
        id: 'quest_master',
        name: 'Quest Master',
        description: 'Complete 10 daily quests',
        icon: '🗡️',
        xp: 200,
        tier: 'uncommon',
        condition: (stats) => stats.completedQuestsToday >= 10
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete all daily quests for 7 days straight',
        icon: '💎',
        xp: 500,
        tier: 'rare',
        condition: (stats) => stats.questStreak >= 7
      }
    ]
  },
  
  mastery_achievements: {
    name: 'Subject Mastery',
    icon: Brain,
    color: 'emerald',
    achievements: [
      {
        id: 'subject_explorer',
        name: 'Subject Explorer',
        description: 'Study 5 different subjects',
        icon: '🗺️',
        xp: 100,
        tier: 'common',
        condition: (stats) => Object.keys(stats.subjectMastery).length >= 5
      },
      {
        id: 'subject_master',
        name: 'Subject Master',
        description: 'Study one subject for 50+ hours',
        icon: '🎓',
        xp: 300,
        tier: 'rare',
        condition: (stats) => Object.values(stats.subjectMastery).some(time => time >= 3000)
      },
      {
        id: 'polymath',
        name: 'Polymath',
        description: 'Study 10+ different subjects',
        icon: '🧠',
        xp: 500,
        tier: 'epic',
        condition: (stats) => Object.keys(stats.subjectMastery).length >= 10
      }
    ]
  },
  
  legendary_feats: {
    name: 'Legendary Feats',
    icon: Crown,
    color: 'yellow',
    achievements: [
      {
        id: 'prestige_master',
        name: 'Prestige Master',
        description: 'Reach Prestige Level 1',
        icon: '🌟',
        xp: 2500,
        tier: 'legendary',
        condition: (stats) => stats.prestigeLevel >= 1
      },
      {
        id: 'jackpot_hunter',
        name: 'Jackpot Hunter',
        description: 'Hit 5 legendary XP jackpots',
        icon: '🎰',
        xp: 1000,
        tier: 'epic',
        condition: (stats) => stats.jackpotCount >= 5
      },
      {
        id: 'ultimate_scholar',
        name: 'Ultimate Scholar',
        description: 'Reach 1 million total XP',
        icon: '👑',
        xp: 10000,
        tier: 'legendary',
        condition: (stats) => stats.totalXPEarned >= 1000000
      }
    ]
  }
};

// Achievement Badge Component
const AchievementBadge = ({ achievement, unlocked, onClick, showLocked = true }) => {
  const tier = RARITY_TIERS[achievement.tier];
  
  if (!unlocked && !showLocked) return null;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(achievement)}
      className={`relative cursor-pointer p-4 rounded-2xl border-2 backdrop-blur ${
        unlocked 
          ? `bg-gradient-to-br ${tier.color} ${tier.borderColor} ${tier.glowColor} shadow-lg` 
          : 'bg-white/5 border-gray-600/50 opacity-60'
      } transition-all duration-300`}
    >
      {/* Rarity indicator */}
      {unlocked && (
        <div className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-bold ${tier.textColor} bg-white shadow-md`}>
          {tier.name}
        </div>
      )}
      
      {/* Achievement icon */}
      <div className="text-center mb-3">
        <div className={`text-4xl mb-2 ${unlocked ? '' : 'filter grayscale'}`}>
          {achievement.icon}
        </div>
        {!unlocked && <Lock className="w-6 h-6 mx-auto text-gray-400" />}
      </div>
      
      {/* Achievement details */}
      <div className="text-center">
        <h3 className={`font-bold text-sm mb-1 ${unlocked ? 'text-white' : 'text-gray-400'}`}>
          {achievement.name}
        </h3>
        <p className={`text-xs ${unlocked ? 'text-white/90' : 'text-gray-500'}`}>
          {achievement.description}
        </p>
        
        {/* XP reward */}
        <div className={`flex items-center justify-center gap-1 mt-2 ${unlocked ? 'text-yellow-200' : 'text-gray-400'}`}>
          <Star className="w-3 h-3" />
          <span className="text-xs font-medium">+{achievement.xp} XP</span>
        </div>
      </div>
      
      {/* Sparkle effect for legendary */}
      {unlocked && achievement.tier === 'legendary' && (
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Achievement Modal
const AchievementModal = ({ achievement, isOpen, onClose }) => {
  if (!isOpen || !achievement) return null;
  
  const tier = RARITY_TIERS[achievement.tier];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-gradient-to-br ${tier.color} p-8 rounded-3xl shadow-2xl text-white max-w-md w-full text-center`}
        >
          <div className="text-6xl mb-4">{achievement.icon}</div>
          
          <div className={`inline-block px-4 py-2 rounded-full bg-white/20 text-sm font-bold mb-4`}>
            {tier.name} Achievement
          </div>
          
          <h2 className="text-2xl font-bold mb-3">{achievement.name}</h2>
          <p className="text-lg opacity-90 mb-6">{achievement.description}</p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-300" />
            <span className="text-xl font-bold">+{achievement.xp} XP</span>
          </div>
          
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Awesome!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Achievement System Component
const AchievementSystem = () => {
  const { userStats, achievements: contextAchievements, checkAchievements } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState('getting_started');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Check achievements on mount
  useEffect(() => {
    if (checkAchievements) {
      checkAchievements();
    }
  }, []); // Only on mount, as context handles triggers on stats change
  
  // Get all achievements with unlock status - FIXED to use both context and component achievements
  const getAllAchievements = () => {
    const allAchievements = [];
    
    // Add achievements from context (simpler system)
    if (contextAchievements) {
      Object.values(contextAchievements).forEach(achievement => {
        const unlocked = (userStats.achievements || []).includes(achievement.id);
        allAchievements.push({
          ...achievement,
          category: 'context',
          unlocked
        });
      });
    }
    
    // Add achievements from component categories
    Object.entries(ACHIEVEMENT_CATEGORIES).forEach(([categoryKey, category]) => {
      category.achievements.forEach(achievement => {
        // Check if already added from context
        if (allAchievements.some(a => a.id === achievement.id)) {
          return;
        }
        
        const unlocked = (userStats.achievements || []).includes(achievement.id);
        allAchievements.push({
          ...achievement,
          category: categoryKey,
          unlocked
        });
      });
    });
    
    return allAchievements;
  };
  
  const allAchievements = getAllAchievements();
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  
  // Filter achievements
  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    if (filter !== 'all') return achievement.tier === filter;
    return true;
  });
  
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Achievement Gallery
        </h1>
        
        {/* Progress Overview */}
        <div className="bg-white/10 rounded-xl p-6 mb-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Progress</h2>
              <p className="text-gray-300">
                {unlockedCount} of {totalCount} achievements unlocked
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </div>
              <p className="text-sm text-gray-300">Complete</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'unlocked', 'locked', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filter === filterOption
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              {filterOption === 'unlocked' && ` (${unlockedCount})`}
              {filterOption === 'locked' && ` (${totalCount - unlockedCount})`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AchievementBadge
              achievement={achievement}
              unlocked={achievement.unlocked}
              onClick={handleAchievementClick}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Achievement Modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AchievementSystem;
export { ACHIEVEMENT_CATEGORIES, RARITY_TIERS, AchievementBadge };
