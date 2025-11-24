import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Star, Trophy, Crown, Sparkles, Zap, Target, 
  Clock, BookOpen, Flame, X, Volume2, VolumeX 
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

// Mystery Box Reward Tiers and Probabilities
const MYSTERY_BOX_REWARDS = {
  xp_small: {
    id: 'xp_small',
    name: 'XP Boost',
    description: 'Bonus experience points!',
    icon: '⭐',
    type: 'xp',
    value: { min: 50, max: 150 },
    probability: 40,
    tier: 'common',
    color: 'from-blue-400 to-blue-600'
  },
  xp_medium: {
    id: 'xp_medium',
    name: 'XP Surge',
    description: 'Major experience boost!',
    icon: '💫',
    type: 'xp',
    value: { min: 200, max: 400 },
    probability: 25,
    tier: 'uncommon',
    color: 'from-green-400 to-green-600'
  },
  xp_large: {
    id: 'xp_large',
    name: 'XP Explosion',
    description: 'Massive experience reward!',
    icon: '✨',
    type: 'xp',
    value: { min: 500, max: 1000 },
    probability: 15,
    tier: 'rare',
    color: 'from-purple-400 to-purple-600'
  },
  streak_saver: {
    id: 'streak_saver',
    name: 'Streak Saver',
    description: 'Protect your study streak!',
    icon: '🛡️',
    type: 'streak_saver',
    value: 1,
    probability: 10,
    tier: 'rare',
    color: 'from-orange-400 to-orange-600'
  },
  title_unlock: {
    id: 'title_unlock',
    name: 'Special Title',
    description: 'Unlock a unique title!',
    icon: '👑',
    type: 'title',
    value: ['Mystery Master', 'Lucky Scholar', 'Box Opener', 'Surprise Seeker'],
    probability: 5,
    tier: 'epic',
    color: 'from-yellow-400 to-orange-500'
  },
  multiplier_boost: {
    id: 'multiplier_boost',
    name: 'XP Multiplier',
    description: '2x XP for 1 hour!',
    icon: '⚡',
    type: 'multiplier',
    value: { multiplier: 2, duration: 3600000 }, // 1 hour in ms
    probability: 3,
    tier: 'epic',
    color: 'from-purple-500 to-pink-500'
  },
  jackpot: {
    id: 'jackpot',
    name: 'JACKPOT!',
    description: 'Ultimate mystery reward!',
    icon: '💎',
    type: 'jackpot',
    value: { xp: 2000, title: 'Jackpot Winner', streakSavers: 3 },
    probability: 2,
    tier: 'legendary',
    color: 'from-yellow-400 via-orange-500 to-red-500'
  }
};

// Confetti Component
const Confetti = ({ intensity = 50 }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: intensity }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 2 + 1
    }));
    
    setParticles(newParticles);
    
    const cleanup = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(cleanup);
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x + '%', 
            y: particle.y + '%',
            opacity: 1,
            scale: 1
          }}
          animate={{ 
            x: (particle.x + particle.speedX * 10) + '%',
            y: (particle.y + particle.speedY * 20) + '%',
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: particle.color, width: particle.size, height: particle.size }}
        />
      ))}
    </div>
  );
};

