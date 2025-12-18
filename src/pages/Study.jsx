import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import SEO from "../components/SEO";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  X,
  Star,
  Trophy,
  Award,
  Flame,
  TrendingUp,
  Calendar,
  Zap,
  Trash2,
  Volume2,
  VolumeX,
  Image,
  X as XIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Sparkles,
  BarChart3,
  Activity,
  Timer,
  Coffee,
  Music,
  Palette,
} from "lucide-react";
import { useTimer } from "../context/TimerContext";
import { useGamification } from "../context/GamificationContext";
import { useSubscription } from "../context/SubscriptionContext";
import PremiumUpgradeModal from "../components/PremiumUpgradeModal";
import {
  XPGainAnimation,
  LevelUpCelebration,
  AchievementUnlock,
  StreakMilestone,
  AnimatedProgressBar,
} from "../components/RewardAnimations";
import Sidebar from "../components/Sidebar";

const Study = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for study session
  const [sessionNotes, setSessionNotes] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [sessionMood, setSessionMood] = useState("");
  const [sessionReflection, setSessionReflection] = useState("");
  const [sessionDifficulty, setSessionDifficulty] = useState(2);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [ambientImages, setAmbientImages] = useState([]);
  const [ambientVideos, setAmbientVideos] = useState([]);
  const [selectedAmbientImage, setSelectedAmbientImage] = useState(null);
  const [selectedAmbientVideo, setSelectedAmbientVideo] = useState(null);
  const [showAmbientGallery, setShowAmbientGallery] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState("25");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startMsRef = useRef(null);
  const intervalRef = useRef(null);
  const pausedAccumulatedRef = useRef(0);
  const pomodoroPhaseRef = useRef("work");
  
  // UI State
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Timer context
  const {
    isRunning,
    mode,
    secondsLeft,
    stopwatchSeconds,
    isPomodoroBreak,
    pomodoroCount,
    totalCyclesCompleted,
    phaseJustCompleted,
    showPhaseNotification,
    startTimer,
    stopTimer,
    resetTimer,
    setTimerMode,
    setTimerSubject,
    setCustomMinutes,
    customMinutes,
    getActualElapsedTime,
    setOnCycleComplete,
    clearPhaseNotification,
    skipBreak,
    playNotificationSound,
  } = useTimer();

  // Gamification context
  const {
    userStats,
    addStudySession,
    updateQuestProgress,
    awardXP,
    grantXP,
    addReward,
    rewardQueue,
    showRewards,
    setShowRewards,
  } = useGamification();

  // Subscription context
  const { subscriptionPlan } = useSubscription();
  const isPremium = subscriptionPlan === 'professor';

  // Track if we just completed a phase
  const phaseCompletedRef = useRef(false);
  const [localPomodoroPhase, setLocalPomodoroPhase] = useState("work");
  const [localPomodoroCount, setLocalPomodoroCount] = useState(0);
  const [showPomodoroNotification, setShowPomodoroNotification] = useState(false);
  const [pomodoroNotificationMessage, setPomodoroNotificationMessage] = useState("");

  // Mouse tracking for dynamic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sync local input with context value
  useEffect(() => {
    if (customMinutes) setCustomMinutesInput(String(customMinutes));
  }, [customMinutes]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      try { if (intervalRef.current) clearInterval(intervalRef.current); } catch {}
      try { pauseLocalTimer?.(); } catch {}
      try { resetLocalTimer?.(); } catch {}
      try { stopTimer?.(); } catch {}
    };
  }, []);

  // Handle fullscreen exit events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isAmbientMode) {
        setIsAmbientMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isAmbientMode]);

  // Load ambient images and videos
  useEffect(() => {
    import('../data/ambientImages.js').then((module) => {
      const images = module.default || module.ambientImages || [];
      const videos = module.ambientVideos || [];
      
      if (images.length > 0) {
        setAmbientImages(images);
        const savedSelected = localStorage.getItem('selectedAmbientImage');
        if (savedSelected && images.find(img => img.id === savedSelected)) {
          setSelectedAmbientImage(savedSelected);
        } else {
          setSelectedAmbientImage(images[0].id);
          localStorage.setItem('selectedAmbientImage', images[0].id);
        }
      }
      
      if (videos.length > 0) {
        setAmbientVideos(videos);
        if (images.length === 0) {
          const savedSelectedVideo = localStorage.getItem('selectedAmbientVideo');
          if (savedSelectedVideo && videos.find(vid => vid.id === savedSelectedVideo)) {
            setSelectedAmbientVideo(savedSelectedVideo);
          } else {
            setSelectedAmbientVideo(videos[0].id);
            localStorage.setItem('selectedAmbientVideo', videos[0].id);
          }
        }
      }
    }).catch(err => {
      console.log('No ambient images config file found:', err);
    });
  }, []);

  // Save selected image to localStorage
  useEffect(() => {
    if (selectedAmbientImage) {
      localStorage.setItem('selectedAmbientImage', selectedAmbientImage);
      if (selectedAmbientVideo) {
        setSelectedAmbientVideo(null);
        localStorage.removeItem('selectedAmbientVideo');
      }
    }
  }, [selectedAmbientImage]);

  // Save selected video to localStorage
  useEffect(() => {
    if (selectedAmbientVideo) {
      localStorage.setItem('selectedAmbientVideo', selectedAmbientVideo);
      if (selectedAmbientImage) {
        setSelectedAmbientImage(null);
        localStorage.removeItem('selectedAmbientImage');
      }
    } else {
      localStorage.removeItem('selectedAmbientVideo');
    }
  }, [selectedAmbientVideo]);

  // Clear video selection if user is not premium
  useEffect(() => {
    if (!isPremium && selectedAmbientVideo) {
      const firstVideoId = ambientVideos.length > 0 ? ambientVideos[0].id : null;
      if (selectedAmbientVideo !== firstVideoId) {
        setSelectedAmbientVideo(null);
        localStorage.removeItem('selectedAmbientVideo');
      }
    }
  }, [isPremium, selectedAmbientVideo, ambientVideos]);

  // Local timer helpers
  const getTotalDuration = () => {
    if (mode === "pomodoro")
      return (localPomodoroPhase === "break" ? 5 : 25) * 60;
    if (mode === "custom") return (customMinutes || 25) * 60;
    return 0;
  };

  const startLocalTimer = () => {
    if (mode === "pomodoro") {
      pomodoroPhaseRef.current = localPomodoroPhase;
    } else {
      pomodoroPhaseRef.current = "";
    }
    phaseCompletedRef.current = false;
    const now = Date.now();
    startMsRef.current = now - pausedAccumulatedRef.current * 1000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const diff = Date.now() - startMsRef.current;
      setElapsedSeconds(Math.floor(diff / 1000));
    }, 100);
  };

  const pauseLocalTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedAccumulatedRef.current = elapsedSeconds;
  };

  const resetLocalTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startMsRef.current = null;
    pausedAccumulatedRef.current = 0;
    setElapsedSeconds(0);
    phaseCompletedRef.current = false;
  };
  
  // Auto-transition between Pomodoro work/break phases
  useEffect(() => {
    if (mode !== "pomodoro" || !isRunning) return;
    
    const totalDuration = localPomodoroPhase === "break" ? 5 * 60 : 25 * 60;
    
    if (elapsedSeconds >= totalDuration && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      
      if (localPomodoroPhase === "work") {
        playNotificationSound?.("work");
        setPomodoroNotificationMessage("🌴 Great work! Time for a 5-minute break.");
        setShowPomodoroNotification(true);
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        startMsRef.current = Date.now();
        pausedAccumulatedRef.current = 0;
        setElapsedSeconds(0);
        setLocalPomodoroPhase("break");
        pomodoroPhaseRef.current = "break";
        phaseCompletedRef.current = false;
        
        intervalRef.current = setInterval(() => {
          const diff = Date.now() - startMsRef.current;
          setElapsedSeconds(Math.floor(diff / 1000));
        }, 100);
        
        setTimeout(() => setShowPomodoroNotification(false), 4000);
        
      } else {
        playNotificationSound?.("break");
        const newCycleCount = localPomodoroCount + 1;
        setLocalPomodoroCount(newCycleCount);
        setPomodoroNotificationMessage(`🏆 Pomodoro #${newCycleCount} complete! +50 XP bonus. Back to work!`);
        setShowPomodoroNotification(true);
        
        if (grantXP) {
          grantXP(50, "pomodoro_cycle");
        }
        
        updateQuestProgress?.("pomodoro_cycles", 1);
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        startMsRef.current = Date.now();
        pausedAccumulatedRef.current = 0;
        setElapsedSeconds(0);
        setLocalPomodoroPhase("work");
        pomodoroPhaseRef.current = "work";
        phaseCompletedRef.current = false;
        
        intervalRef.current = setInterval(() => {
          const diff = Date.now() - startMsRef.current;
          setElapsedSeconds(Math.floor(diff / 1000));
        }, 100);
        
        setTimeout(() => setShowPomodoroNotification(false), 4000);
      }
    }
  }, [elapsedSeconds, mode, isRunning, localPomodoroPhase, localPomodoroCount, playNotificationSound, updateQuestProgress]);

  // Helper functions
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getSubjectFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("subject");
  };

  const subject = getSubjectFromURL();

  // Load data from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    const savedSessions = localStorage.getItem("studySessions");
    const savedTasks = localStorage.getItem("tasks");

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedSessions) setStudySessions(JSON.parse(savedSessions));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Set subject when component mounts
  useEffect(() => {
    if (subject) {
      setTimerSubject(subject);
    }
  }, [subject, setTimerSubject]);

  const getSubjectTasks = () => {
    return tasks.filter((task) => task.subject === subject);
  };

  const subjectTasks = getSubjectTasks();

  // Handle custom duration input
  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutesInput);
    if (minutes > 0 && minutes <= 480) {
      setCustomMinutes(minutes);
      setTimerMode("custom");
      resetLocalTimer();
      setShowCustomInput(false);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    if (newMode === "custom") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setTimerMode(newMode);
      resetLocalTimer();
      if (newMode === "pomodoro") {
        setLocalPomodoroPhase("work");
        setLocalPomodoroCount(0);
      }
    }
  };

  // Get display time
  const getDisplayTime = () => {
    if (mode === "stopwatch") {
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      const total = getTotalDuration();
      const overtime = Math.max(0, elapsedSeconds - total);
      if (
        mode === "pomodoro" &&
        localPomodoroPhase === "work" &&
        overtime > 0
      ) {
        const minutes = Math.floor(overtime / 60);
        const seconds = overtime % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      }
      const remaining = Math.max(0, total - elapsedSeconds);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  };
  
  const isInBreakPhase = mode === "pomodoro" && localPomodoroPhase === "break";

  // Progress calculation
  const getProgress = () => {
    if (mode === "stopwatch") return 0;
    const total = getTotalDuration();
    return total > 0 ? Math.min(100, (elapsedSeconds / total) * 100) : 0;
  };

  // Calculate stats
  const getTodayStats = () => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const todaySessions = studySessions.filter((session) => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= todayStart && session.subjectName === subject;
    });

    const totalMinutes = todaySessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0,
    );

    return {
      sessions: todaySessions.length,
      minutes: totalMinutes,
    };
  };

  const getStreak = () => {
    if (studySessions.length === 0) return 0;

    const studyDates = [
      ...new Set(
        studySessions
          .filter((session) => session.subjectName === subject)
          .map((session) => new Date(session.timestamp).toDateString()),
      ),
    ].sort();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();

      if (studyDates.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getWeeklyProgress = () => {
    const now = new Date();
    const weekStart = getStartOfWeek(now);

    const weekSessions = studySessions.filter((session) => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= weekStart && session.subjectName === subject;
    });

    const studiedMinutes = weekSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0,
    );
    const subjectData = subjects.find((s) => s.name === subject);
    const goalMinutes = subjectData ? subjectData.goalHours * 60 : 0;

    return {
      studied: studiedMinutes,
      goal: goalMinutes,
      percentage: goalMinutes > 0 ? (studiedMinutes / goalMinutes) * 100 : 0,
    };
  };

  const todayStats = getTodayStats();
  const streak = getStreak();
  const weeklyProgress = getWeeklyProgress();

  const handleCancelStudy = () => {
    try { pauseLocalTimer?.(); } catch {}
    try { stopTimer?.(); } catch {}
    try { resetLocalTimer?.(); } catch {}
    try { resetTimer?.(); } catch {}
    setIsTaskComplete(false);
    setShowEndSession(false);
    setSessionMood("");
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

  // Subject selection screen
  if (!subject) {
    return (
      <>
        <SEO 
          title="Study Session - Trackviso"
          description="Start a focused study session with Trackviso's pomodoro timer, custom timer, and stopwatch. Track your study time and earn XP for your sessions."
          url="/study"
          robots="noindex, nofollow"
          noindex={true}
        />
        <div className="min-h-screen mt-20 flex bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Sidebar />
        <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
          <div className="max-w-4xl mx-auto p-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
                Ready to Study?
              </h1>
              <p className="text-xl text-purple-200/80">
                Log your study time here!
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {subjects.map((subjectItem) => (
                <motion.div
                  key={subjectItem.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 cursor-pointer hover:border-purple-600/50 transition-all duration-300 group"
                  onClick={() =>
                    navigate(
                      `/study?subject=${encodeURIComponent(subjectItem.name)}`,
                    )
                  }
                >
                  <motion.div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: subjectItem.color }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  >
                    {subjectItem.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white text-center mb-2 group-hover:text-purple-300 transition-colors">
                    {subjectItem.name}
                  </h3>
                  <p className="text-purple-200/80 text-center text-sm">
                    Goal: {subjectItem.goalHours}h/week
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {subjects.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-purple-300/80 text-lg mb-4">
                  No subjects added yet!
                </p>
                <motion.button
                  onClick={() => navigate("/subjects")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Your First Subject
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  const handleEndSession = () => {
    pauseLocalTimer();
    stopTimer();
    setShowEndSession(true);
  };

  const handleSaveSession = () => {
    const sessionDurationMinutes = Math.max(
      1,
      Math.round((elapsedSeconds / 60) * 100) / 100,
    );

    const sessionData = {
      subjectName: subject,
      durationMinutes: sessionDurationMinutes,
      timestamp: new Date().toISOString(),
      notes: sessionNotes,
      task: currentTask,
      mood: sessionMood,
      reflection: sessionReflection,
      difficulty: sessionDifficulty,
      isTaskComplete,
    };

    const sessionResult = addStudySession(sessionData);

    const updatedSessions = [...studySessions, sessionResult];
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    setStudySessions(updatedSessions);

    if (isTaskComplete && currentTask) {
      const updatedTasks = tasks.map((task) =>
        task.name === currentTask
          ? { ...task, done: true, doneAt: Date.now() }
          : task,
      );
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      updateQuestProgress("tasks");
    }

    addReward({
      type: "SESSION_COMPLETE",
      title: `🎉 Session Complete!`,
      description: `You studied ${subject} for ${sessionDurationMinutes.toFixed(1)} minutes and earned ${sessionResult.xpEarned} XP!`,
      tier: "uncommon",
      xp: sessionResult.xpEarned,
      bonuses: sessionResult.bonuses,
    });

    setSessionNotes("");
    setCurrentTask("");
    setIsTaskComplete(false);
    setShowEndSession(false);
    setSessionMood("");
    setSessionReflection("");
    setSessionDifficulty(2);

    resetLocalTimer();
    resetTimer();

    setShowRewards(true);
  };

  const deleteStudySession = (index) => {
    const updatedSessions = studySessions.filter((_, i) => i !== index);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    setStudySessions(updatedSessions);
  };

  const handleTaskSelection = (taskName) => {
    setCurrentTask(taskName);
    if (taskName) {
      setIsTaskComplete(true);
    }
  };

  const MODES = [
    { key: "pomodoro", label: "Pomodoro", icon: "🍅", duration: 25 * 60 },
    { key: "custom", label: "Custom", icon: "⚙️", duration: null },
    { key: "stopwatch", label: "Stopwatch", icon: "⏱️", duration: 0 },
  ];

  const moods = [
    { emoji: "😄", label: "Great", value: "great" },
    { emoji: "🙂", label: "Good", value: "good" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😫", label: "Struggled", value: "struggled" },
  ];

  // End session modal
  if (showEndSession) {
    return (
      <>
        <SEO 
          title="Study Session - Trackviso"
          description="Start a focused study session with Trackviso's pomodoro timer, custom timer, and stopwatch. Track your study time and earn XP for your sessions."
          url="/study"
          robots="noindex, nofollow"
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center p-4 mt-20" style={{ backgroundImage: "linear-gradient(135deg, var(--study-from), var(--study-via), var(--study-to))" }}>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Session Complete! 🎉
          </h2>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-3">
              How did it go?
            </label>
            <div className="flex justify-center gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSessionMood(mood.value)}
                  className={`p-3 rounded-xl transition-all ${
                    sessionMood === mood.value
                      ? "bg-[#6C5DD3] text-white shadow-lg scale-110"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              What did you work on?
            </label>
            <textarea
              value={sessionReflection}
              onChange={(e) => setSessionReflection(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#1a1a2e] text-white border border-[#6C5DD3] resize-none"
              rows="3"
              placeholder="Briefly describe what you studied..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => setSessionDifficulty(level)}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    sessionDifficulty === level
                      ? "bg-[#FEC260] text-[#23234a] font-bold"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEndSession(false)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition"
            >
              Continue Studying
            </button>
            <button
              onClick={handleSaveSession}
              className="flex-1 px-4 py-3 rounded-lg bg-[#6C5DD3] text-white font-semibold hover:bg-[#7A6AD9] transition"
            >
              Save & Finish
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Main Study Interface - Modern Redesign
  return (
    <>
      <SEO 
        title="Study Session - Trackviso"
        description="Start a focused study session with Trackviso's pomodoro timer, custom timer, and stopwatch. Track your study time and earn XP for your sessions."
        url="/study"
        robots="noindex, nofollow"
        noindex={true}
      />
      <div className="min-h-screen mt-20 flex bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)`,
              left: `${(mousePosition.x / window.innerWidth) * 100}%`,
              top: `${(mousePosition.y / window.innerHeight) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64 relative z-10">
          {/* Top Header Bar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 bg-gradient-to-r from-purple-900/80 via-purple-950/80 to-slate-900/80 backdrop-blur-xl border-b border-purple-700/30 px-6 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: subjects.find(s => s.name === subject)?.color || '#8b5cf6' }}
                >
                  {subject?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{subject}</h1>
                  {currentTask && (
                    <p className="text-sm text-purple-300/70 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {currentTask}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-purple-300">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round(todayStats.minutes)}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-300">
                    <Flame className="w-4 h-4 text-[#FEC260]" />
                    <span>{streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-300">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>{localPomodoroCount}</span>
                  </div>
                </div>
                
                {/* Quick Settings Toggle */}
                <motion.button
                  onClick={() => setShowQuickSettings(!showQuickSettings)}
                  className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 border border-purple-700/30 text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                
                {/* Exit Button */}
                <motion.button
                  onClick={() => { handleCancelStudy(); navigate("/subjects"); }}
                  className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Settings Dropdown */}
          <AnimatePresence>
            {showQuickSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-6 mt-2 z-50 bg-purple-900/95 backdrop-blur-xl rounded-xl p-4 border border-purple-700/30 shadow-2xl min-w-[200px]"
              >
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsAmbientMode(!isAmbientMode);
                      if (!isAmbientMode) {
                        document.documentElement.requestFullscreen?.();
                      } else {
                        document.exitFullscreen?.();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-800/40 text-white transition-all"
                  >
                    {isAmbientMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span className="text-sm">Ambient Mode</span>
                  </button>
                  <button
                    onClick={() => setShowAmbientGallery(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-800/40 text-white transition-all"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-sm">Backgrounds</span>
                  </button>
                  <button
                    onClick={() => setIsDistractionFree(!isDistractionFree)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-800/40 text-white transition-all ${isDistractionFree ? 'bg-purple-700/40' : ''}`}
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Focus Mode</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Layout - Split Screen */}
          <div className="flex h-[calc(100vh-5rem)]">
            {/* Left Panel - Timer & Controls */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${leftPanelCollapsed ? 'w-16' : 'w-96'} transition-all duration-300 flex flex-col border-r border-purple-700/30 bg-gradient-to-b from-purple-900/20 to-slate-900/20 backdrop-blur-sm`}
            >
              {/* Collapse Toggle */}
              <button
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-purple-700 border border-purple-600 flex items-center justify-center text-white hover:bg-purple-600 transition-all"
              >
                {leftPanelCollapsed ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronUp className="w-4 h-4 rotate-90" />}
              </button>

              {!leftPanelCollapsed && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Mode Selection */}
                  <div>
                    <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-3 block">
                      Timer Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {MODES.map((m) => (
                        <motion.button
                          key={m.key}
                          onClick={() => handleModeChange(m.key)}
                          disabled={isRunning}
                          className={`p-3 rounded-xl font-semibold text-sm transition-all ${
                            mode === m.key
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                              : "bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                          } disabled:opacity-50`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-lg mb-1">{m.icon}</div>
                          <div className="text-xs">{m.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Duration Input */}
                  <AnimatePresence>
                    {showCustomInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 block">
                          Custom Duration
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max="480"
                            value={customMinutesInput}
                            onChange={(e) => setCustomMinutesInput(e.target.value)}
                            className="flex-1 p-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 text-sm focus:outline-none focus:border-purple-600/80"
                            placeholder="25"
                          />
                          <motion.button
                            onClick={handleCustomDuration}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Set
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pomodoro Status */}
                  {mode === "pomodoro" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-purple-800/30 to-pink-800/20 border border-purple-700/30"
                    >
                      <div className={`text-center font-semibold ${isInBreakPhase ? 'text-green-400' : 'text-purple-200'}`}>
                        {isInBreakPhase ? "🌴 Break Time" : "📚 Work Time"}
                      </div>
                      <div className="text-center text-sm text-purple-300/70 mt-1">
                        {localPomodoroCount} cycles completed
                      </div>
                    </motion.div>
                  )}

                  {/* Task Selection */}
                  <div>
                    <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 block">
                      Current Task
                    </label>
                    <select
                      value={currentTask}
                      onChange={(e) => handleTaskSelection(e.target.value)}
                      className="w-full p-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 text-sm focus:outline-none focus:border-purple-600/80"
                      disabled={isRunning}
                    >
                      <option value="">Select or type custom...</option>
                      {subjectTasks.map((task) => (
                        <option key={task.id} value={task.name}>
                          {task.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      className="w-full mt-2 p-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 text-sm focus:outline-none focus:border-purple-600/80"
                      placeholder="Or type custom topic..."
                    />
                    <label className="flex items-center gap-2 mt-2 text-sm text-purple-300">
                      <input
                        type="checkbox"
                        checked={isTaskComplete}
                        onChange={(e) => setIsTaskComplete(e.target.checked)}
                        className="rounded"
                      />
                      Mark as complete
                    </label>
                  </div>

                  {/* Session Notes */}
                  <div>
                    <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 block">
                      Session Notes
                    </label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="w-full p-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 text-sm focus:outline-none focus:border-purple-600/80 resize-none"
                      rows="3"
                      placeholder="Add notes about your session..."
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Center - Main Timer Display */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Floating Timer Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Timer Circle */}
                <div className="relative w-[400px] h-[400px]">
                  {/* Progress Ring */}
                  {mode !== "stopwatch" && (
                    <svg className="absolute inset-0 transform -rotate-90" width="400" height="400">
                      <circle
                        cx="200"
                        cy="200"
                        r="180"
                        stroke="rgba(139, 92, 246, 0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="200"
                        cy="200"
                        r="180"
                        stroke={
                          isInBreakPhase
                            ? "#4ADE80"
                            : mode === "pomodoro" &&
                              elapsedSeconds > getTotalDuration() &&
                              localPomodoroPhase === "work"
                              ? "#EF4444"
                              : "url(#timerGradient)"
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 180}
                        strokeDashoffset={2 * Math.PI * 180 * (1 - getProgress() / 100)}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 2 * Math.PI * 180 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 180 * (1 - getProgress() / 100) }}
                        transition={{ duration: 0.5 }}
                      />
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}

                  {/* Timer Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      className={`text-7xl font-mono font-bold ${
                        isInBreakPhase
                          ? "text-green-400"
                          : mode === "pomodoro" &&
                            elapsedSeconds > getTotalDuration() &&
                            localPomodoroPhase === "work"
                            ? "text-red-400"
                            : "text-white"
                      }`}
                      animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getDisplayTime()}
                    </motion.div>
                    {mode === "pomodoro" && (
                      <div className={`mt-4 text-sm font-semibold ${isInBreakPhase ? 'text-green-400' : 'text-purple-300'}`}>
                        {isInBreakPhase ? "🌴 Break" : "📚 Work"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  {isRunning ? (
                    <motion.button
                      onClick={() => {
                        pauseLocalTimer();
                        stopTimer();
                      }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-slate-900 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 transition-all flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Pause className="w-8 h-8" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => {
                        startLocalTimer();
                        startTimer();
                      }}
                      disabled={mode !== "stopwatch" && getTotalDuration() === 0}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => {
                      resetLocalTimer();
                      resetTimer();
                    }}
                    className="w-12 h-12 rounded-full bg-purple-900/40 text-white border border-purple-700/40 hover:bg-purple-900/60 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleEndSession}
                    className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Panel - Stats & Logs */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`${rightPanelCollapsed ? 'w-16' : 'w-96'} transition-all duration-300 flex flex-col border-l border-purple-700/30 bg-gradient-to-b from-purple-900/20 to-slate-900/20 backdrop-blur-sm`}
            >
              {/* Collapse Toggle */}
              <button
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-purple-700 border border-purple-600 flex items-center justify-center text-white hover:bg-purple-600 transition-all"
              >
                {rightPanelCollapsed ? <ChevronDown className="w-4 h-4 -rotate-90" /> : <ChevronUp className="w-4 h-4 -rotate-90" />}
              </button>

              {!rightPanelCollapsed && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Today's Stats */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-800/30 to-slate-800/20 border border-purple-700/30">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Today's Progress
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300/70">Sessions</span>
                        <span className="text-white font-bold">{todayStats.sessions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300/70">Time</span>
                        <span className="text-white font-bold">{Math.round(todayStats.minutes)}m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300/70 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#FEC260]" />
                          Streak
                        </span>
                        <span className="text-white font-bold">{streak}d</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-pink-800/30 to-purple-800/20 border border-pink-700/30">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-400" />
                      Weekly Goal
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-pink-300/70">Studied</span>
                        <span className="text-white font-bold">{Math.round(weeklyProgress.studied / 60)}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-pink-300/70">Goal</span>
                        <span className="text-white font-bold">{Math.round(weeklyProgress.goal / 60)}h</span>
                      </div>
                      <div className="w-full bg-pink-500/20 rounded-full h-2 mt-2">
                        <motion.div
                          className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(weeklyProgress.percentage, 100)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="text-xs text-center text-pink-300/70 mt-1">
                        {Math.round(weeklyProgress.percentage)}% complete
                      </div>
                    </div>
                  </div>

                  {/* Recent Logs */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      Recent Sessions
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {studySessions
                        .filter((session) => session.subjectName === subject)
                        .slice(0, 5)
                        .map((session, index) => {
                          const moodEmoji = {
                            great: "😄",
                            good: "🙂",
                            okay: "😐",
                            struggled: "😫",
                          }[session.mood] || "";

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-3 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all group"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">
                                  {session.durationMinutes.toFixed(1)}m
                                </span>
                                <span className="text-xs text-purple-300/60">
                                  {new Date(session.timestamp).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              {session.task && (
                                <div className="text-xs text-purple-300/70 truncate">
                                  {session.task}
                                </div>
                              )}
                              {session.mood && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-purple-300/70">
                                  <span>{moodEmoji}</span>
                                  <span className="capitalize">{session.mood}</span>
                                </div>
                              )}
                              <button
                                onClick={() => deleteStudySession(studySessions.indexOf(session))}
                                className="mt-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-600/30 transition text-red-400 hover:text-red-300 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </motion.div>
                          );
                        })}
                      {studySessions.filter((s) => s.subjectName === subject).length === 0 && (
                        <div className="text-center py-4 text-purple-300/50 text-sm">
                          No sessions yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Pomodoro Notification */}
        <AnimatePresence>
          {showPomodoroNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[150] max-w-md"
            >
              <div className={`px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md ${
                isInBreakPhase 
                  ? "bg-green-900/90 border-green-400/50 shadow-green-500/30" 
                  : "bg-purple-900/90 border-purple-400/50 shadow-purple-500/30"
              }`}>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-3xl"
                  >
                    {isInBreakPhase ? "🌴" : "💪"}
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {pomodoroNotificationMessage}
                    </p>
                    <p className="text-white/70 text-sm mt-1">
                      {isInBreakPhase 
                        ? "Take a short break, stretch, and relax!" 
                        : "Stay focused and keep up the great work!"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Mode - Keep existing implementation */}
        <AnimatePresence>
          {isAmbientMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: selectedAmbientImage && !selectedAmbientVideo
                  ? `url(${ambientImages.find(img => img.id === selectedAmbientImage)?.data || ambientImages.find(img => img.id === selectedAmbientImage)?.path})`
                  : (ambientImages.length > 0 && !selectedAmbientVideo)
                    ? `url(${ambientImages[0]?.data || ambientImages[0]?.path})`
                    : 'none',
                backgroundColor: (selectedAmbientImage || selectedAmbientVideo || ambientImages.length > 0) ? 'transparent' : '#000000',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={() => {
                setIsAmbientMode(false);
                if (document.exitFullscreen) {
                  document.exitFullscreen().catch(err => console.log(err));
                }
              }}
            >
              {selectedAmbientVideo && (
                (() => {
                  const selectedVideo = ambientVideos.find(vid => vid.id === selectedAmbientVideo);
                  const isFirstVideo = ambientVideos.length > 0 && ambientVideos[0].id === selectedAmbientVideo;
                  if (selectedVideo && (isFirstVideo || isPremium)) {
                    return (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ zIndex: 0 }}
                        src={selectedVideo.path}
                      />
                    );
                  }
                  return null;
                })()
              )}
              
              <div className="absolute inset-0" />
              
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAmbientGallery(true);
                }}
                className="absolute top-4 right-4 z-20 p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>
              
              <div className="text-center relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-white drop-shadow-2xl"
                >
                  <div className="text-9xl font-bold tracking-wider mb-4" style={{ fontWeight: 900 }}>
                    {getDisplayTime()}
                  </div>
                  {subject && (
                    <div className="text-2xl text-white/90 mt-8 drop-shadow-lg font-bold">
                      {subject}
                    </div>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex items-center justify-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isRunning ? (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        pauseLocalTimer();
                        stopTimer();
                      }}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pause className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        startLocalTimer();
                        startTimer();
                      }}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndSession();
                    }}
                    className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Gallery Modal - Keep existing */}
        <AnimatePresence>
          {showAmbientGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowAmbientGallery(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Image className="w-6 h-6 text-purple-400" />
                    Ambient Mode Background Gallery
                  </h2>
                  <button
                    onClick={() => setShowAmbientGallery(false)}
                    className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-purple-800/20 border border-purple-700/30 rounded-lg">
                  <p className="text-purple-300/80 text-sm">
                    <strong className="text-white">Note:</strong> Images and videos may not appear instantly. Please wait for a few seconds.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-400" />
                    Static Backgrounds
                  </h3>
                  {ambientImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ambientImages.map((image) => (
                        <motion.div
                          key={image.id}
                          className="relative group aspect-video rounded-lg overflow-hidden border-2 transition-all"
                          style={{
                            borderColor: selectedAmbientImage === image.id 
                              ? 'rgba(168, 85, 247, 1)' 
                              : 'rgba(139, 92, 246, 0.3)'
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={image.data || image.path}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-purple-900/40 text-purple-300 text-sm">Image not found</div>';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <button
                              onClick={() => {
                                setSelectedAmbientImage(image.id);
                                setSelectedAmbientVideo(null);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedAmbientImage === image.id
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/20 text-white opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {selectedAmbientImage === image.id ? 'Selected' : 'Select'}
                            </button>
                          </div>
                          {selectedAmbientImage === image.id && (
                            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                              Active
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-purple-800/20 rounded-lg border border-purple-700/30">
                      <Image className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                      <p className="text-purple-300/80">No static images configured</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Animated Wallpapers
                    {!isPremium && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Premium
                      </span>
                    )}
                  </h3>
                  
                  {ambientVideos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ambientVideos.map((video, index) => {
                        const isFirstVideo = index === 0;
                        const isPremiumVideo = !isFirstVideo;
                        const isLocked = isPremiumVideo && !isPremium;
                        
                        return (
                          <motion.div
                            key={video.id}
                            className="relative group aspect-video rounded-lg overflow-hidden border-2 transition-all"
                            style={{
                              borderColor: selectedAmbientVideo === video.id 
                                ? 'rgba(168, 85, 247, 1)' 
                                : 'rgba(139, 92, 246, 0.3)'
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: isLocked ? 1 : 1.05 }}
                          >
                            <video
                              src={video.path}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => e.target.play()}
                              onMouseLeave={(e) => {
                                e.target.pause();
                                e.target.currentTime = 0;
                              }}
                            />
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="text-center">
                                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                  <p className="text-white text-sm font-semibold mb-1">Premium</p>
                                  <p className="text-white/70 text-xs">Upgrade to unlock</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              {!isLocked ? (
                                <button
                                  onClick={() => {
                                    setSelectedAmbientVideo(video.id);
                                    setSelectedAmbientImage(null);
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedAmbientVideo === video.id
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white/20 text-white opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  {selectedAmbientVideo === video.id ? 'Selected' : 'Select'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    pauseLocalTimer();
                                    stopTimer();
                                    setIsAmbientMode(false);
                                    setShowAmbientGallery(false);
                                    if (document.exitFullscreen) {
                                      document.exitFullscreen().catch(err => console.log(err));
                                    }
                                    setShowPremiumModal(true);
                                  }}
                                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Upgrade to Unlock
                                </button>
                              )}
                            </div>
                            {selectedAmbientVideo === video.id && !isLocked && (
                              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Active
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-purple-800/20 rounded-lg border border-purple-700/30">
                      <Zap className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                      <p className="text-purple-300/80">No animated wallpapers configured</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Upgrade Modal */}
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="Animated Wallpapers"
        />

        {/* Reward Animations */}
        <AnimatePresence>
          {rewardQueue &&
            rewardQueue.length > 0 &&
            rewardQueue.map((reward, index) => {
              if (reward.type === "SESSION_COMPLETE") {
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4 border-4 border-yellow-400"
                    >
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-3xl font-bold mb-4">{reward.title}</h2>
                      <p className="text-lg mb-6">{reward.description}</p>

                      {reward.bonuses &&
                        Object.keys(reward.bonuses).length > 0 && (
                          <div className="bg-black/20 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold mb-2">XP Breakdown:</h3>
                            {Object.entries(reward.bonuses).map(
                              ([type, value]) =>
                                value > 0 && (
                                  <div
                                    key={type}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="capitalize">
                                      {type} Bonus:
                                    </span>
                                    <span>+{value} XP</span>
                                  </div>
                                ),
                            )}
                          </div>
                        )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setShowRewards(false);
                            navigate("/dashboard");
                          }}
                          className="flex-1 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                          View Dashboard
                        </button>
                        <button
                          onClick={() => setShowRewards(false)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                          Continue Studying
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }

              if (reward.type === "XP_EARNED") {
                return (
                  <XPGainAnimation
                    key={reward.id}
                    amount={reward.xp || 0}
                    bonuses={reward.bonuses || {}}
                    onComplete={() => setShowRewards(false)}
                  />
                );
              }

              if (reward.type === "LEVEL_UP") {
                return (
                  <LevelUpCelebration
                    key={reward.id}
                    newLevel={userStats.level}
                    onComplete={() => setShowRewards(false)}
                  />
                );
              }

              if (reward.type === "ACHIEVEMENT") {
                return (
                  <AchievementUnlock
                    key={reward.id}
                    achievement={reward}
                    onComplete={() => setShowRewards(false)}
                  />
                );
              }

              return null;
            })}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Study;
