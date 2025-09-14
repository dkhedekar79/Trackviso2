import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Trophy,
  Target,
  Flame,
  Crown,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  BookOpen,
  Clock,
  Users,
  Share2,
  Plus,
  Settings,
  Sparkles,
  Gift,
  Shield,
  Gem,
  ChevronRight,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import { useAuth } from "../context/AuthContext";
import { AnimatedProgressBar } from "./RewardAnimations";
import StreakTracker from "./StreakTracker";
import QuestSystem from "./QuestSystem";
import AchievementSystem from "./AchievementSystem";

import PremiumSystem from "./PremiumSystem";
import RewardSystem from "./RewardSystem";
import MysteryBox from "./MysteryBox";
import OnboardingModal from "./OnboardingModal";

const formatHM = (totalMinutes) => {
  const m = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
};

const GamifiedDashboard = () => {
  const {
    userStats,
    getUserRank,
    getXPProgress,
    getXPForLevel,
    getTotalXPForLevel,
    addReward,
    generateDailyQuests,
    generateWeeklyQuests,
  } = useGamification();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickActions, setShowQuickActions] = useState(false);


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
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "quests", label: "Quests", icon: Target },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "streaks", label: "Streaks", icon: Flame },
    { id: "premium", label: "Premium", icon: Crown },
  ];

  function formatHM(totalMinutes) {
  const m = Math.max(0, Math.round(totalMinutes || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}

  const userRank = getUserRank();
  const xpProgress = getXPProgress();
  const nextLevelXP = getXPForLevel(userStats.level + 1);
  const cumulativeNextLevelXP = getTotalXPForLevel(userStats.level + 1);

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

  // Real quick session function
  const startQuickSession = (duration) => {
    // This would integrate with the actual timer system
    // For now, we'll show a realistic message
    addReward({
      type: "XP_EARNED",
      title: `Timer set for ${duration} minutes`,
      description: "Focus mode activated! Start studying to earn XP.",
      tier: "common",
    });

    // In a real implementation, this would start the actual timer
    // and navigate to the study page with the timer pre-configured
  };

  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-20 pl-10">
      <OnboardingModal userId={user?.id} />
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
                      <li>�� The longer + more focused you study, the more XP you get.</li>
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

      {/* Hero Section with User Stats */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              {/* Level Circle */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className={`w-24 h-24 rounded-full bg-gradient-to-r ${getLevelColor(userStats.level)} flex items-center justify-center text-white text-3xl font-bold shadow-2xl border-4 border-white/20`}
              >
                {userStats.level}
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold mb-2">{userRank}</h1>
                <p className="text-blue-100 mb-1">
                  Level {userStats.level}
                  {userStats.prestigeLevel > 0 && (
                    <span className="ml-2 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-sm">
                      Prestige {userStats.prestigeLevel}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">
                    {Math.floor(userStats.xp || 0).toLocaleString()} / {Math.floor(cumulativeNextLevelXP || 0).toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSettingsPopup(true)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-100">
                Progress to Level {userStats.level + 1}
              </span>
              <span className="text-sm font-bold">
                {xpProgress.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6 text-orange-300" />
                <span className="font-semibold">Current Streak</span>
              </div>
              <div className="text-2xl font-bold">
                {getStreakEmoji(userStats.currentStreak)}{" "}
                {userStats.currentStreak}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-300" />
                <span className="font-semibold">Study Time</span>
              </div>
              <div className="text-2xl font-bold">
                {formatHM(userStats.totalStudyTime)}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-300" />
                <span className="font-semibold">Achievements</span>
              </div>
              <div className="text-2xl font-bold">
                {userStats.achievements.length}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-green-300" />
                <span className="font-semibold">Quests Done</span>
              </div>
              <div className="text-2xl font-bold">
                {userStats.dailyQuests.filter((q) => q.completed).length}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur border-t border-white/20 px-6 py-4"
            >
              <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => startQuickSession(25)}
                    className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    25min Focus
                  </button>
                  <button
                    onClick={() => startQuickSession(15)}
                    className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    15min Quick
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all">
                    <BookOpen className="w-4 h-4" />
                    Review Notes
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all">
                    <Target className="w-4 h-4" />
                    View Quests
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 shadow"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "premium" && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "overview" && <OverviewTab userStats={userStats} xpProgress={xpProgress} />}

          {activeTab === "quests" && <QuestSystem />}

          {activeTab === "achievements" && <AchievementSystem />}

          {activeTab === "streaks" && <StreakTracker />}

          

          {activeTab === "premium" && <PremiumSystem />}
        </div>
      </div>
    </div>
  );
};

// Enhanced Overview Tab
const OverviewTab = ({ userStats, xpProgress }) => {
  // Calculate real weekly statistics
  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekSessions =
      userStats.sessionHistory?.filter(
        (session) => new Date(session.timestamp) > oneWeekAgo,
      ) || [];

    const thisWeekXP = thisWeekSessions.reduce(
      (total, session) => total + (session.xpEarned || 0),
      0,
    );

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
      value: Math.floor((userStats?.xp || 0)).toLocaleString(),
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      change:
        (weeklyStats.xpThisWeek + (userStats.weeklyXP || 0)) > 0
          ? `+${(weeklyStats.xpThisWeek + (userStats.weeklyXP || 0)).toLocaleString()} this week`
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
      change:
        userStats.currentStreak === userStats.longestStreak
          ? "Current record!"
          : "Personal best",
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

  const recentAchievements = userStats.achievements.slice(-3);
  const activeQuests = userStats.dailyQuests?.filter((q) => !q.completed) || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <span className="text-xs text-green-600 font-medium">
                {stat.change}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Active Quests & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Quests Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Active Quests
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab("quests")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {activeQuests.slice(0, 3).map((quest, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    {quest.name}
                  </span>
                  <span className="text-sm text-blue-600">+{quest.xp} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(quest.progress / quest.target) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {quest.progress} / {quest.target}
                </div>
              </div>
            ))}

            {activeQuests.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active quests</p>
                <p className="text-sm">New quests will appear daily!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab("achievements")}
              className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentAchievements.map((achievementId, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    Achievement Unlocked
                  </h4>
                  <p className="text-sm text-gray-600">{achievementId}</p>
                </div>
              </motion.div>
            ))}

            {recentAchievements.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No achievements yet</p>
                <p className="text-sm">
                  Complete quests to unlock achievements!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mystery Box Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Mystery Rewards
          </h3>
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6">
            <p className="text-gray-700 mb-4">
              Complete study sessions to earn mystery boxes with surprise
              rewards! Get bonus XP, streak savers, special titles, and more!
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Sparkles className="w-4 h-4" />
              <span>Next box available after 3 more sessions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <MysteryBox
            available={
              userStats.totalSessions >= 3 && userStats.totalSessions % 3 === 0
            }
            onOpen={() => console.log("Mystery box opened!")}
          />
        </div>
      </div>

      {/* Premium Teaser */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Crown className="w-7 h-7 text-yellow-300" />
              Unlock Premium Power
            </h3>
            <p className="text-purple-100 mb-4">
              Get 3x XP multiplier, unlimited streak savers, and exclusive
              themes!
            </p>
            <ul className="space-y-1 text-sm text-purple-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                3x Faster Progress
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                Never Lose Your Streak
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                Exclusive Content & Themes
              </li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Upgrade Now
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default GamifiedDashboard;
