// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import OnboardingModal from "../components/OnboardingModal";
import Skillpulse from "../components/Skillpulse";
import { FlameIcon } from "lucide-react";
import { fetchStudySessions, fetchUserSubjects, fetchUserTasks } from "../utils/supabaseDb";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
}

function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateStreak(studySessions) {
  if (!studySessions || studySessions.length === 0) {
    return 0;
  }

  // Get unique study dates (just the date part, not time)
  const studyDates = [...new Set(
    studySessions.map(session => 
      getStartOfDay(new Date(session.timestamp)).toISOString().split('T')[0]
    )
  )].sort();

  if (studyDates.length === 0) {
    return 0;
  }

  const today = getStartOfDay(new Date()).toISOString().split('T')[0];
  const yesterday = getStartOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  // Check if the student studied today or yesterday
  const hasStudiedRecently = studyDates.includes(today) || studyDates.includes(yesterday);
  
  if (!hasStudiedRecently) {
    return 0; // Streak is broken if they haven't studied today or yesterday
  }

  // Calculate consecutive days
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateString = getStartOfDay(currentDate).toISOString().split('T')[0];
    
    if (studyDates.includes(dateString)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Go back one day
    } else {
      break; // Streak broken
    }
  }

  return streak;
}


function QuoteRotator() {
  const quotes = [
  "You don't need to be motivated — just don't be lazy.",
  "Future you is watching right now. Don't embarrass them.",
  "Discipline > Motivation. Every. Single. Time.",
  "Some people are praying for the opportunities you're wasting.",
  "The work you do when no one's watching decides who you become.",
  "You can cry, but finish the assignment first.",
  "Looking at stats isn't studying.",
  "It's not that deep, just do it.",
  "All those times you said you would lock in, do it now.",
  "You're not behind, you're just early in your story.",
  "It's not a sprint. Nor a marathon. It's studying. Now work.",
  "Your 'I'll do it later' is your biggest opp.",
  "You don't need perfect music — just start.",
  "Six months of pure focus can change everything.",
  "Nobody cares how tired you are — show results.",
  "You've scrolled long enough to read this. Go revise.",
  "Your grades aren't gonna 'manifest' themselves.",
  "Crazy how you want A's but also 8 hours of TikTok.",
  "You're not overwhelmed, you're just avoiding it creatively.",
  "If you can overthink, you can overachieve.",
  "You don't need another study playlist — you need to start.",
  "You said 'I'll do it later'… three days ago.",
  "You have WiFi, coffee, and a brain. Use one of them.",
  "The exam doesn't care about your vibes.",
  "Every minute you waste is another panic attack in June.",
  "You're not stuck, you're just lazy with better excuses.",
  "Don't call it burnout if you never even lit the fire.",
  "Your laptop isn't broken — your discipline is.",
  "If procrastination was a subject, you'd ace it.",
  "Remember when you said you'd start early? Neither do I.",
];


  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 4000); // change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-8 flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 1.2 }}
          className="text-lg font-semibold text-white text-center"
        >
          {quotes[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function getCompletedTasksThisWeek(tasks) {
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  return tasks.filter(task => {
    return task.done && task.doneAt && task.doneAt >= oneWeekAgo;
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studyStats, setStudyStats] = useState({
    hoursThisWeek: 0,
    totalGoal: 0,
    progress: 0
  });
  const [streak, setStreak] = useState(0);
  const [completedTasksThisWeek, setCompletedTasksThisWeek] = useState(0);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Load subjects, study sessions, and tasks from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    const savedSessions = localStorage.getItem("studySessions");
    const savedTasks = localStorage.getItem("tasks");
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    
    if (savedSessions) {
      setStudySessions(JSON.parse(savedSessions));
    }
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Calculate study statistics, streak, and completed tasks
  useEffect(() => {
    const now = new Date();
    const weekStart = getStartOfWeek(now);
    
    // Calculate total goal from all subjects
    const totalGoal = subjects.reduce((sum, subject) => sum + (subject.goalHours || 0), 0);

    // Calculate actual hours studied this week
    const weekSessions = studySessions.filter(s => new Date(s.timestamp) >= weekStart);
    const minutesThisWeek = weekSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const hoursThisWeek = minutesThisWeek / 60;

    // Get accurate weekly statistics
    const accurateStats = getAccurateWeeklyStats(totalGoal);

    // Calculate streak
    const currentStreak = calculateStreak(studySessions);

    // Calculate completed tasks this week
    const completedTasks = getCompletedTasksThisWeek(tasks);

    setStudyStats({
      hoursThisWeek: accurateStats.hoursThisWeek,
      totalGoal,
      progress: accurateStats.progress
    });

    setStreak(currentStreak);
    setCompletedTasksThisWeek(completedTasks.length);
  }, [subjects, studySessions, tasks]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
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

  // Card component
  const Card = ({ title, icon, children, className = "", variant = "default" }) => {
    const variants = {
      default: "bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-700/30",
      pink: "bg-gradient-to-br from-pink-900/40 to-slate-900/40 border-pink-700/30",
      emerald: "bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border-emerald-700/30",
      orange: "bg-gradient-to-br from-orange-900/40 to-slate-900/40 border-orange-700/30"
    };

    return (
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        variants={itemVariants}
        className={`rounded-2xl p-6 border backdrop-blur-md shadow-xl transition-all ${variants[variant]} ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-purple-400 text-2xl">{icon}</div>}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {children}
      </motion.div>
    );
  };
  

  const getStreakMessage = (streakCount) => {
    if (streakCount === 0) return "Start your streak today!";
    if (streakCount === 1) return "Great start! Keep it up!";
    if (streakCount < 7) return "You're building momentum!";
    if (streakCount < 30) return "Impressive consistency!";
    return "You're on fire! 🔥";
  };

  const getCompletedTasksMessage = (count) => {
    if (count === 0) return "No tasks completed yet this week";
    if (count === 1) return "Great start! Keep going!";
    if (count < 5) return "You're making progress!";
    if (count < 10) return "Excellent productivity!";
    return "Outstanding work this week!";
  };

  // Calculate accurate weekly study statistics
  const getAccurateWeeklyStats = (goal) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekSessions = studySessions.filter(session =>
      new Date(session.timestamp) > oneWeekAgo
    );

    const thisWeekMinutes = thisWeekSessions.reduce((total, session) =>
      total + (session.durationMinutes || 0), 0
    );

    return {
      sessionsThisWeek: thisWeekSessions.length,
      hoursThisWeek: thisWeekMinutes / 60,
      progress: goal > 0 ? Math.min((thisWeekMinutes / 60 / goal) * 100, 100) : 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex">
      <OnboardingModal userId={user?.id} />

      {/* Main Content Container with Sidebar Offset */}
      <div className="flex-1 pl-16">
      {/* Main Content */}
      <div>
        {/* Header Section */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-md border-b border-purple-700/30 mt-20">
            <div>
              <h1>
              <QuoteRotator />
              </h1>
            </div>
        </div>

        {/* Summary & Streak */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8 bg-#F8F9FC">
          <Card title="This Week's Study">
            <span className="text-3xl font-bold text-white">{studyStats.hoursThisWeek.toFixed(1)} <small className="text-base font-normal text-gray-300">hrs</small></span>
            <div className="w-full bg-white/10 rounded-full h-3 my-3 overflow-hidden">
              <div className="bg-[#6C5DD3] h-3 rounded-full transition-all duration-300" style={{ width: `${studyStats.progress}%` }} />
            </div>
            <small className="block text-gray-300 mb-2">{Math.round(studyStats.progress)}% of your {studyStats.totalGoal.toFixed(1)} hr goal</small>
            {studyStats.progress >= 100 ? (
              <p className="text-[#B6E4CF] mt-2">🎯 Goal met!</p>
            ) : studyStats.progress >= 75 ? (
              <p className="text-[#FEC260] mt-2">Almost there!</p>
            ) : (
              <p className="text-[#FEC260] mt-2">Keep going!</p>
            )}
          </Card>
         

    
          <Card title="Streak" icon={null}>
            <div className="flex flex-col">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FlameIcon className={`w-7 h-7 ${streak > 0 ? 'text-orange-400' : 'text-gray-400'}`} />
                  <span className="text-3xl font-bold text-orange-400">{streak} <small className="text-base font-normal text-gray-300">days in a row</small></span>
                </div>
              </div>
              <div className="flex-1" />
              <p className="text-sm text-gray-300 mt-4">{getStreakMessage(streak)}</p>
            </div>
          </Card>
          <Card title="Tasks completed this week!" icon={null}>
            <div className="mb-6">
              <span className="block text-4xl font-extrabold text-white mb-2">{completedTasksThisWeek}</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{getCompletedTasksMessage(completedTasksThisWeek)}</p>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C5DD3] text-white font-semibold shadow hover:bg-[#7A6AD9] transition"
              onClick={() => navigate('/tasks')}
            >
              <span className="text-xl">🧠</span> Go to Tasks
            </button>
          </Card>
        </section>
        
        {/* Skillpulse */}
        <section className="px-6 py-8">
          <Skillpulse />
        </section>
        
        {/* Quick Access */}
        <motion.section
          className="px-6 py-8 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/subjects')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Subject
          </motion.button>
          <motion.button
            onClick={() => navigate('/tasks')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Task
          </motion.button>
          <motion.button
            onClick={() => navigate('/schedule')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Schedule tasks
          </motion.button>
        </motion.section>
      </div>
      </div>
    </div>
  );
}
