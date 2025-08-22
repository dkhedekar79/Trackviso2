import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Target, X, ArrowRight } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const QuickStartModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { calculateXPForDuration } = useGamification();
  const [subjects, setSubjects] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Load subjects from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const timeOptions = [
    { 
      duration: 15, 
      label: '15 min', 
      subtitle: 'Quick Focus',
      color: 'from-green-500 to-emerald-600',
      icon: '⚡'
    },
    { 
      duration: 25, 
      label: '25 min', 
      subtitle: 'Pomodoro',
      color: 'from-blue-500 to-indigo-600',
      icon: '🍅'
    },
    { 
      duration: 30, 
      label: '30 min', 
      subtitle: 'Deep Focus',
      color: 'from-purple-500 to-violet-600',
      icon: '🎯'
    },
    { 
      duration: 60, 
      label: '1 hour', 
      subtitle: 'Extended Session',
      color: 'from-orange-500 to-red-600',
      icon: '🔥'
    }
  ];

  const calculatePotentialXP = (duration) => {
    // Base XP calculation: 10 XP per minute + bonuses
    const baseXP = duration * 10;
    const difficultyBonus = Math.round(baseXP * 0.2); // Assume medium difficulty
    const streakBonus = Math.round(baseXP * 0.1); // Assume streak exists
    return {
      base: baseXP,
      difficulty: difficultyBonus,
      streak: streakBonus,
      total: baseXP + difficultyBonus + streakBonus
    };
  };

  const handleTimeSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const startStudySession = () => {
    if (!selectedDuration || !selectedSubject) return;
    
    onClose();
    // Navigate to study page with pre-selected subject and start timer with custom duration
    const params = new URLSearchParams({
      subject: selectedSubject.name,
      quickStart: 'true',
      duration: selectedDuration.toString()
    });
    navigate(`/study?${params.toString()}`);
  };

  const resetSelection = () => {
    setSelectedDuration(null);
    setSelectedSubject(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => {
          onClose();
          resetSelection();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-[#23234a] to-[#1a1a2e] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Quick Start Study Session</h2>
                <p className="text-gray-300">Choose your duration and subject to begin</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  resetSelection();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Time Selection */}
            {!selectedDuration && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Step 1: Choose Study Duration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {timeOptions.map((option) => {
                    const xpData = calculatePotentialXP(option.duration);
                    return (
                      <motion.button
                        key={option.duration}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTimeSelect(option)}
                        className={`relative overflow-hidden bg-gradient-to-br ${option.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all group`}
                      >
                        <div className="relative z-10">
                          <div className="text-3xl mb-2">{option.icon}</div>
                          <div className="text-2xl font-bold mb-1">{option.label}</div>
                          <div className="text-sm opacity-90 mb-3">{option.subtitle}</div>
                          
                          <div className="bg-black/20 rounded-lg p-3 backdrop-blur">
                            <div className="flex items-center gap-1 text-yellow-300 mb-1">
                              <Star className="w-4 h-4" />
                              <span className="font-semibold">Potential XP</span>
                            </div>
                            <div className="text-lg font-bold">{xpData.total}</div>
                            <div className="text-xs opacity-80">
                              Base: {xpData.base} + Bonuses: {xpData.difficulty + xpData.streak}
                            </div>
                          </div>
                        </div>
                        
                        {/* Animated background */}
                        <motion.div
                          className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Subject Selection */}
            {selectedDuration && !selectedSubject && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Step 2: Choose Subject
                  </h3>
                  <button
                    onClick={() => setSelectedDuration(null)}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    ← Back to duration
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-white/5 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{timeOptions.find(opt => opt.duration === selectedDuration.duration)?.icon}</div>
                    <div>
                      <div className="text-white font-semibold">{selectedDuration.label} Study Session</div>
                      <div className="text-gray-300 text-sm">
                        Potential XP: <span className="text-yellow-400 font-bold">{calculatePotentialXP(selectedDuration.duration).total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubjectSelect(subject)}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{subject.name}</div>
                            <div className="text-gray-300 text-sm">Goal: {subject.goalHours}h/week</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Click to select</span>
                          <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No subjects found</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/subjects');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Add Subjects First
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirmation */}
            {selectedDuration && selectedSubject && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Ready to Start!
                  </h3>
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    ← Back to subjects
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: selectedSubject.color }}
                    >
                      {selectedSubject.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{selectedSubject.name}</h4>
                      <p className="text-gray-300">{selectedDuration.label} Study Session</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-gray-300 text-sm">Duration</div>
                      <div className="text-white font-bold">{selectedDuration.label}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-gray-300 text-sm">Potential XP</div>
                      <div className="text-yellow-400 font-bold">{calculatePotentialXP(selectedDuration.duration).total}</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startStudySession}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
                    >
                      <div className="text-2xl">🚀</div>
                      <div>
                        <div>Start Study Session</div>
                        <div className="text-sm opacity-90">Let's earn some XP!</div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                <div className="text-center text-gray-400 text-sm">
                  This will open the study page with your timer pre-configured
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickStartModal;
