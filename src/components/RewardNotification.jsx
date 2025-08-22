import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Award, Zap, Flame } from 'lucide-react';

const RewardNotification = ({ rewards, showRewards, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'gold':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'purple':
        return <Award className="w-6 h-6 text-purple-500" />;
      case 'blue':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'diamond':
        return <Flame className="w-6 h-6 text-red-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-purple-700';
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 to-blue-700';
      case 'diamond':
        return 'bg-gradient-to-r from-red-500 to-red-700';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  return (
    <AnimatePresence>
      {showRewards && rewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 space-y-2"
        >
          {rewards.slice(0, 3).map((reward) => (
            <motion.div
              key={reward.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={`${getBgColor(reward.type)} text-white rounded-lg shadow-lg p-4 min-w-[300px] backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIcon(reward.type)}
                  <div>
                    <h3 className="font-bold text-lg">{reward.title}</h3>
                    <p className="text-sm opacity-90">{reward.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Confetti effect for achievements */}
              {reward.type === 'achievement' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: 150, 
                        y: 75, 
                        rotate: 0, 
                        scale: 0,
                        opacity: 1 
                      }}
                      animate={{ 
                        x: 150 + (Math.random() - 0.5) * 200,
                        y: 75 + (Math.random() - 0.5) * 200,
                        rotate: 360,
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardNotification;
