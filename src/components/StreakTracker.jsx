import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Shield, Clock, AlertTriangle, Star, Crown, 
  Calendar, TrendingUp, Zap, Heart, Timer, RotateCcw,
  ChevronDown, ChevronUp, Gift, Lock, CheckCircle
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { AnimatedProgressBar, StreakMilestone } from './RewardAnimations';

// Streak Status Types
const STREAK_STATUS = {
  ACTIVE: 'active',        // Current streak going strong
  WARNING: 'warning',      // About to expire (same day, no study yet)
  DANGER: 'danger',        // Past deadline, can use saver
  BROKEN: 'broken',        // Streak broken, needs restart
  PROTECTED: 'protected'   // Using streak saver protection
};

// Streak Tier Definitions
const STREAK_TIERS = {
  beginner: {
    name: 'Beginner',
    days: [1, 2],
    color: 'from-gray-400 to-gray-600',
    icon: '🌱',
    multiplier: 1.0,
    description: 'Just getting started!'
  },
  growing: {
    name: 'Growing',
    days: [3, 6],
    color: 'from-green-400 to-green-600',
    icon: '🌿',
    multiplier: 1.1,
    description: 'Building momentum!'
  },
  strong: {
    name: 'Strong',
    days: [7, 13],
    color: 'from-blue-400 to-blue-600',
    icon: '💪',
    multiplier: 1.2,
    description: 'Getting stronger!'
  },
  blazing: {
    name: 'Blazing',
    days: [14, 29],
    color: 'from-orange-400 to-red-500',
    icon: '🔥',
    multiplier: 1.3,
    description: 'On fire!'
  },
  legendary: {
    name: 'Legendary',
    days: [30, 99],
    color: 'from-purple-400 to-pink-500',
    icon: '⚡',
    multiplier: 1.5,
    description: 'Unstoppable force!'
  },
  godlike: {
    name: 'God-like',
    days: [100, Infinity],
    color: 'from-yellow-400 to-orange-500',
    icon: '👑',
    multiplier: 2.0,
    description: 'Transcended mortal limits!'
  }
};

// Get current streak tier
const getStreakTier = (streak) => {
  return Object.values(STREAK_TIERS).find(tier => 
    streak >= tier.days[0] && streak <= tier.days[1]
  ) || STREAK_TIERS.beginner;
};

// Calculate time until streak expires
const getTimeUntilExpiry = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeLeft = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, totalMinutes: Math.floor(timeLeft / (1000 * 60)) };
};

// Streak Status Calculator
const getStreakStatus = (userStats) => {
  const today = new Date().toDateString();
  const lastStudy = userStats.lastStudyDate ? new Date(userStats.lastStudyDate).toDateString() : null;
  
  // Check if studied today
  if (lastStudy === today) {
    return {
      status: STREAK_STATUS.ACTIVE,
      message: "Great job! You've studied today!",
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  }
  
  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastStudy === yesterdayStr) {
    const timeLeft = getTimeUntilExpiry();
    
    if (timeLeft.totalMinutes <= 60) { // Less than 1 hour
      return {
        status: STREAK_STATUS.DANGER,
        message: `Danger! Streak expires in ${timeLeft.minutes}m`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        timeLeft
      };
    } else if (timeLeft.totalMinutes <= 180) { // Less than 3 hours
      return {
        status: STREAK_STATUS.WARNING,
        message: `Warning! Streak expires in ${timeLeft.hours}h ${timeLeft.minutes}m`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        timeLeft
      };
    } else {
      return {
        status: STREAK_STATUS.WARNING,
        message: `Study today to maintain your streak!`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        timeLeft
      };
    }
  }
  
  // Streak is broken
  return {
    status: STREAK_STATUS.BROKEN,
    message: "Streak broken. Start a new one today!",
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  };
};

