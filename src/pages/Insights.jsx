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

  return (
    <div className="min-h-screen mt-20 flex" style={{ backgroundImage: "linear-gradient(135deg, var(--study-from), var(--study-via), var(--study-to))" }}>>
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Study Insights</h1>
              <p className="text-gray-300">Track your progress and discover your study patterns</p>
            </div>
            <button
              onClick={exportInsights}
              className="flex items-center gap-2 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg hover:bg-[#7A6AD9] transition"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

      

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex gap-2 bg-white/5 rounded-lg p-1 w-fit">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'all', label: 'All Time' }
              ].map(range => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    timeRange === range.key
                      ? 'bg-[#6C5DD3] text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#6C5DD3]" />
                <h3 className="text-lg font-semibold text-white">Total Study Time</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(totalStudyTime / 60)}h {Math.round(totalStudyTime % 60)}m
              </div>
              <p className="text-gray-400 text-sm">{totalSessions} sessions</p>
              {comparison.studyTimeChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs mt-2 ${
                  comparison.studyTimeChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comparison.studyTimeChange > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {Math.abs(comparison.studyTimeChange).toFixed(1)}% vs previous
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[#FEC260]" />
                <h3 className="text-lg font-semibold text-white">Avg Session</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(averageSessionLength)}m
              </div>
              <p className="text-gray-400 text-sm">per session</p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-[#FF6B6B]" />
                <h3 className="text-lg font-semibold text-white">Current Streak</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{streakHistory.currentStreak}</div>
              <p className="text-gray-400 text-sm">days (best: {streakHistory.longestStreak})</p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-[#B6E4CF]" />
                <h3 className="text-lg font-semibold text-white">Task Completion</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{taskStats.rate.toFixed(1)}%</div>
              <p className="text-gray-400 text-sm">{taskStats.completed}/{taskStats.total} tasks</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Longest Session */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Longest Session
              </h3>
              {longestSession ? (
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(longestSession.durationMinutes)} minutes
                  </div>
                  <div className="text-gray-300">
                    <div>Subject: {longestSession.subjectName}</div>
                    <div>Date: {new Date(longestSession.timestamp).toLocaleDateString()}</div>
                    {longestSession.task && <div>Task: {longestSession.task}</div>}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No sessions recorded yet</div>
              )}
            </div>

            {/* Study Consistency Score */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Study Consistency
              </h3>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-white">
                  {consistencyScore.toFixed(1)}%
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-[#6C5DD3] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(consistencyScore, 100)}%` }}
                  />
                </div>
                <div className="text-gray-300 text-sm">
                  Studied {Math.round(consistencyScore / 100 * (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365))} out of {timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365} days
                </div>
              </div>
            </div>
          </div>

          {/* Subject Time Distribution */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Subject Time Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(subjectTimeDistribution).map(([subject, time]) => {
                const percentage = totalStudyTime > 0 ? (time / totalStudyTime) * 100 : 0;
                const subjectData = subjects.find(s => s.name === subject);
                
                return (
                  <div key={subject} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subjectData?.color || '#6C5DD3' }}
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{subject}</div>
                      <div className="text-gray-300 text-sm">{Math.round(time / 60)}h ({percentage.toFixed(1)}%)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Leaderboard */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Subject Leaderboard (All Time)
            </h3>
            {subjectLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {subjectLeaderboard.map((subject, index) => (
                  <div key={subject.subjectName} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#6C5DD3] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">{subject.subjectName}</div>
                        <div className="text-gray-300 text-sm">
                          {subject.totalHours}h {subject.totalMinutesRemaining}m total
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {index === 0 && (
                        <div className="flex items-center gap-2 text-[#FEC260] mb-1">
                          <Trophy className="w-5 h-5" />
                          <span className="text-sm font-medium">Top Studier</span>
                        </div>
                      )}
                      <div className="text-2xl font-bold text-white">
                        {subject.totalHours}h {subject.totalMinutesRemaining}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 text-lg">No study data yet!</p>
                <p className="text-gray-500 text-sm">Complete your first study session to see the leaderboard</p>
              </div>
            )}
          </div>

          {/* Study Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Time of Day Heatmap */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Time of Day Heatmap
              </h3>
              <div className="grid grid-cols-12 gap-1">
                {timeHeatmap.map((count, hour) => {
                  const maxCount = Math.max(...timeHeatmap);
                  const intensity = maxCount > 0 ? count / maxCount : 0;
                  
                  return (
                    <div key={hour} className="text-center">
                      <div className="text-xs text-gray-400 mb-1">{hour}</div>
                      <div 
                        className="w-full rounded transition-all duration-300"
                        style={{ 
                          height: '20px',
                          backgroundColor: `rgba(108, 93, 211, ${intensity})`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day of Week Breakdown */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Day of Week Breakdown
              </h3>
              <div className="space-y-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const time = dayBreakdown[index];
                  const maxTime = Math.max(...dayBreakdown);
                  const height = maxTime > 0 ? (time / maxTime) * 100 : 0;
                  
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-8 text-sm text-gray-300">{day}</div>
                      <div className="flex-1 bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-[#6C5DD3] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${height}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-300 text-right">
                        {Math.round(time / 60)}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mood Trends */}
          {moodTrends && (
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Mood Trends
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(moodTrends).map(([mood, count]) => {
                  const emoji = {
                    great: '😄',
                    good: '🙂',
                    okay: '😐',
                    struggled: '😫'
                  }[mood];
                  
                  return (
                    <div key={mood} className="text-center p-4 rounded-lg bg-white/5">
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="text-white font-medium capitalize">{mood}</div>
                      <div className="text-gray-300 text-sm">{count} sessions</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goal Progress */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TargetIcon className="w-5 h-5" />
              Goal Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white">Weekly Goal Progress</span>
                <span className="text-white font-bold">{goalProgress.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-[#6C5DD3] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                />
              </div>
              <div className="text-gray-300 text-sm">
                {Math.round(goalProgress.current / 60)}h / {Math.round(goalProgress.goal / 60)}h
              </div>
            </div>
          </div>

          {/* Recent Reflections */}
          {recentReflections.length > 0 && (
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Reflections
              </h3>
              <div className="space-y-4">
                {recentReflections.map((session, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5">
                    <div className="text-gray-300 text-sm mb-2">
                      {new Date(session.timestamp).toLocaleDateString()} - {session.subjectName}
                    </div>
                    <div className="text-white italic">"{session.reflection}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {upcomingDeadlines.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="text-white font-medium">{task.name}</div>
                      <div className="text-gray-300 text-sm">{task.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-300 text-xs">{task.time} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Personalized Suggestions
            </h3>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#6C5DD3]/10 border border-[#6C5DD3]/20">
                  <Lightbulb className="w-5 h-5 text-[#FEC260] mt-0.5" />
                  <div className="text-white">{suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
