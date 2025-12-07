import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Zap, CheckCircle, Lock, ArrowRight, Star } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const PremiumUpgradeModal = ({ isOpen, onClose, feature = null }) => {
  const { subscriptionPlan, getRemainingMockExams, getRemainingBlurtTests, getHoursUntilReset } = useSubscription();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  if (!isOpen) return null;

  const features = [
    { icon: Zap, text: 'Unlimited Mock Exams', color: 'text-red-400' },
    { icon: Sparkles, text: 'Unlimited Blurt Tests', color: 'text-amber-400' },
    { icon: Star, text: 'Priority AI Support', color: 'text-blue-400' },
    { icon: Crown, text: 'Exclusive Features', color: 'text-purple-400' },
  ];

  const handleUpgrade = () => {
    onClose();
    navigate('/payment');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border-2 border-purple-500/50 shadow-2xl overflow-hidden"
        >
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
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
                opacity: [0.3, 0.5, 0.3],
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

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative z-10 p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-4"
              >
                <Crown className="w-16 h-16 text-yellow-400 mx-auto" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Unlock Professor Plan
              </h2>
              <p className="text-white/70 text-lg">
                {feature === 'mock_exam' && 'You\'ve used your free Mock Exam today'}
                {feature === 'blurt_test' && 'You\'ve used your free Blurt Test today'}
                {!feature && 'Upgrade to unlock unlimited features'}
              </p>
            </div>

            {/* Current usage */}
            {subscriptionPlan === 'scholar' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10"
              >
                <h3 className="text-white font-semibold mb-4">Your Daily Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Mock Exams</span>
                      <span className="text-white font-bold">{getRemainingMockExams()} / 1</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(1 - getRemainingMockExams()) * 100}%` }}
                        className="bg-red-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Blurt Tests</span>
                      <span className="text-white font-bold">{getRemainingBlurtTests()} / 1</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(1 - getRemainingBlurtTests()) * 100}%` }}
                        className="bg-amber-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-4 text-center">
                  Resets in {getHoursUntilReset()} hour{getHoursUntilReset() !== 1 ? 's' : ''}
                </p>
              </motion.div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                    <span className="text-white font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-6">
                <p className="text-white/80 text-sm mb-2">Only</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-white">£4.99</span>
                  <span className="text-white/70 text-xl">/month</span>
                </div>
                <p className="text-white/60 text-sm mt-2">Cancel anytime</p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              onClick={handleUpgrade}
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg"
            >
              <motion.div
                animate={{
                  backgroundPosition: isHovering ? '100%' : '0%',
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%]"
              />
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                Upgrade to Professor Plan
                <ArrowRight className="w-5 h-5" />
              </span>
            </motion.button>

            <p className="text-center text-white/50 text-sm mt-4">
              🔒 Secure payment via Stripe
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumUpgradeModal;

