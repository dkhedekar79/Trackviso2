import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Zap, ArrowRight, Lock } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const PremiumUpgradeCard = ({ onUpgradeClick }) => {
  const { getRemainingMockExams, getRemainingBlurtTests, getHoursUntilReset } = useSubscription();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/50 shadow-xl"
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Unlock Professor Plan</h3>
              <p className="text-white/70 text-sm">Get unlimited access to all features</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Current Usage */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <h4 className="text-white font-semibold mb-3 text-sm">Your Daily Usage</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs">Mock Exams</span>
                <span className="text-white font-bold text-sm">{getRemainingMockExams()} / 1</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 - getRemainingMockExams()) * 100}%` }}
                  className="bg-red-500 h-1.5 rounded-full"
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs">Blurt Tests</span>
                <span className="text-white font-bold text-sm">{getRemainingBlurtTests()} / 1</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 - getRemainingBlurtTests()) * 100}%` }}
                  className="bg-amber-500 h-1.5 rounded-full"
                />
              </div>
            </div>
          </div>
          <p className="text-white/50 text-xs mt-3 text-center">
            Resets in {getHoursUntilReset()} hour{getHoursUntilReset() !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm font-medium">Unlimited</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white text-sm font-medium">Premium</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm font-medium">£4.99/mo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumUpgradeCard;

