import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Plus, Edit2, X } from 'lucide-react';
import MasterySetupModal from '../components/MasterySetupModal';
import { getTopicsForSubject } from '../data/masteryTopics';

const Mastery = () => {
  const [masterySetup, setMasterySetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

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
        emptyProgress[topic.id] = { completed: false, notes: '' };
      });
    }
    setTopicProgress(emptyProgress);
    localStorage.setItem('masteryProgress', JSON.stringify(emptyProgress));
  };

  const toggleTopicCompletion = (topicId) => {
    const updated = {
      ...topicProgress,
      [topicId]: {
        ...topicProgress[topicId],
        completed: !topicProgress[topicId]?.completed
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
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6">
        <AnimatePresence>
          {showSetupModal && (
            <MasterySetupModal
              subjects={subjects}
              onComplete={handleSetupComplete}
              onClose={() => {}}
            />
          )}
        </AnimatePresence>
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
              <p className="text-white/80">Track your mastery of topics in {masterySetup.subject}</p>
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

        <div className="space-y-4">
          {masterySetup.topics && masterySetup.topics.length > 0 ? (
            masterySetup.topics.map((topic, index) => {
              const isCompleted = topicProgress[topic.id]?.completed || false;
              const notes = topicProgress[topic.id]?.notes || '';
              const isExpanded = expandedTopics[topic.id] || false;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div
                    className={`bg-gradient-to-br rounded-2xl border transition-all cursor-pointer ${
                      isCompleted
                        ? 'from-green-900/40 to-slate-900/40 border-green-700/30'
                        : 'from-purple-900/40 to-slate-900/40 border-purple-700/30 hover:border-purple-600/50'
                    }`}
                  >
                    <div
                      onClick={() => toggleExpandTopic(topic.id)}
                      className="p-6 flex items-start gap-4 cursor-pointer"
                    >
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTopicCompletion(topic.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          isCompleted
                            ? 'bg-green-600 border-green-500'
                            : 'border-purple-500 hover:border-purple-400'
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 text-white" />}
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-semibold transition ${
                            isCompleted ? 'text-green-400 line-through' : 'text-white'
                          }`}
                        >
                          {topic.name}
                        </h3>
                        {notes && (
                          <p className="text-purple-200/60 text-sm mt-1 truncate">{notes}</p>
                        )}
                      </div>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandTopic(topic.id);
                        }}
                        className="flex-shrink-0 text-purple-300 hover:text-white transition opacity-0 group-hover:opacity-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-purple-200 mb-2">
                                Study Notes
                              </label>
                              <textarea
                                value={notes}
                                onChange={(e) => updateTopicNotes(topic.id, e.target.value)}
                                placeholder="Add your study notes, key points, or reminders..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows="3"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              {!isCompleted && (
                                <motion.button
                                  onClick={() => toggleTopicCompletion(topic.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                                >
                                  <Check className="w-4 h-4 inline mr-2" />
                                  Mark as Complete
                                </motion.button>
                              )}
                              {isCompleted && (
                                <motion.button
                                  onClick={() => toggleTopicCompletion(topic.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition"
                                >
                                  <X className="w-4 h-4 inline mr-2" />
                                  Mark as Incomplete
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
            })
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
