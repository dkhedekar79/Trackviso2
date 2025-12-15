import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Flame,
  BarChart3,
  BookOpen,
  CheckCircle,
  Award,
  Zap,
  Activity,
  Download,
  Lightbulb,
  AlertCircle,
  Trophy,
  Star,
  TrendingDown,
  CalendarDays,
  PieChart,
  BarChart,
  Clock3,
  Target as TargetIcon,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
}

function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getPreviousPeriod(startDate, timeRange) {
  const periodLength = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() - 1);
  const startDatePrev = new Date(startDate);
  startDatePrev.setDate(startDatePrev.getDate() - periodLength);
  return { startDate: startDatePrev, endDate };
}

export default function Insights() {
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    const savedSessions = localStorage.getItem('studySessions');
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedSessions) setStudySessions(JSON.parse(savedSessions));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Calculate insights based on time range
  const getFilteredSessions = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = getStartOfWeek(now);
        break;
      case 'month':
        startDate = getStartOfMonth(now);
        break;
      case 'all':
        return studySessions;
      default:
        startDate = getStartOfWeek(now);
    }
    
    return studySessions.filter(session => new Date(session.timestamp) >= startDate);
  };

  const filteredSessions = getFilteredSessions();

  // Calculate overall stats
  const totalStudyTime = filteredSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const totalSessions = filteredSessions.length;
  const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

  // Longest Session
  const longestSession = filteredSessions.length > 0 
    ? filteredSessions.reduce((longest, session) => 
        session.durationMinutes > longest.durationMinutes ? session : longest
      )
    : null;

  // Subject Time Distribution
  const getSubjectTimeDistribution = () => {
    const distribution = {};
    filteredSessions.forEach(session => {
      if (!distribution[session.subjectName]) {
        distribution[session.subjectName] = 0;
      }
      distribution[session.subjectName] += session.durationMinutes;
    });
    return distribution;
  };

  const subjectTimeDistribution = getSubjectTimeDistribution();

  // Weekly Study Time by Day and Subject (for compound bar graph)
  const getWeeklyStudyByDay = () => {
    if (timeRange !== 'week') return null;
    
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const weekSessions = studySessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startOfWeek;
    });

    // Initialize days of week (Monday = 1, Sunday = 0)
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayData = {};
    
    daysOfWeek.forEach((day, index) => {
      dayData[index] = {
        dayName: day,
        dayIndex: index,
        subjects: {},
        totalMinutes: 0
      };
    });

    // Group sessions by day and subject
    weekSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Convert to Monday-based (0 = Monday, 6 = Sunday)
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (dayData[mondayBasedDay]) {
        const subjectName = session.subjectName || 'Unknown';
        if (!dayData[mondayBasedDay].subjects[subjectName]) {
          dayData[mondayBasedDay].subjects[subjectName] = 0;
        }
        dayData[mondayBasedDay].subjects[subjectName] += session.durationMinutes || 0;
        dayData[mondayBasedDay].totalMinutes += session.durationMinutes || 0;
      }
    });

    // Convert to array and get all unique subjects for colors
    const allSubjects = new Set();
    Object.values(dayData).forEach(day => {
      Object.keys(day.subjects).forEach(subject => allSubjects.add(subject));
    });

    return {
      days: Object.values(dayData),
      subjects: Array.from(allSubjects),
      maxMinutes: Math.max(...Object.values(dayData).map(d => d.totalMinutes), 1)
    };
  };

  const weeklyStudyData = getWeeklyStudyByDay();

  // Monthly Study Time by Day and Subject (for compound bar graph)
  const getMonthlyStudyByDay = () => {
    if (timeRange !== 'month') return null;
    
    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
    const daysInMonth = endOfMonth.getDate();
    
    const monthSessions = studySessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
    });

    // Initialize all days of the month
    const dayData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dayData[day] = {
        dayNumber: day,
        subjects: {},
        totalMinutes: 0
      };
    }

    // Group sessions by day and subject
    monthSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const dayOfMonth = sessionDate.getDate();
      
      if (dayData[dayOfMonth]) {
        const subjectName = session.subjectName || 'Unknown';
        if (!dayData[dayOfMonth].subjects[subjectName]) {
          dayData[dayOfMonth].subjects[subjectName] = 0;
        }
        dayData[dayOfMonth].subjects[subjectName] += session.durationMinutes || 0;
        dayData[dayOfMonth].totalMinutes += session.durationMinutes || 0;
      }
    });

    // Convert to array and get all unique subjects for colors
    const allSubjects = new Set();
    Object.values(dayData).forEach(day => {
      Object.keys(day.subjects).forEach(subject => allSubjects.add(subject));
    });

    return {
      days: Object.values(dayData),
      subjects: Array.from(allSubjects),
      maxMinutes: Math.max(...Object.values(dayData).map(d => d.totalMinutes), 1),
      daysInMonth
    };
  };

  const monthlyStudyData = getMonthlyStudyByDay();

  // Subject Leaderboard (All Time)
  const getSubjectLeaderboard = () => {
    const leaderboard = {};
    
    // Calculate total time for each subject across all sessions
    studySessions.forEach(session => {
      if (!leaderboard[session.subjectName]) {
        leaderboard[session.subjectName] = 0;
      }
      leaderboard[session.subjectName] += session.durationMinutes;
    });
    
    // Convert to array and sort by total time (descending)
    return Object.entries(leaderboard)
      .map(([subjectName, totalMinutes]) => ({
        subjectName,
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60),
        totalMinutesRemaining: Math.round(totalMinutes % 60)
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  };

  const subjectLeaderboard = getSubjectLeaderboard();

  // Task Completion Rate
  const getTaskCompletionRate = () => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = getStartOfWeek(now);
        break;
      case 'month':
        startDate = getStartOfMonth(now);
        break;
      case 'all':
        return {
          total: tasks.length,
          completed: tasks.filter(t => t.done).length,
          rate: tasks.length > 0 ? (tasks.filter(t => t.done).length / tasks.length) * 100 : 0
        };
      default:
        startDate = getStartOfWeek(now);
    }
    
    const periodTasks = tasks.filter(task => {
      if (task.doneAt) {
        return new Date(task.doneAt) >= startDate;
      }
      return new Date(task.id) >= startDate; // Use creation time for pending tasks
    });
    
    return {
      total: periodTasks.length,
      completed: periodTasks.filter(t => t.done).length,
      rate: periodTasks.length > 0 ? (periodTasks.filter(t => t.done).length / periodTasks.length) * 100 : 0
    };
  };

  const taskStats = getTaskCompletionRate();

  // Study Consistency Score
  const getStudyConsistencyScore = () => {
    if (filteredSessions.length === 0) return 0;
    
    const studyDates = [...new Set(
      filteredSessions.map(session => 
        new Date(session.timestamp).toDateString()
      )
    )];
    
    let totalDays;
    switch (timeRange) {
      case 'week':
        totalDays = 7;
        break;
      case 'month':
        totalDays = 30;
        break;
      case 'all':
        totalDays = Math.max(studyDates.length, 1);
        break;
      default:
        totalDays = 7;
    }
    
    return (studyDates.length / totalDays) * 100;
  };

  const consistencyScore = getStudyConsistencyScore();

  // Streak History
  const getStreakHistory = () => {
    const studyDates = [...new Set(
      studySessions.map(session => 
        new Date(session.timestamp).toDateString()
      )
    )].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    
    // Calculate current streak
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      if (studyDates.includes(dateString)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (let i = 0; i < studyDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(studyDates[i - 1]);
        const currDate = new Date(studyDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  };

  const streakHistory = getStreakHistory();

  // Time of Day Heatmap
  const getTimeOfDayHeatmap = () => {
    const heatmap = Array(24).fill(0);
    filteredSessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      heatmap[hour]++;
    });
    return heatmap;
  };

  const timeHeatmap = getTimeOfDayHeatmap();

  // Time of Day Heatmap by Day of Week (for new card)
  const getTimeOfDayByDayHeatmap = () => {
    // Days of week: Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // 3-hour chunks: 0-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21, 21-24
    const timeChunks = [
      { label: '12am-3am', start: 0, end: 3 },
      { label: '3am-6am', start: 3, end: 6 },
      { label: '6am-9am', start: 6, end: 9 },
      { label: '9am-12pm', start: 9, end: 12 },
      { label: '12pm-3pm', start: 12, end: 15 },
      { label: '3pm-6pm', start: 15, end: 18 },
      { label: '6pm-9pm', start: 18, end: 21 },
      { label: '9pm-12am', start: 21, end: 24 }
    ];

    // Initialize heatmap data: [dayIndex][timeChunkIndex] = totalMinutes
    const heatmapData = Array(7).fill(null).map(() => Array(8).fill(0));

    filteredSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = sessionDate.getHours();
      const durationMinutes = session.durationMinutes || 0;

      // Find which time chunk this hour belongs to
      const chunkIndex = timeChunks.findIndex(chunk => hour >= chunk.start && hour < chunk.end);
      if (chunkIndex !== -1) {
        heatmapData[dayOfWeek][chunkIndex] += durationMinutes;
      }
    });

    // Find max value for normalization
    const maxValue = Math.max(...heatmapData.flat(), 1);

    return {
      data: heatmapData,
      daysOfWeek,
      timeChunks,
      maxValue
    };
  };

  const timeOfDayByDayHeatmap = getTimeOfDayByDayHeatmap();

  // Day of Week Breakdown
  const getDayOfWeekBreakdown = () => {
    const breakdown = Array(7).fill(0);
    filteredSessions.forEach(session => {
      const day = new Date(session.timestamp).getDay();
      breakdown[day] += session.durationMinutes;
    });
    return breakdown;
  };

  const dayBreakdown = getDayOfWeekBreakdown();

  // Upcoming Deadlines
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    return tasks.filter(task => 
      !task.done && task.scheduledDate && 
      new Date(task.scheduledDate) >= now && 
      new Date(task.scheduledDate) <= nextWeek
    ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  // Comparison to Previous Period
  const getComparisonToPrevious = () => {
    const now = new Date();
    let currentStartDate;
    
    switch (timeRange) {
      case 'week':
        currentStartDate = getStartOfWeek(now);
        break;
      case 'month':
        currentStartDate = getStartOfMonth(now);
        break;
      default:
        return { studyTimeChange: 0, sessionsChange: 0, tasksChange: 0 };
    }
    
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriod(currentStartDate, timeRange);
    
    const currentSessions = studySessions.filter(session => 
      new Date(session.timestamp) >= currentStartDate
    );
    const previousSessions = studySessions.filter(session => 
      new Date(session.timestamp) >= prevStartDate && new Date(session.timestamp) <= prevEndDate
    );
    
    const currentStudyTime = currentSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const previousStudyTime = previousSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    
    const currentTasks = tasks.filter(task => {
      if (task.doneAt) {
        return new Date(task.doneAt) >= currentStartDate;
      }
      return new Date(task.id) >= currentStartDate;
    });
    const previousTasks = tasks.filter(task => {
      if (task.doneAt) {
        return new Date(task.doneAt) >= prevStartDate && new Date(task.doneAt) <= prevEndDate;
      }
      return new Date(task.id) >= prevStartDate && new Date(task.id) <= prevEndDate;
    });
    
    return {
      studyTimeChange: previousStudyTime > 0 ? ((currentStudyTime - previousStudyTime) / previousStudyTime) * 100 : 0,
      sessionsChange: previousSessions.length > 0 ? ((currentSessions.length - previousSessions.length) / previousSessions.length) * 100 : 0,
      tasksChange: previousTasks.length > 0 ? ((currentTasks.filter(t => t.done).length - previousTasks.filter(t => t.done).length) / previousTasks.filter(t => t.done).length) * 100 : 0
    };
  };

  const comparison = getComparisonToPrevious();

  // Mood Trends
  const getMoodTrends = () => {
    const moodSessions = filteredSessions.filter(s => s.mood);
    if (moodSessions.length === 0) return null;
    
    const moodCounts = {
      great: 0,
      good: 0,
      okay: 0,
      struggled: 0
    };
    
    moodSessions.forEach(session => {
      moodCounts[session.mood]++;
    });
    
    return moodCounts;
  };

  const moodTrends = getMoodTrends();

  // Goal Progress
  const getGoalProgress = () => {
    const totalGoal = subjects.reduce((sum, subject) => sum + (subject.goalHours * 60), 0);
    return {
      current: totalStudyTime,
      goal: totalGoal,
      percentage: totalGoal > 0 ? (totalStudyTime / totalGoal) * 100 : 0
    };
  };

  const goalProgress = getGoalProgress();

  // Recent Reflections
  const getRecentReflections = () => {
    return filteredSessions
      .filter(session => session.reflection)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
  };

  const recentReflections = getRecentReflections();

  // Generate Suggestions
  const getSuggestions = () => {
    const suggestions = [];
    
    if (consistencyScore < 50) {
      suggestions.push("Try to study at least 4 days a week to build consistency");
    }
    
    if (averageSessionLength < 25) {
      suggestions.push("Consider longer study sessions for better focus and retention");
    }
    
    if (taskStats.rate < 70) {
      suggestions.push("Break down large tasks into smaller, manageable chunks");
    }
    
    if (streakHistory.currentStreak < 3) {
      suggestions.push("Start with shorter daily sessions to build your study habit");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Great job! Keep up the excellent study habits");
    }
    
    return suggestions;
  };

  const suggestions = getSuggestions();

  // Export functionality
  const exportInsights = () => {
    const insightsData = {
      timeRange,
      totalStudyTime,
      totalSessions,
      averageSessionLength,
      consistencyScore,
      taskStats,
      goalProgress,
      streakHistory,
      subjectTimeDistribution,
      date: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(insightsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-insights-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen mt-20 flex bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            className="mb-8 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">Study Insights</h1>
              <p className="text-purple-200/80 text-lg">Track your progress and discover your study patterns</p>
            </div>
            <motion.button
              onClick={exportInsights}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Export Data
            </motion.button>
          </motion.div>

      

          {/* Time Range Selector */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-2 bg-purple-900/30 backdrop-blur-md rounded-xl p-1 w-fit border border-purple-700/30">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' }
              ].map(range => (
                <motion.button
                  key={range.key}
                  onClick={() => setTimeRange(range.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    timeRange === range.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-purple-300 hover:text-purple-200'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {range.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all group cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-purple-400 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <h3 className="text-lg font-semibold text-white">Total Study Time</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(totalStudyTime / 60)}h {Math.round(totalStudyTime % 60)}m
              </div>
              <p className="text-purple-200/80 text-sm">{totalSessions} sessions</p>
              {comparison.studyTimeChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs mt-2 ${
                  comparison.studyTimeChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comparison.studyTimeChange > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {Math.abs(comparison.studyTimeChange).toFixed(1)}% vs previous
                </div>
              )}
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-pink-700/30 hover:border-pink-600/50 transition-all group cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-pink-400 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <h3 className="text-lg font-semibold text-white">Avg Session</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(averageSessionLength)}m
              </div>
              <p className="text-pink-200/80 text-sm">per session</p>
            </motion.div>

            {/* Compressed Subject Leaderboard */}
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all group cursor-pointer col-span-2"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                <h3 className="text-lg font-semibold text-white">Subject Leaderboard</h3>
              </div>
              {subjectLeaderboard.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {subjectLeaderboard.slice(0, 3).map((subject, index) => (
                    <motion.div
                      key={subject.subjectName}
                      className="flex items-center gap-2 p-3 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{subject.subjectName}</div>
                        <div className="text-purple-200/80 text-xs">
                          {subject.totalHours}h {subject.totalMinutesRemaining}m
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-purple-300/70 text-sm">No study data yet</div>
              )}
            </motion.div>
            </motion.div>

          {/* Weekly Study Time Compound Bar Graph */}
          {timeRange === 'week' && weeklyStudyData && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-400" />
                Daily Study Hours by Subject
              </h3>
              
              <div className="flex gap-6">
                {/* Graph Area */}
                <div className="flex-1">
                  {/* X-axis labels (hours) */}
                  <div className="flex justify-between mb-2 px-2">
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(hour => (
                      <div key={hour} className="text-xs text-purple-300/70">
                        {hour}h
              </div>
                    ))}
                  </div>
                  
                  {/* Graph Grid */}
                  <div className="relative" style={{ height: '420px' }}>
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex">
                      {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((hour, index) => (
                        <div
                          key={hour}
                          className="flex-1 border-l border-dashed border-purple-700/30"
                          style={{ 
                            borderLeftWidth: index === 0 ? '0px' : '1px',
                            marginLeft: index === 0 ? '0' : '-1px'
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Bars for each day */}
                    <div className="relative h-full flex flex-col justify-between gap-3 py-2">
                      {weeklyStudyData.days.map((day, dayIndex) => {
                        const totalHours = day.totalMinutes / 60;
                        const maxHours = Math.max(16, weeklyStudyData.maxMinutes / 60); // Cap at 16 hours for display
                        const barWidth = maxHours > 0 ? Math.min(100, (totalHours / maxHours) * 100) : 0;
                        
                        // Get subject segments
                        const subjectSegments = [];
                        let currentLeft = 0;
                        Object.entries(day.subjects).forEach(([subjectName, minutes]) => {
                          const subjectData = subjects.find(s => s.name === subjectName);
                          const subjectColor = subjectData?.color || '#6C5DD3';
                          const segmentWidth = day.totalMinutes > 0 ? (minutes / day.totalMinutes) * 100 : 0;
                          
                          subjectSegments.push({
                            subjectName,
                            minutes,
                            width: segmentWidth,
                            left: currentLeft,
                            color: subjectColor
                          });
                          
                          currentLeft += segmentWidth;
                        });

                        return (
                          <motion.div
                            key={day.dayName}
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: dayIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            {/* Day label */}
                            <div className="w-24 text-sm text-white font-medium text-right">
                              {day.dayName}
                            </div>
                            
                            {/* Bar container */}
                            <div className="flex-1 relative h-10 bg-purple-800/20 rounded-lg overflow-hidden border border-purple-700/30">
                              {day.totalMinutes > 0 ? (
                                <motion.div
                                  className="absolute left-0 top-0 h-full flex"
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${barWidth}%` }}
                                  transition={{ duration: 0.8, delay: dayIndex * 0.1 }}
                                  viewport={{ once: true }}
                                  style={{ maxWidth: '100%' }}
                                >
                                  {subjectSegments.map((segment, segIndex) => (
                                    <motion.div
                                      key={`${day.dayName}-${segment.subjectName}`}
                                      className="h-full relative group cursor-pointer"
                                      style={{
                                        width: `${segment.width}%`,
                                        backgroundColor: segment.color,
                                        opacity: 0.85
                                      }}
                                      initial={{ opacity: 0 }}
                                      whileInView={{ opacity: 0.85 }}
                                      transition={{ delay: dayIndex * 0.1 + segIndex * 0.05 }}
                                      viewport={{ once: true }}
                                      whileHover={{ opacity: 1, scale: 1.02 }}
                                    >
                                      {/* Tooltip on hover */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-purple-900/95 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        {segment.subjectName}: {Math.round(segment.minutes / 60)}h {Math.round(segment.minutes % 60)}m
                                      </div>
            </motion.div>
                                  ))}
          </motion.div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-purple-400/50 text-xs">
                                  No study
                                </div>
                              )}
                            </div>
                            
                            {/* Total time label */}
                            <div className="w-20 text-sm text-purple-300 text-right font-medium">
                              {day.totalMinutes > 0 ? (
                                <>
                                  {Math.round(day.totalMinutes / 60)}h {Math.round(day.totalMinutes % 60)}m
                                </>
                              ) : (
                                <span className="text-purple-400/50">—</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                {weeklyStudyData.subjects.length > 0 && (
                  <div className="w-56 bg-purple-800/20 rounded-lg p-4 border border-purple-700/30">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Subjects
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {weeklyStudyData.subjects.map((subjectName, index) => {
                        const subjectData = subjects.find(s => s.name === subjectName);
                        const subjectColor = subjectData?.color || '#6C5DD3';
                        const totalMinutes = weeklyStudyData.days.reduce((sum, day) => 
                          sum + (day.subjects[subjectName] || 0), 0
                        );
                        
                        return (
                          <motion.div
                            key={subjectName}
                            className="flex items-center gap-2 p-2 rounded hover:bg-purple-800/30 transition-colors"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div
                              className="w-4 h-4 rounded flex-shrink-0"
                              style={{ backgroundColor: subjectColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{subjectName}</div>
                              <div className="text-purple-300/70 text-xs">
                                {Math.round(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m total
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Monthly Study Time Compound Bar Graph */}
          {timeRange === 'month' && monthlyStudyData && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-purple-400" />
                Daily Study Hours by Subject (This Month)
              </h3>
              
              <div className="flex gap-6">
                {/* Graph Area */}
                <div className="flex-1">
                  {/* X-axis labels (hours) */}
                  <div className="flex justify-between mb-2 px-2">
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(hour => (
                      <div key={hour} className="text-xs text-purple-300/70">
                        {hour}h
                      </div>
                    ))}
                  </div>
                  
                  {/* Graph Grid - Scrollable for 31 days */}
                  <div className="relative max-h-[600px] overflow-y-auto overflow-x-hidden pr-2" style={{ scrollbarWidth: 'thin' }}>
                    <div className="relative" style={{ minHeight: `${monthlyStudyData.days.length * 24}px` }}>
                      {/* Vertical grid lines */}
                      <div className="absolute inset-0 flex">
                        {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((hour, index) => (
                          <div
                            key={hour}
                            className="flex-1 border-l border-dashed border-purple-700/30"
                            style={{ 
                              borderLeftWidth: index === 0 ? '0px' : '1px',
                              marginLeft: index === 0 ? '0' : '-1px'
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Bars for each day - smaller rows */}
                      <div className="relative flex flex-col gap-1 py-1">
                        {monthlyStudyData.days.map((day, dayIndex) => {
                          const totalHours = day.totalMinutes / 60;
                          const maxHours = Math.max(16, monthlyStudyData.maxMinutes / 60);
                          const barWidth = maxHours > 0 ? Math.min(100, (totalHours / maxHours) * 100) : 0;
                          
                          // Get subject segments
                          const subjectSegments = [];
                          let currentLeft = 0;
                          Object.entries(day.subjects).forEach(([subjectName, minutes]) => {
                            const subjectData = subjects.find(s => s.name === subjectName);
                            const subjectColor = subjectData?.color || '#6C5DD3';
                            const segmentWidth = day.totalMinutes > 0 ? (minutes / day.totalMinutes) * 100 : 0;
                            
                            subjectSegments.push({
                              subjectName,
                              minutes,
                              width: segmentWidth,
                              left: currentLeft,
                              color: subjectColor
                            });
                            
                            currentLeft += segmentWidth;
                          });

                          // Format date for label
                          const now = new Date();
                          const dayDate = new Date(now.getFullYear(), now.getMonth(), day.dayNumber);
                          const dayLabel = `${day.dayNumber}${day.dayNumber === 1 || day.dayNumber === 21 || day.dayNumber === 31 ? 'st' : day.dayNumber === 2 || day.dayNumber === 22 ? 'nd' : day.dayNumber === 3 || day.dayNumber === 23 ? 'rd' : 'th'}`;
                          const isToday = day.dayNumber === now.getDate() && now.getMonth() === dayDate.getMonth();

                          return (
                            <motion.div
                              key={day.dayNumber}
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: dayIndex * 0.02 }}
                              viewport={{ once: true }}
                            >
                              {/* Day label - smaller */}
                              <div className={`w-16 text-xs font-medium text-right ${isToday ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                                {dayLabel}
                              </div>
                              
                              {/* Bar container - smaller height */}
                              <div className="flex-1 relative h-5 bg-purple-800/20 rounded overflow-hidden border border-purple-700/30">
                                {day.totalMinutes > 0 ? (
                                  <motion.div
                                    className="absolute left-0 top-0 h-full flex"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.6, delay: dayIndex * 0.02 }}
                                    viewport={{ once: true }}
                                    style={{ maxWidth: '100%' }}
                                  >
                                    {subjectSegments.map((segment, segIndex) => (
                                      <motion.div
                                        key={`${day.dayNumber}-${segment.subjectName}`}
                                        className="h-full relative group cursor-pointer"
                                        style={{
                                          width: `${segment.width}%`,
                                          backgroundColor: segment.color,
                                          opacity: 0.85
                                        }}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 0.85 }}
                                        transition={{ delay: dayIndex * 0.02 + segIndex * 0.01 }}
                                        viewport={{ once: true }}
                                        whileHover={{ opacity: 1, scale: 1.05 }}
                                      >
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-purple-900/95 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                          {segment.subjectName}: {Math.round(segment.minutes / 60)}h {Math.round(segment.minutes % 60)}m
                                        </div>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-purple-400/50 text-[10px]">
                                    —
                                  </div>
                                )}
                              </div>
                              
                              {/* Total time label - smaller */}
                              <div className="w-16 text-xs text-purple-300 text-right">
                                {day.totalMinutes > 0 ? (
                                  <>
                                    {Math.round(day.totalMinutes / 60)}h {Math.round(day.totalMinutes % 60)}m
                                  </>
                                ) : (
                                  <span className="text-purple-400/50">—</span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                {monthlyStudyData.subjects.length > 0 && (
                  <div className="w-56 bg-purple-800/20 rounded-lg p-4 border border-purple-700/30">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Subjects
                    </h4>
                    <div className="space-y-2 max-h-[550px] overflow-y-auto">
                      {monthlyStudyData.subjects.map((subjectName, index) => {
                        const subjectData = subjects.find(s => s.name === subjectName);
                        const subjectColor = subjectData?.color || '#6C5DD3';
                        const totalMinutes = monthlyStudyData.days.reduce((sum, day) => 
                          sum + (day.subjects[subjectName] || 0), 0
                        );
                        
                        return (
                          <motion.div
                            key={subjectName}
                            className="flex items-center gap-2 p-2 rounded hover:bg-purple-800/30 transition-colors"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div
                              className="w-4 h-4 rounded flex-shrink-0"
                              style={{ backgroundColor: subjectColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{subjectName}</div>
                              <div className="text-purple-300/70 text-xs">
                                {Math.round(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m total
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Key Metrics Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Longest Session */}
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Longest Session
              </h3>
              {longestSession ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(longestSession.durationMinutes)} minutes
                  </div>
                  <div className="text-purple-200/80 space-y-1">
                    <div>Subject: {longestSession.subjectName}</div>
                    <div>Date: {new Date(longestSession.timestamp).toLocaleDateString()}</div>
                    {longestSession.task && <div>Task: {longestSession.task}</div>}
                  </div>
                </div>
              ) : (
                <div className="text-purple-300/70">No sessions recorded yet</div>
              )}
            </motion.div>

            {/* Study Consistency Score */}
            <motion.div
              className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-pink-700/30 hover:border-pink-600/50 transition-all"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Study Consistency
              </h3>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-white">
                  {consistencyScore.toFixed(1)}%
                </div>
                <div className="w-full bg-pink-500/20 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(consistencyScore, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="text-pink-200/80 text-sm">
                  Studied {Math.round(consistencyScore / 100 * (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365))} out of {timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365} days
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Subject Time Distribution with Pie Chart and Time of Day Heatmap */}
          <div className="mb-8 flex gap-8 flex-wrap lg:flex-nowrap">
          <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all flex-1 min-w-[300px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Subject Time Distribution
            </h3>
            
            {Object.keys(subjectTimeDistribution).length > 0 ? (
              <div className="flex gap-6 items-center">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {(() => {
                      const entries = Object.entries(subjectTimeDistribution);
                      const total = entries.reduce((sum, [, time]) => sum + time, 0);
                      
                      if (total === 0) {
                        return (
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="40"
                          />
                        );
                      }
                      
                      let currentAngle = -90; // Start from top (12 o'clock)
                      const angles = entries.map(([, time]) => {
                        const percentage = (time / total) * 100;
                        return percentage * 3.6; // Convert to degrees (percentage * 360 / 100)
                      });
                      
                      // Ensure angles sum to exactly 360 by adjusting the last one
                      const sumAngles = angles.reduce((sum, angle) => sum + angle, 0);
                      if (angles.length > 0) {
                        angles[angles.length - 1] += (360 - sumAngles);
                      }
                      
                      return (
                        <>
                          {/* Background circle */}
                          <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="40"
                          />
                          {/* Pie slices */}
                          {entries.map(([subject, time], index) => {
                const subjectData = subjects.find(s => s.name === subject);
                            const color = subjectData?.color || '#6C5DD3';
                            const angle = angles[index];
                            
                            // Calculate path for pie slice
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            
                            const x1 = 100 + 80 * Math.cos(startAngleRad);
                            const y1 = 100 + 80 * Math.sin(startAngleRad);
                            const x2 = 100 + 80 * Math.cos(endAngleRad);
                            const y2 = 100 + 80 * Math.sin(endAngleRad);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const pathData = [
                              `M 100 100`,
                              `L ${x1} ${y1}`,
                              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ');
                            
                            currentAngle += angle;

                return (
                              <motion.path
                    key={subject}
                                d={pathData}
                                fill={color}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                              />
                );
              })}
                        </>
                      );
                    })()}
                  </svg>
            </div>
                
                {/* Legend */}
                <div className="flex-1 space-y-2 max-h-[200px] overflow-y-auto">
                  {Object.entries(subjectTimeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([subject, time], index) => {
                const percentage = totalStudyTime > 0 ? (time / totalStudyTime) * 100 : 0;
                const subjectData = subjects.find(s => s.name === subject);
                      const color = subjectData?.color || '#6C5DD3';

                return (
                  <motion.div
                    key={subject}
                          className="flex items-center gap-3 p-2 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <div
                            className="w-4 h-4 rounded flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate">{subject}</div>
                            <div className="text-purple-200/80 text-xs">
                              {Math.round(time / 60)}h {Math.round(time % 60)}m ({percentage.toFixed(1)}%)
                        </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                <p className="text-purple-300/80 text-lg">No study data yet!</p>
                <p className="text-purple-300/60 text-sm">Complete study sessions to see distribution</p>
              </div>
            )}
          </motion.div>

          {/* Time of Day Heatmap Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all flex-1 min-w-[300px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Time of Day Heatmap
            </h3>
            
            {filteredSessions.length > 0 ? (
              <div className="flex gap-4">
                {/* Heatmap Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-8 gap-1">
                    {/* Day headers */}
                    <div className="col-span-8 grid grid-cols-7 gap-1 mb-1">
                      {timeOfDayByDayHeatmap.daysOfWeek.map((day, dayIndex) => (
                        <div key={day} className="text-xs text-purple-300/80 text-center font-medium">
                          {day}
                        </div>
                      ))}
                      </div>
                    
                    {/* Time chunks and heatmap cells */}
                    {timeOfDayByDayHeatmap.timeChunks.map((chunk, chunkIndex) => (
                      <React.Fragment key={chunkIndex}>
                        {/* Time chunk label */}
                        <div className="text-xs text-purple-300/80 text-right pr-2 flex items-center">
                          {chunk.label}
                    </div>
                        
                        {/* Heatmap cells for this time chunk */}
                        {timeOfDayByDayHeatmap.daysOfWeek.map((day, dayIndex) => {
                          const value = timeOfDayByDayHeatmap.data[dayIndex][chunkIndex];
                          const intensity = timeOfDayByDayHeatmap.maxValue > 0 
                            ? value / timeOfDayByDayHeatmap.maxValue 
                            : 0;
                          
                          // Gradient from purple to pink based on intensity
                          const r = Math.round(139 + (168 - 139) * intensity); // 139 (purple) to 168 (pink)
                          const g = Math.round(69 + (85 - 69) * intensity);   // 69 to 85
                          const b = 247; // Purple blue stays constant
                          const opacity = 0.3 + (0.9 - 0.3) * intensity; // 0.3 to 0.9
                          
                          return (
                        <motion.div
                              key={`${dayIndex}-${chunkIndex}`}
                              className="aspect-square rounded-sm border border-purple-700/20 group relative cursor-pointer"
                              style={{
                                backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (chunkIndex * 7 + dayIndex) * 0.01 }}
                              viewport={{ once: true }}
                              whileHover={{ scale: 1.1, zIndex: 10 }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-purple-900/95 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                {day}: {Math.round(value / 60)}h {Math.round(value % 60)}m
                    </div>
                  </motion.div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                {/* Gradient Legend */}
                <div className="w-8 flex flex-col items-center gap-2">
                  <div className="text-xs text-purple-300/80 font-medium mb-1">More</div>
                  <div className="flex-1 w-full rounded-lg overflow-hidden border border-purple-700/30">
                    {Array.from({ length: 20 }, (_, i) => {
                      const intensity = 1 - (i / 19); // 1 to 0
                      const r = Math.round(139 + (168 - 139) * intensity);
                      const g = Math.round(69 + (85 - 69) * intensity);
                      const b = 247;
                      const opacity = 0.3 + (0.9 - 0.3) * intensity;
                      
                      return (
                        <div
                          key={i}
                          className="w-full"
                          style={{
                            height: `${100 / 20}%`,
                            backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-purple-300/80 font-medium mt-1">Less</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                <p className="text-purple-300/80 text-lg">No study data yet!</p>
                <p className="text-purple-300/60 text-sm">Complete study sessions to see heatmap</p>
              </div>
            )}
          </motion.div>
          </div>

          {/* Subject Leaderboard */}
          

          

          {/* Mood Trends */}
          {moodTrends && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Mood Trends
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(moodTrends).map(([mood, count], index) => {
                  const emoji = {
                    great: '😄',
                    good: '🙂',
                    okay: '😐',
                    struggled: '😫'
                  }[mood];

                  return (
                    <motion.div
                      key={mood}
                      className="text-center p-4 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <motion.div
                        className="text-2xl mb-2"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        {emoji}
                      </motion.div>
                      <div className="text-white font-medium capitalize">{mood}</div>
                      <div className="text-purple-200/80 text-sm">{count} sessions</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Goal Progress */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TargetIcon className="w-5 h-5 text-purple-400" />
              Goal Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white">Weekly Goal Progress</span>
                <span className="text-white font-bold">{goalProgress.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-purple-500/20 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </div>
              <div className="text-purple-200/80 text-sm">
                {Math.round(goalProgress.current / 60)}h / {Math.round(goalProgress.goal / 60)}h
              </div>
            </div>
          </motion.div>

          {/* Recent Reflections */}
          {recentReflections.length > 0 && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Recent Reflections
              </h3>
              <div className="space-y-4">
                {recentReflections.map((session, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="text-purple-200/80 text-sm mb-2">
                      {new Date(session.timestamp).toLocaleDateString()} - {session.subjectName}
                    </div>
                    <div className="text-white italic">"{session.reflection}"</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {upcomingDeadlines.map((task, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-800/20 border border-red-700/30 hover:bg-red-800/40 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <div className="text-white font-medium">{task.name}</div>
                      <div className="text-purple-200/80 text-sm">{task.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-purple-200/80 text-xs">{task.time} min</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Personalized Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                  </motion.div>
                  <div className="text-white">{suggestion}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
