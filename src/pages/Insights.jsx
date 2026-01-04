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
  ChevronDown,
  Sparkles,
  Brain,
  Lock,
  BarChart2
} from 'lucide-react';
import AdSense from '../components/AdSense';
import { useSubscription } from '../context/SubscriptionContext';
import { useGamification } from '../context/GamificationContext';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  d.setDate(diff);
  return d;
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Get subscription and gamification data
  const { subscriptionPlan } = useSubscription();
  const isPremium = subscriptionPlan === 'professor';
  const { userStats } = useGamification();

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
  const totalStudyTime = filteredSessions.reduce((sum, session) => sum + (Number(session.durationMinutes) || 0), 0);
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
      distribution[session.subjectName] += (Number(session.durationMinutes) || 0);
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
        const sessionMinutes = Number(session.durationMinutes) || 0;
        dayData[mondayBasedDay].subjects[subjectName] += sessionMinutes;
        dayData[mondayBasedDay].totalMinutes += sessionMinutes;
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
        const sessionMinutes = Number(session.durationMinutes) || 0;
        dayData[dayOfMonth].subjects[subjectName] += sessionMinutes;
        dayData[dayOfMonth].totalMinutes += sessionMinutes;
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

  // Monthly Study Time by Day and Subject for All Time (with month selector)
  const getAllTimeMonthlyStudyByDay = () => {
    if (timeRange !== 'all') return null;
    
    // Parse selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, 1);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // Last day of month
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
        const sessionMinutes = Number(session.durationMinutes) || 0;
        dayData[dayOfMonth].subjects[subjectName] += sessionMinutes;
        dayData[dayOfMonth].totalMinutes += sessionMinutes;
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
      daysInMonth,
      month: selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  };

  const allTimeMonthlyStudyData = getAllTimeMonthlyStudyByDay();

  // Get available months from study sessions
  const getAvailableMonths = () => {
    const monthsSet = new Set();
    studySessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const year = sessionDate.getFullYear();
      const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
      monthsSet.add(`${year}-${month}`);
    });
    return Array.from(monthsSet).sort().reverse(); // Most recent first
  };

  const availableMonths = getAvailableMonths();

  // Subject Leaderboard (for selected timeframe)
  const getSubjectLeaderboard = () => {
    const leaderboard = {};
    
    // Calculate total time for each subject across filtered sessions (based on selected timeframe)
    filteredSessions.forEach(session => {
      if (!leaderboard[session.subjectName]) {
        leaderboard[session.subjectName] = 0;
      }
      leaderboard[session.subjectName] += (Number(session.durationMinutes) || 0);
    });
    
    // Convert to array and sort by total time (descending)
    return Object.entries(leaderboard)
      .map(([subjectName, totalMinutes]) => ({
        subjectName,
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
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

  // ========== ENHANCED ANALYTICS CALCULATIONS ==========

  // 1. Learning Velocity Tracker (FREE) - Calculate growth rate over time
  const getLearningVelocity = () => {
    if (studySessions.length < 3) return null;
    
    // Group sessions by week
    const sessionsByWeek = {};
    studySessions.forEach(session => {
      const date = new Date(session.timestamp);
      const weekStart = getStartOfWeek(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!sessionsByWeek[weekKey]) {
        sessionsByWeek[weekKey] = { 
          totalMinutes: 0, 
          sessions: 0, 
          totalXP: 0,
          avgSessionLength: 0
        };
      }
      sessionsByWeek[weekKey].totalMinutes += Number(session.durationMinutes) || 0;
      sessionsByWeek[weekKey].sessions += 1;
      sessionsByWeek[weekKey].totalXP += Number(session.xpEarned) || (Number(session.durationMinutes) || 0) * 10;
    });
    
    const weeks = Object.keys(sessionsByWeek).sort();
    
    // If only one week of data, we can't show velocity but we can show stats
    if (weeks.length < 2) return {
      velocities: [],
      avgVelocity: 0,
      trend: 'stable',
      currentWeek: weeks[0]
    };
    
    // Calculate velocity between consecutive weeks
    const velocities = [];
    for (let i = 1; i < weeks.length; i++) {
      const prev = sessionsByWeek[weeks[i - 1]];
      const curr = sessionsByWeek[weeks[i]];
      
      // Calculate percentage change
      const timeChange = prev.totalMinutes > 0 ? ((curr.totalMinutes - prev.totalMinutes) / prev.totalMinutes) * 100 : 0;
      const xpChange = prev.totalXP > 0 ? ((curr.totalXP - prev.totalXP) / prev.totalXP) * 100 : 0;
      const sessionChange = prev.sessions > 0 ? ((curr.sessions - prev.sessions) / prev.sessions) * 100 : 0;
      
      // Overall velocity (weighted average)
      const velocity = (timeChange * 0.4) + (xpChange * 0.4) + (sessionChange * 0.2);
      
      velocities.push({
        week: weeks[i],
        timeChange,
        xpChange,
        sessionChange,
        velocity,
        totalMinutes: curr.totalMinutes,
        totalXP: curr.totalXP
      });
    }
    
    const avgVelocity = velocities.length > 0 
      ? velocities.reduce((sum, v) => sum + v.velocity, 0) / velocities.length 
      : 0;
    
    return { 
      velocities: velocities.slice(-6), // Last 6 weeks
      avgVelocity, 
      trend: avgVelocity > 5 ? 'accelerating' : avgVelocity > 0 ? 'improving' : avgVelocity > -5 ? 'stable' : 'declining',
      currentWeek: weeks[weeks.length - 1]
    };
  };

  const learningVelocity = getLearningVelocity();

  // 2. Optimal Study Time Predictor (PREMIUM) - Find best hours to study
  const getOptimalStudyTimes = () => {
    if (!isPremium || studySessions.length < 3) return null;
    
    const hourPerformance = Array(24).fill(0).map((_, hour) => {
      const hourSessions = studySessions.filter(s => {
        const sessionHour = new Date(s.timestamp).getHours();
        return sessionHour === hour;
      });
      
      if (hourSessions.length === 0) return { hour, score: 0, sessions: 0, avgDuration: 0, avgXP: 0 };
      
      const avgDuration = hourSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0) / hourSessions.length;
      const avgXP = hourSessions.reduce((sum, s) => sum + (Number(s.xpEarned) || (Number(s.durationMinutes) || 0) * 10), 0) / hourSessions.length;
      const consistency = hourSessions.length / Math.max(1, studySessions.length / 24);
      const moodScore = hourSessions.filter(s => s.mood === 'great' || s.mood === 'good').length / hourSessions.length;
      
      // Score calculation: duration (40%), XP efficiency (30%), consistency (20%), mood (10%)
      const score = (avgDuration * 0.4) + (avgXP * 0.3) + (consistency * 30) + (moodScore * 20);
      
      return { hour, score, sessions: hourSessions.length, avgDuration, avgXP, consistency, moodScore };
    });
    
    const sorted = [...hourPerformance].sort((a, b) => b.score - a.score);
    const topTimes = sorted.filter(t => t.score > 0).slice(0, 3);
    
    return {
      topTimes,
      allTimes: hourPerformance,
      recommendation: topTimes.length > 0 ? topTimes[0].hour : 14,
      peakPerformance: topTimes.length > 0 ? topTimes[0].score : 0
    };
  };

  const optimalTimes = getOptimalStudyTimes();

  // 3. Performance Prediction Engine (PREMIUM) - Predict exam scores
  const getPerformancePrediction = () => {
    if (!isPremium || studySessions.length < 3) return null;
    
    // Use recent sessions for prediction
    const recentSessions = studySessions.slice(-20);
    
    const avgSessionLength = recentSessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0) / recentSessions.length;
    const avgXP = recentSessions.reduce((sum, s) => sum + (Number(s.xpEarned) || (Number(s.durationMinutes) || 0) * 10), 0) / recentSessions.length;
    
    // Calculate consistency based on last 14 days
    const studyDates = [...new Set(studySessions.map(s => new Date(s.timestamp).toDateString()))];
    const last14Days = Array.from({length: 14}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    });
    const daysStudied = last14Days.filter(d => studyDates.includes(d)).length;
    const consistency = daysStudied / 14;

    const streakBonus = Math.min((streakHistory.currentStreak || 0) / 30, 1);
    
    // Calculate subject diversity across all time
    const subjectsStudiedCount = Object.keys(
      studySessions.reduce((acc, s) => ({ ...acc, [s.subjectName]: true }), {})
    ).length;
    const diversityScore = Math.min(subjectsStudiedCount / 5, 1); // Max 5 subjects = 100%
    
    // Predict exam performance (0-100 scale)
    const baseScore = 50;
    const timeScore = Math.min((avgSessionLength / 60) * 15, 15); // Up to 15 points (1 hour = 15 pts)
    const xpScore = Math.min((avgXP / 100) * 10, 10); // Up to 10 points
    const consistencyScore_points = consistency * 15; // Up to 15 points
    const streakScore = streakBonus * 5; // Up to 5 points
    const diversityBonus = diversityScore * 5; // Up to 5 points
    
    const predictedScore = Math.min(100, baseScore + timeScore + xpScore + consistencyScore_points + streakScore + diversityBonus);
    
    // Calculate confidence based on data quality
    let confidence = 'low';
    if (studySessions.length >= 10 && consistency > 0.7) confidence = 'high';
    else if (studySessions.length >= 5 && consistency > 0.5) confidence = 'medium';
    
    return {
      predictedScore: Math.round(predictedScore),
      confidence,
      factors: {
        sessionLength: Math.round(timeScore),
        xpEarned: Math.round(xpScore),
        consistency: Math.round(consistencyScore_points),
        streak: Math.round(streakScore),
        diversity: Math.round(diversityBonus)
      },
      breakdown: {
        avgSessionLength: Math.round(avgSessionLength),
        avgXP: Math.round(avgXP),
        consistencyPercent: Math.round(consistency * 100),
        streakDays: streakHistory.currentStreak || 0,
        subjectsStudied: subjectsStudiedCount
      }
    };
  };

  const performancePrediction = getPerformancePrediction();

  // 4. Retention Rate Analyzer (PREMIUM) - Analyze memory retention patterns
  const getRetentionRate = () => {
    if (!isPremium || studySessions.length < 3) return null;
    
    // Group sessions by subject
    const sessionsBySubject = {};
    studySessions.forEach(session => {
      const subject = session.subjectName || 'Unknown';
      if (!sessionsBySubject[subject]) {
        sessionsBySubject[subject] = { sessions: [], totalTime: 0 };
      }
      sessionsBySubject[subject].sessions.push(session);
      sessionsBySubject[subject].totalTime += Number(session.durationMinutes) || 0;
    });
    
    const retentionData = Object.entries(sessionsBySubject)
      .map(([subject, data]) => {
        // Sort sessions by date
        const sortedSessions = data.sessions.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        // Calculate average spacing between sessions (in days)
        let avgSpacing = 0;
        if (sortedSessions.length > 1) {
          const spacings = [];
          for (let i = 1; i < sortedSessions.length; i++) {
            const spacing = (new Date(sortedSessions[i].timestamp) - new Date(sortedSessions[i - 1].timestamp)) / (1000 * 60 * 60 * 24);
            if (spacing > 0 && spacing < 30) { // Only count reasonable spacing (0-30 days)
              spacings.push(spacing);
            }
          }
          if (spacings.length > 0) {
            avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
          }
        }
        
        // Calculate retention score based on spacing (optimal: 1-3 days)
        let spacingScore = 0;
        if (avgSpacing > 0) {
          if (avgSpacing >= 1 && avgSpacing <= 3) spacingScore = 100; // Optimal
          else if (avgSpacing > 3 && avgSpacing <= 7) spacingScore = 75; // Good
          else if (avgSpacing > 0 && avgSpacing < 1) spacingScore = 60; // Too frequent
          else if (avgSpacing > 7 && avgSpacing <= 14) spacingScore = 50; // Fair
          else spacingScore = 30; // Poor (too spaced out)
        } else {
          // Single session: lower baseline retention score
          spacingScore = 40;
        }
        
        // Frequency score (more sessions = better, but with diminishing returns)
        const frequencyScore = Math.min((sortedSessions.length / 10) * 100, 100);
        
        // Calculate retention rate (weighted: spacing 60%, frequency 40%)
        const retentionRate = (spacingScore * 0.6) + (frequencyScore * 0.4);
        
        // Calculate recent activity (sessions in last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentSessions = sortedSessions.filter(s => new Date(s.timestamp) >= oneWeekAgo);
        
        return {
          subject,
          retentionRate: Math.round(retentionRate),
          avgSpacing: Math.round(avgSpacing * 10) / 10,
          sessionCount: sortedSessions.length,
          totalTime: data.totalTime,
          recentActivity: recentSessions.length,
          lastStudied: sortedSessions[sortedSessions.length - 1]?.timestamp
        };
      });
    
    return retentionData.sort((a, b) => b.retentionRate - a.retentionRate);
  };

  const retentionRate = getRetentionRate();

  // 5. Study Pattern Intelligence (PREMIUM) - Identify patterns and suggest improvements
  const getStudyPatterns = () => {
    if (!isPremium || studySessions.length < 3) return null;
    
    const patterns = {
      peakDays: [],
      peakHours: [],
      subjectBalance: 0,
      sessionLengthTrend: 'stable',
      timeDistribution: {},
      recommendations: []
    };
    
    // Find peak study days (0 = Sunday, 6 = Saturday)
    const dayCounts = Array(7).fill(0);
    const dayMinutes = Array(7).fill(0);
    studySessions.forEach(session => {
      const day = new Date(session.timestamp).getDay();
      dayCounts[day]++;
      dayMinutes[day] += Number(session.durationMinutes) || 0;
    });
    const maxDayMinutes = Math.max(...dayMinutes);
    patterns.peakDays = dayCounts.map((count, day) => ({
      day,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      count,
      minutes: dayMinutes[day],
      isPeak: dayMinutes[day] === maxDayMinutes && maxDayMinutes > 0
    }));
    
    // Find peak hours
    const hourCounts = Array(24).fill(0);
    const hourMinutes = Array(24).fill(0);
    studySessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourCounts[hour]++;
      hourMinutes[hour] += Number(session.durationMinutes) || 0;
    });
    const topHours = hourMinutes.map((minutes, hour) => ({ hour, minutes, count: hourCounts[hour] }))
      .sort((a, b) => b.minutes - a.minutes)
      .filter(h => h.minutes > 0)
      .slice(0, 3);
    patterns.peakHours = topHours;
    
    // Calculate subject balance (0-100, higher = more balanced)
    const subjectTimeAllTime = studySessions.reduce((acc, s) => {
      acc[s.subjectName] = (acc[s.subjectName] || 0) + (Number(s.durationMinutes) || 0);
      return acc;
    }, {});
    
    const subjectCounts = Object.values(subjectTimeAllTime);
    if (subjectCounts.length > 1) {
      const total = subjectCounts.reduce((sum, t) => sum + t, 0);
      const avg = total / subjectCounts.length;
      const variance = subjectCounts.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / subjectCounts.length;
      const stdDev = Math.sqrt(variance);
      // Lower stdDev relative to avg = more balanced
      patterns.subjectBalance = Math.max(0, 100 - Math.min(100, (stdDev / avg) * 100));
    } else if (subjectCounts.length === 1) {
      patterns.subjectBalance = 0; // Only one subject = not balanced
    } else {
      patterns.subjectBalance = 100; // No subjects = perfectly balanced (but not useful)
    }
    
    // Session length trend
    if (studySessions.length >= 6) {
      const recent = studySessions.slice(-3).reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0) / 3;
      const older = studySessions.slice(-6, -3).reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0) / 3;
      if (recent > older * 1.15) patterns.sessionLengthTrend = 'increasing';
      else if (recent < older * 0.85) patterns.sessionLengthTrend = 'decreasing';
      else patterns.sessionLengthTrend = 'stable';
    }
    
    // Time distribution (morning, afternoon, evening, night)
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    studySessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      const minutes = Number(session.durationMinutes) || 0;
      if (hour >= 6 && hour < 12) timeSlots.morning += minutes;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon += minutes;
      else if (hour >= 18 && hour < 22) timeSlots.evening += minutes;
      else timeSlots.night += minutes;
    });
    patterns.timeDistribution = timeSlots;
    
    // Generate intelligent recommendations
    if (patterns.subjectBalance < 50 && Object.keys(subjectTimeAllTime).length > 1) {
      patterns.recommendations.push('Focus on balancing time across all subjects for better overall performance');
    }
    if (averageSessionLength < 30 && studySessions.length > 0) {
      patterns.recommendations.push('Try longer study sessions (30+ min) for deeper learning and better retention');
    }
    if (consistencyScore < 60) {
      patterns.recommendations.push('Increase study frequency to improve consistency - aim for 4+ days per week');
    }
    if (patterns.peakHours.length > 0 && patterns.peakHours[0].hour < 8) {
      patterns.recommendations.push('You study best in the morning - schedule important topics during these hours');
    }
    if (patterns.sessionLengthTrend === 'decreasing') {
      patterns.recommendations.push('Your session lengths are decreasing - try to maintain longer focus periods');
    }
    if (patterns.recommendations.length === 0) {
      patterns.recommendations.push('Excellent study patterns! Keep up the great work!');
    }
    
    return patterns;
  };

  const studyPatterns = getStudyPatterns();

  // 6. Focus Score Analyzer (PREMIUM) - Measure session quality
  const getFocusScore = () => {
    if (!isPremium || filteredSessions.length < 1) return null;
    
    const sessions = filteredSessions.map(session => {
      const duration = session.durationMinutes || 0;
      const xp = session.xpEarned || (duration * 10); // Estimate XP if not available
      const difficulty = session.difficulty || 1.0;
      const mood = session.mood || 'neutral';
      
      // Calculate focus score (0-100)
      // Factors: duration (30%), XP efficiency (20%), difficulty (15%), mood (15%), consistency bonus (10%), exam verification (10%)
      const durationScore = Math.min((duration / 60) * 30, 30); // Up to 30 points (2 hours = max)
      const efficiencyScore = duration > 0 ? Math.min((xp / duration) * 2.0, 20) : 0; // Up to 20 points
      const difficultyScore = (difficulty - 1) * 7.5; // Up to 15 points
      const moodScores = { great: 15, good: 12, okay: 8, struggled: 5, neutral: 10 };
      const moodScore = moodScores[mood] || 10;
      const consistencyBonus = consistencyScore > 70 ? 10 : consistencyScore > 50 ? 5 : 0;
      
      // AI Verification Bonus - Based on linked mock exam score
      let verificationBonus = 0;
      if (session.mockExamScore !== undefined) {
        // Linear scale: 0 score = 0 bonus, 100 score = 10 bonus
        verificationBonus = (session.mockExamScore / 100) * 10;
      } else {
        // Small default if no exam taken, to not penalize
        verificationBonus = 5;
      }
      
      const focusScore = Math.min(100, durationScore + efficiencyScore + difficultyScore + moodScore + consistencyBonus + verificationBonus);
      
      return {
        timestamp: session.timestamp,
        focusScore: Math.round(focusScore),
        duration,
        xp,
        subject: session.subjectName,
        mood,
        difficulty,
        verified: session.mockExamScore !== undefined,
        examScore: session.mockExamScore
      };
    });
    
    const avgFocusScore = sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length;
    
    // Calculate trend
    let trend = 'stable';
    if (sessions.length >= 4) {
      const recent = sessions.slice(0, Math.floor(sessions.length / 2)).reduce((sum, s) => sum + s.focusScore, 0) / Math.floor(sessions.length / 2);
      const older = sessions.slice(Math.floor(sessions.length / 2)).reduce((sum, s) => sum + s.focusScore, 0) / Math.ceil(sessions.length / 2);
      if (recent > older * 1.1) trend = 'improving';
      else if (recent < older * 0.9) trend = 'declining';
    }
    
    // Distribution
    const distribution = {
      excellent: sessions.filter(s => s.focusScore >= 80).length,
      good: sessions.filter(s => s.focusScore >= 60 && s.focusScore < 80).length,
      fair: sessions.filter(s => s.focusScore >= 40 && s.focusScore < 60).length,
      poor: sessions.filter(s => s.focusScore < 40).length
    };
    
    return {
      average: Math.round(avgFocusScore),
      trend,
      sessions: sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10),
      distribution,
      bestSession: sessions.reduce((best, s) => s.focusScore > best.focusScore ? s : best, sessions[0]),
      improvement: sessions.length >= 2 ? sessions[0].focusScore - sessions[sessions.length - 1].focusScore : 0
    };
  };

  const focusScore = getFocusScore();

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
    hidden: { scale: 1 },
    visible: {
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30 },
    visible: {
      y: 0,
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
            initial={{ y: -20 }}
            animate={{ y: 0 }}
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
            initial={{ y: 20 }}
            animate={{ y: 0 }}
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
                {Math.floor(totalStudyTime / 60)}h {Math.round(totalStudyTime % 60)}m
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
                  <div className="flex justify-between mb-2">
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
                                        {segment.subjectName}: {Math.floor(segment.minutes / 60)}h {Math.round(segment.minutes % 60)}m
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
                                  {Math.floor(day.totalMinutes / 60)}h {Math.round(day.totalMinutes % 60)}m
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
                                {Math.floor(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m total
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
                  <div className="flex justify-between mb-2">
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
                                          {segment.subjectName}: {Math.floor(segment.minutes / 60)}h {Math.round(segment.minutes % 60)}m
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
                                    {Math.floor(day.totalMinutes / 60)}h {Math.round(day.totalMinutes % 60)}m
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
                                {Math.floor(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m total
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

          {/* All Time Monthly Study Time Compound Bar Graph */}
          {timeRange === 'all' && allTimeMonthlyStudyData && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-purple-400" />
                  Daily Study Hours by Subject
                </h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-purple-300">Select Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 bg-purple-800/40 border border-purple-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-purple-800/60 transition-colors"
                  >
                    {availableMonths.map(month => {
                      const [year, monthNum] = month.split('-');
                      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                      return (
                        <option key={month} value={month}>
                          {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-6">
                {/* Graph Area */}
                <div className="flex-1">
                  {/* X-axis labels (hours) */}
                  <div className="flex justify-between mb-2">
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(hour => (
                      <div key={hour} className="text-xs text-purple-300/70">
                        {hour}h
                      </div>
                    ))}
                  </div>
                  
                  {/* Graph Grid - Scrollable for 31 days */}
                  <div className="relative max-h-[600px] overflow-y-auto overflow-x-hidden pr-2" style={{ scrollbarWidth: 'thin' }}>
                    <div className="relative" style={{ minHeight: `${allTimeMonthlyStudyData.days.length * 24}px` }}>
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
                        {allTimeMonthlyStudyData.days.map((day, dayIndex) => {
                          const totalHours = day.totalMinutes / 60;
                          const maxHours = Math.max(16, allTimeMonthlyStudyData.maxMinutes / 60);
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
                          const [year, monthNum] = selectedMonth.split('-').map(Number);
                          const dayDate = new Date(year, monthNum - 1, day.dayNumber);
                          const dayLabel = `${day.dayNumber}${day.dayNumber === 1 || day.dayNumber === 21 || day.dayNumber === 31 ? 'st' : day.dayNumber === 2 || day.dayNumber === 22 ? 'nd' : day.dayNumber === 3 || day.dayNumber === 23 ? 'rd' : 'th'}`;
                          const now = new Date();
                          const isToday = day.dayNumber === now.getDate() && 
                                         monthNum === now.getMonth() + 1 && 
                                         year === now.getFullYear();

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
                                          {segment.subjectName}: {Math.floor(segment.minutes / 60)}h {Math.round(segment.minutes % 60)}m
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
                                    {Math.floor(day.totalMinutes / 60)}h {Math.round(day.totalMinutes % 60)}m
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
                {allTimeMonthlyStudyData.subjects.length > 0 && (
                  <div className="w-56 bg-purple-800/20 rounded-lg p-4 border border-purple-700/30">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Subjects
                    </h4>
                    <div className="space-y-2 max-h-[550px] overflow-y-auto">
                      {allTimeMonthlyStudyData.subjects.map((subjectName, index) => {
                        const subjectData = subjects.find(s => s.name === subjectName);
                        const subjectColor = subjectData?.color || '#6C5DD3';
                        const totalMinutes = allTimeMonthlyStudyData.days.reduce((sum, day) => 
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
                                {Math.floor(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m total
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
              className="bg-gradient-to-br from-slate-900/90 to-purple-900/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all flex-1 min-w-[350px] shadow-2xl overflow-hidden relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-400" />
              </div>
              Subject Time Distribution
            </h3>
            
            {Object.keys(subjectTimeDistribution).length > 0 ? (
              <div className="flex flex-col gap-8 items-center relative z-10">
                {/* Multi-Ring Concentric Chart - Slightly Smaller */}
                <div className="relative w-full max-w-[300px] aspect-square flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const entries = Object.entries(subjectTimeDistribution)
                        .sort(([, a], [, b]) => b - a);
                      const topEntries = entries.slice(0, 5);
                      const total = entries.reduce((sum, [, time]) => sum + time, 0);
                      
                      const radii = [42, 34, 26, 18, 10];
                      const strokeWidth = 6;

                      return (
                        <>
                          {/* Background Rings */}
                          {radii.map((r, i) => (
                            <circle
                              key={`bg-${i}`}
                              cx="50"
                              cy="50"
                              r={r}
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.03)"
                              strokeWidth={strokeWidth}
                            />
                          ))}
                          
                          {/* Progress Rings */}
                          {topEntries.map(([subject, time], index) => {
                            const subjectData = subjects.find(s => s.name === subject);
                            const color = subjectData?.color || '#6C5DD3';
                            const percentage = (time / total);
                            const r = radii[index];
                            const circumference = 2 * Math.PI * r;
                            
                            return (
                              <motion.circle
                                key={subject}
                                cx="50"
                                cy="50"
                                r={r}
                                fill="none"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                whileInView={{ strokeDashoffset: circumference * (1 - percentage) }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                                strokeLinecap="round"
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Center Content - Scaled for smaller size */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="bg-slate-900/50 backdrop-blur-md p-4 sm:p-5 rounded-full border border-white/10 flex flex-col items-center shadow-inner">
                      <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                        {Math.floor(totalStudyTime / 60)}h
                      </div>
                      <div className="text-[10px] font-black text-purple-300/60 uppercase tracking-[0.3em] mt-1">
                        Total
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend with Enhanced Info - Grid Layout Below */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(subjectTimeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([subject, time], index) => {
                      const percentage = totalStudyTime > 0 ? (time / totalStudyTime) * 100 : 0;
                      const subjectData = subjects.find(s => s.name === subject);
                      const color = subjectData?.color || '#6C5DD3';

                      return (
                        <motion.div
                          key={subject}
                          className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group relative overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div 
                            className="w-1.5 h-12 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-bold text-sm truncate uppercase tracking-tight">{subject}</span>
                              <span className="text-white font-black text-xs">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                              <span className="text-purple-200/40 text-[10px] font-bold whitespace-nowrap">
                                {Math.floor(time / 60)}h {Math.round(time % 60)}m
                              </span>
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
                                {day}: {Math.floor(value / 60)}h {Math.round(value % 60)}m
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
                {Math.floor(goalProgress.current / 60)}h / {Math.floor(goalProgress.goal / 60)}h
              </div>
            </div>
          </motion.div>

          {/* Enhanced Analytics Section */}
          <div className="mb-8">
            {/* Section Header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                    Enhanced Analytics
                  </h2>
                  <p className="text-purple-200/80 text-lg">
                    Advanced insights designed for <span className="font-bold text-yellow-400">86.1% more productivity</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. Learning Velocity Tracker (FREE) */}
              <motion.div
                className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-green-500/50 hover:border-green-400/70 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Free Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-400/50 rounded-full text-xs font-semibold text-green-300">
                  FREE
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Learning Velocity Tracker</h3>
                    <p className="text-green-200/70 text-sm">Track your learning speed over time</p>
                  </div>
                </div>
                
                {learningVelocity ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-800/20 rounded-xl border border-green-700/30">
                      <div className="text-4xl font-bold text-white mb-2">
                        {learningVelocity.avgVelocity > 0 ? '+' : ''}{learningVelocity.avgVelocity.toFixed(1)}%
                      </div>
                      <div className="text-green-200/80 text-sm mb-2">
                        Average weekly growth rate
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        learningVelocity.trend === 'accelerating' ? 'bg-green-500/20 text-green-300' :
                        learningVelocity.trend === 'improving' ? 'bg-blue-500/20 text-blue-300' :
                        learningVelocity.trend === 'stable' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {learningVelocity.trend.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-white mb-2">Recent Velocity Trends</div>
                      {learningVelocity.velocities.slice(-4).reverse().map((v, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-2 bg-green-800/10 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <span className="text-green-200/80 text-xs">Week {learningVelocity.velocities.length - index}</span>
                          <span className={`font-semibold ${v.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {v.velocity > 0 ? '+' : ''}{v.velocity.toFixed(1)}%
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-200/60">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more study sessions to track learning velocity</p>
                    <p className="text-xs mt-2">Need at least 3 sessions total</p>
                  </div>
                )}
              </motion.div>

              {/* 2. Optimal Study Time Predictor (PREMIUM) */}
              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-700/30 hover:border-purple-600/50 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => !isPremium && setShowPremiumModal(true)}
                style={{ cursor: !isPremium ? 'pointer' : 'default' }}
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-white font-semibold mb-2">Premium Feature</div>
                      <div className="text-purple-200/80 text-sm">Unlock to discover your optimal study times</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Optimal Study Time Predictor</h3>
                    <p className="text-purple-200/70 text-sm">AI-powered best times to study</p>
                  </div>
                </div>
                
                {isPremium && optimalTimes && optimalTimes.topTimes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-purple-800/20 rounded-xl border border-purple-700/30">
                      <div className="text-3xl font-bold text-white mb-2">
                        {optimalTimes.recommendation}:00
                      </div>
                      <div className="text-purple-200/80 text-sm">
                        Your peak performance hour
                      </div>
                      <div className="text-xs text-purple-300/70 mt-1">
                        Score: {Math.round(optimalTimes.peakPerformance)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-white mb-2">Top 3 Study Times</div>
                      {optimalTimes.topTimes.map((time, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-3 bg-purple-800/10 rounded-lg border border-purple-700/20"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-white font-medium">{time.hour}:00</div>
                              <div className="text-purple-200/70 text-xs">{time.sessions} sessions</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-purple-300 font-semibold">{Math.round(time.avgDuration)}m avg</div>
                            <div className="text-purple-200/60 text-xs">{Math.round(time.avgXP)} XP</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : isPremium ? (
                  <div className="text-center py-8 text-purple-200/60">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more sessions to predict optimal times</p>
                    <p className="text-xs mt-2">Need at least 3 sessions total</p>
                  </div>
                ) : null}
              </motion.div>

              {/* 3. Performance Prediction Engine (PREMIUM) */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-700/30 hover:border-blue-600/50 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => !isPremium && setShowPremiumModal(true)}
                style={{ cursor: !isPremium ? 'pointer' : 'default' }}
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-white font-semibold mb-2">Premium Feature</div>
                      <div className="text-purple-200/80 text-sm">Unlock to predict your exam performance</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Performance Prediction Engine</h3>
                    <p className="text-blue-200/70 text-sm">AI predicts your exam scores</p>
                  </div>
                </div>
                
                {isPremium && performancePrediction ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-800/20 rounded-xl border border-blue-700/30">
                      <div className="text-5xl font-bold text-white mb-2">
                        {performancePrediction.predictedScore}%
                      </div>
                      <div className="text-blue-200/80 text-sm mb-2">
                        Predicted Exam Score
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        performancePrediction.confidence === 'high' ? 'bg-green-500/20 text-green-300' :
                        performancePrediction.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {performancePrediction.confidence.toUpperCase()} Confidence
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-white mb-2">Score Breakdown</div>
                      {Object.entries(performancePrediction.factors).map(([factor, points], index) => (
                        <motion.div
                          key={factor}
                          className="flex items-center justify-between p-2 bg-blue-800/10 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <span className="text-blue-200/80 text-xs capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-blue-300 font-semibold">+{points} pts</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t border-blue-700/30">
                      <div className="text-xs text-blue-200/70 space-y-1">
                        <div>Avg Session: {performancePrediction.breakdown.avgSessionLength}m</div>
                        <div>Subjects: {performancePrediction.breakdown.subjectsStudied}</div>
                        <div>Consistency: {performancePrediction.breakdown.consistencyPercent}%</div>
                      </div>
                    </div>
                  </div>
                ) : isPremium ? (
                  <div className="text-center py-8 text-blue-200/60">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more sessions for accurate predictions</p>
                    <p className="text-xs mt-2">Need at least 3 sessions total</p>
                  </div>
                ) : null}
              </motion.div>

              {/* 4. Retention Rate Analyzer (PREMIUM) */}
              <motion.div
                className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-pink-700/30 hover:border-pink-600/50 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => !isPremium && setShowPremiumModal(true)}
                style={{ cursor: !isPremium ? 'pointer' : 'default' }}
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-white font-semibold mb-2">Premium Feature</div>
                      <div className="text-purple-200/80 text-sm">Unlock to analyze memory retention</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Retention Rate Analyzer</h3>
                    <p className="text-pink-200/70 text-sm">Track memory retention by subject</p>
                  </div>
                </div>
                
                {isPremium && retentionRate && retentionRate.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {retentionRate.slice(0, 5).map((subject, index) => (
                        <motion.div
                          key={subject.subject}
                          className="p-3 bg-pink-800/10 rounded-lg border border-pink-700/20"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium text-sm truncate">{subject.subject}</span>
                            <span className="text-pink-300 font-bold">{subject.retentionRate}%</span>
                          </div>
                          <div className="w-full bg-pink-500/20 rounded-full h-2 mb-2">
                            <motion.div
                              className="bg-gradient-to-r from-pink-400 to-rose-400 h-2 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${subject.retentionRate}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              viewport={{ once: true }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-pink-200/70">
                            <span>{subject.sessionCount} sessions</span>
                            <span>Spacing: {subject.avgSpacing}d</span>
                            {subject.recentActivity > 0 && (
                              <span className="text-green-300">{subject.recentActivity} this week</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : isPremium ? (
                  <div className="text-center py-8 text-pink-200/60">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Study more to analyze retention</p>
                    <p className="text-xs mt-2">Need at least 3 sessions total</p>
                  </div>
                ) : null}
              </motion.div>

              {/* 5. Study Pattern Intelligence (PREMIUM) */}
              <motion.div
                className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-amber-700/30 hover:border-amber-600/50 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => !isPremium && setShowPremiumModal(true)}
                style={{ cursor: !isPremium ? 'pointer' : 'default' }}
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-white font-semibold mb-2">Premium Feature</div>
                      <div className="text-purple-200/80 text-sm">Unlock intelligent pattern analysis</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Study Pattern Intelligence</h3>
                    <p className="text-amber-200/70 text-sm">AI-powered pattern recognition</p>
                  </div>
                </div>
                
                {isPremium && studyPatterns ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-amber-800/20 rounded-lg border border-amber-700/30">
                        <div className="text-2xl font-bold text-white">{Math.round(studyPatterns.subjectBalance)}%</div>
                        <div className="text-amber-200/70 text-xs">Subject Balance</div>
                      </div>
                      <div className="p-3 bg-amber-800/20 rounded-lg border border-amber-700/30">
                        <div className="text-lg font-bold text-white capitalize">{studyPatterns.sessionLengthTrend}</div>
                        <div className="text-amber-200/70 text-xs">Session Trend</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-white mb-2">Peak Study Hours</div>
                      <div className="flex gap-2">
                        {studyPatterns.peakHours.map((hour, index) => (
                          <div key={index} className="flex-1 p-2 bg-amber-800/10 rounded-lg border border-amber-700/20 text-center">
                            <div className="text-white font-semibold">{hour.hour}:00</div>
                            <div className="text-amber-200/70 text-xs">{hour.count} sessions</div>
                            <div className="text-amber-200/60 text-xs">{Math.round(hour.minutes / 60)}h</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {studyPatterns.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-white mb-2">AI Recommendations</div>
                        {studyPatterns.recommendations.map((rec, index) => (
                          <motion.div
                            key={index}
                            className="p-2 bg-amber-800/10 rounded-lg border border-amber-700/20 text-amber-200/80 text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                          >
                            • {rec}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : isPremium ? (
                  <div className="text-center py-8 text-amber-200/60">
                    <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more sessions to analyze patterns</p>
                    <p className="text-xs mt-2">Need at least 3 sessions total</p>
                  </div>
                ) : null}
              </motion.div>

              {/* 6. Focus Score Analyzer (PREMIUM) */}
              <motion.div
                className="bg-gradient-to-br from-cyan-900/40 to-teal-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-700/30 hover:border-cyan-600/50 transition-all relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => !isPremium && setShowPremiumModal(true)}
                style={{ cursor: !isPremium ? 'pointer' : 'default' }}
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <div className="text-white font-semibold mb-2">Premium Feature</div>
                      <div className="text-purple-200/80 text-sm">Unlock advanced focus analysis</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Focus Score Analyzer</h3>
                    <p className="text-cyan-200/70 text-sm">Measure session quality & focus</p>
                  </div>
                </div>
                
                {isPremium && focusScore ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-cyan-800/20 rounded-xl border border-cyan-700/30">
                      <div className="text-5xl font-bold text-white mb-2">
                        {focusScore.average}
                      </div>
                      <div className="text-cyan-200/80 text-sm mb-2">
                        Average Focus Score
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        focusScore.trend === 'improving' ? 'bg-green-500/20 text-green-300' :
                        focusScore.trend === 'declining' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {focusScore.trend.toUpperCase()}
                      </div>
                      {focusScore.bestSession && (
                        <div className="text-xs text-cyan-200/70 mt-2">
                          Best: {focusScore.bestSession.focusScore} ({focusScore.bestSession.subject})
                          {focusScore.bestSession.verified && <span className="ml-1 text-cyan-400">✓ AI Verified</span>}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(focusScore.distribution).map(([level, count], index) => (
                        <motion.div
                          key={level}
                          className="p-2 bg-cyan-800/10 rounded-lg border border-cyan-700/20 text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="text-white font-bold text-lg">{count}</div>
                          <div className="text-cyan-200/70 text-xs capitalize">{level}</div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-xs text-cyan-200/60 border-b border-cyan-700/20 pb-1">
                        <span>Recent AI Validations</span>
                        <span>Score</span>
                      </div>
                      {focusScore.sessions.filter(s => s.verified).slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-white/80">
                            <span className="text-cyan-400 mr-1">✓</span>
                            {s.subject}
                          </span>
                          <span className="text-cyan-300 font-bold">{s.examScore}%</span>
                        </div>
                      ))}
                      {focusScore.sessions.filter(s => s.verified).length === 0 && (
                        <p className="text-[9px] text-white/30 italic text-center">No verified sessions yet</p>
                      )}
                    </div>
                  </div>
                ) : isPremium ? (
                  <div className="text-center py-8 text-cyan-200/60">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete sessions to analyze focus scores</p>
                    <p className="text-xs mt-2">Need at least 1 session</p>
                  </div>
                ) : null}
              </motion.div>
            </div>
          </div>

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

          {/* Premium Upgrade Modal */}
          <PremiumUpgradeModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
          />
        </div>
      </div>
    </div>
  );
}
