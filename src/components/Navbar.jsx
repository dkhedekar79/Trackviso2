import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, LogOut, Menu, X, Star, Trophy, Flame, Zap } from 'lucide-react';
import ProfileDropdown from "./ProfileDropdown";

// Custom 4-pointed star logo SVG component
const StarLogo = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <defs>
      <filter id="navGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="navStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4d4d8" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#d4d4d8" />
      </linearGradient>
      <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="100%" stopColor="#6366f1" />
      </radialGradient>
    </defs>
    
    {/* 4-pointed star shape */}
    <path
      d="M50 5 Q55 45 95 50 Q55 55 50 95 Q45 55 5 50 Q45 45 50 5Z"
      fill="url(#navStarGradient)"
      filter="url(#navGlow)"
    />
    
    {/* Center circle with gradient */}
    <circle
      cx="50"
      cy="50"
      r="18"
      fill="url(#centerGradient)"
      filter="url(#navGlow)"
    />
  </svg>
);

// Particle trail component
const MouseTrail = ({ mousePosition, isInNavbar }) => {
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);

  useEffect(() => {
    if (!isInNavbar || !mousePosition.x) return;

    const newParticle = {
      id: particleId.current++,
      x: mousePosition.x,
      y: mousePosition.y,
      size: Math.random() * 8 + 4,
      opacity: 1,
      hue: Math.random() * 40 + 35, // Golden/yellow range
    };

    setParticles(prev => [...prev.slice(-15), newParticle]);

    const cleanup = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 800);

    return () => clearTimeout(cleanup);
  }, [mousePosition, isInNavbar]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden">
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x - particle.size / 2, 
            y: particle.y - particle.size / 2,
            scale: 1,
            opacity: 0.8
          }}
          animate={{ 
            y: particle.y - 30 - Math.random() * 20,
            x: particle.x + (Math.random() - 0.5) * 40,
            scale: 0,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, hsla(${particle.hue}, 100%, 70%, 0.9), hsla(${particle.hue}, 100%, 50%, 0.5))`,
            boxShadow: `0 0 ${particle.size * 2}px hsla(${particle.hue}, 100%, 60%, 0.6)`,
          }}
        />
      ))}
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInNavbar, setIsInNavbar] = useState(false);
  const navRef = useRef(null);
  const { user, logout } = useAuth();
  const { userStats, showRewards, rewardQueue } = useGamification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is in navbar area
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsInNavbar(e.clientY >= rect.top && e.clientY <= rect.bottom);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "DASHBOARD",
      "/tasks": "TASKS",
      "/schedule": "SCHEDULE",
      "/subjects": "SUBJECTS",
      "/study": "STUDY",
      "/settings": "SETTINGS",
      "/insights": "INSIGHTS",
      "/resources": "RESOURCES",
      "/mastery": "MASTERY",
    };
    return titles[location.pathname] || "";
  };

  const pageTitle = getPageTitle();

  return (
    <>
      {/* Mouse trail effect */}
      <MouseTrail mousePosition={mousePosition} isInNavbar={isInNavbar} />

      {/* Animated gradient line at top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] overflow-hidden">
        <motion.div
          className="h-full w-[200%] bg-gradient-to-r from-amber-400 via-purple-500 via-pink-500 via-amber-400 to-purple-500"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.nav
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-purple-900/30" 
            : "bg-gradient-to-r from-slate-950 via-purple-950/95 to-slate-950 backdrop-blur-lg"
        }`}
      >
        {/* Animated glow that follows mouse */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: isInNavbar 
              ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y - 3}px, rgba(251, 191, 36, 0.15), rgba(139, 92, 246, 0.08) 40%, transparent 70%)`
              : 'none',
            opacity: isInNavbar ? 1 : 0
          }}
        />

        {/* Subtle animated particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400/30"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: "100%",
                opacity: 0 
              }}
              animate={{ 
                y: "-100%",
                opacity: [0, 0.6, 0],
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-between px-8 py-4 h-20">
          {/* Left: Logo with animation */}
          <motion.div 
            className="flex-1 min-w-0"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/dashboard" className="group flex items-center gap-3">
              <motion.div
                className="relative"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <StarLogo className="w-11 h-11 drop-shadow-lg" />
                {/* Animated glow behind logo */}
                <motion.div 
                  className="absolute inset-0 bg-indigo-500/50 blur-xl rounded-full -z-10"
                  animate={{ 
                    scale: [1, 1.4, 1], 
                    opacity: [0.5, 0.8, 0.5] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-2xl font-black bg-gradient-to-r from-amber-300 via-white to-purple-300 bg-clip-text text-transparent group-hover:from-amber-200 group-hover:via-yellow-100 group-hover:to-purple-200 transition-all duration-300 tracking-tight">
                Trackviso
              </span>
            </Link>
          </motion.div>
          
          {/* Center: Animated Page Title */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {pageTitle && (
                <motion.div
                  key={pageTitle}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="text-center"
                >
                  <div className="relative">
                    <span className="text-2xl font-black tracking-[0.25em] bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                      {pageTitle}
                    </span>
                    <motion.div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    />
                  </div>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-semibold text-amber-300/60 mt-2 block tracking-[0.2em] uppercase"
                  >
                    {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right: Auth & Stats */}
          <div className="flex-1 flex justify-end items-center gap-3 min-w-0">
            {!user && (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 rounded-xl font-semibold text-amber-200 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-amber-500/30"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/signup" 
                    className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-400/50 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
            {user && (
              <div className="flex items-center gap-3">
                {/* Level Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/50 backdrop-blur-sm shadow-lg shadow-amber-500/20">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-4 h-4 text-amber-300" fill="currentColor" />
                    </motion.div>
                    <span className="text-sm font-bold text-amber-200">Lvl {userStats?.level || 1}</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-amber-400/30 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* Streak Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/25 to-red-500/25 border border-orange-400/50 backdrop-blur-sm shadow-lg shadow-orange-500/20">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                    >
                      <Flame className="w-4 h-4 text-orange-300" />
                    </motion.div>
                    <span className="text-sm font-bold text-orange-200">{userStats?.currentStreak || 0} day</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-orange-400/30 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* XP Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-400/50 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                    <Zap className="w-4 h-4 text-purple-300" />
                    <span className="text-sm font-bold text-purple-200">{userStats?.xp || 0} XP</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-purple-400/30 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent mx-2" />
                
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </motion.nav>

      {/* Gamification Notifications */}
      <AnimatePresence>
        {showRewards && rewardQueue && Array.isArray(rewardQueue) && rewardQueue.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="fixed top-28 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 rounded-2xl shadow-2xl shadow-emerald-500/40 z-50 max-w-sm border border-emerald-300/30"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="text-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.div>
              <div>
                <h4 className="font-bold text-lg">{rewardQueue[rewardQueue.length - 1]?.title || "Session Complete!"}</h4>
                <p className="text-sm opacity-90">{rewardQueue[rewardQueue.length - 1]?.description || "Great work!"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
