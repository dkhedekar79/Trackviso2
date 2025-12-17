import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlameIcon, BookIcon, CalendarIcon, ListChecksIcon, BrainIcon,
  BarChart2Icon, Settings2Icon, LayoutDashboardIcon, BarChart3, GraduationCap, BookOpen,
  ChevronRight, Sparkles
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
  purple: { bg: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/50", glow: "shadow-purple-500/30", text: "text-purple-400" },
  pink: { bg: "from-pink-500/20 to-pink-600/20", border: "border-pink-500/50", glow: "shadow-pink-500/30", text: "text-pink-400" },
  cyan: { bg: "from-cyan-500/20 to-cyan-600/20", border: "border-cyan-500/50", glow: "shadow-cyan-500/30", text: "text-cyan-400" },
  emerald: { bg: "from-emerald-500/20 to-emerald-600/20", border: "border-emerald-500/50", glow: "shadow-emerald-500/30", text: "text-emerald-400" },
  amber: { bg: "from-amber-500/20 to-amber-600/20", border: "border-amber-500/50", glow: "shadow-amber-500/30", text: "text-amber-400" },
  rose: { bg: "from-rose-500/20 to-rose-600/20", border: "border-rose-500/50", glow: "shadow-rose-500/30", text: "text-rose-400" },
  indigo: { bg: "from-indigo-500/20 to-indigo-600/20", border: "border-indigo-500/50", glow: "shadow-indigo-500/30", text: "text-indigo-400" },
  slate: { bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/50", glow: "shadow-slate-500/30", text: "text-slate-400" },
};

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  return (
    <motion.aside 
      className="fixed left-0 top-[2px] h-[calc(100%-2px)] z-40 flex flex-col"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Main sidebar container */}
      <motion.div
        className="relative h-full flex flex-col bg-gradient-to-b from-slate-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-xl border-r border-purple-500/20"
        animate={{ width: isExpanded ? 240 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Animated gradient border */}
        <div className="absolute right-0 top-0 bottom-0 w-px overflow-hidden">
          <motion.div
            className="w-full h-[200%] bg-gradient-to-b from-purple-500 via-pink-500 via-cyan-500 to-purple-500"
            animate={{ y: ["-50%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Logo area */}
        <div className="pt-24 pb-6 px-4">
          <motion.div 
            className="flex items-center gap-3 px-2"
            animate={{ justifyContent: isExpanded ? "flex-start" : "center" }}
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
        </div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-purple-500/50 blur-lg -z-10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap"
                >
                  Menu
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-hide">
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
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative block"
                >
                  <motion.div
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${colors.bg} border ${colors.border}` 
                        : "hover:bg-white/5"
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active indicator glow */}
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className={`absolute inset-0 rounded-xl ${colors.glow} shadow-lg blur-sm -z-10`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Active bar indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 24 }}
                          exit={{ height: 0 }}
                          className={`absolute left-0 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-400`}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon with animation */}
                    <motion.div
                      animate={{ 
                        scale: isActive || isHovered ? 1.1 : 1,
                        rotate: isHovered && !isActive ? [0, -10, 10, 0] : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 ${isActive ? colors.text : "text-purple-300/70"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    {/* Label */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`font-medium whitespace-nowrap ${
                            isActive ? "text-white" : "text-purple-200/70"
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Hover arrow */}
                    <AnimatePresence>
                      {isExpanded && isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-auto text-purple-400"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Tooltip for collapsed state */}
                  <AnimatePresence>
                    {!isExpanded && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50"
                      >
                        <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${colors.bg} backdrop-blur-xl border ${colors.border} shadow-xl whitespace-nowrap`}>
                          <span className="text-sm font-medium text-white">{item.label}</span>
        </div>
                        {/* Tooltip arrow */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-gradient-to-br ${colors.bg} border-l border-b ${colors.border}`} />
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
        <div className="pb-6 px-3">
          <Link
            to="/settings"
            onMouseEnter={() => setHoveredItem("/settings")}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative block"
          >
            <motion.div
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === "/settings"
                  ? "bg-gradient-to-r from-slate-500/20 to-slate-600/20 border border-slate-500/50"
                  : "hover:bg-white/5"
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {location.pathname === "/settings" && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 rounded-xl shadow-slate-500/30 shadow-lg blur-sm -z-10"
                />
              )}

              <AnimatePresence>
                {location.pathname === "/settings" && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    exit={{ height: 0 }}
                    className="absolute left-0 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-400"
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{ 
                  rotate: hoveredItem === "/settings" ? 90 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`flex-shrink-0 ${
                  location.pathname === "/settings" ? "text-slate-300" : "text-purple-300/70"
                }`}
              >
                <Settings2Icon className="w-5 h-5" />
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`font-medium whitespace-nowrap ${
                      location.pathname === "/settings" ? "text-white" : "text-purple-200/70"
                    }`}
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tooltip for settings */}
            <AnimatePresence>
              {!isExpanded && hoveredItem === "/settings" && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.8 }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50"
                >
                  <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-slate-500/20 to-slate-600/20 backdrop-blur-xl border border-slate-500/50 shadow-xl whitespace-nowrap">
                    <span className="text-sm font-medium text-white">Settings</span>
        </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-l border-b border-slate-500/50" />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Expand indicator */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-purple-500/50"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
}
