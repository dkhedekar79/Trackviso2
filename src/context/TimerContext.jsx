import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState({
    isRunning: false,
    mode: 'pomodoro', // pomodoro, custom, stopwatch
    secondsLeft: 25 * 60, // For countdown modes
    stopwatchSeconds: 0, // For stopwatch mode
    isPomodoroBreak: false,
    pomodoroCount: 0,
    subjectName: '',
    // Custom duration (minutes) for custom mode
    customMinutes: 25,
    startTime: null, // Store when timer started (ms)
    pausedTime: null, // Accumulated time when paused (seconds)
    lastUpdateTime: null // Track last update for accuracy (ms)
  });

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
        setTimerState(prev => ({ ...prev, isPomodoroBreak: false, pomodoroCount: prev.pomodoroCount + 1, startTime: Date.now(), pausedTime: null }));
      } else {
        setTimerState(prev => ({ ...prev, isPomodoroBreak: true, startTime: Date.now(), pausedTime: null }));
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

  const value = {
    ...timerState,
    startTimer,
    stopTimer,
    resetTimer,
    setCustomMinutes,
    setTimerMode,
    setTimerSubject: (subject) => {
      console.log('Setting timer subject:', subject);
      setTimerSubject(subject);
    },
    saveStudySession,
    getActualElapsedTime
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};