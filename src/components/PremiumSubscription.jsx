import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Zap, TrendingUp, Award } from 'lucide-react';

const PremiumSubscription = () => {
  const benefits = [
    { icon: <CheckCircle className="w-6 h-6 text-emerald-400" />, text: "Unlock all Flashcards, Quick Quizzes, and Mock Exams" },
    { icon: <Zap className="w-6 h-6 text-purple-400" />, text: "Ad-free learning experience" },
    { icon: <TrendingUp className="w-6 h-6 text-blue-400" />, text: "Advanced progress tracking and insights" },
    { icon: <Award className="w-6 h-6 text-yellow-400" />, text: "Priority access to new features" },
  ];

  const fakeStats = [
    { value: "95%", description: "of premium users improve their grades" },
    { value: "2x", description: "faster learning with premium tools" },
    { value: "1000+", description: "exclusive practice questions" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-purple-700/40 shadow-2xl mt-12 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-center mb-8">
        <Crown className="w-12 h-12 text-yellow-400 mr-4" />
        <h2 className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Go Premium
        </h2>
      </div>

      <p className="text-purple-200 text-lg text-center mb-10 leading-relaxed">
        Unlock your full potential with Premium. Gain access to exclusive features designed to accelerate your learning and boost your grades.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="flex items-center bg-white/5 rounded-xl p-4 border border-purple-600/30"
          >
            {benefit.icon}
            <p className="text-white ml-4 text-lg">{benefit.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-around items-center bg-white/5 rounded-xl p-6 mb-10 border border-purple-600/30">
        {fakeStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.15 }}
            className="text-center"
          >
            <p className="text-4xl font-bold text-yellow-300 mb-1">{stat.value}</p>
            <p className="text-purple-200 text-sm">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-white text-5xl font-extrabold mb-4">
          £5<span className="text-purple-300 text-xl font-medium">/month</span>
        </p>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(168, 85, 247, 0.6)" }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
        >
          Start Your 7-Day Free Trial
        </motion.button>
        <p className="text-purple-300/80 text-sm mt-4">
          Cancel anytime. No commitments.
        </p>
      </div>
    </motion.div>
  );
};

export default PremiumSubscription;