import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, LogOut, Menu, X, Star, Trophy, Flame, Sparkles, Zap } from 'lucide-react';
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
      {/* Animated gradient line at top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] overflow-hidden">
        <motion.div
          className="h-full w-[200%] bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-400 via-purple-500 to-pink-500"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-purple-900/20" 
            : "bg-gradient-to-r from-slate-950/90 via-purple-950/90 to-slate-950/90 backdrop-blur-md"
        }`}
      >
        {/* Subtle animated background glow */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`
          }}
        />

        <div className="relative flex items-center justify-between px-8 py-4 h-20">
          {/* Left: Logo with animation */}
          <motion.div 
            className="flex-1 min-w-0"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/dashboard" className="group flex items-center gap-3">
              <motion.div
                className="relative"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 blur-md opacity-50 -z-10"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all duration-300">
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
                    <span className="text-2xl font-black tracking-[0.3em] bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {pageTitle}
                    </span>
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    />
                  </div>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-medium text-purple-300/60 mt-2 block tracking-widest"
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
                  className="px-5 py-2 rounded-xl font-semibold text-purple-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/signup" 
                    className="px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
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
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 backdrop-blur-sm">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                    </motion.div>
                    <span className="text-sm font-bold text-amber-300">Lvl {userStats?.level || 1}</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-amber-500/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* Streak Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Flame className="w-4 h-4 text-orange-400" />
                    </motion.div>
                    <span className="text-sm font-bold text-orange-300">{userStats?.currentStreak || 0} day</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-orange-500/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                {/* XP Badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-purple-300">{userStats?.xp || 0} XP</span>
                  </div>
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-purple-500/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>

                <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent mx-1" />
                
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </motion.nav>

      {/* Gamification Notifications */}
      <AnimatePresence>
        {showRewards && rewardQueue && Array.isArray(rewardQueue) && rewardQueue.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="fixed top-24 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-500/30 z-50 max-w-sm border border-emerald-400/30"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="text-2xl"
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
