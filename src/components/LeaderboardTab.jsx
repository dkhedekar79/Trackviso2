import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, Flame, Clock, Medal, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";

const LeaderboardTab = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("all-time"); // daily, weekly, all-time
  const [sortBy, setSortBy] = useState("study_time"); // streak, study_time
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinPosition, setPinPosition] = useState(null); // 'top', 'bottom', or null
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, sortBy, user?.id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = user?.id || '';
      const response = await fetch(
        `/api/leaderboard?timeframe=${timeframe}&sortBy=${sortBy}${userId ? `&userId=${userId}` : ''}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard");
      }
      
      const leaderboardData = data.leaderboard || [];
      setLeaderboard(leaderboardData);
      
      // Reset pin position on new data
      setPinPosition(null);
    } catch (err) {
      logger.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || leaderboard.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const userIndex = leaderboard.findIndex(entry => entry.userId === user?.id);
    
    if (userIndex === -1) {
      setPinPosition(null);
      return;
    }

    const itemHeight = 64; // Approximate height of a compact item
    const userOffsetTop = userIndex * itemHeight;
    
    if (userOffsetTop < scrollTop) {
      setPinPosition('top');
    } else if (userOffsetTop > scrollTop + clientHeight - itemHeight) {
      setPinPosition('bottom');
    } else {
      setPinPosition(null);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [leaderboard, user?.id]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-400" />;
    return <span className="text-gray-400 font-bold text-xs">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
    if (rank === 2) return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
    if (rank === 3) return "from-orange-400/20 to-orange-500/20 border-orange-400/30";
    return "bg-white/5 border-white/10";
  };

  const isCurrentUser = (userId) => {
    return user?.id === userId;
  };

  const scrollToUser = () => {
    const userIndex = leaderboard.findIndex(entry => entry.userId === user?.id);
    if (userIndex !== -1 && scrollContainerRef.current) {
      const itemHeight = 64;
      scrollContainerRef.current.scrollTo({
        top: userIndex * itemHeight - (scrollContainerRef.current.clientHeight / 2) + (itemHeight / 2),
        behavior: 'smooth'
      });
    }
  };

  const LeaderboardItem = ({ entry, index, isPinned = false }) => {
    const rank = entry.rank || (index + 1);
    const isUser = isCurrentUser(entry.userId);
    
    return (
      <motion.div
        layout
        initial={isPinned ? { opacity: 0, y: isPinned === 'top' ? -20 : 20 } : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        className={`rounded-xl p-3 border backdrop-blur transition-all ${
          isPinned 
            ? "bg-purple-600/90 border-purple-400 shadow-2xl z-20" 
            : isUser
              ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-500/50 shadow-lg shadow-purple-500/20"
              : getRankColor(rank)
        } ${isPinned ? 'cursor-pointer' : ''}`}
        onClick={isPinned ? scrollToUser : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 flex items-center justify-center">
            {getRankIcon(rank)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate text-sm text-white">
                {entry.displayName}
                {isUser && !isPinned && (
                  <span className="ml-1 text-[10px] text-purple-300">(You)</span>
                )}
              </h3>
              {rank <= 3 && !isPinned && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                  Top {rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-300">
              <span>Lvl {entry.level || 1}</span>
              <span>•</span>
              <span>{(entry.xp || 0).toLocaleString()} XP</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-bold text-white">
              {entry.displayValue}
            </div>
            <div className="text-[10px] text-gray-400">
              {sortBy === "streak" ? "days" : "studied"}
            </div>
          </div>
          
          {isPinned && (
            <div className="flex-shrink-0">
              {isPinned === 'top' ? <ChevronDown className="w-4 h-4 text-white animate-bounce" /> : <ChevronUp className="w-4 h-4 text-white animate-bounce" />}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);

  return (
    <div className="space-y-4 flex flex-col h-full max-h-[600px]">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
        <div className="flex-1">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {["daily", "weekly", "all-time"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tf === "daily" ? "Today" : tf === "weekly" ? "Week" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { id: "study_time", label: "Time", icon: Clock },
              { id: "streak", label: "Streak", icon: Flame },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    sortBy === option.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard Container */}
      <div className="relative flex-1 min-h-0 bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="mt-3 text-sm text-gray-400">Loading rankings...</span>
        </div>
      ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-200 text-xs transition-colors"
          >
              Try Again
          </button>
        </div>
      ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Trophy className="w-10 h-10 mb-3 text-gray-600" />
            <p className="text-gray-500 text-sm">No rankings yet</p>
        </div>
      ) : (
          <>
            {/* Pinned Top */}
            <AnimatePresence>
              {pinPosition === 'top' && currentUserEntry && (
                <div className="absolute top-2 left-2 right-2 z-30">
                  <LeaderboardItem entry={currentUserEntry} isPinned="top" />
                </div>
              )}
            </AnimatePresence>

            {/* Scrollable List */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {leaderboard.map((entry, index) => (
                <LeaderboardItem key={entry.userId || index} entry={entry} index={index} />
              ))}
                  </div>

            {/* Pinned Bottom */}
            <AnimatePresence>
              {pinPosition === 'bottom' && currentUserEntry && (
                <div className="absolute bottom-2 left-2 right-2 z-30">
                  <LeaderboardItem entry={currentUserEntry} isPinned="bottom" />
                </div>
              )}
            </AnimatePresence>
          </>
        )}
        </div>

      {/* Footer Info */}
      <div className="px-2">
        <p className="text-[10px] text-gray-500 text-center italic">
          Showing {leaderboard.length} users • {sortBy === "streak" ? "Consecutive days" : "Total study time"}
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTab;

