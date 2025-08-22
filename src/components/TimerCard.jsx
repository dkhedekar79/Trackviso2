import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useGamification } from '../context/GamificationContext';

const TimerCard = ({ variant = 'full', className = '' }) => {
  const [subjects, setSubjects] = useState([]);
  const [customMinutes, setLocalCustomMinutes] = useState('25');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    secondsLeft,
    isRunning,
    subjectName,
    mode,
    stopwatchSeconds,
    isPomodoroBreak,
    pomodoroCount,
    startTimer,
    stopTimer,
    resetTimer,
    setTimerMode,
    setTimerSubject,
    setCustomMinutes,
    getActualElapsedTime
  } = useTimer();

  const {
    addStudySession,
    updateQuestProgress,
    addReward
  } = useGamification();

  const MODES = [
    { key: 'pomodoro', label: 'Pomodoro', duration: 25 * 60 },
    { key: 'custom', label: 'Custom', duration: null },
    { key: 'stopwatch', label: 'Stopwatch', duration: 0 },
  ];

  // Load subjects from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handleSubjectChange = (e) => {
    setTimerSubject(e.target.value);
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0) {
      setCustomMinutes(minutes);
      setTimerMode('custom');
      setShowCustomInput(false);
    }
  };

  // Handle timer completion with gamification integration
  const handleTimerComplete = () => {
    if (!subjectName) {
      addReward({
        type: 'XP_EARNED',
        title: 'Session Complete!',
        description: 'Don\'t forget to select a subject next time for full XP!',
        tier: 'common'
      });
      return;
    }

    const duration = mode === 'stopwatch' ? stopwatchSeconds : getActualElapsedTime();
    const durationMinutes = Math.max(1, Math.round(duration / 60)); // Minimum 1 minute

    // Add study session to gamification system
    const sessionData = {
      subjectName,
      durationMinutes,
      mode,
      difficulty: 1.0, // Default difficulty
      mood: 'neutral' // Default mood
    };

    addStudySession(sessionData);

    // Update quest progress
    updateQuestProgress('time', durationMinutes);
    updateQuestProgress('sessions', 1);
    updateQuestProgress('subjects', 1, subjectName);

    // Show completion reward
    addReward({
      type: 'XP_EARNED',
      title: `🎉 ${durationMinutes} min session complete!`,
      description: `Great work studying ${subjectName}!`,
      tier: durationMinutes >= 60 ? 'rare' : durationMinutes >= 30 ? 'uncommon' : 'common'
    });
  };

  // Override stop timer to include completion logic
  const handleStopTimer = () => {
    if (isRunning) {
      handleTimerComplete();
    }
    stopTimer();
  };

  const handleModeChange = (modeKey) => {
    if (modeKey === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setTimerMode(modeKey);
    }
  };

  const getDisplayTime = () => {
    if (mode === 'stopwatch') {
      const minutes = Math.floor(stopwatchSeconds / 60);
      const seconds = stopwatchSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  };

  const getModeLabel = () => {
    if (mode === 'pomodoro') {
      return isPomodoroBreak ? 'Break' : 'Work';
    }
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Get progress percentage for circular progress bar
  const getProgress = () => {
    if (mode === 'stopwatch') return 0;
    
    const totalDuration = mode === 'pomodoro' 
      ? (isPomodoroBreak ? 5 * 60 : 25 * 60)
      : (mode === 'custom' ? parseInt(customMinutes) * 60 : 25 * 60);
    
    const elapsed = totalDuration - secondsLeft;
    return totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 rounded-lg p-3 backdrop-blur ${className}`}>
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/80 mb-1">{subjectName}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono text-white drop-shadow">
              {getDisplayTime()}
            </span>
            {isRunning ? (
              <button
                className="px-3 py-1 rounded bg-[#FEC260] text-[#23234a] font-bold shadow hover:bg-[#FFD580] transition text-xs"
                onClick={handleStopTimer}
              >
                Stop
              </button>
            ) : (
              <button
                className="px-3 py-1 rounded bg-[#6C5DD3] text-white font-bold shadow hover:bg-[#7A6AD9] transition text-xs"
                onClick={startTimer}
                disabled={mode !== 'stopwatch' && secondsLeft === 0}
              >
                Start
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 rounded-2xl p-6 backdrop-blur border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <select
          className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] text-sm"
          value={subjectName}
          onChange={handleSubjectChange}
          disabled={isRunning}
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        {MODES.map(m => (
          <button
            key={m.key}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              mode === m.key ? 'bg-[#6C5DD3] text-white shadow' : 'bg-white/10 text-white/70 hover:bg-[#6C5DD3]/70'
            }`}
            onClick={() => handleModeChange(m.key)}
            disabled={isRunning}
          >
            {m.label}
          </button>
        ))}
      </div>

      {showCustomInput && (
        <div className="mb-4 flex gap-2">
          <input
            type="number"
            min="1"
            max="480"
            value={customMinutes}
            onChange={(e) => setLocalCustomMinutes(e.target.value)}
            className="flex-1 p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] text-sm"
            placeholder="25"
          />
          <button
            onClick={handleCustomDuration}
            className="px-4 py-2 rounded bg-[#6C5DD3] text-white font-semibold hover:bg-[#7A6AD9] transition text-sm"
          >
            Set
          </button>
        </div>
      )}

      <div className="text-center">
        <div className="relative inline-block mb-4">
          <svg width="160" height="160" className="absolute top-0 left-0">
            <circle cx="80" cy="80" r="72" stroke="#6C5DD3" strokeWidth="8" fill="none" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={2 * Math.PI * 72 * (1 - getProgress() / 100)} />
          </svg>
          <div className="w-[130px] h-[130px] rounded-full bg-white/10 flex items-center justify-center mx-auto">
            <span className="text-4xl font-mono text-white drop-shadow-lg">{getDisplayTime()}</span>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {isRunning ? (
            <button onClick={handleStopTimer} className="px-6 py-2 rounded-xl bg-[#FEC260] text-[#23234a] font-bold shadow hover:bg-[#FFD580] transition">Complete Session</button>
          ) : (
            <button onClick={startTimer} disabled={mode !== 'stopwatch' && secondsLeft === 0} className="px-6 py-2 rounded-xl bg-[#6C5DD3] text-white font-bold shadow hover:bg-[#7A6AD9] transition">Start</button>
          )}
          <button onClick={resetTimer} className="px-6 py-2 rounded-xl bg-white/10 text-white font-bold shadow hover:bg-white/20 transition">Reset</button>
        </div>
      </div>
    </div>
  );
};

export default TimerCard;
