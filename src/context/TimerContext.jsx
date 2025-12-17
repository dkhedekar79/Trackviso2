import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Sound notification helper
const playNotificationSound = (type = 'work') => {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different tones for work vs break completion
    if (type === 'break') {
      // Uplifting tone for break end (time to work!)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3); // G5
    } else {
      // Relaxing tone for work end (time to rest!)
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio notification not available');
  }
};

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState({
    isRunning: false,
    mode: 'pomodoro', // pomodoro, custom, stopwatch
    secondsLeft: 25 * 60, // For countdown modes
    stopwatchSeconds: 0, // For stopwatch mode
    isPomodoroBreak: false,
    pomodoroCount: 0,
    totalCyclesCompleted: 0, // Track total completed pomodoro cycles
    subjectName: '',
    // Custom duration (minutes) for custom mode
    customMinutes: 25,
    startTime: null, // Store when timer started (ms)
    pausedTime: null, // Accumulated time when paused (seconds)
    lastUpdateTime: null, // Track last update for accuracy (ms)
    phaseJustCompleted: null, // 'work' or 'break' - used for detecting phase transitions
    showPhaseNotification: false, // Show notification when phase changes
  });
  
  // Callbacks for phase completion (can be set by Study page)
  const onWorkCompleteRef = useRef(null);
  const onBreakCompleteRef = useRef(null);
  const onCycleCompleteRef = useRef(null);

  const { isRunning, mode, secondsLeft, stopwatchSeconds, isPomodoroBreak, pomodoroCount, subjectName, startTime, pausedTime, lastUpdateTime, customMinutes } = timerState;

  // Calculate actual elapsed time based on real timestamps
  const getActualElapsedTime = useCallback(() => {
    if (!startTime) return 0;
    if (isRunning) {
      return Math.floor((Date.now() - startTime) / 1000);
    } else if (pausedTime !== null) {
      return pausedTime;
    }
    return 0;
  }, [startTime, isRunning, pausedTime]);

  // Update timer display based on actual elapsed time
  const updateTimerDisplay = () => {
    if (mode === 'stopwatch') {
      const elapsed = getActualElapsedTime();
      setTimerState(prev => ({ ...prev, stopwatchSeconds: elapsed }));
    } else {
      const elapsed = getActualElapsedTime();
      const totalDuration = getModeDuration(mode);
      const remaining = Math.max(0, totalDuration - elapsed);
      setTimerState(prev => ({ ...prev, secondsLeft: remaining }));
    }
  };

  // Main timer update loop - runs every 100ms for smooth display
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      updateTimerDisplay();
      if (mode !== 'stopwatch') {
        const elapsed = getActualElapsedTime();
        const totalDuration = getModeDuration(mode);
        if (elapsed >= totalDuration) handleTimerComplete();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, mode, startTime, pausedTime, customMinutes, isPomodoroBreak]);

  // Handle page visibility changes to maintain timer accuracy
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning) {
          const elapsed = getActualElapsedTime();
          setTimerState(prev => ({ ...prev, pausedTime: elapsed, lastUpdateTime: Date.now() }));
        }
      } else {
        if (isRunning && pausedTime !== null) {
          const now = Date.now();
          const hiddenDuration = now - (lastUpdateTime || now);
          // Shift startTime forward by the hidden duration so elapsed includes background time
          setTimerState(prev => ({ ...prev, startTime: prev.startTime ? prev.startTime + hiddenDuration : now, pausedTime: null }));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, pausedTime, lastUpdateTime]);

  const getModeDuration = (timerMode) => {
    switch (timerMode) {
      case 'pomodoro':
        return isPomodoroBreak ? 5 * 60 : 25 * 60;
      case 'custom':
        return (customMinutes || 25) * 60;
      case 'stopwatch':
        return 0;
      default:
        return 25 * 60;
    }
  };

  // Start or resume timer
  const startTimer = useCallback(() => {
    const now = Date.now();
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      // If we have pausedTime, resume from that elapsed
      startTime: prev.pausedTime !== null ? now - prev.pausedTime * 1000 : now,
      pausedTime: null,
      lastUpdateTime: now
    }));
  }, []);

  const stopTimer = useCallback(() => {
    const elapsed = getActualElapsedTime();
    setTimerState(prev => ({ ...prev, isRunning: false, pausedTime: elapsed, lastUpdateTime: Date.now() }));
  }, [getActualElapsedTime]);

  const resetTimer = useCallback(() => {
    const totalDuration = getModeDuration(mode);
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      secondsLeft: mode === 'stopwatch' ? 0 : totalDuration,
      stopwatchSeconds: 0,
      startTime: null,
      pausedTime: null,
      lastUpdateTime: null
    }));
  }, [mode]);

  // When custom minutes change, reflect it in secondsLeft if not running and in custom mode
  const setCustomMinutes = useCallback((minutes) => {
    setTimerState(prev => {
      const next = { ...prev, customMinutes: minutes };
      if (!prev.isRunning && prev.mode === 'custom') {
        next.secondsLeft = (minutes || 25) * 60;
      }
      return next;
    });
  }, []);

  const setTimerMode = useCallback((newMode) => {
    const totalDuration = getModeDuration(newMode);
    setTimerState(prev => ({
      ...prev,
      mode: newMode,
      secondsLeft: newMode === 'stopwatch' ? 0 : totalDuration,
      stopwatchSeconds: 0,
      isPomodoroBreak: false,
      pomodoroCount: 0,
      startTime: null,
      pausedTime: null,
      lastUpdateTime: null
    }));
  }, []);

  const setTimerSubject = useCallback((subject) => {
    setTimerState(prev => ({ ...prev, subjectName: subject }));
  }, []);

  const handleTimerComplete = () => {
    if (mode === 'pomodoro') {
      if (isPomodoroBreak) {
        // Break is complete - this counts as a completed pomodoro cycle!
        playNotificationSound('break');
        
        // Call the cycle complete callback if registered
        if (onCycleCompleteRef.current) {
          onCycleCompleteRef.current(timerState.pomodoroCount + 1);
        }
        if (onBreakCompleteRef.current) {
          onBreakCompleteRef.current();
        }
        
        // Restart work phase
        setTimerState(prev => ({
          ...prev,
          isPomodoroBreak: false,
          pomodoroCount: prev.pomodoroCount + 1,
          totalCyclesCompleted: prev.totalCyclesCompleted + 1,
          startTime: Date.now(),
          pausedTime: null,
          secondsLeft: 25 * 60,
          phaseJustCompleted: 'break',
          showPhaseNotification: true,
        }));
        
        // Clear the notification after 3 seconds
        setTimeout(() => {
          setTimerState(prev => ({ ...prev, showPhaseNotification: false, phaseJustCompleted: null }));
        }, 3000);
      } else {
        // Work phase is complete, start break
        playNotificationSound('work');
        
        if (onWorkCompleteRef.current) {
          onWorkCompleteRef.current();
        }
        
        setTimerState(prev => ({
          ...prev,
          isPomodoroBreak: true,
          startTime: Date.now(),
          pausedTime: null,
          secondsLeft: 5 * 60,
          phaseJustCompleted: 'work',
          showPhaseNotification: true,
        }));
        
        // Clear the notification after 3 seconds
        setTimeout(() => {
          setTimerState(prev => ({ ...prev, showPhaseNotification: false, phaseJustCompleted: null }));
        }, 3000);
      }
    } else {
      stopTimer();
    }
  };

  const saveStudySession = useCallback((sessionData) => {
    const actualDuration = mode === 'stopwatch' ? stopwatchSeconds : getModeDuration(mode) - secondsLeft;
    const session = { ...sessionData, durationMinutes: Math.round((actualDuration / 60) * 100) / 100, timestamp: new Date().toISOString(), subjectName: subjectName || sessionData.subjectName };
    const existingSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    const updatedSessions = [...existingSessions, session];
    localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
  }, [mode, stopwatchSeconds, secondsLeft, subjectName]);

  // Callback setters for phase completions
  const setOnWorkComplete = useCallback((callback) => {
    onWorkCompleteRef.current = callback;
  }, []);
  
  const setOnBreakComplete = useCallback((callback) => {
    onBreakCompleteRef.current = callback;
  }, []);
  
  const setOnCycleComplete = useCallback((callback) => {
    onCycleCompleteRef.current = callback;
  }, []);
  
  // Clear phase notification manually
  const clearPhaseNotification = useCallback(() => {
    setTimerState(prev => ({ ...prev, showPhaseNotification: false, phaseJustCompleted: null }));
  }, []);
  
  // Skip break and start work immediately
  const skipBreak = useCallback(() => {
    if (mode === 'pomodoro' && isPomodoroBreak) {
      setTimerState(prev => ({
        ...prev,
        isPomodoroBreak: false,
        startTime: Date.now(),
        pausedTime: null,
        secondsLeft: 25 * 60,
        showPhaseNotification: false,
        phaseJustCompleted: null,
      }));
    }
  }, [mode, isPomodoroBreak]);
  
  // Skip work and start break immediately (for testing)
  const skipWork = useCallback(() => {
    if (mode === 'pomodoro' && !isPomodoroBreak) {
      setTimerState(prev => ({
        ...prev,
        isPomodoroBreak: true,
        startTime: Date.now(),
        pausedTime: null,
        secondsLeft: 5 * 60,
        showPhaseNotification: false,
        phaseJustCompleted: null,
      }));
    }
  }, [mode, isPomodoroBreak]);

  const value = {
    ...timerState,
    startTimer,
    stopTimer,
    resetTimer,
    setCustomMinutes,
    setTimerMode,
    setTimerSubject,
    saveStudySession,
    getActualElapsedTime,
    // New Pomodoro-specific exports
    setOnWorkComplete,
    setOnBreakComplete,
    setOnCycleComplete,
    clearPhaseNotification,
    skipBreak,
    skipWork,
    playNotificationSound,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
