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
      className="relative bg-gradient-to-br from-gray-900 via-purple-950 to-black backdrop-blur-md rounded-3xl p-8 md:p-12 border border-purple-700/40 shadow-2xl mt-12 max-w-3xl mx-auto overflow-hidden"
    >
      {/* Background glowing effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
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
            whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(168, 85, 247, 0.8)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-purple-600/70 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Your 7-Day Free Trial
          </motion.button>
          <p className="text-purple-300/80 text-sm mt-4">
            Cancel anytime. No commitments.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumSubscription;

// Add these keyframes to your index.css or a global CSS file
/*
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
*/