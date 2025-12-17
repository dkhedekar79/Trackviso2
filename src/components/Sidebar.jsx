import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlameIcon, BookIcon, CalendarIcon, ListChecksIcon, BrainIcon,
  BarChart2Icon, Settings2Icon, LayoutDashboardIcon, BarChart3, GraduationCap, BookOpen,
  ChevronRight
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard", color: "purple" },
  { path: "/study", icon: BrainIcon, label: "Study", color: "pink" },
  { path: "/mastery", icon: BookOpen, label: "Mastery", color: "cyan" },
  { path: "/insights", icon: BarChart3, label: "Insights", color: "emerald" },
  { path: "/subjects", icon: BookIcon, label: "Subjects", color: "amber" },
  { path: "/tasks", icon: ListChecksIcon, label: "Tasks", color: "rose" },
  { path: "/resources", icon: GraduationCap, label: "Resources", color: "indigo" },
];

const colorVariants = {
  purple: { bg: "from-purple-500/30 to-purple-600/30", border: "border-purple-400/60", glow: "shadow-purple-500/40", text: "text-purple-300", icon: "text-purple-300" },
  pink: { bg: "from-pink-500/30 to-pink-600/30", border: "border-pink-400/60", glow: "shadow-pink-500/40", text: "text-pink-300", icon: "text-pink-300" },
  cyan: { bg: "from-cyan-500/30 to-cyan-600/30", border: "border-cyan-400/60", glow: "shadow-cyan-500/40", text: "text-cyan-300", icon: "text-cyan-300" },
  emerald: { bg: "from-emerald-500/30 to-emerald-600/30", border: "border-emerald-400/60", glow: "shadow-emerald-500/40", text: "text-emerald-300", icon: "text-emerald-300" },
  amber: { bg: "from-amber-500/30 to-amber-600/30", border: "border-amber-400/60", glow: "shadow-amber-500/40", text: "text-amber-300", icon: "text-amber-300" },
  rose: { bg: "from-rose-500/30 to-rose-600/30", border: "border-rose-400/60", glow: "shadow-rose-500/40", text: "text-rose-300", icon: "text-rose-300" },
  indigo: { bg: "from-indigo-500/30 to-indigo-600/30", border: "border-indigo-400/60", glow: "shadow-indigo-500/40", text: "text-indigo-300", icon: "text-indigo-300" },
  slate: { bg: "from-slate-500/30 to-slate-600/30", border: "border-slate-400/60", glow: "shadow-slate-500/40", text: "text-slate-300", icon: "text-slate-300" },
};

// Custom 4-pointed star logo SVG component
const StarLogo = ({ className, isGlowing }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Glow filter */}
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a1a1aa" />
        <stop offset="50%" stopColor="#e4e4e7" />
        <stop offset="100%" stopColor="#a1a1aa" />
      </linearGradient>
    </defs>
    
    {/* 4-pointed star shape */}
    <path
      d="M50 5 Q55 45 95 50 Q55 55 50 95 Q45 55 5 50 Q45 45 50 5Z"
      fill="url(#starGradient)"
      filter={isGlowing ? "url(#glow)" : undefined}
      opacity="0.9"
    />
    
    {/* Center circle */}
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="#818cf8"
      filter={isGlowing ? "url(#glow)" : undefined}
    />
  </svg>
);

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  // Close sidebar when a link is clicked
  const handleLinkClick = () => {
    setIsExpanded(false);
    setHoveredItem(null);
  };

  return (
    <motion.aside 
      className="fixed left-0 top-[3px] h-[calc(100%-3px)] z-40 flex flex-col"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredItem(null);
      }}
    >
      {/* Main sidebar container */}
      <motion.div
        className="relative h-full flex flex-col bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 backdrop-blur-xl border-r border-purple-400/30 shadow-2xl shadow-purple-900/50 overflow-hidden"
        animate={{ width: isExpanded ? 220 : 68 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        {/* Animated gradient border */}
        <div className="absolute right-0 top-0 bottom-0 w-px overflow-hidden">
          <motion.div
            className="w-full h-[200%] bg-gradient-to-b from-purple-500 via-pink-500 via-cyan-500 to-purple-500"
            animate={{ y: ["-50%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Logo area - glowing star */}
        <div className="pt-24 pb-4 px-2 flex justify-center">
          <Link to="/dashboard" onClick={handleLinkClick}>
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <StarLogo className="w-12 h-12" isGlowing={true} />
              {/* Animated glow behind logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/40 blur-xl -z-10"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 flex flex-col gap-1.5 px-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.path;
            const Icon = item.icon;
            const colors = colorVariants[item.color];

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => !isExpanded && setHoveredItem(null)}
                  className="relative block"
                >
                  <motion.div
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${colors.bg} border ${colors.border} shadow-lg ${colors.glow}` 
                        : isHovered ? "bg-white/10" : "bg-transparent"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active bar indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-400"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={{ 
                        scale: isActive || isHovered ? 1.15 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 w-5 h-5 ${isActive ? colors.icon : isHovered ? "text-white" : "text-purple-300/80"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    {/* Label - always in DOM but opacity controlled */}
                    <motion.span
                      animate={{ 
                        opacity: isExpanded ? 1 : 0,
                        x: isExpanded ? 0 : -10
                      }}
                      transition={{ duration: 0.15 }}
                      className={`font-medium text-sm whitespace-nowrap overflow-hidden ${
                        isActive ? "text-white font-semibold" : isHovered ? "text-white" : "text-purple-200/80"
                      }`}
                    >
                      {item.label}
                    </motion.span>

                    {/* Hover arrow */}
                    {isExpanded && isHovered && !isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto text-purple-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Tooltip for collapsed state */}
                  <AnimatePresence>
                    {!isExpanded && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-[100]"
                      >
                        <div className={`px-4 py-2 rounded-lg bg-slate-900 border ${colors.border} shadow-xl shadow-black/50`}>
                          <span className={`text-sm font-semibold ${colors.text}`}>{item.label}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* Settings at bottom */}
        <div className="pb-6 px-2">
          <Link
            to="/settings"
            onClick={handleLinkClick}
            onMouseEnter={() => setHoveredItem("/settings")}
            onMouseLeave={() => !isExpanded && setHoveredItem(null)}
            className="relative block"
          >
            <motion.div
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 ${
                location.pathname === "/settings"
                  ? "bg-gradient-to-r from-slate-500/30 to-slate-600/30 border border-slate-400/60 shadow-lg shadow-slate-500/40"
                  : hoveredItem === "/settings" ? "bg-white/10" : "bg-transparent"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {location.pathname === "/settings" && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-400"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <motion.div
                animate={{ rotate: hoveredItem === "/settings" ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className={`flex-shrink-0 w-5 h-5 ${
                  location.pathname === "/settings" ? "text-slate-300" : hoveredItem === "/settings" ? "text-white" : "text-purple-300/80"
                }`}
              >
                <Settings2Icon className="w-5 h-5" />
              </motion.div>

              <motion.span
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : -10
                }}
                transition={{ duration: 0.15 }}
                className={`font-medium text-sm whitespace-nowrap ${
                  location.pathname === "/settings" ? "text-white font-semibold" : hoveredItem === "/settings" ? "text-white" : "text-purple-200/80"
                }`}
              >
                Settings
              </motion.span>
            </motion.div>

            {/* Tooltip for settings */}
            <AnimatePresence>
              {!isExpanded && hoveredItem === "/settings" && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-[100]"
                >
                  <div className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-400/60 shadow-xl shadow-black/50">
                    <span className="text-sm font-semibold text-slate-300">Settings</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.div>
    </motion.aside>
  );
}
