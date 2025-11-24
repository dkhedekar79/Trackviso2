import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Trophy, Zap, Flame, Crown, Target, CheckCircle, 
  Sparkles, Gift, Award, TrendingUp, Plus, X, Volume2, VolumeX
} from 'lucide-react';

// Sound Hook (placeholder for future sound integration)
const useSound = (soundName) => {
  const playSound = () => {
    // Placeholder for sound implementation
    // Could integrate with Howler.js or Web Audio API
    console.log(`Playing sound: ${soundName}`);
  };
  
  return playSound;
};

// Confetti Particle Component
const ConfettiParticle = ({ x, y, color, shape, delay = 0 }) => {
  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-sm',
    star: 'clip-star'
  };

  return (
    <motion.div
      initial={{ 
        x: x + '%', 
        y: y + '%', 
        opacity: 1,
        scale: 1,
        rotate: 0
      }}
      animate={{ 
        x: (x + (Math.random() - 0.5) * 100) + '%',
        y: (y + 150 + Math.random() * 50) + '%',
        opacity: 0,
        scale: [1, 1.2, 0.8, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 3 + Math.random() * 2, 
        ease: "easeOut",
        delay: delay
      }}
      className={`absolute w-3 h-3 ${shapes[shape]} pointer-events-none`}
      style={{ backgroundColor: color }}
    />
  );
};

// Enhanced Confetti Effect
const EnhancedConfetti = ({ intensity = 'medium', colors = null, duration = 3000 }) => {
  const [particles, setParticles] = useState([]);
  
  const intensitySettings = {
    low: { count: 30, spread: 60 },
    medium: { count: 60, spread: 80 },
    high: { count: 100, spread: 100 },
    extreme: { count: 200, spread: 120 }
  };
  
  const defaultColors = [
    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
  ];
  
  const particleColors = colors || defaultColors;
  const { count, spread } = intensitySettings[intensity];
  
  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * spread,
      y: 45 + Math.random() * 20,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)],
      delay: Math.random() * 0.5
    }));
    
    setParticles(newParticles);
    
    const cleanup = setTimeout(() => {
      setParticles([]);
    }, duration);
    
    return () => clearTimeout(cleanup);
  }, [intensity, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          shape={particle.shape}
          delay={particle.delay}
        />
      ))}
    </div>
  );
};

// XP Gain Animation with Number Counter
export const XPGainAnimation = ({ amount, bonuses = {}, onComplete }) => {
  const [counter, setCounter] = useState(0);
  const playSound = useSound('xp_gain');
  
  useEffect(() => {
    playSound();
    
    // Animate counter
    const duration = 1000;
    const steps = 30;
    const increment = amount / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounter(Math.floor(increment * currentStep));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCounter(amount);
        
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [amount, onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: -50 }}
      className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 0.6, 
          repeat: 2,
          ease: "easeInOut"
        }}
        className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-6 rounded-3xl shadow-2xl border-4 border-yellow-300"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-3"
          >
            <Star className="w-12 h-12 text-yellow-200" />
          </motion.div>
          
          <div className="text-5xl font-bold mb-2">
            +{counter.toLocaleString()}
          </div>
          <div className="text-xl font-semibold">XP GAINED!</div>
          
          {/* Bonus breakdown */}
          {Object.keys(bonuses).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-sm bg-black/20 rounded-lg p-2"
            >
              {Object.entries(bonuses).map(([type, value]) => (
                value > 0 && (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type} Bonus:</span>
                    <span>+{value}</span>
                  </div>
                )
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <EnhancedConfetti intensity="medium" />
    </motion.div>
  );
};

// Level Up Celebration with Prestige Support
export const LevelUpCelebration = ({ newLevel, isPrestige = false, onComplete }) => {
  const playSound = useSound(isPrestige ? 'prestige' : 'level_up');
  
  useEffect(() => {
    playSound();
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 1
        }}
        className={`${
          isPrestige 
            ? 'bg-gradient-to-br from-purple-800 via-pink-600 to-yellow-500' 
            : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
        } text-white p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4 border-4 border-yellow-400`}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
        >
          {isPrestige ? (
            <Sparkles className="w-24 h-24 mx-auto mb-4 text-yellow-300" />
          ) : (
            <Crown className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
          )}
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold mb-2"
        >
          {isPrestige ? 'PRESTIGE UP!' : 'LEVEL UP!'}
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl mb-4"
        >
          {isPrestige ? 'Welcome to the Elite!' : 'Congratulations!'}
        </motion.p>
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
          className="text-8xl font-bold text-yellow-300 mb-4"
        >
          {isPrestige ? `P${newLevel}` : newLevel}
        </motion.div>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-lg opacity-90"
        >
          {isPrestige ? 'You\'ve transcended!' : 'Keep pushing your limits!'}
        </motion.p>
      </motion.div>
      
      <EnhancedConfetti 
        intensity={isPrestige ? "extreme" : "high"} 
        colors={isPrestige ? ['#FFD700', '#FF1493', '#9370DB', '#FF6347'] : null}
      />
    </motion.div>
  );
};

