import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Edit2, X } from 'lucide-react';
import MasterySetupModal from '../components/MasterySetupModal';

const Mastery = () => {
  const [masterySetup, setMasterySetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [selectedRevisionMethod, setSelectedRevisionMethod] = useState(null);
  const [selectedTopicForBlurt, setSelectedTopicForBlurt] = useState(null);

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);

    const savedSetup = localStorage.getItem('masterySetup');
    if (savedSetup) {
      const setup = JSON.parse(savedSetup);
      setMasterySetup(setup);
      
      const savedProgress = localStorage.getItem('masteryProgress');
      if (savedProgress) {
        setTopicProgress(JSON.parse(savedProgress));
      }
    } else {
      setShowSetupModal(true);
    }
  }, []);

  const handleSetupComplete = (setup) => {
    setMasterySetup(setup);
    localStorage.setItem('masterySetup', JSON.stringify(setup));
    setShowSetupModal(false);

    const emptyProgress = {};
    if (setup.topics) {
      setup.topics.forEach(topic => {
        emptyProgress[topic.id] = { completed: false, selected: false, notes: '', completionPercent: 0 };
      });
    }
    setTopicProgress(emptyProgress);
    localStorage.setItem('masteryProgress', JSON.stringify(emptyProgress));
  };

  const toggleTopicSelection = (topicId) => {
    const updated = {
      ...topicProgress,
      [topicId]: {
        ...topicProgress[topicId],
        selected: !topicProgress[topicId]?.selected
      }
    };
    setTopicProgress(updated);
    localStorage.setItem('masteryProgress', JSON.stringify(updated));
  };

  const toggleTopicCompletion = (topicId) => {
    const updated = {
      ...topicProgress,
      [topicId]: {
        ...topicProgress[topicId],
        completed: !topicProgress[topicId]?.completed,
        completionPercent: !topicProgress[topicId]?.completed ? 100 : 0
      }
    };
    setTopicProgress(updated);
    localStorage.setItem('masteryProgress', JSON.stringify(updated));
  };

  const toggleExpandTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const updateTopicNotes = (topicId, notes) => {
    const updated = {
      ...topicProgress,
      [topicId]: {
        ...topicProgress[topicId],
        notes
      }
    };
    setTopicProgress(updated);
    localStorage.setItem('masteryProgress', JSON.stringify(updated));
  };

  const handleChangeSetup = () => {
    setShowSetupModal(true);
  };

  const completedCount = masterySetup?.topics?.filter(
    topic => topicProgress[topic.id]?.completed
  ).length || 0;

  const totalCount = masterySetup?.topics?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!masterySetup) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6 flex items-center justify-center">
        {showSetupModal && (
          <MasterySetupModal
            subjects={subjects}
            onComplete={handleSetupComplete}
            onClose={() => {}}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6">
      <AnimatePresence>
        {showSetupModal && (
          <MasterySetupModal
            subjects={subjects}
            onComplete={handleSetupComplete}
            onClose={() => setShowSetupModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-2">
                Mastery Path
              </h1>
              <p className="text-white/80">Your journey to academic excellence, led by an in-depth science-based AI tutor.</p>
            </div>
            <motion.button
              onClick={handleChangeSetup}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Change Setup
            </motion.button>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-800/40 rounded-lg p-4">
                <p className="text-purple-200/80 text-sm mb-1">Qualification</p>
                <p className="text-white font-semibold">{masterySetup.qualification}</p>
              </div>
              <div className="bg-purple-800/40 rounded-lg p-4">
                <p className="text-purple-200/80 text-sm mb-1">Subject</p>
                <p className="text-white font-semibold">{masterySetup.subject}</p>
              </div>
              <div className="bg-purple-800/40 rounded-lg p-4">
                <p className="text-purple-200/80 text-sm mb-1">Exam Board</p>
                <p className="text-white font-semibold">{masterySetup.examBoard}</p>
              </div>
              <div className="bg-purple-800/40 rounded-lg p-4">
                <p className="text-purple-200/80 text-sm mb-1">Progress</p>
                <p className="text-white font-semibold">{completedCount}/{totalCount} Topics</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">Overall Progress</span>
                <span className="text-white font-semibold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div>
          {masterySetup.topics && masterySetup.topics.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {masterySetup.topics.map((topic, index) => {
                  const isSelected = topicProgress[topic.id]?.selected || false;
                  const isCompleted = topicProgress[topic.id]?.completed || false;
                  const completionPercent = topicProgress[topic.id]?.completionPercent || 0;
                  const notes = topicProgress[topic.id]?.notes || '';
                  const isExpanded = expandedTopics[topic.id] || false;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group h-full"
                    >
                      <div
                        className={`bg-gradient-to-br rounded-xl border-2 transition-all cursor-pointer h-full flex flex-col ${
                          isSelected
                            ? 'from-blue-900/50 to-slate-900/50 border-blue-600/60 shadow-lg shadow-blue-500/20'
                            : 'from-purple-900/40 to-slate-900/40 border-purple-700/40 hover:border-purple-600/60 hover:shadow-lg hover:shadow-purple-500/10'
                        }`}
                      >
                        <div className="p-5 flex flex-col gap-3">
                          {/* Header with checkbox and expand button */}
                          <div className="flex items-start gap-2">
                            <motion.button
                              onClick={() => toggleTopicSelection(topic.id)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-400'
                                  : 'border-purple-500 hover:border-purple-400 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </motion.button>

                            <motion.button
                              onClick={() => toggleExpandTopic(topic.id)}
                              className="ml-auto flex-shrink-0 text-purple-300 hover:text-white transition"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>

                          {/* Topic title */}
                          <h3 className="text-sm font-bold text-white line-clamp-2 flex-1 leading-tight">
                            {topic.name}
                          </h3>

                          {/* Completion percentage and bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-purple-200/60">Completion</span>
                              <span className={`text-xs font-bold ${completionPercent > 0 ? 'text-green-400' : 'text-purple-300'}`}>
                                {completionPercent}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercent}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Status badge */}
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-xs text-green-300 bg-green-900/30 rounded-full px-2 py-1 w-fit">
                              <Check className="w-3 h-3" />
                              Mastered
                            </div>
                          )}
                        </div>

                        {/* Expandable section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-white/10"
                            >
                              <div className="p-4 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-purple-200 mb-1">
                                    Study Notes
                                  </label>
                                  <textarea
                                    value={notes}
                                    onChange={(e) => updateTopicNotes(topic.id, e.target.value)}
                                    placeholder="Add notes..."
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    rows="2"
                                  />
                                </div>

                                <div className="flex gap-2 pt-1">
                                  {!isCompleted && (
                                    <motion.button
                                      onClick={() => toggleTopicCompletion(topic.id)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-xs transition"
                                    >
                                      <Check className="w-3 h-3 inline mr-1" />
                                      Complete
                                    </motion.button>
                                  )}
                                  {isCompleted && (
                                    <motion.button
                                      onClick={() => toggleTopicCompletion(topic.id)}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="flex-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-xs transition"
                                    >
                                      <X className="w-3 h-3 inline mr-1" />
                                      Undo
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {Object.values(topicProgress).some(tp => tp.selected) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8"
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Smart Revise
                  </h2>
                  <p className="text-purple-200/80 mb-6">
                    The scientifically leading methods of revision, guided to you.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl border-2 border-amber-700/30 hover:border-amber-600/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">⚡</span>
                        <h3 className="text-2xl font-bold text-amber-300">Blurt Mode</h3>
                      </div>
                      <p className="text-amber-100/70 text-sm leading-relaxed">
                        Test your instant recall with quick-fire questions. Write down what you remember before seeing the answer. Perfect for rapid memory check.
                      </p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-purple-900/40 to-violet-900/40 backdrop-blur-md rounded-2xl border-2 border-purple-700/30 hover:border-purple-600/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🔄</span>
                        <h3 className="text-2xl font-bold text-purple-300">Spaced Retrieval</h3>
                      </div>
                      <p className="text-purple-100/70 text-sm leading-relaxed">
                        Scientifically-optimized spacing intervals for maximum retention. Review concepts at the right time to strengthen long-term memory.
                      </p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group p-6 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md rounded-2xl border-2 border-red-700/30 hover:border-red-600/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📋</span>
                        <h3 className="text-2xl font-bold text-red-300">Mock Exams</h3>
                      </div>
                      <p className="text-red-100/70 text-sm leading-relaxed">
                        Full exam-style simulation under timed conditions. Experience real exam pressure and identify weak areas before the actual exam.
                      </p>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-purple-300 mb-4">No topics available for this configuration</p>
              <motion.button
                onClick={handleChangeSetup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Update Setup
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mastery;
