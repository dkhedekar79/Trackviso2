import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
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
  Music,
  Search,
  LogOut,
  ChevronDown,
  ListMusic,
} from "lucide-react";
import { useYouTubeMusic } from "../hooks/useYouTubeMusic";

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
  // Local input state for custom minutes
  const [customMinutesInput, setCustomMinutesInput] = useState("25");
  // Local high-accuracy timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startMsRef = useRef(null);
  const intervalRef = useRef(null);
  const pausedAccumulatedRef = useRef(0);
  const pomodoroPhaseRef = useRef("work");
  const totalPomodoroTimeRef = useRef(0); // Track total WORK time across all Pomodoro phases (breaks don't count)

  // Timer context (kept for global sync but display uses local timer)
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

  // YouTube Music integration
  const {
    isConnected: isYouTubeMusicConnected,
    isPlaying: isYouTubeMusicPlaying,
    currentTrack,
    isLoading: isYouTubeMusicLoading,
    error: youtubeMusicError,
    handleLogin: handleYouTubeMusicLogin,
    handleLogout: handleYouTubeMusicLogout,
    playLofiPlaylist,
    togglePlayback: toggleYouTubeMusicPlayback,
    searchAndPlay,
    getMostPlayedPlaylists,
    availablePlaylists,
  } = useYouTubeMusic();

  // YouTube Music UI state
  const [showYouTubeMusicControls, setShowYouTubeMusicControls] = useState(false);
  const [showYouTubeMusicSearch, setShowYouTubeMusicSearch] = useState(false);
  const [youtubeMusicSearchQuery, setYouTubeMusicSearchQuery] = useState('');
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [mostPlayedPlaylists, setMostPlayedPlaylists] = useState([]);

  // Load most played playlists
  useEffect(() => {
    if (isYouTubeMusicConnected && getMostPlayedPlaylists) {
      const mostPlayed = getMostPlayedPlaylists();
      setMostPlayedPlaylists(mostPlayed);
    }
  }, [isYouTubeMusicConnected, getMostPlayedPlaylists]);

  // Close playlist selector when clicking outside or when ambient mode closes
  useEffect(() => {
    if (!isAmbientMode) {
      setShowPlaylistSelector(false);
    }
  }, [isAmbientMode]);

  // Close playlist selector on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPlaylistSelector && !e.target.closest('.playlist-selector-container')) {
        setShowPlaylistSelector(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPlaylistSelector]);

  // Sync local input with context value when it changes
  useEffect(() => {
    if (customMinutes) setCustomMinutesInput(String(customMinutes));
  }, [customMinutes]);

  // Cleanup timers on unmount to avoid leaks and lag when navigating away
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
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isAmbientMode]);

  // Load ambient images and videos from config file and selected from localStorage
  useEffect(() => {
    // Import ambient images and videos from config
    import('../data/ambientImages.js').then((module) => {
      const images = module.default || module.ambientImages || [];
      const videos = module.ambientVideos || [];
      
      if (images.length > 0) {
        setAmbientImages(images);
        // Set first image as default if none selected
        const savedSelected = localStorage.getItem('selectedAmbientImage');
        if (savedSelected && images.find(img => img.id === savedSelected)) {
          setSelectedAmbientImage(savedSelected);
        } else {
          // Always default to first image if no saved selection
          setSelectedAmbientImage(images[0].id);
          localStorage.setItem('selectedAmbientImage', images[0].id);
        }
      }
      
      if (videos.length > 0) {
        setAmbientVideos(videos);
        // Only set video as default if no images exist
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
      // Clear video selection when image is selected
      if (selectedAmbientVideo) {
        setSelectedAmbientVideo(null);
        localStorage.removeItem('selectedAmbientVideo');
      }
    }
    // Don't remove from localStorage if it becomes null - keep the default
  }, [selectedAmbientImage]);

  // Save selected video to localStorage
  useEffect(() => {
    if (selectedAmbientVideo) {
      localStorage.setItem('selectedAmbientVideo', selectedAmbientVideo);
      // Clear image selection when video is selected
      if (selectedAmbientImage) {
        setSelectedAmbientImage(null);
        localStorage.removeItem('selectedAmbientImage');
      }
    } else {
      localStorage.removeItem('selectedAmbientVideo');
    }
  }, [selectedAmbientVideo]);

  // Clear video selection if user is not premium (but allow first video)
  useEffect(() => {
    if (!isPremium && selectedAmbientVideo) {
      // Check if selected video is the first one (free)
      const firstVideoId = ambientVideos.length > 0 ? ambientVideos[0].id : null;
      if (selectedAmbientVideo !== firstVideoId) {
        // Only clear if it's not the first video
        setSelectedAmbientVideo(null);
        localStorage.removeItem('selectedAmbientVideo');
      }
    }
  }, [isPremium, selectedAmbientVideo, ambientVideos]);

  // Track if we just completed a phase (to avoid double triggering)
  const phaseCompletedRef = useRef(false);
  const [localPomodoroPhase, setLocalPomodoroPhase] = useState("work"); // "work" or "break"
  const [localPomodoroCount, setLocalPomodoroCount] = useState(0);
  const [showPomodoroNotification, setShowPomodoroNotification] = useState(false);
  const [pomodoroNotificationMessage, setPomodoroNotificationMessage] = useState("");

  // Local timer helpers
  const getTotalDuration = () => {
    if (mode === "pomodoro")
      return (localPomodoroPhase === "break" ? 5 : 25) * 60;
    if (mode === "custom") return (customMinutes || 25) * 60;
    return 0; // stopwatch
  };

  const startLocalTimer = () => {
    // lock current pomodoro phase at start
    if (mode === "pomodoro") {
      pomodoroPhaseRef.current = localPomodoroPhase;
    } else {
      pomodoroPhaseRef.current = "";
    }
    phaseCompletedRef.current = false;
    // resume from paused
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
    totalPomodoroTimeRef.current = 0; // Reset total Pomodoro time
  };
  
  // Auto-transition between Pomodoro work/break phases
  useEffect(() => {
    if (mode !== "pomodoro" || !isRunning) return;
    
    const totalDuration = localPomodoroPhase === "break" ? 5 * 60 : 25 * 60;
    
    // Check if timer reached 0 and we haven't already processed this completion
    if (elapsedSeconds >= totalDuration && !phaseCompletedRef.current) {
      phaseCompletedRef.current = true;
      
      if (localPomodoroPhase === "work") {
        // Work phase complete - start break
        playNotificationSound?.("work");
        setPomodoroNotificationMessage("🌴 Great work! Time for a 5-minute break.");
        setShowPomodoroNotification(true);
        
        // Add completed work phase time to total (use actual elapsed time, which should be ~25 minutes)
        totalPomodoroTimeRef.current += elapsedSeconds;
        
        // Reset local timer and switch to break phase
        if (intervalRef.current) clearInterval(intervalRef.current);
        startMsRef.current = Date.now();
        pausedAccumulatedRef.current = 0;
        setElapsedSeconds(0);
        setLocalPomodoroPhase("break");
        pomodoroPhaseRef.current = "break";
        phaseCompletedRef.current = false;
        
        // Restart the interval
        intervalRef.current = setInterval(() => {
          const diff = Date.now() - startMsRef.current;
          setElapsedSeconds(Math.floor(diff / 1000));
        }, 100);
        
        // Auto-hide notification after 4 seconds
        setTimeout(() => setShowPomodoroNotification(false), 4000);
        
      } else {
        // Break phase complete - this counts as a completed pomodoro cycle!
        playNotificationSound?.("break");
        const newCycleCount = localPomodoroCount + 1;
        setLocalPomodoroCount(newCycleCount);
        setPomodoroNotificationMessage(`🏆 Pomodoro #${newCycleCount} complete! +50 XP bonus. Back to work!`);
        setShowPomodoroNotification(true);
        
        // Don't add break time to total - only work time counts as study time
        
        // Award XP for completing a pomodoro cycle
        if (grantXP) {
          grantXP(50, "pomodoro_cycle");
        }
        
        // Update quest progress for pomodoro cycles
        updateQuestProgress?.("pomodoro_cycles", 1);
        
        // Reset local timer and switch to work phase
        if (intervalRef.current) clearInterval(intervalRef.current);
        startMsRef.current = Date.now();
        pausedAccumulatedRef.current = 0;
        setElapsedSeconds(0);
        setLocalPomodoroPhase("work");
        pomodoroPhaseRef.current = "work";
        phaseCompletedRef.current = false;
        
        // Restart the interval
        intervalRef.current = setInterval(() => {
          const diff = Date.now() - startMsRef.current;
          setElapsedSeconds(Math.floor(diff / 1000));
        }, 100);
        
        // Auto-hide notification after 4 seconds
        setTimeout(() => setShowPomodoroNotification(false), 4000);
      }
    }
  }, [elapsedSeconds, mode, isRunning, localPomodoroPhase, localPomodoroCount, playNotificationSound, updateQuestProgress]);

  // Helper function to get start of week
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
  };

  // Get subject from URL params
  const getSubjectFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("subject");
  };

  const subject = getSubjectFromURL();

  // Handle incoming state from AI Schedule
  useEffect(() => {
    if (location.state?.isFromSchedule) {
      const { duration, subject: scheduleSubject, topic } = location.state;
      
      // Set the timer duration if provided
      if (duration) {
        setCustomMinutesInput(duration.toString());
        // Use 'custom' mode to respect the specific duration from the AI schedule
        setTimerMode('custom');
        setCustomMinutes(duration);
        // Reset local timer to ensure it starts from zero with the new duration
        resetLocalTimer();
      }

      // Set the subject if provided
      if (scheduleSubject) {
        setTimerSubject(scheduleSubject);
      }

      // Pre-fill session notes with the topic
      if (topic) {
        setSessionNotes(`Focusing on: ${topic}\n`);
      }

      // Clear the state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setTimerMode, setCustomMinutes, setTimerSubject]);

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
  }, [subject, setTimerSubject]); // setTimerSubject is now stable with useCallback

  // Get subject tasks
  const getSubjectTasks = () => {
    return tasks.filter((task) => task.subject === subject);
  };

  const subjectTasks = getSubjectTasks();

  // Handle custom duration input
  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutesInput);
    if (minutes > 0 && minutes <= 480) {
      // Max 8 hours
      setCustomMinutes(minutes);
      setTimerMode("custom");
      // restart local timer base
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
      // Reset pomodoro state when switching modes
      if (newMode === "pomodoro") {
        setLocalPomodoroPhase("work");
        setLocalPomodoroCount(0);
        totalPomodoroTimeRef.current = 0;
      } else {
        // Reset total Pomodoro time when switching away from Pomodoro mode
        totalPomodoroTimeRef.current = 0;
      }
    }
  };

  // Get display time using local timer
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
  
  // Check if currently in break phase
  const isInBreakPhase = mode === "pomodoro" && localPomodoroPhase === "break";

  // Progress based on local timer
  const getProgress = () => {
    if (mode === "stopwatch") return 0;
    const total = getTotalDuration();
    return total > 0 ? Math.min(100, (elapsedSeconds / total) * 100) : 0;
  };

  // Helper function to get mode duration
  const getModeDuration = (timerMode) => {
    switch (timerMode) {
      case "pomodoro":
        return localPomodoroPhase === "break" ? 5 * 60 : 25 * 60;
      case "custom":
        return (customMinutes || 25) * 60;
      case "stopwatch":
        return 0;
      default:
        return 25 * 60;
    }
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

  // If no subject is selected, show subject selection page
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
    // pause both local and global timers
    pauseLocalTimer();
    stopTimer();
    setShowEndSession(true);
  };

  const handleSaveSession = () => {
    // For Pomodoro mode, calculate total time including all completed work phases and current phase
    let totalSessionSeconds = elapsedSeconds;
    if (mode === "pomodoro") {
      // Add total accumulated WORK time from completed phases
      totalSessionSeconds = totalPomodoroTimeRef.current;
      
      // Add current phase time only if it's a work phase (breaks don't count as study time)
      if (localPomodoroPhase === "work") {
        totalSessionSeconds += elapsedSeconds;
      }
      // If ending during break, don't add the break time to study time
    }
    
    // Ensure we have a valid duration - use minimum 1 minute if session was very short
    const sessionDurationMinutes = Math.max(
      1,
      Math.round((totalSessionSeconds / 60) * 100) / 100,
    );

    // Save session data based on actual elapsedSeconds
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

    // Add to gamification system (handles XP and quest updates internally)
    const sessionResult = addStudySession(sessionData);

    // Update study sessions in localStorage with enriched data
    const updatedSessions = [...studySessions, sessionResult];
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    setStudySessions(updatedSessions);

    // Update task if completed
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

    // Show completion success with rewards
    addReward({
      type: "SESSION_COMPLETE",
      title: `🎉 Session Complete!`,
      description: `You studied ${subject} for ${sessionDurationMinutes.toFixed(1)} minutes and earned ${sessionResult.xpEarned} XP!`,
      tier: "uncommon",
      xp: sessionResult.xpEarned,
      bonuses: sessionResult.bonuses,
    });

    // Reset session state but keep subject to avoid blank screen
    setSessionNotes("");
    setCurrentTask("");
    setIsTaskComplete(false);
    setShowEndSession(false);
    setSessionMood("");
    setSessionReflection("");
    setSessionDifficulty(2);

    // Reset timers but keep the subject active
    resetLocalTimer();
    resetTimer();

    // Show rewards for a few seconds then allow continuing
    setShowRewards(true);

    // Stay on the study page instead of going to subject selection
    // The subject remains in the URL so user can continue studying
  };

  const deleteStudySession = (index) => {
    const updatedSessions = studySessions.filter((_, i) => i !== index);
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions));
    setStudySessions(updatedSessions);
  };

  const handleTaskSelection = (taskName) => {
    setCurrentTask(taskName);
    // Automatically check the completion checkbox when a task is selected
    if (taskName) {
      setIsTaskComplete(true);
    }
  };

  const MODES = [
    { key: "pomodoro", label: "Pomodoro", duration: 25 * 60 },
    { key: "custom", label: "Custom", duration: null },
    { key: "stopwatch", label: "Stopwatch", duration: 0 },
  ];

  const moods = [
    { emoji: "😄", label: "Great", value: "great" },
    { emoji: "🙂", label: "Good", value: "good" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😫", label: "Struggled", value: "struggled" },
  ];

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

          {/* Mood Tracker */}
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

          {/* Reflection */}
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

          {/* Difficulty Rating */}
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

          {/* Action Buttons */}
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
        {/* Ambient Mode Fullscreen Overlay */}
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
              {/* Video Background - First video is free, rest require premium */}
              {selectedAmbientVideo && (
                (() => {
                  const selectedVideo = ambientVideos.find(vid => vid.id === selectedAmbientVideo);
                  const isFirstVideo = ambientVideos.length > 0 && ambientVideos[0].id === selectedAmbientVideo;
                  // Allow first video for free, rest require premium
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
              
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0" />
              
              {/* Settings Button in Corner */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAmbientGallery(true);
                }}
                className="absolute top-4 right-4 z-20 p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.2 }}
                title="Manage Background Images"
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>

              {/* YouTube Music Player */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: showPlaylistSelector ? -400 : 0
                }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute bottom-4 left-4 z-20 max-w-sm"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  {!isYouTubeMusicConnected ? (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.nativeEvent) {
                            e.nativeEvent.stopImmediatePropagation();
                          }
                          handleYouTubeMusicLogin();
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] hover:bg-[#ff1a1a] text-white rounded-lg font-semibold transition-all shadow-lg w-full"
                      >
                        <Music className="w-4 h-4" />
                        Connect YouTube Music
                      </button>
                      {youtubeMusicError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded mt-2"
                        >
                          {youtubeMusicError}
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Current Track Info */}
                      {currentTrack && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3"
                        >
                          {currentTrack.thumbnail && typeof currentTrack.thumbnail === 'string' && currentTrack.thumbnail.trim() !== '' ? (
                            <img
                              src={currentTrack.thumbnail}
                              alt={currentTrack.name || 'Track'}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-purple-600/30 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white/60" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isInBreakPhase ? 'text-green-400' : 'text-white'}`}>
                              {currentTrack.name || 'Unknown Track'}
                            </p>
                            <p className="text-xs text-white/60 truncate">
                              {currentTrack.artist || 'Unknown Artist'}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Playlist Selector - Always Available */}
                        <div className="relative playlist-selector-container">
                          {!currentTrack && !isYouTubeMusicPlaying ? (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPlaylistSelector(!showPlaylistSelector);
                              }}
                              disabled={isYouTubeMusicLoading}
                              className="flex items-center gap-2 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isYouTubeMusicLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <ListMusic className="w-4 h-4" />
                                  <span>Lofi Playlists</span>
                                  <ChevronDown className={`w-3 h-3 transition-transform ${showPlaylistSelector ? 'rotate-180' : ''}`} />
                                </>
                              )}
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPlaylistSelector(!showPlaylistSelector);
                              }}
                              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Change Playlist"
                            >
                              <ListMusic className="w-4 h-4" />
                            </motion.button>
                          )}

                          {/* Playlist Selector Dropdown */}
                          <AnimatePresence>
                            {showPlaylistSelector && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-30 max-h-96 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Top 10 Most Played Section */}
                                {mostPlayedPlaylists.length > 0 && (
                                  <div className="p-2 border-b border-white/10">
                                    <p className="text-xs font-semibold text-purple-400 mb-2 px-2 flex items-center gap-1">
                                      <Trophy className="w-3 h-3" />
                                      Top 10 Most Played
                                    </p>
                                    {mostPlayedPlaylists.map((playlist) => (
                                      <motion.button
                                        key={playlist.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playLofiPlaylist(playlist.id);
                                          setShowPlaylistSelector(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between group ${
                                          currentTrack?.playlistId === playlist.id ? 'bg-purple-500/20 border border-purple-500/30' : ''
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-white truncate flex items-center gap-2">
                                            {currentTrack?.playlistId === playlist.id && (
                                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                            )}
                                            {playlist.name}
                                          </p>
                                          <p className="text-xs text-white/50">Played {playlist.playCount} {playlist.playCount === 1 ? 'time' : 'times'}</p>
                                        </div>
                                        <Play className="w-3 h-3 text-white/50 group-hover:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </motion.button>
                                    ))}
                                  </div>
                                )}

                                {/* All Playlists Section */}
                                <div className="p-2">
                                  <p className="text-xs font-semibold text-purple-400 mb-2 px-2 flex items-center gap-1">
                                    <ListMusic className="w-3 h-3" />
                                    All Playlists
                                  </p>
                                  {availablePlaylists.map((playlist) => (
                                    <motion.button
                                      key={playlist.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playLofiPlaylist(playlist.id);
                                        setShowPlaylistSelector(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between group ${
                                        currentTrack?.playlistId === playlist.id ? 'bg-purple-500/20 border border-purple-500/30' : ''
                                      }`}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <span className="text-sm text-white flex items-center gap-2">
                                        {currentTrack?.playlistId === playlist.id && (
                                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                        )}
                                        {playlist.name}
                                      </span>
                                      <Play className="w-3 h-3 text-white/50 group-hover:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Play/Pause Button - Only show when track is playing */}
                        {currentTrack && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleYouTubeMusicPlayback();
                            }}
                            disabled={isYouTubeMusicLoading}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isYouTubeMusicLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isYouTubeMusicPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}

                        {/* Search Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowYouTubeMusicSearch(!showYouTubeMusicSearch);
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Search music"
                        >
                          <Search className="w-4 h-4" />
                        </motion.button>

                        {/* Disconnect Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleYouTubeMusicLogout();
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Disconnect YouTube Music"
                        >
                          <LogOut className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Error Message */}
                      {youtubeMusicError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded"
                        >
                          {youtubeMusicError}
                        </motion.p>
                      )}

                      {/* Search Input */}
                      <AnimatePresence>
                        {showYouTubeMusicSearch && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (youtubeMusicSearchQuery.trim()) {
                                searchAndPlay(youtubeMusicSearchQuery);
                                setShowYouTubeMusicSearch(false);
                                setYouTubeMusicSearchQuery('');
                              }
                            }}
                            className="flex items-center gap-2 overflow-hidden"
                          >
                            <input
                              type="text"
                              value={youtubeMusicSearchQuery}
                              onChange={(e) => setYouTubeMusicSearchQuery(e.target.value)}
                              placeholder="Search for a song..."
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              autoFocus
                            />
                            <motion.button
                              type="submit"
                              disabled={!youtubeMusicSearchQuery.trim() || isYouTubeMusicLoading}
                              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => {
                                setShowYouTubeMusicSearch(false);
                                setYouTubeMusicSearchQuery('');
                              }}
                              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <XIcon className="w-4 h-4" />
                            </motion.button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <div className="text-center relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${isInBreakPhase ? 'text-green-400' : 'text-white'} drop-shadow-2xl`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <div className={`text-9xl font-bold tracking-wider mb-4 ${isInBreakPhase ? 'text-green-400' : 'text-white'}`} style={{ fontWeight: 900 }}>
                    {getDisplayTime()}
                  </div>
                  {subject && (
                    <div className={`text-2xl mt-8 drop-shadow-lg font-bold ${isInBreakPhase ? 'text-green-400/90' : 'text-white/90'}`} style={{ fontWeight: 700 }}>
                      {subject}
                    </div>
                  )}
                </motion.div>
                
                {/* Minimal Control Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex items-center justify-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Start/Pause Button */}
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
                      title="Pause"
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
                      title="Start"
                    >
                      <Play className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  {/* End Session Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndSession();
                    }}
                    className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="End Session"
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Mode Gallery Modal */}
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

                {/* Info Section */}
                <div className="mb-6 p-4 bg-purple-800/20 border border-purple-700/30 rounded-lg">
                  <p className="text-purple-300/80 text-sm">
                    <strong className="text-white">Note:</strong> Images and videos may not appear instantly. Please wait for a few seconds.
                    
                  </p>
                </div>

                {/* Static Images Section */}
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
                              // Fallback if image fails to load
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
                      <p className="text-purple-300/60 text-sm mt-1">Add images in ambientImages.js</p>
                    </div>
                  )}
                </div>

                {/* Animated Wallpapers Section - Premium Only */}
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
                                    // Pause session and exit ambient mode
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
                            {isLocked && (
                              <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Premium
                              </div>
                            )}
                            {!isLocked && (
                              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                MP4
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
                      <p className="text-purple-300/60 text-sm mt-1">Add MP4 videos in ambientImages.js</p>
                    </div>
                  )}
                  
                  {!isPremium && ambientVideos.length > 1 && (
                    <div className="mt-6 text-center py-6 bg-gradient-to-br from-purple-900/30 to-slate-900/30 rounded-lg border-2 border-purple-500/30">
                      <h4 className="text-lg font-bold text-white mb-2">Unlock More Wallpapers</h4>
                      <p className="text-purple-300/80 mb-4 text-sm max-w-md mx-auto">
                        Upgrade to Professor Plan to access all animated wallpapers.
                      </p>
                      <button
                        onClick={() => {
                          // Pause session and exit ambient mode
                          pauseLocalTimer();
                          stopTimer();
                          setIsAmbientMode(false);
                          setShowAmbientGallery(false);
                          if (document.exitFullscreen) {
                            document.exitFullscreen().catch(err => console.log(err));
                          }
                          setShowPremiumModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        Upgrade to Premium
                      </button>
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

        {/* Pomodoro Phase Transition Notification */}
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

        {/* Focus Mode Overlay */}
        {isFocusMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
            <div className="w-full max-w-2xl">
              {/* Focus Mode Timer Card */}
              <div className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 backdrop-blur-md rounded-3xl p-12 border border-purple-700/40 shadow-2xl shadow-purple-500/20">
                <div className="flex flex-col items-center">
                  {/* Subject Display */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {subject}
                    </h2>
                    {currentTask && (
                      <p className="text-gray-300 text-lg">{currentTask}</p>
                    )}
                  </div>

                  {/* Custom Duration Input */}
                  {showCustomInput && (
                    <motion.div
                      className="w-full mb-8 p-6 bg-purple-900/30 rounded-xl border border-purple-700/30 backdrop-blur-sm"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-white text-lg font-medium mb-3">
                        Custom Duration (minutes)
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={customMinutesInput}
                          onChange={(e) =>
                            setCustomMinutesInput(e.target.value)
                          }
                          className="flex-1 p-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 text-lg focus:outline-none focus:border-purple-600/80 transition"
                          placeholder="25"
                        />
                        <motion.button
                          onClick={handleCustomDuration}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Set
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Mode Selection */}
                  <div className="flex gap-3 mb-8">
                    {MODES.map((m) => (
                      <motion.button
                        key={m.key}
                        className={`px-6 py-3 rounded-full font-semibold transition-all text-lg ${
                          mode === m.key
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                            : "bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                        }`}
                        onClick={() => handleModeChange(m.key)}
                        disabled={isRunning}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {m.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Mode Status */}
                  {mode === "pomodoro" && (
                    <div className="text-center mb-8">
                        <div className={`text-xl font-medium ${isInBreakPhase ? 'text-green-400' : 'text-white'}`}>
                          {isInBreakPhase ? "🌴 Break Time" : "📚 Work Time"}
                      </div>
                      <div className="text-gray-300 text-lg">
                          {localPomodoroCount} pomodoros completed
                      </div>
                    </div>
                  )}

                  {/* Large Timer Display */}
                  <div className="relative mb-12 w-[320px] h-[320px]">
                    {mode !== "stopwatch" && (
                      <svg
                        width="320"
                        height="320"
                        className="absolute inset-0"
                      >
                        <circle
                          cx="160"
                          cy="160"
                          r="144"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="160"
                          cy="160"
                          r="144"
                          stroke={
                              isInBreakPhase
                              ? "#4ADE80"
                              : mode === "pomodoro" &&
                                elapsedSeconds > getTotalDuration() &&
                                  localPomodoroPhase === "work"
                                ? "#EF4444"
                                : "var(--primary)"
                          }
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 144}
                          strokeDashoffset={
                            2 * Math.PI * 144 * (1 - getProgress() / 100)
                          }
                          style={{
                            transition: "stroke-dashoffset 0.5s, stroke 0.2s",
                          }}
                        />
                      </svg>
                    )}
                    <div
                      className={`absolute inset-0 rounded-full bg-white/10 flex items-center justify-center ${isInBreakPhase ? "text-green-400" : mode === "pomodoro" && elapsedSeconds > getTotalDuration() && localPomodoroPhase === "work" ? "text-red-400" : "text-white"}`}
                    >
                      <span className="text-8xl font-mono drop-shadow-2xl">
                        {getDisplayTime()}
                      </span>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex gap-6 mb-8">
                    {isRunning ? (
                      <motion.button
                        onClick={() => {
                          pauseLocalTimer();
                          stopTimer();
                        }}
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 transition flex items-center gap-3 text-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Pause className="w-6 h-6" />
                        Pause
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => {
                          startLocalTimer();
                          startTimer();
                          // Automatically enable ambient mode when starting
                          setIsAmbientMode(true);
                          // Request fullscreen
                          const element = document.documentElement;
                          if (element.requestFullscreen) {
                            element.requestFullscreen().catch(err => console.log(err));
                          }
                        }}
                        disabled={
                          mode !== "stopwatch" && getTotalDuration() === 0
                        }
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-3 text-xl disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-6 h-6" />
                        Start
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => {
                        resetLocalTimer();
                        resetTimer();
                      }}
                      className="px-8 py-4 rounded-xl bg-purple-900/40 text-white font-bold shadow-lg hover:bg-purple-900/60 border border-purple-700/40 transition flex items-center gap-3 text-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw className="w-6 h-6" />
                      Reset
                    </motion.button>
                    <motion.button
                      onClick={handleEndSession}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:shadow-lg hover:shadow-red-500/50 transition flex items-center gap-3 text-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="w-6 h-6" />
                      End
                    </motion.button>
                  </div>

                  {/* Debug Info */}
                  <div className="text-sm text-gray-400 mb-6 text-center">
                    <div>Mode: {mode}</div>
                    <div>Running: {isRunning ? "Yes" : "No"}</div>
                    <div>Seconds Left: {secondsLeft}</div>
                    <div>Stopwatch: {stopwatchSeconds}</div>
                  </div>

                  {/* Focus Mode Controls */}
                  <div className="flex items-center gap-6">
                    <motion.button
                      onClick={() => setIsFocusMode(false)}
                      className="px-6 py-3 rounded-lg bg-purple-900/40 text-white font-semibold hover:bg-purple-900/60 border border-purple-700/40 transition flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Target className="w-5 h-5" />
                      Exit Focus Mode
                    </motion.button>
                    <motion.button
                      onClick={() => { handleCancelStudy(); navigate("/subjects"); }}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5" />
                      Cancel Study
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setIsAmbientMode(!isAmbientMode);
                        if (!isAmbientMode) {
                          // Request fullscreen
                          const element = document.documentElement;
                          if (element.requestFullscreen) {
                            element.requestFullscreen().catch(err => console.log(err));
                          }
                        } else {
                          // Exit fullscreen
                          if (document.exitFullscreen) {
                            document.exitFullscreen().catch(err => console.log(err));
                          }
                        }
                      }}
                      className={`px-6 py-3 rounded-lg transition flex items-center gap-2 ${
                        isAmbientMode
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                          : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-700/40"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Clock className="w-5 h-5" />
                      Ambient Mode
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Study Interface */}
        <div
          className={`transition-opacity duration-500 ${isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          {/* Top Bar - Context Panel */}
          <div className="bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-md border-b border-purple-700/30 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {subject || "Select Subject"}
                  </h1>
                  {currentTask && (
                    <p className="text-sm text-gray-300">{currentTask}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{todayStats.minutes.toFixed(1)}min today</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-[#FEC260]" />
                    <span>{streak} day streak</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <div className="text-sm text-purple-300">Weekly Progress</div>
                  <div className="text-lg font-bold text-white">
                    {Math.floor(weeklyProgress.studied / 60)}h /{" "}
                    {Math.floor(weeklyProgress.goal / 60)}h
                  </div>
                  <div className="text-xs text-purple-300/70">
                    {weeklyProgress.percentage}% complete
                  </div>
                </div>
                <motion.button
                  onClick={() => { handleCancelStudy(); navigate("/subjects"); }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-lg hover:shadow-red-500/50 transition flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  Cancel Study
                </motion.button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Study Panel */}
              <div className="space-y-6">
                {/* Timer Card */}
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-8 border border-purple-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center">
                    {/* Custom Duration Input */}
                    {showCustomInput && (
                      <motion.div
                        className="w-full mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/40"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-white text-sm font-medium mb-2">
                          Custom Duration (minutes)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max="480"
                            value={customMinutesInput}
                            onChange={(e) =>
                              setCustomMinutesInput(e.target.value)
                            }
                            className="flex-1 p-2 rounded bg-purple-900/40 text-white border border-purple-700/50 text-sm focus:outline-none focus:border-purple-600/80 transition"
                            placeholder="25"
                          />
                          <motion.button
                            onClick={handleCustomDuration}
                            className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Set
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Mode Selection */}
                    <div className="flex gap-2 mb-6">
                      {MODES.map((m) => (
                        <motion.button
                          key={m.key}
                          className={`px-4 py-2 rounded-full font-semibold transition-all ${
                            mode === m.key
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                              : "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-700/30"
                          }`}
                          onClick={() => handleModeChange(m.key)}
                          disabled={isRunning}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {m.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Mode Status */}
                    {mode === "pomodoro" && (
                      <div className="text-center mb-6">
                        <div className={`text-sm font-medium ${isInBreakPhase ? 'text-green-400' : 'text-white'}`}>
                          {isInBreakPhase ? "🌴 Break Time" : "📚 Work Time"}
                        </div>
                        <div className="text-xs text-gray-300">
                          {localPomodoroCount} pomodoros completed
                        </div>
                      </div>
                    )}

                    {/* Timer Display */}
                    <div className="relative mb-8 w-[160px] h-[160px]">
                      {mode !== "stopwatch" && (
                        <svg
                          width="160"
                          height="160"
                          className="absolute inset-0"
                        >
                          <circle
                            cx="80"
                            cy="80"
                            r="64"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="64"
                            stroke={
                              isInBreakPhase
                                ? "#4ADE80"
                                : mode === "pomodoro" &&
                              elapsedSeconds > getTotalDuration() &&
                                  localPomodoroPhase === "work"
                                ? "#EF4444"
                                : "var(--primary)"
                            }
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 64}
                            strokeDashoffset={
                              2 * Math.PI * 64 * (1 - getProgress() / 100)
                            }
                            style={{
                              transition: "stroke-dashoffset 0.5s, stroke 0.2s",
                            }}
                          />
                        </svg>
                      )}
                      <div
                        className={`absolute inset-0 rounded-full bg-white/10 flex items-center justify-center ${isInBreakPhase ? "text-green-400" : mode === "pomodoro" && elapsedSeconds > getTotalDuration() && localPomodoroPhase === "work" ? "text-red-400" : "text-white"}`}
                      >
                        <span className={`text-6xl font-mono drop-shadow-lg`}>
                          {getDisplayTime()}
                        </span>
                      </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-4 mb-6">
                      {isRunning ? (
                        <motion.button
                          onClick={() => {
                            pauseLocalTimer();
                            stopTimer();
                          }}
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 transition flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Pause className="w-5 h-5" />
                          Pause
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => {
                            startLocalTimer();
                            startTimer();
                            // Automatically enable ambient mode when starting
                            setIsAmbientMode(true);
                            // Request fullscreen
                            const element = document.documentElement;
                            if (element.requestFullscreen) {
                              element.requestFullscreen().catch(err => console.log(err));
                            }
                          }}
                          disabled={
                            mode !== "stopwatch" && getTotalDuration() === 0
                          }
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2 disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-5 h-5" />
                          Start
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => {
                          resetLocalTimer();
                          resetTimer();
                        }}
                        className="px-6 py-3 rounded-xl bg-purple-900/40 text-white font-bold shadow-lg hover:bg-purple-900/60 border border-purple-700/40 transition flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                      </motion.button>
                      <motion.button
                        onClick={handleEndSession}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:shadow-lg hover:shadow-red-500/50 transition flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Square className="w-5 h-5" />
                        End
                      </motion.button>
                    </div>

                    {/* Debug Info */}
                    <div className="text-xs text-purple-300/70 mb-4">
                      <div>Mode: {mode}</div>
                      <div>Running: {isRunning ? "Yes" : "No"}</div>
                      <div>Seconds Left: {secondsLeft}</div>
                      <div>Stopwatch: {stopwatchSeconds}</div>
                    </div>

                    {/* Focus Mode Toggle */}
                    <div className="flex items-center gap-4">
                      
                      <motion.button
                        onClick={() => {
                          setIsAmbientMode(!isAmbientMode);
                          if (!isAmbientMode) {
                            // Request fullscreen
                            const element = document.documentElement;
                            if (element.requestFullscreen) {
                              element.requestFullscreen().catch(err => console.log(err));
                            }
                          } else {
                            // Exit fullscreen
                            if (document.exitFullscreen) {
                              document.exitFullscreen().catch(err => console.log(err));
                            }
                          }
                        }}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                          isAmbientMode
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                            : "bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-700/40"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Clock className="w-4 h-4" />
                        Ambient Mode
                      </motion.button>
                      </div>
                    </div>
                  </motion.div>

                {/* Current Task Input */}
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Current Task/Topic
                  </h3>

                  <div className="mb-4">
                    <select
                      value={currentTask}
                      onChange={(e) => handleTaskSelection(e.target.value)}
                      className="w-full p-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition"
                      disabled={isRunning}
                    >
                      <option value="">
                        Select a task or enter custom topic
                      </option>
                      {subjectTasks.length > 0 ? (
                        subjectTasks.map((task) => (
                          <option key={task.id} value={task.name}>
                            {task.name} ({task.time} min - {task.priority})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No tasks available for {subject}
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      className="w-full p-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition"
                      placeholder="Or type a custom topic..."
                    />
                  </div>

                  {/* Task Completion */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taskComplete"
                      checked={isTaskComplete}
                      onChange={(e) => setIsTaskComplete(e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor="taskComplete"
                      className="text-white text-sm"
                    >
                      Mark task as complete
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar - Stats Panel */}
              <div className="space-y-6">
                {/* Today's Stats */}
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Today's Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200/80">Sessions</span>
                      <span className="text-white font-bold">
                        {todayStats.sessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200/80">Time Studied</span>
                      <span className="text-white font-bold">
                        {Math.round(todayStats.minutes)} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200/80">Current Streak</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Flame className="w-4 h-4 text-[#FEC260]" />
                        {streak} days
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Weekly Progress */}
                <motion.div
                  className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-pink-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                    Weekly Goal
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-pink-200/80">Studied</span>
                      <span className="text-white font-bold">
                        {Math.floor(weeklyProgress.studied / 60)}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-200/80">Goal</span>
                      <span className="text-white font-bold">
                        {Math.floor(weeklyProgress.goal / 60)}h
                      </span>
                    </div>
                    <div className="w-full bg-pink-500/20 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(weeklyProgress.percentage, 100)}%` }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                    <div className="text-center text-sm text-pink-200/80">
                      {weeklyProgress.percentage}% complete
                    </div>
                  </div>
                </motion.div>

                {/* Recent Study Logs */}
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Recent Study Logs
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto">
                    {studySessions.filter(
                      (session) => session.subjectName === subject,
                    ).length > 0 ? (
                      <div className="space-y-3">
                        {studySessions
                          .filter((session) => session.subjectName === subject)
                          .slice(0, 5)
                          .map((session, index) => {
                            const moodEmoji =
                              {
                                great: "😄",
                                good: "🙂",
                                okay: "😐",
                                struggled: "😫",
                              }[session.mood] || "";

                            return (
                              <motion.div
                                key={index}
                                className="p-3 rounded-lg bg-purple-800/20 border border-purple-700/30 hover:bg-purple-800/40 transition-all"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-white">
                                      {session.durationMinutes.toFixed(1)} min
                                    </span>
                                  </div>
                                  <span className="text-xs text-purple-200/80">
                                    {new Date(
                                      session.timestamp,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>

                                {session.task && (
                                  <div className="text-xs text-purple-200/80 mb-1">
                                    <span className="font-medium">Task:</span>{" "}
                                    {session.task}
                                  </div>
                                )}

                                {session.reflection && (
                                  <div className="text-xs text-purple-200/80 mb-2 italic">
                                    "{session.reflection}"
                                  </div>
                                )}

                                <div className="flex items-center gap-3 text-xs">
                                  {session.mood && (
                                    <span className="text-purple-200/80 flex items-center gap-1">
                                      <span>{moodEmoji}</span>
                                      <span className="capitalize">
                                        {session.mood}
                                      </span>
                                    </span>
                                  )}
                                  {session.difficulty && (
                                    <span className="text-purple-200/80">
                                      Difficulty: {session.difficulty}/4
                                    </span>
                                  )}
                                </div>

                                <motion.button
                                  onClick={() =>
                                    deleteStudySession(
                                      studySessions.indexOf(session),
                                    )
                                  }
                                  className="mt-2 p-1 rounded hover:bg-red-600/30 transition text-red-400 hover:text-red-300"
                                  title="Delete session"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </motion.button>
                              </motion.div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                        <p className="text-purple-300/80 text-sm">
                          No study logs yet for this subject
                        </p>
                        <p className="text-purple-300/60 text-xs">
                          Complete a session to see your logs here!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Achievements */}
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {streak >= 3 && (
                      <motion.div
                        className="flex items-center gap-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30 hover:bg-yellow-900/40 transition-all"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Flame className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="text-white text-sm font-medium">
                            Streak Master
                          </div>
                          <div className="text-yellow-200/80 text-xs">
                            {streak} day streak!
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {todayStats.minutes >= 120 && (
                      <motion.div
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-900/20 border border-blue-700/30 hover:bg-blue-900/40 transition-all"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Zap className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white text-sm font-medium">
                            Study Warrior
                          </div>
                          <div className="text-blue-200/80 text-xs">
                            2+ hours today!
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {weeklyProgress.percentage >= 80 && (
                      <motion.div
                        className="flex items-center gap-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/30 hover:bg-emerald-900/40 transition-all"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Target className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-white text-sm font-medium">
                            Goal Crusher
                          </div>
                          <div className="text-emerald-200/80 text-xs">
                            80%+ weekly goal!
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {studySessions.length === 0 && (
                      <div className="text-center py-4">
                        <Award className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                        <p className="text-purple-300/80 text-sm">
                          Complete your first session to unlock achievements!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Reward System is handled globally in App.jsx */}
    </div>
    </>
  );
};

export default Study;
