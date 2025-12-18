import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Trophy,
  Target,
  Flame,
  Crown,
  Clock,
  BookOpen,
  Gem,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  Gift,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import StreakTracker from "./StreakTracker";
import QuestSystem from "./QuestSystem";
import AchievementSystem from "./AchievementSystem";
import RewardSystem from "./RewardSystem";
import MysteryBox from "./MysteryBox";
import LeaderboardTab from "./LeaderboardTab";

const formatHM = (totalMinutes) => {
  const m = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
};

const Skillpulse = () => {
  const {
    userStats,
    getUserRank,
    getXPProgress,
    getTotalXPForLevel,
    generateDailyQuests,
    generateWeeklyQuests,
    achievements,
  } = useGamification();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  // Generate daily and weekly quests on component mount
  useEffect(() => {
    if (userStats.dailyQuests.length === 0) {
      generateDailyQuests();
    }
    if (userStats.weeklyQuests.length === 0) {
      generateWeeklyQuests();
    }
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "from-purple-600 to-blue-600" },
    { id: "quests", label: "Quests", icon: Target, color: "from-blue-500 to-cyan-500" },
    { id: "achievements", label: "Achievements", icon: Trophy, color: "from-yellow-500 to-orange-500" },
    { id: "streaks", label: "Streaks", icon: Flame, color: "from-orange-500 to-red-500" },
    { id: "leaderboard", label: "Leaderboard", icon: Crown, color: "from-yellow-400 to-orange-500" },
  ];

  const userRank = getUserRank();
  const xpProgress = getXPProgress();

  const getLevelColor = (level) => {
    if (level >= 100) return "from-yellow-400 to-orange-500";
    if (level >= 50) return "from-purple-600 to-pink-600";
    if (level >= 25) return "from-blue-600 to-purple-600";
    if (level >= 10) return "from-green-600 to-blue-600";
    return "from-gray-600 to-gray-700";
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 365) return "👑";
    if (streak >= 100) return "💎";
    if (streak >= 50) return "🔥";
    if (streak >= 30) return "⚡";
    if (streak >= 7) return "💪";
    return "🌟";
  };


  // Overview Tab Component
  const OverviewTab = ({ userStats, xpProgress }) => {
    const getWeeklyStats = () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const thisWeekSessions =
        userStats.sessionHistory?.filter(
          (session) => new Date(session.timestamp) > oneWeekAgo,
        ) || [];

      const xpEventsThisWeek = (userStats.xpEvents || [])
        .filter((e) => new Date(e.timestamp) > oneWeekAgo)
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const thisWeekXPFromSessions = thisWeekSessions.reduce(
        (total, session) => total + (session.xpEarned || 0),
        0,
      );

      const thisWeekXP = xpEventsThisWeek > 0 ? xpEventsThisWeek : thisWeekXPFromSessions;

      const thisWeekTime = thisWeekSessions.reduce(
        (total, session) => total + (session.durationMinutes || 0),
        0,
      );

      return {
        sessionsThisWeek: thisWeekSessions.length,
        xpThisWeek: thisWeekXP,
        timeThisWeekMinutes: thisWeekTime,
      };
    };

    const weeklyStats = getWeeklyStats();

    const stats = [
      {
        label: "Total XP",
        value: Math.floor((userStats?.totalXPEarned || userStats?.xp || 0)).toLocaleString(),
        icon: Star,
        color: "from-yellow-500 to-orange-500",
        change:
          (weeklyStats.xpThisWeek || 0) > 0
            ? `+${(weeklyStats.xpThisWeek || 0).toLocaleString()} this week`
            : "No XP this week",
      },
      {
        label: "Study Sessions",
        value: userStats.totalSessions,
        icon: BookOpen,
        color: "from-green-500 to-teal-500",
        change:
          weeklyStats.sessionsThisWeek > 0
            ? `+${weeklyStats.sessionsThisWeek} this week`
            : "No sessions this week",
      },
      {
        label: "Longest Streak",
        value: `${userStats.longestStreak} days`,
        icon: Flame,
        color: "from-orange-500 to-red-500",
        change: userStats.currentStreak === userStats.longestStreak ? "Current record!" : "Personal best",
      },
      {
        label: "Total Study Time",
        value: formatHM(userStats.totalStudyTime),
        icon: Clock,
        color: "from-blue-500 to-indigo-500",
        change:
          (weeklyStats.timeThisWeekMinutes || 0) > 0
            ? `+${formatHM(weeklyStats.timeThisWeekMinutes)} this week`
            : "No study time this week",
      },
    ];

    const recentAchievements = (userStats.achievements || [])
      .slice(-3)
      .map((id) => (achievements ? achievements[id] : null))
      .filter(Boolean);
    const activeQuests = userStats.dailyQuests?.filter((q) => !q.completed) || [];

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 rounded-xl p-4 backdrop-blur"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-300 text-xs mb-1">{stat.label}</p>
                <span className="text-xs text-green-300 font-medium">
                  {stat.change}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Active Quests & Recent Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Quests Preview */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              Active Quests
            </h3>
            <div className="space-y-2">
              {activeQuests.slice(0, 3).map((quest, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm">
                      {quest.name}
                    </span>
                    <span className="text-xs text-blue-400">+{quest.xp} XP</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(quest.progress / quest.target) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {quest.progress} / {quest.target}
                  </div>
                </div>
              ))}
              {activeQuests.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p>No active quests</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Recent Achievements
            </h3>
            <div className="space-y-2">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={`${achievement.id}-${index}`}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl">
                    <span>{achievement.icon || "🏆"}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-300">{achievement.description}</p>
                  </div>
                </div>
              ))}
              {recentAchievements.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <p>No achievements yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mystery Box Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Mystery Rewards
            </h3>
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl p-4">
              <p className="text-gray-300 text-sm mb-3">
                Complete study sessions to earn mystery boxes with surprise rewards!
              </p>
              {(() => {
                const threshold = 3;
                const claimedAt = parseInt(localStorage.getItem('mysteryBoxClaimedSessions') || '0', 10);
                const sinceClaim = Math.max(0, (userStats.totalSessions || 0) - claimedAt);
                const remainder = sinceClaim % threshold;
                const remaining = sinceClaim === 0 ? threshold : (remainder === 0 ? 0 : threshold - remainder);
                const availableNow = sinceClaim >= threshold;
                return (
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <Sparkles className="w-4 h-4" />
                    {availableNow ? (
                      <span>Box available now! Open to claim your reward.</span>
                    ) : (
                      <span>Next box after {remaining} more session{remaining === 1 ? '' : 's'}</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center justify-center">
            {(() => {
              const threshold = 3;
              const claimedAt = parseInt(localStorage.getItem('mysteryBoxClaimedSessions') || '0', 10);
              const sinceClaim = Math.max(0, (userStats.totalSessions || 0) - claimedAt);
              const availableNow = sinceClaim >= threshold;
              return (
                <MysteryBox
                  available={availableNow}
                  onOpen={() => {
                    localStorage.setItem('mysteryBoxClaimedSessions', String(userStats.totalSessions || 0));
                  }}
                />
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Reward System - Always Active */}
      <RewardSystem userStats={userStats} />

      {/* Settings Popup */}
      <AnimatePresence>
        {showSettingsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettingsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  How the System Works
                </h2>
                <button
                  onClick={() => setShowSettingsPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="text-xl text-gray-500">✕</span>
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <p className="text-lg text-gray-600">
                  Trackviso makes studying feel like a game. Every time you study, you earn XP and build your streak. Here's the breakdown:
                </p>

                <div className="space-y-5">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      🎯 XP (Experience Points)
                    </h3>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Earn XP for every study session.</li>
                      <li>• The longer + more focused you study, the more XP you get.</li>
                      <li>• Multipliers boost your XP (streak bonus, mastery bonus, and more).</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2 flex items-center gap-2">
                      🔥 Streaks
                    </h3>
                    <ul className="space-y-1 text-orange-700">
                      <li>• Study every day to keep your streak alive.</li>
                      <li>• Longer streaks = bigger XP boosts.</li>
                      <li>• Miss a day? Use a Streak Saver to protect your progress.</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      🏆 Levels & Prestige
                    </h3>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Level up as you gain XP.</li>
                      <li>• Reach the max level? You can Prestige: reset to Level 1, keep your rewards, and earn a permanent XP boost.</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
                      🎁 Rewards & Quests
                    </h3>
                    <ul className="space-y-1 text-green-700">
                      <li>• <strong>Variable Rewards:</strong> Sometimes you'll get bonus XP, gems, or rare jackpots after studying.</li>
                      <li>• <strong>Daily Quests:</strong> Extra challenges (e.g. "Study 30 minutes") that give big bonuses.</li>
                      <li>• <strong>Achievements:</strong> Unlock badges for milestones (like hitting a 30-day streak).</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
                      💎 Gems & Premium
                    </h3>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Earn gems from studying, quests, or jackpots.</li>
                      <li>• Spend gems on streak savers, boosts, or cosmetic upgrades.</li>
                      <li>• Premium users get extra perks + higher rewards.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    👉 Simple takeaway:
                  </h3>
                  <p className="text-lg">
                    Study → Earn XP → Level up → Unlock rewards.
                  </p>
                  <p className="text-indigo-100 mt-1">
                    The more consistent you are, the faster you progress.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowSettingsPopup(false)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border backdrop-blur-md shadow-xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-700/30 overflow-hidden relative"
      >
        {/* Header - Always Visible */}
        <div className="p-6 border-b border-purple-700/30">
          {/* Centered Skillpulse Title and Subheading */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-1">Skillpulse</h2>
            <p className="text-purple-300 text-sm">Level up your study game</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Level Circle */}
              <motion.div
                key={`level-${userStats.level}`}
                initial={false}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${getLevelColor(userStats.level)} flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/20`}
              >
                {userStats.level}
              </motion.div>
              
              <div>
                <p className="text-purple-200 text-sm mb-1">
                  {userRank} • Level {userStats.level}
                  {userStats.prestigeLevel > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-200 text-xs">
                      Prestige {userStats.prestigeLevel}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {getStreakEmoji(userStats.currentStreak)} {userStats.currentStreak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Gem className="w-3 h-3" />
                    {userStats.gems || 0} gems
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettingsPopup(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                title="How the System Works"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* XP Progress Bar - Always Visible */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-purple-200">
                Progress to Level {userStats.level + 1}
              </span>
              <span className="text-xs font-bold text-white">
                {xpProgress.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {Math.floor(xpProgress.current || 0)} / {Math.floor(xpProgress.needed || 0)} XP to next level
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="expanded-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 pb-2 overflow-x-auto justify-center">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${
                          activeTab === tab.id
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === "overview" && (
                    <OverviewTab userStats={userStats} xpProgress={xpProgress} />
                  )}

                  {activeTab === "quests" && (
                    <div className="space-y-6">
                      <QuestSystem />
                    </div>
                  )}

                  {activeTab === "achievements" && (
                    <div className="space-y-6">
                      <AchievementSystem />
                    </div>
                  )}

                  {activeTab === "streaks" && (
                    <div className="space-y-6">
                      <StreakTracker />
                    </div>
                  )}

                  {activeTab === "leaderboard" && (
                    <div className="space-y-6">
                      <LeaderboardTab />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Skillpulse;