// Variable Reward Popup with Tier-based Effects
export const VariableRewardPopup = ({ reward, onComplete }) => {
  const playSound = useSound(`reward_${reward.tier}`);
  
  const tierEffects = {
    legendary: {
      bg: 'from-yellow-400 via-orange-500 to-red-600',
      border: 'border-yellow-300',
      glow: 'shadow-yellow-500/50',
      confetti: 'extreme',
      duration: 4000
    },
    epic: {
      bg: 'from-purple-500 via-pink-500 to-red-500',
      border: 'border-purple-300',
      glow: 'shadow-purple-500/40',
      confetti: 'high',
      duration: 3500
    },
    rare: {
      bg: 'from-blue-500 via-cyan-500 to-teal-500',
      border: 'border-blue-300',
      glow: 'shadow-blue-500/40',
      confetti: 'medium',
      duration: 3000
    },
    uncommon: {
      bg: 'from-green-500 via-emerald-500 to-teal-500',
      border: 'border-green-300',
      glow: 'shadow-green-500/30',
      confetti: 'medium',
      duration: 2500
    },
    common: {
      bg: 'from-gray-500 via-slate-500 to-gray-600',
      border: 'border-gray-300',
      glow: 'shadow-gray-500/20',
      confetti: 'low',
      duration: 2000
    }
  };
  
  const effect = tierEffects[reward.tier] || tierEffects.common;
  
  useEffect(() => {
    playSound();
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, effect.duration);
    
    return () => clearTimeout(timer);
  }, [onComplete, effect.duration]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -90 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 90 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 20px rgba(255,255,255,0.3)`,
            `0 0 40px rgba(255,255,255,0.6)`,
            `0 0 20px rgba(255,255,255,0.3)`
          ]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`bg-gradient-to-br ${effect.bg} text-white px-8 py-6 rounded-3xl shadow-2xl border-4 ${effect.border} ${effect.glow} max-w-sm`}
      >
        <div className="text-center">
          {/* Tier badge */}
          <div className={`inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-bold mb-3 ${
            reward.tier === 'legendary' ? 'animate-pulse' : ''
          }`}>
            {reward.tier.toUpperCase()} REWARD!
          </div>
          
          {/* Icon */}
          <motion.div
            animate={{ 
              rotate: reward.tier === 'legendary' ? [0, 360] : [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: reward.tier === 'legendary' ? 2 : 0.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl mb-4"
          >
            {reward.tier === 'legendary' ? '💎' : 
             reward.tier === 'epic' ? '⚡' :
             reward.tier === 'rare' ? '⭐' :
             reward.tier === 'uncommon' ? '✨' : '🎁'}
          </motion.div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2">{reward.title}</h2>
          <p className="text-lg opacity-90 mb-4">{reward.description}</p>
          
          {/* XP amount */}
          {reward.bonusXP > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-2xl font-bold">+{reward.bonusXP} XP</span>
            </div>
          )}
          
          {/* Extra rewards */}
          {reward.extras && (
            <div className="text-sm bg-black/20 rounded-lg p-3">
              {reward.extras.title && (
                <div className="mb-1">🏆 Title: {reward.extras.title}</div>
              )}
              {reward.extras.badge && (
                <div>🎖️ Badge: {reward.extras.badge}</div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      
      <EnhancedConfetti intensity={effect.confetti} />
    </motion.div>
  );
};

// Achievement Unlock with Enhanced Effects
export const AchievementUnlock = ({ achievement, onComplete }) => {
  const playSound = useSound('achievement');
  
  useEffect(() => {
    playSound();
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-3xl shadow-2xl z-50 max-w-sm border-4 border-yellow-400"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl"
        >
          {achievement.icon}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-lg">Achievement Unlocked!</span>
          </div>
          
          <h3 className="font-bold text-xl mb-1">{achievement.name}</h3>
          <p className="text-sm opacity-90 mb-2">{achievement.description}</p>
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold">+{achievement.xp} XP</span>
            <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold ml-auto">
              {achievement.tier?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 3.5, ease: "linear" }}
        className="h-1 bg-yellow-400 rounded-full mt-4"
      />
    </motion.div>
  );
};

// Streak Milestone with Fire Effects
export const StreakMilestone = ({ streak, onComplete }) => {
  const playSound = useSound('streak_milestone');
  
  useEffect(() => {
    playSound();
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-10 py-8 rounded-3xl shadow-2xl text-center border-4 border-yellow-400"
      >
        <motion.div
          animate={{ 
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.6, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
        >
          <Flame className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-2">🔥 STREAK MILESTONE! 🔥</h2>
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="text-7xl font-bold text-yellow-300 mb-3"
        >
          {streak}
        </motion.div>
        
        <p className="text-xl mb-2">Days of consistent studying!</p>
        <p className="text-lg opacity-80">Keep the fire burning! 🚀</p>
      </motion.div>
      
      <EnhancedConfetti 
        intensity="high" 
        colors={['#FF4500', '#FF6347', '#FFD700', '#FFA500']}
      />
    </motion.div>
  );
};

// Quest Complete Notification
export const QuestComplete = ({ quest, onComplete }) => {
  const playSound = useSound('quest_complete');
  
  useEffect(() => {
    playSound();
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-3xl shadow-2xl z-50 max-w-sm text-center border-4 border-cyan-300"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          <CheckCircle className="w-8 h-8 text-green-300" />
        </motion.div>
        <span className="font-bold text-xl">Quest Complete!</span>
      </div>
      
      <p className="text-lg mb-3">{quest.name}</p>
      
      <div className="flex items-center justify-center gap-2">
        <Star className="w-5 h-5 text-yellow-300" />
        <span className="text-lg font-semibold">+{quest.xp} XP</span>
      </div>
    </motion.div>
  );
};

// Floating Notifications Container
export const FloatingNotifications = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-40 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              
              <button
                onClick={() => onRemove(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Progress Bar with Enhanced Animation
export const AnimatedProgressBar = ({ 
  progress, 
  label, 
  color = "blue", 
  showPercentage = true,
  height = "h-3",
  animated = true 
}) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ 
            duration: animated ? 1 : 0, 
            ease: "easeOut" 
          }}
          className={`${height} bg-gradient-to-r ${colors[color]} rounded-full shadow-sm relative overflow-hidden`}
        >
          {/* Shimmer effect */}
          {animated && progress > 0 && (
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Sound Toggle Button (for future sound integration)
export const SoundToggle = ({ soundEnabled, onToggle }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`p-2 rounded-lg transition-all ${
        soundEnabled 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export {
  EnhancedConfetti,
  useSound
};
