// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import OnboardingModal from "../components/OnboardingModal";
import Skillpulse from "../components/Skillpulse";
import { FlameIcon } from "lucide-react";
import { applyMemoryDeterioration } from "../utils/memoryDeterioration";
import PremiumUpgradeModal from "../components/PremiumUpgradeModal";
import PremiumUpgradeCard from "../components/PremiumUpgradeCard";
import { useSubscription } from "../context/SubscriptionContext";

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
  const [examReadiness, setExamReadiness] = useState(0);
  const [subjectLeaderboard, setSubjectLeaderboard] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { subscriptionPlan, getRemainingMockExams, getRemainingBlurtTests, getHoursUntilReset } = useSubscription();

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Helper function to normalize subject data format (Supabase uses snake_case, app uses camelCase)
  // This is a pure function, so it doesn't need to be in dependency arrays
  const normalizeSubject = (subject) => {
    // If already in camelCase format (from localStorage), return as is
    if (subject.goalHours !== undefined) {
      return subject;
    }
    // Convert from Supabase format (snake_case) to app format (camelCase)
    return {
      ...subject,
      goalHours: subject.goal_hours || 0,
      iconName: subject.icon_name || 'BookOpen',
    };
  };

  // Load subjects, study sessions, and tasks from Supabase (with localStorage fallback)
  useEffect(() => {
    const loadData = async () => {
      // Try to load from Supabase first
      if (user) {
        try {
          const [supabaseSubjects, supabaseSessions, supabaseTasks] = await Promise.all([
            fetchUserSubjects(),
            fetchStudySessions(),
            fetchUserTasks(),
          ]);

          if (supabaseSubjects && supabaseSubjects.length > 0) {
            // Normalize subjects from Supabase format to app format
            const normalizedSubjects = supabaseSubjects.map(normalizeSubject);
            setSubjects(normalizedSubjects);
            // Also sync to localStorage for offline support
            localStorage.setItem("subjects", JSON.stringify(normalizedSubjects));
          } else {
            const savedSubjects = localStorage.getItem("subjects");
            if (savedSubjects) {
              setSubjects(JSON.parse(savedSubjects));
            }
          }

          if (supabaseSessions && supabaseSessions.length > 0) {
            setStudySessions(supabaseSessions);
          } else {
            const savedSessions = localStorage.getItem("studySessions");
            if (savedSessions) {
              setStudySessions(JSON.parse(savedSessions));
            }
          }

          if (supabaseTasks && supabaseTasks.length > 0) {
            setTasks(supabaseTasks);
          } else {
            const savedTasks = localStorage.getItem("tasks");
            if (savedTasks) {
              setTasks(JSON.parse(savedTasks));
            }
          }
        } catch (error) {
          console.error('Error loading from Supabase, falling back to localStorage:', error);
          // Fallback to localStorage
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
        }
      }
    };

    loadData();
  }, [user]);

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

  // Helper function to calculate completion score from mastery topic progress
  const calculateCompletionScore = (topicProgress, applyDeterioration = true) => {
    if (!topicProgress) return 0;
    const scores = [];
    if (topicProgress.blurtScore !== undefined) scores.push(topicProgress.blurtScore);
    if (topicProgress.spacedRetrievalScore !== undefined) scores.push(topicProgress.spacedRetrievalScore);
    if (topicProgress.mockExamScore !== undefined) scores.push(topicProgress.mockExamScore);
    
    if (scores.length === 0) return 0;
    
    const baseScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Apply memory deterioration if enabled
    if (applyDeterioration && topicProgress.lastPracticeDate) {
      return applyMemoryDeterioration(baseScore, topicProgress.lastPracticeDate);
    }
    
    return baseScore;
  };

  // Calculate subject mastery progress (combines study time progress and mastery progress)
  const calculateSubjectProgress = useCallback(async (subject) => {
    // Normalize subject to ensure consistent format
    const normalizedSubject = normalizeSubject(subject);
    
    // Get study time progress
    const subjectSessions = studySessions.filter(s => s.subjectName === normalizedSubject.name || s.subject_name === normalizedSubject.name);
    const studyTimeMinutes = subjectSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const goalMinutes = (normalizedSubject.goalHours || 0) * 60;
    const studyTimeProgress = goalMinutes > 0 ? Math.min(100, (studyTimeMinutes / goalMinutes) * 100) : 0;

    // Get mastery progress if available
    let masteryProgress = 0;
    try {
      const masterySetup = JSON.parse(localStorage.getItem('masterySetup') || 'null');
      if (masterySetup && masterySetup.subject === normalizedSubject.name) {
        let topicProgressData = null;
        
        // Try to load from Supabase first
        if (user) {
          try {
            topicProgressData = await fetchTopicProgress(normalizedSubject.name);
          } catch (error) {
            console.error('Error loading topic progress from Supabase:', error);
          }
        }
        
        // Fallback to localStorage
        if (!topicProgressData) {
          const storageKey = `masteryData_${normalizedSubject.name}`;
          const savedProgress = localStorage.getItem(storageKey);
          if (savedProgress) {
            topicProgressData = JSON.parse(savedProgress);
          }
        }

        if (topicProgressData && masterySetup.topics && masterySetup.topics.length > 0) {
          const completionScores = masterySetup.topics.map(topic => {
            const topicProgress = topicProgressData[topic.id];
            return topicProgress ? calculateCompletionScore(topicProgress, true) : 0;
          });
          masteryProgress = completionScores.reduce((acc, score) => acc + score, 0) / completionScores.length;
        }
      }
    } catch (error) {
      console.error('Error calculating mastery progress:', error);
    }

    // Combine both progress metrics (weighted average: 40% study time, 60% mastery)
    // If no mastery data, use only study time progress
    if (masteryProgress === 0) {
      return studyTimeProgress;
    }
    return (studyTimeProgress * 0.4) + (masteryProgress * 0.6);
  }, [studySessions, user]);

  // Calculate overall exam readiness and subject leaderboard
  useEffect(() => {
    const calculateExamReadiness = async () => {
      if (subjects.length === 0) {
        setExamReadiness(0);
        setSubjectLeaderboard([]);
        return;
      }

      const subjectProgresses = await Promise.all(
        subjects.map(async (subject) => {
          const progress = await calculateSubjectProgress(subject);
          return {
            ...subject,
            progress: progress
          };
        })
      );

      // Sort by progress for leaderboard
      const sorted = [...subjectProgresses].sort((a, b) => b.progress - a.progress);
      setSubjectLeaderboard(sorted);

      // Calculate overall exam readiness as average
      const overallProgress = subjectProgresses.reduce((sum, s) => sum + s.progress, 0) / subjectProgresses.length;
      setExamReadiness(Math.round(overallProgress));
    };

    calculateExamReadiness();
  }, [subjects, studySessions, user, calculateSubjectProgress]);

  // Get color for circular progress based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // green-500
    if (percentage >= 60) return '#3b82f6'; // blue-500
    if (percentage >= 40) return '#f59e0b'; // amber-500
    if (percentage >= 20) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
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

        {/* Summary & Exam Readiness */}
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

          {/* Exam Readiness Card - Combined Streak and Tasks */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 rounded-2xl p-6 border backdrop-blur-md shadow-xl transition-all bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-700/30"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-white">Your mastery progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Circular Progress */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={getProgressColor(examReadiness)}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: examReadiness / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeDasharray={`${2 * Math.PI * 56}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{examReadiness}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mt-4 text-center">Overall progress</p>
              </div>

              {/* Right: Subject Leaderboard */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-3">Subject Mastery</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subjectLeaderboard.length > 0 ? (
                    subjectLeaderboard.map((subject, index) => (
                      <div key={subject.id || index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-semibold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white truncate">{subject.name}</span>
                            <span className="text-xs font-semibold text-gray-300 ml-2">{Math.round(subject.progress)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${subject.progress}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className="h-1.5 rounded-full"
                              style={{ backgroundColor: getProgressColor(subject.progress) }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No subjects yet. Add subjects to track your progress!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Skillpulse */}
        <section className="px-6 py-8">
          <Skillpulse />
        </section>

        {/* Premium Upgrade Card */}
        {subscriptionPlan === 'scholar' && (
          <section className="px-6 py-4">
            <PremiumUpgradeCard onUpgradeClick={() => setShowUpgradeModal(true)} />
          </section>
        )}

        <PremiumUpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
        />
        
        {/* Quick Access */}
        <motion.section
          className="px-6 py-8 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/study')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start study session
          </motion.button>
          <motion.button
            onClick={() => navigate('/subjects')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add subject
          </motion.button>
          <motion.button
            onClick={() => navigate('/mastery')}
            className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Master subjects
          </motion.button>
        </motion.section>
      </div>
      </div>
    </div>
  );
}