// Streak Protection Modal
const StreakProtectionModal = ({ isOpen, onClose, onUseSaver, saversLeft, streakDays }) => {
  if (!isOpen) return null;
  
  return (
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
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Shield className="w-20 h-20 mx-auto text-blue-500 mb-4" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Streak Protection!
          </h2>
          <p className="text-gray-600">
            Your {streakDays}-day streak is about to be lost!
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-gray-800">{streakDays}</span>
            <span className="text-lg font-medium text-gray-600">day streak</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Use a Streak Saver to protect your progress?
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-800">
              {saversLeft} Streak Savers remaining
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Let it break
          </button>
          
          <button
            onClick={onUseSaver}
            disabled={saversLeft <= 0}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              saversLeft > 0
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saversLeft > 0 ? 'Use Saver' : 'No Savers Left'}
          </button>
        </div>
        
        {saversLeft <= 0 && (
          <p className="text-sm text-gray-500 mt-3">
            Get more streak savers with premium!
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

// Streak History Calendar
const StreakCalendar = ({ sessionHistory, currentStreak }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get last 30 days
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toDateString();
      const hasSession = sessionHistory.some(session => 
        new Date(session.timestamp).toDateString() === dateStr
      );
      
      const dayData = sessionHistory.filter(session => 
        new Date(session.timestamp).toDateString() === dateStr
      );
      
      const totalMinutes = dayData.reduce((sum, session) => sum + session.durationMinutes, 0);
      
      days.push({
        date,
        dateStr,
        hasSession,
        totalMinutes,
        intensity: totalMinutes > 120 ? 'high' : totalMinutes > 60 ? 'medium' : totalMinutes > 0 ? 'low' : 'none'
      });
    }
    
    return days;
  };
  
  const days = getLast30Days();
  
  const intensityColors = {
    none: 'bg-white/5',
    low: 'bg-green-500/30',
    medium: 'bg-green-500/50',
    high: 'bg-green-500/70'
  };
  
  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          Study Calendar
        </h3>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-300 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-300 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <motion.div
                  key={day.dateStr}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`aspect-square rounded-lg ${intensityColors[day.intensity]} border-2 ${
                    day.hasSession ? 'border-green-400/50' : 'border-transparent'
                  } flex items-center justify-center text-xs font-medium ${
                    day.intensity === 'none' ? 'text-gray-400' : 'text-white'
                  } relative group cursor-pointer`}
                  title={`${day.date.toLocaleDateString()}: ${day.totalMinutes}min`}
                >
                  {day.date.getDate()}
                  
                  {/* Today indicator */}
                  {day.dateStr === new Date().toDateString() && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                  {Object.entries(intensityColors).map(([key, color]) => (
                    <div key={key} className={`w-3 h-3 rounded ${color}`} />
                  ))}
                </div>
                <span>More</span>
              </div>
              
              <span className="font-medium">
                {days.filter(d => d.hasSession).length} active days
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Streak Tracker Component
const StreakTracker = () => {
  const { 
    userStats, 
    updateStreak, 
    useStreakSaver,
    addReward 
  } = useGamification();
  
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilExpiry());
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  
  const streakStatus = getStreakStatus(userStats);
  const currentTier = getStreakTier(userStats.currentStreak);
  const nextTier = Object.values(STREAK_TIERS).find(tier => 
    tier.days[0] > userStats.currentStreak
  );
  
  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilExpiry());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Check for streak milestones
  useEffect(() => {
    const milestones = [7, 14, 30, 50, 100, 365];
    if (milestones.includes(userStats.currentStreak) && userStats.currentStreak > 0) {
      setMilestoneStreak(userStats.currentStreak);
      setShowMilestone(true);
    }
  }, [userStats.currentStreak]);
  
  // Handle streak protection
  const handleStreakProtection = () => {
    if (streakStatus.status === STREAK_STATUS.DANGER && userStats.streakSavers > 0) {
      setShowProtectionModal(true);
    }
  };
  
  const handleUseSaver = () => {
    const success = useStreakSaver();
    if (success) {
      setShowProtectionModal(false);
      addReward({
        type: 'STREAK_SAVED',
        title: '🛡️ Streak Protected!',
        description: `Your ${userStats.currentStreak}-day streak is safe!`,
        tier: 'premium'
      });
    }
  };
  
  // Calculate progress to next tier
  const getNextTierProgress = () => {
    if (!nextTier) return 100;
    
    const currentTierStart = currentTier.days[0];
    const nextTierStart = nextTier.days[0];
    const progress = ((userStats.currentStreak - currentTierStart) / (nextTierStart - currentTierStart)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  };
  
  return (
    <div className="space-y-6">
      {/* Main Streak Display */}
      <div className={`rounded-3xl shadow-xl p-8 border-2 backdrop-blur bg-white/10 border-orange-700/30 transition-all`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: streakStatus.status === STREAK_STATUS.DANGER ? [1, 1.1, 1] : 1,
                rotate: userStats.currentStreak > 0 ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: streakStatus.status === STREAK_STATUS.DANGER ? 0.5 : 2,
                repeat: streakStatus.status === STREAK_STATUS.DANGER ? Infinity : 0
              }}
              className={`w-20 h-20 rounded-full bg-gradient-to-r ${currentTier.color} flex items-center justify-center text-4xl shadow-lg`}
            >
              {currentTier.icon}
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                {userStats.currentStreak}
                <span className="text-lg font-normal text-gray-300">day streak</span>
              </h2>
              <p className="text-lg font-medium text-orange-300">
                {currentTier.name} • {currentTier.description}
              </p>
              <p className="text-sm text-orange-200">
                {streakStatus.message}
              </p>
            </div>
          </div>
          
          {/* Streak Actions */}
          <div className="flex flex-col items-end gap-2">
            {streakStatus.status === STREAK_STATUS.DANGER && userStats.streakSavers > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStreakProtection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-all"
              >
                <Shield className="w-4 h-4" />
                Protect Streak
              </motion.button>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Shield className="w-4 h-4" />
              <span>{userStats.streakSavers} streak savers</span>
            </div>
          </div>
        </div>
        
        {/* Tier Progress */}
        {nextTier && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">
                Progress to {nextTier.name}
              </span>
              <span className="text-sm font-bold text-white">
                {userStats.currentStreak} / {nextTier.days[0]}
              </span>
            </div>
            
            <AnimatedProgressBar
              progress={getNextTierProgress()}
              color="orange"
              height="h-4"
            />
          </div>
        )}
        
        {/* Countdown Timer */}
        {(streakStatus.status === STREAK_STATUS.WARNING || streakStatus.status === STREAK_STATUS.DANGER) && timeLeft && (
          <motion.div
            animate={{ 
              scale: streakStatus.status === STREAK_STATUS.DANGER ? [1, 1.02, 1] : 1
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`p-4 rounded-2xl backdrop-blur ${
              streakStatus.status === STREAK_STATUS.DANGER ? 'bg-red-500/20 border-red-400/50' : 'bg-orange-500/20 border-orange-400/50'
            } border-2`}
          >
            <div className="flex items-center gap-3">
              <Timer className={`w-6 h-6 ${
                streakStatus.status === STREAK_STATUS.DANGER ? 'text-red-300' : 'text-orange-300'
              }`} />
              
              <div>
                <p className={`font-semibold ${
                  streakStatus.status === STREAK_STATUS.DANGER ? 'text-red-300' : 'text-orange-300'
                }`}>
                  Time Remaining: {timeLeft.hours}h {timeLeft.minutes}m
                </p>
                <p className={`text-sm ${
                  streakStatus.status === STREAK_STATUS.DANGER ? 'text-red-200' : 'text-orange-200'
                }`}>
                  Study now to maintain your streak!
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Streak Benefits */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">XP Multiplier</p>
            <p className="text-2xl font-bold text-white">{currentTier.multiplier}x</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur">
            <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Longest Streak</p>
            <p className="text-2xl font-bold text-white">{userStats.longestStreak}</p>
          </div>
        </div>
      </div>
      
      {/* Streak Calendar */}
      <StreakCalendar 
        sessionHistory={userStats.sessionHistory} 
        currentStreak={userStats.currentStreak}
      />
      
      {/* Streak Protection Modal */}
      <StreakProtectionModal
        isOpen={showProtectionModal}
        onClose={() => setShowProtectionModal(false)}
        onUseSaver={handleUseSaver}
        saversLeft={userStats.streakSavers}
        streakDays={userStats.currentStreak}
      />
      
      {/* Milestone Animation */}
      <AnimatePresence>
        {showMilestone && (
          <StreakMilestone
            streak={milestoneStreak}
            onComplete={() => setShowMilestone(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakTracker;
export { getStreakStatus, getStreakTier, STREAK_TIERS };
