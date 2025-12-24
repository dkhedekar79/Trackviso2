import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Flame, Clock, Medal, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logger from "../utils/logger";

const LeaderboardTab = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("all-time"); // daily, weekly, all-time
  const [sortBy, setSortBy] = useState("study_time"); // streak, study_time
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/leaderboard?timeframe=${timeframe}&sortBy=${sortBy}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard");
      }
      
      const leaderboardData = data.leaderboard || [];
      logger.log('Leaderboard data received:', leaderboardData.slice(0, 3).map(e => ({ 
        name: e.displayName, 
        xp: e.xp, 
        level: e.level 
      })));
      setLeaderboard(leaderboardData);
    } catch (err) {
      logger.error("Error fetching leaderboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-500/30 to-orange-500/30 border-yellow-500/50";
    if (rank === 2) return "from-gray-400/30 to-gray-500/30 border-gray-400/50";
    if (rank === 3) return "from-orange-400/30 to-orange-500/30 border-orange-400/50";
    return "bg-white/5 border-white/10";
  };

  const isCurrentUser = (userId) => {
    return user?.id === userId;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Timeframe Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Time Period
          </label>
          <div className="flex gap-2">
            {["daily", "weekly", "all-time"].map((tf) => (
              <motion.button
                key={tf}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  timeframe === tf
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {tf === "daily" ? "Today" : tf === "weekly" ? "This Week" : "All Time"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort By Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Sort By
          </label>
          <div className="flex gap-2">
            {[
              { id: "study_time", label: "Study Time", icon: Clock },
              { id: "streak", label: "Streak", icon: Flame },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    sortBy === option.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="ml-3 text-gray-300">Loading leaderboard...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 px-4 py-2 bg-red-600/50 hover:bg-red-600/70 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white/10 rounded-xl p-8 text-center backdrop-blur">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No data available for this period</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const isUser = isCurrentUser(entry.userId);
            
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl p-4 border backdrop-blur ${
                  isUser
                    ? "bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-500/50 shadow-lg shadow-purple-500/20"
                    : getRankColor(rank)
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold truncate ${
                        isUser ? "text-white" : "text-white"
                      }`}>
                        {entry.displayName}
                        {isUser && (
                          <span className="ml-2 text-xs text-purple-300">(You)</span>
                        )}
                      </h3>
                      {rank <= 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                          Top {rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-300">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span>{entry.xp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${
                      isUser ? "text-purple-200" : "text-white"
                    }`}>
                      {entry.displayValue}
                    </div>
                    <div className="text-xs text-gray-400">
                      {sortBy === "streak" ? "days" : "studied"}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Text */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-400 text-center">
          {sortBy === "streak" 
            ? "Leaderboard shows top studiers by consecutive study days"
            : "Leaderboard shows top studiers by total study time"
          } for {timeframe === "daily" ? "today" : timeframe === "weekly" ? "this week" : "all time"}
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTab;

