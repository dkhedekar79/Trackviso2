import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Laptop, Sparkles, ArrowRight, Heart } from 'lucide-react';
import MagneticParticles from '../components/MagneticParticles';

const Unsupported = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Particle Effect Background */}
      <div className="absolute inset-0 z-0">
        <MagneticParticles />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl w-full text-center"
        >
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 flex justify-center items-center gap-4"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Smartphone className="w-20 h-20 text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-12 h-12 text-pink-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Laptop className="w-20 h-20 text-purple-500" />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              Mobile Not Supported
            </span>
          </motion.h1>

          {/* Apology Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-xl md:text-2xl text-purple-200 mb-2">
              We're sorry! 😔
            </p>
            <p className="text-lg text-purple-300/80">
              Trackviso is currently optimized for desktop and tablet devices.
            </p>
          </motion.div>

          {/* Feature Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-purple-700/30 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">
                Why Desktop?
              </h2>
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-purple-800/20 rounded-xl p-4 border border-purple-700/20"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Better Experience
                </h3>
                <p className="text-purple-200/80 text-sm">
                  Full-screen ambient mode, detailed analytics, and immersive study sessions work best on larger screens.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-purple-800/20 rounded-xl p-4 border border-purple-700/20"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  More Features
                </h3>
                <p className="text-purple-200/80 text-sm">
                  Access all gamification features, advanced insights, and study modes designed for desktop productivity.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xl text-white font-semibold mb-2">
              Switch to your laptop or desktop for the full Trackviso experience! 💻
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a
                href="https://trackviso-beta.vercel.app"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <Laptop className="w-6 h-6" />
                Open on Desktop
                <ArrowRight className="w-6 h-6" />
              </a>
            </motion.div>
          </motion.div>

          {/* Coming Soon Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-purple-400 text-sm mt-8 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Mobile support coming soon! Stay tuned for updates.
            <Sparkles className="w-4 h-4" />
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Unsupported;

