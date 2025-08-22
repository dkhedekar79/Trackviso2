// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import TimerCard from "../components/TimerCard";
import { FlameIcon, CheckCircle, Clock, XCircle, Trash2, Calendar, BookOpen, Zap } from "lucide-react";

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

function getTaskStatusIcon(task) {
  if (task.done) {
    return <CheckCircle className="w-4 h-4 text-[#B6E4CF]" />;
  }
  
  if (task.scheduledDate) {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0];
    
    if (taskDate < today) {
      return <XCircle className="w-4 h-4 text-red-500" />; // Overdue
    } else if (taskDate === today) {
      return <Clock className="w-4 h-4 text-[#FEC260]" />; // Due today
    }
  }
  
  return <Clock className="w-4 h-4 text-gray-400" />; // No date set
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
    const accurateStats = getAccurateWeeklyStats();

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

  // Get today's tasks
  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0];
      return taskDate === today;
    }).slice(0, 5); // Show max 5 tasks
  };

  const todaysTasks = getTodaysTasks();

  // Delete study session
  const deleteStudySession = (index) => {
    const updatedSessions = studySessions.filter((_, i) => i !== index);
    setStudySessions(updatedSessions);
    localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
  };

  // Card component
  const Card = ({ title, icon, children, className = "" }) => (
    <motion.div
      whileHover={{ scale: 1.015 }}
      className={`rounded-xl bg-white/5 p-5 border border-white/10 backdrop-blur shadow-xl ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-purple-400 text-2xl">{icon}</div>}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );

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
  const getAccurateWeeklyStats = () => {
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
      progress: totalGoal > 0 ? Math.min((thisWeekMinutes / 60 / totalGoal) * 100, 100) : 0
    };
  };

  return (
     
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] mt-20 flex">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        {/* Header Section */}
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
        {/* Today's Tasks & Timer */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-8">
          <Card title="Today's Tasks" icon={"📘"}>
            <div className="space-y-4">
              {/* Top: Today's Tasks */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Today's Tasks</h3>
                {todaysTasks.length > 0 ? (
                  <div className="space-y-2">
                    {todaysTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{task.name}</span>
                            {getTaskStatusIcon(task)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {task.subject} • {task.time} min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-xs mb-1">No tasks scheduled</p>
                    <p className="text-gray-500 text-xs">Great job staying on top!</p>
                  </div>
                )}
                <button 
                  className="w-full mt-3 px-3 py-2 rounded-lg bg-[#6C5DD3] text-white font-semibold shadow hover:bg-[#7A6AD9] transition text-sm"
                  onClick={() => navigate('/tasks')}
                >
                  + Add Task
                </button>
              </div>

              {/* Bottom: Study Logs */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Recent Study Logs</h3>
                <div className="max-h-[150px] overflow-y-auto">
                  {studySessions.length > 0 ? (
                    <div className="space-y-2">
                      {studySessions.slice(0, 5).map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3 text-[#6C5DD3]" />
                              <span className="text-xs font-medium text-white">{session.subjectName}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-300">{session.durationMinutes.toFixed(1)} min</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-300">
                                {new Date(session.timestamp).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric" 
                                })}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteStudySession(index)}
                            className="p-1 rounded hover:bg-red-600/20 transition text-red-400 hover:text-red-300"
                            title="Delete session"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {studySessions.length > 5 && (
                        <div className="text-center py-2">
                          <span className="text-xs text-gray-400">
                            +{studySessions.length - 5} more sessions
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">No study logs yet</p>
                      <p className="text-gray-500 text-xs">Start studying with the timer!</p>
                    </div>
                  )}
                </div>
                {studySessions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Total: {studySessions.length} sessions</span>
                      <span>{(studySessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60).toFixed(1)}h</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card title="Smart Timer" icon={"⏱️"}>
            <TimerCard />
          </Card>
        </section>
        {/* Flashcard Reminder */}
        
        {/* Quick Access */}
        <section className="px-6 py-8 flex flex-wrap gap-4">
          <button 
            onClick={() => navigate('/subjects')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-[#6C5DD3] text-white font-semibold shadow hover:bg-[#7A6AD9] transition"
          >
            + Add Subject
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-[#6C5DD3] text-white font-semibold shadow hover:bg-[#7A6AD9] transition"
          >
            + Add Task
          </button>
          <button 
            onClick={() => navigate('/schedule')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-[#6C5DD3] text-white font-semibold shadow hover:bg-[#7A6AD9] transition"
          >
            + Schedule tasks
          </button>
        </section>
        {/* Footer */}
        <footer className="py-6 text-center bg-[#3F3D56] text-white mt-10">
          <p>© 2025 Trackviso. Keep learning, keep growing!</p>
        </footer>
      </div>

      
    </div>
  );
}
