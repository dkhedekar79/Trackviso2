import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Settings, BookOpen, Clock, Target } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useGamification } from '../context/GamificationContext';
import TimerCard from '../components/TimerCard';

const Study = () => {
  const {
    time,
    isActive,
    isPaused,
    mode,
    currentSession,
    startTimer,
    pauseTimer,
    stopTimer,
    setTime: setTimerTime,
    setMode
  } = useTimer();

  const { userStats, completeSession } = useGamification();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [customMinutes, setCustomMinutes] = useState(25);

  // Fixed: Added proper dependencies and conditions to prevent infinite loops
  useEffect(() => {
    // Only auto-complete session if we have an active session that just ended
    if (time === 0 && currentSession && !isActive && !isPaused) {
      handleSessionComplete();
    }
  }, [time, currentSession, isActive, isPaused]); // Proper dependencies

  const handleSessionComplete = () => {
    if (currentSession) {
      completeSession({
        duration: currentSession.duration,
        subject: currentSession.subject || selectedSubject,
        notes: sessionNotes,
        timestamp: new Date().toISOString()
      });
      setSessionNotes('');
    }
  };

  const handleStartTimer = (duration, timerMode = 'study') => {
    if (!selectedSubject.trim()) {
      alert('Please select a subject before starting the timer');
      return;
    }

    startTimer(duration, selectedSubject, timerMode);
  };

  const handleCustomStart = () => {
    if (customMinutes > 0) {
      handleStartTimer(customMinutes);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetTimes = [
    { label: '15 min', minutes: 15, color: 'from-green-500 to-green-600' },
    { label: '25 min', minutes: 25, color: 'from-blue-500 to-blue-600' },
    { label: '30 min', minutes: 30, color: 'from-purple-500 to-purple-600' },
    { label: '60 min', minutes: 60, color: 'from-red-500 to-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Study Session</h1>
          <p className="text-gray-600">Focus on your studies and track your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Timer
            </h2>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
                {formatTime(time)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                {mode} Mode
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4 mb-8">
              {!isActive && !isPaused && (
                <button
                  onClick={handleCustomStart}
                  disabled={!selectedSubject.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              )}

              {isActive && (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}

              {isPaused && (
                <button
                  onClick={() => startTimer(time / 60, selectedSubject, mode)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}

              {(isActive || isPaused) && (
                <button
                  onClick={stopTimer}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              )}
            </div>

            {/* Custom Timer Input */}
            {!isActive && !isPaused && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Preset Timer Buttons */}
            {!isActive && !isPaused && (
              <div className="grid grid-cols-2 gap-3">
                {presetTimes.map((preset) => (
                  <button
                    key={preset.minutes}
                    onClick={() => handleStartTimer(preset.minutes)}
                    disabled={!selectedSubject.trim()}
                    className={`p-3 rounded-xl text-white font-semibold bg-gradient-to-r ${preset.color} hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Session Details
            </h2>

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="Enter subject (e.g., Mathematics, History)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Session Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="What are you studying? Any goals for this session?"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Current Session Info */}
            {currentSession && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Current Session</h3>
                <div className="text-sm text-blue-700">
                  <div>Subject: {currentSession.subject}</div>
                  <div>Duration: {currentSession.duration} minutes</div>
                  <div>Started: {new Date(currentSession.startTime).toLocaleTimeString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{userStats.totalSessions}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">Study Time</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {Math.round(userStats.totalStudyTime / 60)}h
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{userStats.currentStreak} days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;