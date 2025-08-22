
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '../context/GamificationContext';
import { useTimer } from '../context/TimerContext';
import { Clock, Zap, BookOpen, X } from 'lucide-react';

const QuickStartTimer = ({ isOpen, onClose }) => {
  const [showSubjects, setShowSubjects] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  const { calculateXP } = useGamification();
  const { setCustomMinutes, setTimerMode, setTimerSubject } = useTimer();

  // Load subjects from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const sessionOptions = [
    { duration: 15, label: '15 min', icon: '⚡' },
    { duration: 25, label: '25 min', icon: '🎯' },
    { duration: 30, label: '30 min', icon: '🔥' },
    { duration: 60, label: '1 hour', icon: '💎' }
  ];

  // Calculate potential XP for each session duration
  const calculatePotentialXP = (minutes) => {
    // Use a generic subject name for calculation
    const xpData = calculateXP(minutes, "Study Session", 1.0);
    return xpData.totalXP;
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    setShowSubjects(true);
  };

  const handleSubjectSelect = (subjectName) => {
    console.log('Quick Start - Selected subject:', subjectName, 'Duration:', selectedDuration);
    
    // Set up the timer with selected parameters
    setTimerSubject(subjectName);
    setCustomMinutes(selectedDuration);
    setTimerMode('custom');
    
    // Navigate to study page with the selected subject and auto-start
    const studyUrl = `/study?subject=${encodeURIComponent(subjectName)}&autoStart=true`;
    console.log('Navigating to:', studyUrl);
    navigate(studyUrl);
    
    // Close the modal
    onClose();
  };

  const handleBackToTimer = () => {
    setShowSubjects(false);
    setSelectedDuration(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[#6C5DD3]" />
              <h2 className="text-xl font-bold text-white">
                {showSubjects ? 'Select Subject' : 'Quick Start Timer'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!showSubjects ? (
              <motion.div
                key="timer-options"
                initial={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-gray-300 text-sm mb-4">
                  Choose a session duration to start studying:
                </p>
                {sessionOptions.map((option) => {
                  const potentialXP = calculatePotentialXP(option.duration);
                  return (
                    <motion.button
                      key={option.duration}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDurationSelect(option.duration)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#6C5DD3]/50 hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <h3 className="text-white font-semibold">{option.label}</h3>
                            <p className="text-sm text-gray-400">
                              Focus session
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[#FEC260]">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold">{potentialXP}</span>
                          </div>
                          <p className="text-xs text-gray-400">potential XP</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="subject-selection"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBackToTimer}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    ←
                  </button>
                  <p className="text-gray-300 text-sm">
                    Selected: {selectedDuration} minutes
                  </p>
                </div>

                {subjects.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {subjects.map((subject) => (
                      <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubjectSelect(subject.name)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#6C5DD3]/50 hover:bg-white/10 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{subject.name}</h3>
                            <p className="text-sm text-gray-400">
                              Goal: {subject.goalHours || 0}h/week
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No subjects found</p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/subjects');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#6C5DD3] text-white font-semibold hover:bg-[#7A6AD9] transition"
                    >
                      Add Subjects
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickStartTimer;