// Mystery Box Opening Animation
const MysteryBoxOpening = ({ onRewardGenerated, onClose }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const [showReward, setShowReward] = useState(false);
  
  // Generate random reward based on probabilities
  const generateReward = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const rewardData of Object.values(MYSTERY_BOX_REWARDS)) {
      cumulative += rewardData.probability;
      if (random <= cumulative) {
        // Calculate actual reward value
        let actualValue = rewardData.value;
        if (rewardData.type === 'xp' && typeof rewardData.value === 'object') {
          actualValue = Math.floor(Math.random() * (rewardData.value.max - rewardData.value.min + 1)) + rewardData.value.min;
        } else if (rewardData.type === 'title' && Array.isArray(rewardData.value)) {
          actualValue = rewardData.value[Math.floor(Math.random() * rewardData.value.length)];
        }
        
        return {
          ...rewardData,
          actualValue
        };
      }
    }
    
    // Fallback to common reward
    return {
      ...MYSTERY_BOX_REWARDS.xp_small,
      actualValue: 75
    };
  };

  const handleOpen = () => {
    setIsOpening(true);
    
    // Simulate opening animation delay
    setTimeout(() => {
      const generatedReward = generateReward();
      setReward(generatedReward);
      setShowReward(true);
      onRewardGenerated(generatedReward);
    }, 2000);
  };

  const handleClose = () => {
    setShowReward(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-3xl shadow-2xl text-white text-center max-w-md mx-4"
      >
        {!showReward ? (
          <>
            {/* Mystery Box */}
            <motion.div
              animate={isOpening ? {
                rotateY: [0, 180, 360],
                scale: [1, 1.2, 1],
                rotateX: [0, 15, -15, 0]
              } : {
                y: [0, -10, 0],
                rotateZ: [0, 5, -5, 0]
              }}
              transition={{
                duration: isOpening ? 2 : 1.5,
                repeat: isOpening ? 0 : Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-6"
            >
              🎁
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-4">
              {isOpening ? 'Opening...' : 'Mystery Box'}
            </h2>
            
            <p className="text-lg opacity-90 mb-6">
              {isOpening ? 'Something amazing is coming!' : 'Click to reveal your surprise reward!'}
            </p>
            
            {!isOpening && (
              <div className="flex gap-4">
                <button
                  onClick={handleOpen}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  Open Box!
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            
            {isOpening && (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Opening mystery box...</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Reward Display */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${reward.color} flex items-center justify-center text-4xl shadow-lg`}
            >
              {reward.icon}
            </motion.div>
            
            <div className={`inline-block px-4 py-2 rounded-full bg-white/20 text-sm font-bold mb-4 ${
              reward.tier === 'legendary' ? 'animate-pulse' : ''
            }`}>
              {reward.tier.toUpperCase()} REWARD!
            </div>
            
            <h2 className="text-3xl font-bold mb-2">{reward.name}</h2>
            <p className="text-lg opacity-90 mb-4">{reward.description}</p>
            
            {/* Reward Details */}
            <div className="bg-black/20 rounded-lg p-4 mb-6">
              {reward.type === 'xp' && (
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-yellow-300" />
                  <span className="text-2xl font-bold">+{reward.actualValue} XP</span>
                </div>
              )}
              
              {reward.type === 'streak_saver' && (
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-6 h-6 text-orange-300" />
                  <span className="text-xl font-bold">+1 Streak Saver</span>
                </div>
              )}
              
              {reward.type === 'title' && (
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-300" />
                  <span className="text-xl font-bold">"{reward.actualValue}"</span>
                </div>
              )}
              
              {reward.type === 'multiplier' && (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-purple-300" />
                  <span className="text-xl font-bold">2x XP for 1 hour!</span>
                </div>
              )}
              
              {reward.type === 'jackpot' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-yellow-300" />
                    <span className="text-xl font-bold">+{reward.value.xp} XP</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold">"{reward.value.title}"</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-300" />
                    <span className="font-bold">+{reward.value.streakSavers} Streak Savers</span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition-all"
            >
              Awesome!
            </button>
          </>
        )}
      </motion.div>
      
      {/* Confetti Effect */}
      {showReward && <Confetti intensity={reward.tier === 'legendary' ? 100 : 50} />}
    </motion.div>
  );
};

// Main Mystery Box Component
const MysteryBox = ({ available = true, onOpen, className = "" }) => {
  const [showOpening, setShowOpening] = useState(false);
  const { addReward, userStats, applyReward } = useGamification();

  const handleClick = () => {
    if (!available) return;
    setShowOpening(true);
    onOpen?.();
  };

  const handleRewardGenerated = (reward) => {
    // Apply reward to user stats centrally
    applyReward(reward);

    // Show reward notification
    addReward({
      type: 'MYSTERY_BOX',
      title: `🎁 ${reward.name}`,
      description: reward.description,
      tier: reward.tier,
      xp: reward.type === 'xp' ? reward.actualValue : reward.type === 'jackpot' ? reward.value.xp : 0
    });
  };

  return (
    <>
      <motion.div
        whileHover={available ? { scale: 1.05, y: -5 } : {}}
        whileTap={available ? { scale: 0.95 } : {}}
        onClick={handleClick}
        className={`relative ${className} ${
          available 
            ? 'cursor-pointer' 
            : 'cursor-not-allowed opacity-50'
        }`}
      >
        <div className={`p-6 rounded-2xl border-2 transition-all ${
          available 
            ? 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 shadow-lg hover:shadow-purple-500/30' 
            : 'bg-gray-400 border-gray-300'
        }`}>
          <motion.div
            animate={available ? {
              rotateY: [0, 10, -10, 0],
              y: [0, -5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: available ? Infinity : 0, 
              repeatDelay: 3 
            }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-white mb-2">Mystery Box</h3>
            <p className="text-purple-100 text-sm mb-4">
              {available ? 'Click to open and get a surprise reward!' : 'Complete more sessions to unlock'}
            </p>
            
            {available && (
              <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                Open Now!
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Sparkle effects for available boxes */}
        {available && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Opening Animation */}
      <AnimatePresence>
        {showOpening && (
          <MysteryBoxOpening
            onRewardGenerated={handleRewardGenerated}
            onClose={() => setShowOpening(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MysteryBox;
export { MYSTERY_BOX_REWARDS };
