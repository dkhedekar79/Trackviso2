import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2, Zap, Sparkles, Star, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';

const LoadingScreen = () => {
  const { debugInfo } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [dots, setDots] = useState('');

  // Track mouse for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (debugInfo.step.includes('error') || debugInfo.step.includes('Error')) {
      return <AlertCircle className="w-8 h-8 text-red-400" />;
    }
    if (debugInfo.step === 'Complete') {
      return <CheckCircle2 className="w-8 h-8 text-green-400" />;
    }
    return <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />;
  };

  const getStatusColor = () => {
    if (debugInfo.step.includes('error') || debugInfo.step.includes('Error')) {
      return 'from-red-500 to-orange-500';
    }
    if (debugInfo.step === 'Complete') {
      return 'from-green-400 to-emerald-500';
    }
    return 'from-purple-500 via-pink-500 to-indigo-500';
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated background gradient that follows mouse */}
      <div 
        className="absolute inset-0 opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2) 40%, transparent 70%)`
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-purple-400/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-2xl w-full">
          {/* Logo/Icon section */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              {/* Rotating outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent"
                style={{
                  borderImage: 'linear-gradient(45deg, #a855f7, #ec4899, #6366f1, #a855f7) 1',
                  borderImageSlice: 1,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Pulsing center */}
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-purple-500/50"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                    '0 0 40px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="w-12 h-12 text-white" />
              </motion.div>

              {/* Orbiting stars */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transformOrigin: '0 0',
                    transform: `rotate(${i * 120}deg) translateY(-60px)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
          >
            Trackviso
          </motion.h1>

          {/* Status section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              {getStatusIcon()}
              <h2 className="text-2xl font-bold text-white">
                {debugInfo.step || 'Loading'}
                {dots}
              </h2>
            </div>
            
            <p className="text-purple-300/80 text-sm mb-2">
              {debugInfo.details || 'Preparing your experience...'}
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto h-2 bg-purple-900/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={`h-full bg-gradient-to-r ${getStatusColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${debugInfo.progress || 0}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="h-full w-1/3 bg-white/30"
                  animate={{ x: ['-100%', '400%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            
            <div className="mt-2 text-xs text-purple-400/60">
              {debugInfo.progress || 0}%
            </div>
          </motion.div>

          {/* Debug info panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-700/30 text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-purple-300">Debug Information</h3>
            </div>
            <div className="space-y-2 text-xs font-mono text-purple-200/70">
              <div className="flex justify-between">
                <span className="text-purple-400/60">Step:</span>
                <span className="text-white">{debugInfo.step || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400/60">Details:</span>
                <span className="text-white/90">{debugInfo.details || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400/60">Progress:</span>
                <span className="text-white">{debugInfo.progress || 0}%</span>
              </div>
            </div>
          </motion.div>

          {/* Animated sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Zap className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent"
          animate={{
            clipPath: [
              'polygon(0 100%, 100% 100%, 100% 80%, 0 70%)',
              'polygon(0 100%, 100% 100%, 100% 70%, 0 80%)',
              'polygon(0 100%, 100% 100%, 100% 80%, 0 70%)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;

