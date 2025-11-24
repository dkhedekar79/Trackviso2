import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Star, Clock, BookOpen, Flame, Trophy, Gift, 
  Zap, Calendar, TrendingUp, Award, CheckCircle, RotateCcw,
  Plus, X, Lock, Sparkles, Crown, Timer, Users, Brain
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { AnimatedProgressBar, QuestComplete } from './RewardAnimations';

// Quest Categories and Templates
const QUEST_CATEGORIES = {
  daily: {
    name: 'Daily Challenges',
    icon: Calendar,
    color: 'blue',
    resetInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxQuests: 3
  },
  weekly: {
    name: 'Weekly Goals',
    icon: TrendingUp,
    color: 'purple',
    resetInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxQuests: 2
  },
  special: {
    name: 'Special Events',
    icon: Sparkles,
    color: 'gold',
    resetInterval: null, // Manual control
    maxQuests: 1
  }
};

// Quest Templates with Dynamic Parameters
const QUEST_TEMPLATES = {
  // Study Time Quests
  study_time_short: {
    id: 'study_time_short',
    name: 'Quick Learner',
    description: 'Study for {minutes} minutes today',
    type: 'time',
    category: 'daily',
    baseXP: 40,
    icon: '⏰',
    difficulty: 'easy',
    parameters: {
      minutes: [15, 20, 25, 30]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Use the Pomodoro technique', 'Find a quiet study space', 'Remove distractions']
  },
  
  study_time_medium: {
    id: 'study_time_medium',
    name: 'Focused Scholar',
    description: 'Study for {minutes} minutes today',
    type: 'time',
    category: 'daily',
    baseXP: 80,
    icon: '📚',
    difficulty: 'medium',
    parameters: {
      minutes: [45, 60, 75, 90]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Take breaks every 25 minutes', 'Stay hydrated', 'Use active recall']
  },
  
  study_time_long: {
    id: 'study_time_long',
    name: 'Endurance Master',
    description: 'Study for {hours} hours today',
    type: 'time',
    category: 'daily',
    baseXP: 150,
    icon: '🏆',
    difficulty: 'hard',
    parameters: {
      hours: [2, 3, 4, 5]
    },
    condition: (progress, target) => progress >= target * 60,
    tips: ['Plan regular breaks', 'Vary your subjects', 'Stay motivated with goals']
  },
  
  // Session Count Quests
  multiple_sessions: {
    id: 'multiple_sessions',
    name: 'Session Warrior',
    description: 'Complete {count} study sessions today',
    type: 'sessions',
    category: 'daily',
    baseXP: 60,
    icon: '🎯',
    difficulty: 'medium',
    parameters: {
      count: [2, 3, 4, 5]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Space out your sessions', 'Use different techniques', 'Track your progress']
  },
  
  // Subject Variety Quests
  subject_variety: {
    id: 'subject_variety',
    name: 'Knowledge Explorer',
    description: 'Study {count} different subjects today',
    type: 'subjects',
    category: 'daily',
    baseXP: 70,
    icon: '🗺️',
    difficulty: 'medium',
    parameters: {
      count: [2, 3, 4]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Mix different types of subjects', 'Use varied study methods', 'Keep it interesting']
  },
  
  // Streak Maintenance
  streak_guardian: {
    id: 'streak_guardian',
    name: 'Streak Guardian',
    description: 'Maintain your daily study streak',
    type: 'streak',
    category: 'daily',
    baseXP: 50,
    icon: '🔥',
    difficulty: 'easy',
    parameters: {
      streakBonus: [5, 10, 15, 20] // Extra XP per streak day
    },
    condition: (progress, target) => progress >= 1,
    tips: ['Study every day', 'Use streak savers wisely', 'Start with small sessions']
  },
  
  // Weekly Quests
  weekly_hours: {
    id: 'weekly_hours',
    name: 'Weekly Champion',
    description: 'Study for {hours} hours this week',
    type: 'weekly_time',
    category: 'weekly',
    baseXP: 300,
    icon: '⚡',
    difficulty: 'hard',
    parameters: {
      hours: [10, 15, 20, 25]
    },
    condition: (progress, target) => progress >= target * 60,
    tips: ['Plan your week', 'Set daily targets', 'Stay consistent']
  },
  
  weekly_consistency: {
    id: 'weekly_consistency',
    name: 'Consistency King',
    description: 'Study every day for {days} days',
    type: 'weekly_streak',
    category: 'weekly',
    baseXP: 250,
    icon: '👑',
    difficulty: 'hard',
    parameters: {
      days: [5, 6, 7]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Plan ahead', 'Set reminders', 'Start small each day']
  },
  
  // Special Event Quests
  weekend_warrior: {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Study for {hours} hours during the weekend',
    type: 'weekend',
    category: 'special',
    baseXP: 200,
    icon: '🏋️',
    difficulty: 'medium',
    parameters: {
      hours: [3, 4, 5, 6]
    },
    condition: (progress, target) => progress >= target * 60,
    tips: ['Use weekends for deep work', 'Catch up on difficult topics', 'Review the week']
  },
  
  night_owl_challenge: {
    id: 'night_owl_challenge',
    name: 'Night Owl Challenge',
    description: 'Study after 9 PM for {minutes} minutes',
    type: 'night_study',
    category: 'special',
    baseXP: 100,
    icon: '🦉',
    difficulty: 'medium',
    parameters: {
      minutes: [30, 45, 60]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Avoid caffeine late', 'Use blue light filters', 'Keep sessions shorter']
  },
  
  early_bird_challenge: {
    id: 'early_bird_challenge',
    name: 'Early Bird Challenge',
    description: 'Study before 7 AM for {minutes} minutes',
    type: 'morning_study',
    category: 'special',
    baseXP: 120,
    icon: '🐦',
    difficulty: 'hard',
    parameters: {
      minutes: [30, 45, 60]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Go to bed early', 'Prepare materials the night before', 'Start with lighter topics']
  },
  
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all daily quests for {days} consecutive days',
    type: 'quest_streak',
    category: 'special',
    baseXP: 500,
    icon: '💎',
    difficulty: 'legendary',
    parameters: {
      days: [3, 5, 7]
    },
    condition: (progress, target) => progress >= target,
    tips: ['Plan your quests', 'Start early each day', 'Track your progress']
  }
};

// Quest Difficulty Multipliers
const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
  legendary: 2.0
};

// Quest Progress Tracker
const QuestProgressTracker = ({ quest, onComplete }) => {
  // Add safety checks for undefined properties
  if (!quest || typeof quest !== 'object') {
    return null;
  }

  const progress = Math.min(quest.progress || 0, quest.target || 1);
  const percentage = (progress / (quest.target || 1)) * 100;
  const isCompleted = quest.completed || false;
  
  const difficultyColors = {
    easy: 'from-green-400 to-green-600',
    medium: 'from-blue-400 to-blue-600',
    hard: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`p-6 rounded-2xl border-2 transition-all ${
        isCompleted 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100/50' 
          : 'bg-white border-gray-200 hover:border-purple-300'
      } shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
            difficultyColors[quest.difficulty || 'medium']
          } flex items-center justify-center text-2xl shadow-lg`}>
            {quest.icon || '🎯'}
          </div>
          
          <div>
            <h3 className={`font-bold text-lg ${
              isCompleted ? 'text-green-800' : 'text-gray-800'
            }`}>
              {quest.name || 'Unknown Quest'}
            </h3>
            <p className={`text-sm ${
              isCompleted ? 'text-green-600' : 'text-gray-600'
            }`}>
              {quest.description || 'No description available'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-green-600"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Complete!</span>
            </motion.div>
          ) : (
            <div className="text-right">
              <span className="text-sm font-medium text-gray-600">
                {progress} / {quest.target || 1}
              </span>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                quest.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                quest.difficulty === 'medium' ? 'bg-blue-100 text-blue-700' :
                quest.difficulty === 'hard' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {(quest.difficulty || 'medium').toUpperCase()}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4" />
            <span className="font-semibold">+{quest.xp || 0} XP</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <AnimatedProgressBar
          progress={percentage}
          color={isCompleted ? 'green' : 'purple'}
          height="h-3"
          showPercentage={false}
        />
      </div>
      
      {/* Tips */}
      {quest.tips && Array.isArray(quest.tips) && quest.tips.length > 0 && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 rounded-lg p-3"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Tips:
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {quest.tips.slice(0, 2).map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      
      {/* Completion Celebration */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-100 rounded-lg p-3 border border-green-200"
        >
          <div className="flex items-center justify-center gap-2 text-green-800">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Quest Complete!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Quest Generation Logic
const generateQuest = (template, category) => {
  const questId = `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Select random parameters
  const selectedParams = {};
  Object.entries(template.parameters).forEach(([key, values]) => {
    selectedParams[key] = values[Math.floor(Math.random() * values.length)];
  });
  
  // Replace placeholders in description
  let description = template.description;
  Object.entries(selectedParams).forEach(([key, value]) => {
    description = description.replace(`{${key}}`, value);
  });
  
  // Calculate XP with difficulty multiplier
  const baseXP = template.baseXP;
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[template.difficulty];
  const xp = Math.floor(baseXP * difficultyMultiplier);
  
  // Set target based on parameter
  const targetKey = Object.keys(selectedParams)[0];
  const target = selectedParams[targetKey];
  
  // Calculate deadline
  const now = new Date();
  let deadline;
  
  if (category === 'daily') {
    deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(0, 0, 0, 0);
  } else if (category === 'weekly') {
    deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 7);
    deadline.setHours(0, 0, 0, 0);
  } else {
    deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 3); // Special quests last 3 days
  }
  
  return {
    id: questId,
    templateId: template.id,
    name: template.name,
    description,
    type: template.type,
    category,
    xp,
    icon: template.icon,
    difficulty: template.difficulty,
    target,
    progress: 0,
    completed: false,
    deadline: deadline.toISOString(),
    tips: template.tips,
    parameters: selectedParams,
    createdAt: now.toISOString()
  };
};

// Main Quest System Component
const QuestSystem = () => {
  const { 
    userStats, 
    updateQuestProgress, 
    addReward,
    generateDailyQuests 
  } = useGamification();
  
  const [activeCategory, setActiveCategory] = useState('daily');
  const [showCompleted, setShowCompleted] = useState(false);
  const [questCompletions, setQuestCompletions] = useState([]);
  
  // Generate fresh quests if needed
  useEffect(() => {
    const now = new Date();
    
    // Check if we need new daily quests
    const lastDailyReset = localStorage.getItem('lastDailyQuestReset');
    const shouldResetDaily = !lastDailyReset || 
      (now.getTime() - parseInt(lastDailyReset)) > QUEST_CATEGORIES.daily.resetInterval;
    
    if (shouldResetDaily || userStats.dailyQuests.length === 0) {
      generateNewQuests('daily');
      localStorage.setItem('lastDailyQuestReset', now.getTime().toString());
    }
    
    // Check if we need new weekly quests
    const lastWeeklyReset = localStorage.getItem('lastWeeklyQuestReset');
    const shouldResetWeekly = !lastWeeklyReset || 
      (now.getTime() - parseInt(lastWeeklyReset)) > QUEST_CATEGORIES.weekly.resetInterval;
    
    if (shouldResetWeekly || userStats.weeklyQuests.length === 0) {
      generateNewQuests('weekly');
      localStorage.setItem('lastWeeklyQuestReset', now.getTime().toString());
    }
  }, []);
  
  // Generate new quests for a category
  const generateNewQuests = (category) => {
    const categoryInfo = QUEST_CATEGORIES[category];
    const templates = Object.values(QUEST_TEMPLATES).filter(t => t.category === category);
    
    // Select random templates
    const selectedTemplates = templates
      .sort(() => Math.random() - 0.5)
      .slice(0, categoryInfo.maxQuests);
    
    const newQuests = selectedTemplates.map(template => generateQuest(template, category));
    
    // Update user stats
    // This would normally be handled by the context
    console.log(`Generated ${newQuests.length} new ${category} quests:`, newQuests);
  };
  
  // Get quests for active category
  const getQuestsForCategory = (category) => {
    let quests = [];
    switch (category) {
      case 'daily':
        quests = userStats.dailyQuests || [];
        break;
      case 'weekly':
        quests = userStats.weeklyQuests || [];
        break;
      case 'special':
        quests = userStats.specialQuests || [];
        break;
      default:
        quests = [];
    }

    // Filter out any invalid quest objects
    return quests.filter(quest =>
      quest &&
      typeof quest === 'object' &&
      typeof quest.name === 'string'
    );
  };
  
  const currentQuests = getQuestsForCategory(activeCategory);
  const completedQuests = currentQuests.filter(q => q.completed);
  const activeQuests = currentQuests.filter(q => !q.completed);
  
  const questsToShow = showCompleted ? completedQuests : activeQuests;
  
  // Calculate completion percentage
  const completionPercentage = currentQuests.length > 0 
    ? (completedQuests.length / currentQuests.length) * 100 
    : 0;
  
  // Calculate total XP available
  const totalXP = currentQuests.reduce((sum, quest) => sum + (quest.xp || 0), 0);
  const earnedXP = completedQuests.reduce((sum, quest) => sum + (quest.xp || 0), 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-500" />
          Quest Center
        </h1>
        <p className="text-gray-600">
          Complete challenges to earn XP and unlock achievements!
        </p>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-4 mb-6">
        {Object.entries(QUEST_CATEGORIES).map(([key, category]) => {
          const Icon = category.icon;
          const categoryQuests = getQuestsForCategory(key);
          const completed = categoryQuests.filter(q => q.completed).length;
          const total = categoryQuests.length;
          
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all ${
                activeCategory === key
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div>{category.name}</div>
                <div className="text-xs opacity-75">
                  {completed}/{total} completed
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Quest Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {QUEST_CATEGORIES[activeCategory].name} Overview
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompleted(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !showCompleted 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Active ({activeQuests.length})
            </button>
            <button
              onClick={() => setShowCompleted(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showCompleted 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Completed ({completedQuests.length})
            </button>
          </div>
        </div>
        
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{completionPercentage.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{earnedXP}</div>
            <div className="text-sm text-gray-600">XP Earned</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalXP - earnedXP}</div>
            <div className="text-sm text-gray-600">XP Available</div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <AnimatedProgressBar
          progress={completionPercentage}
          label={`Quest Progress (${completedQuests.length}/${currentQuests.length})`}
          color="purple"
        />
      </div>
      
      {/* Quest List */}
      <div className="space-y-6">
        {questsToShow.length > 0 ? (
          questsToShow.map((quest) => (
            <QuestProgressTracker
              key={quest.id}
              quest={quest}
              onComplete={(questId) => {
                // Handle quest completion
                setQuestCompletions(prev => [...prev, questId]);
              }}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {showCompleted ? (
                <CheckCircle className="w-16 h-16 mx-auto" />
              ) : (
                <Target className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {showCompleted ? 'No completed quests yet' : 'No active quests'}
            </h3>
            <p className="text-gray-500">
              {showCompleted 
                ? 'Complete some quests to see them here!' 
                : 'New quests will appear soon!'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Quest Completion Animations */}
      <AnimatePresence>
        {questCompletions.map((questId) => {
          const quest = currentQuests.find(q => q.id === questId);
          if (!quest) return null;
          
          return (
            <QuestComplete
              key={questId}
              quest={quest}
              onComplete={() => {
                setQuestCompletions(prev => prev.filter(id => id !== questId));
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default QuestSystem;
export { QUEST_TEMPLATES, generateQuest, QUEST_CATEGORIES };
