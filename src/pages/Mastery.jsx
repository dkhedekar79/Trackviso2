import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Edit2, AlertTriangle, Crown, Lock } from 'lucide-react';
import MasterySetupModal from '../components/MasterySetupModal';
import BlurtModeSection from '../components/BlurtModeSection';
import ActiveRecallModeSection from '../components/ActiveRecallModeSection';
import MockExamModeSection from '../components/MockExamModeSection';
import { applyMemoryDeterioration, getDeteriorationInfo } from '../utils/memoryDeterioration';
import { fetchTopicProgress, updateTopicProgress } from '../utils/supabaseDb';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';

// Helper function to calculate completion score from individual scores
const calculateCompletionScore = (topicProgress, applyDeterioration = true) => {
  if (!topicProgress) return 0;
  const scores = [];
  if (topicProgress.blurtScore !== undefined) scores.push(topicProgress.blurtScore);
  if (topicProgress.spacedRetrievalScore !== undefined) scores.push(topicProgress.spacedRetrievalScore);
  if (topicProgress.mockExamScore !== undefined) scores.push(topicProgress.mockExamScore);
  
  if (scores.length === 0) return 0;
  
  const baseScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Apply memory deterioration if enabled
  if (applyDeterioration && topicProgress.lastPracticeDate) {
    return applyMemoryDeterioration(baseScore, topicProgress.lastPracticeDate);
  }
  
  return baseScore;
};

const Mastery = () => {
  const { user } = useAuth();
  const { subscriptionPlan, getRemainingMockExams, getRemainingBlurtTests, getHoursUntilReset } = useSubscription();
  const [masterySetup, setMasterySetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [selectedRevisionMethod, setSelectedRevisionMethod] = useState(null);
  const [selectedTopicForBlurt, setSelectedTopicForBlurt] = useState(null);
  const [isBlurtModeActive, setIsBlurtModeActive] = useState(false);
  const [blurtData, setBlurtData] = useState(null);
  const [isActiveRecallModeActive, setIsActiveRecallModeActive] = useState(false);
  const [activeRecallData, setActiveRecallData] = useState(null);
  const [isMockExamModeActive, setIsMockExamModeActive] = useState(false);
  const [mockExamData, setMockExamData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Helper function to get storage key for a subject
  const getStorageKey = (subject) => {
    return `masteryData_${subject}`;
  };

  useEffect(() => {
    const loadMasteryData = async () => {
      const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
      setSubjects(savedSubjects);

      const savedSetup = localStorage.getItem('masterySetup');
      if (savedSetup) {
        const setup = JSON.parse(savedSetup);
        setMasterySetup(setup);

        // Load progress from Supabase first, fallback to localStorage
        let progress = null;
        try {
          if (user) {
            const supabaseProgress = await fetchTopicProgress(setup.subject);
            if (supabaseProgress) {
              progress = supabaseProgress;
            }
          }
        } catch (error) {
          console.error('Error loading from Supabase, falling back to localStorage:', error);
        }

        if (!progress) {
          const storageKey = getStorageKey(setup.subject);
          const savedProgress = localStorage.getItem(storageKey);
          if (savedProgress) {
            progress = JSON.parse(savedProgress);
          }
        }

        if (progress) {
          // Recalculate completion scores for all topics (with deterioration)
          const updatedProgress = { ...progress };
          Object.keys(updatedProgress).forEach(topicId => {
            const completionScore = calculateCompletionScore(updatedProgress[topicId], true);
            updatedProgress[topicId] = {
              ...updatedProgress[topicId],
              completionPercent: completionScore,
            };
          });
          setTopicProgress(updatedProgress);
          const storageKey = getStorageKey(setup.subject);
          localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
        }
      } else {
        setShowSetupModal(true);
      }
    };

    loadMasteryData();
  }, [user]);

  const handleSetupComplete = async (setup) => {
    setMasterySetup(setup);
    localStorage.setItem('masterySetup', JSON.stringify(setup));
    setShowSetupModal(false);

    // Load existing progress for this subject if it exists
    const storageKey = getStorageKey(setup.subject);
    let progress = {};

    // Try to load from Supabase first
    try {
      if (user) {
        const supabaseProgress = await fetchTopicProgress(setup.subject);
        if (supabaseProgress) {
          progress = supabaseProgress;
        }
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    }

    // Fallback to localStorage
    if (Object.keys(progress).length === 0) {
      const existingProgress = localStorage.getItem(storageKey);
      if (existingProgress) {
        progress = JSON.parse(existingProgress);
      }
    }

    // Initialize new topics if they don't exist
    if (setup.topics) {
      setup.topics.forEach(topic => {
        if (!progress[topic.id]) {
          progress[topic.id] = {
            completed: false,
            selected: false,
            notes: '',
            completionPercent: 0,
            blurtScore: undefined,
            spacedRetrievalScore: undefined,
            mockExamScore: undefined,
          };
        } else {
          // Recalculate completion score for existing topics (with deterioration)
          progress[topic.id].completionPercent = calculateCompletionScore(progress[topic.id], true);
        }
      });
    }

    setTopicProgress(progress);
    localStorage.setItem(storageKey, JSON.stringify(progress));

    // Sync to Supabase
    try {
      if (user) {
        await updateTopicProgress(setup.subject, progress);
      }
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const toggleTopicSelection = async (topicId) => {
    const updated = {
      ...topicProgress,
      [topicId]: {
        ...topicProgress[topicId],
        selected: !topicProgress[topicId]?.selected
      }
    };
    setTopicProgress(updated);
    const storageKey = getStorageKey(masterySetup.subject);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Sync to Supabase
    try {
      if (user) {
        await updateTopicProgress(masterySetup.subject, updated);
      }
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
    }
  };

  const toggleExpandTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleChangeSetup = () => {
    setShowSetupModal(true);
  };

  // Calculate overall progress as average of all topic completion scores (with deterioration applied)
  const calculateOverallProgress = () => {
    if (!masterySetup?.topics || masterySetup.topics.length === 0) return 0;
    
    const completionScores = masterySetup.topics.map(topic => {
      const progress = topicProgress[topic.id];
      if (!progress) return 0;
      // Use the already-calculated completionPercent which includes deterioration
      return progress.completionPercent || 0;
    });
    
    const sum = completionScores.reduce((acc, score) => acc + score, 0);
    return sum / masterySetup.topics.length;
  };

  const completedCount = masterySetup?.topics?.filter(
    topic => topicProgress[topic.id]?.completed
  ).length || 0;

  const totalCount = masterySetup?.topics?.length || 0;
  const progressPercent = calculateOverallProgress();

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

            {/* Memory Deterioration Info */}
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">Memory Deterioration System</h4>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Your topic scores naturally decrease over time if not practiced regularly. This encourages consistent review and follows scientific research on memory retention. Practice topics regularly to maintain your scores!
                  </p>
                  <p className="text-xs text-blue-200/60 mt-2">
                    <strong>Decay rates:</strong> ~20% after 1 day, ~40% after 3 days, ~60% after 7 days
                  </p>
                </div>
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
                  const blurtScore = topicProgress[topic.id]?.blurtScore;
                  const lastPracticeDate = topicProgress[topic.id]?.lastPracticeDate;
                  const isExpanded = expandedTopics[topic.id] || false;
                  const deteriorationInfo = getDeteriorationInfo(lastPracticeDate);

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group h-full"
                    >
                      <div
                        onClick={() => toggleTopicSelection(topic.id)}
                        className={`bg-gradient-to-br rounded-xl border-2 transition-all cursor-pointer h-full flex flex-col ${
                          isSelected
                            ? 'from-blue-900/50 to-slate-900/50 border-blue-600/60 shadow-lg shadow-blue-500/20'
                            : 'from-purple-900/40 to-slate-900/40 border-purple-700/40 hover:border-purple-600/60 hover:shadow-lg hover:shadow-purple-500/10'
                        }`}
                      >
                        <div className="p-5 flex flex-col gap-3">
                          {/* Header with checkbox and expand button */}
                          <div className="flex items-start gap-2">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-400'
                                  : 'border-purple-500 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandTopic(topic.id);
                              }}
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

                          {/* Memory Deterioration Warning */}
                          {lastPracticeDate && deteriorationInfo.daysSince > 0 && deteriorationInfo.lossPercent > 0 && (
                            <div className={`flex items-center gap-1 text-xs rounded-full px-2 py-1 w-fit ${
                              deteriorationInfo.daysSince <= 3
                                ? 'text-yellow-300 bg-yellow-900/30'
                                : deteriorationInfo.daysSince <= 7
                                ? 'text-orange-300 bg-orange-900/30'
                                : 'text-red-300 bg-red-900/30'
                            }`}>
                              <AlertTriangle className="w-3 h-3" />
                              {deteriorationInfo.lossPercent}% decay
                            </div>
                          )}

                          {/* Blurt Score Badge */}
                          {blurtScore !== undefined && (
                            <div className="flex items-center gap-1 text-xs text-amber-300 bg-amber-900/30 rounded-full px-2 py-1 w-fit">
                              <span className="text-amber-400">⚡</span>
                              Blurt: {Math.round(blurtScore)}%
                            </div>
                          )}

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
                                {/* Memory Deterioration Info */}
                                {lastPracticeDate && (
                                  <div className={`rounded-lg p-3 border ${
                                    deteriorationInfo.daysSince <= 1
                                      ? 'bg-green-900/20 border-green-700/30'
                                      : deteriorationInfo.daysSince <= 3
                                      ? 'bg-yellow-900/20 border-yellow-700/30'
                                      : deteriorationInfo.daysSince <= 7
                                      ? 'bg-orange-900/20 border-orange-700/30'
                                      : 'bg-red-900/20 border-red-700/30'
                                  }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertTriangle className={`w-4 h-4 ${
                                        deteriorationInfo.daysSince <= 1
                                          ? 'text-green-400'
                                          : deteriorationInfo.daysSince <= 3
                                          ? 'text-yellow-400'
                                          : deteriorationInfo.daysSince <= 7
                                          ? 'text-orange-400'
                                          : 'text-red-400'
                                      }`} />
                                      <span className="text-xs font-semibold text-white">Memory Deterioration</span>
                                    </div>
                                    <p className="text-xs text-white/80 mb-1">{deteriorationInfo.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-white/60">Retention:</span>
                                      <span className={`text-xs font-bold ${
                                        deteriorationInfo.retention >= 80
                                          ? 'text-green-400'
                                          : deteriorationInfo.retention >= 60
                                          ? 'text-yellow-400'
                                          : deteriorationInfo.retention >= 40
                                          ? 'text-orange-400'
                                          : 'text-red-400'
                                      }`}>
                                        {deteriorationInfo.retention}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/60 mt-1">
                                      Your score has decreased by {deteriorationInfo.lossPercent}% due to time since last practice.
                                    </p>
                                  </div>
                                )}

                                {/* Blurt Score Display */}
                                {blurtScore !== undefined && (
                                  <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-amber-300">Blurt Test Score</span>
                                      <span className="text-sm font-bold text-amber-300">{Math.round(blurtScore)}%</span>
                                    </div>
                                    {topicProgress[topic.id]?.blurtAnalysis?.feedback && (
                                      <p className="text-xs text-amber-100/80 line-clamp-2">
                                        {topicProgress[topic.id].blurtAnalysis.feedback}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Mock Exam Score Display */}
                                {topicProgress[topic.id]?.mockExamScore !== undefined && (
                                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-red-300">Mock Exam Score</span>
                                      <span className="text-sm font-bold text-red-300">{Math.round(topicProgress[topic.id].mockExamScore)}%</span>
                                    </div>
                                  </div>
                                )}

                                {/* Completion Score Explanation */}
                                {(blurtScore !== undefined || topicProgress[topic.id]?.mockExamScore !== undefined) && (
                                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
                                    <div className="flex items-start gap-2 mb-2">
                                      <span className="text-xs font-semibold text-blue-300">Topic Progress</span>
                                    </div>
                                    <p className="text-xs text-blue-100/80 leading-relaxed">
                                      Your completion percentage ({Math.round(completionPercent)}%) is calculated as an average of your Blurt Test and Mock Exam scores. Each practice session helps improve your overall mastery.
                                    </p>
                                  </div>
                                )}
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
                      whileHover={subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0 ? {} : { scale: 1.05, y: -4 }}
                      whileTap={subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0 ? {} : { scale: 0.98 }}
                      onClick={() => setIsBlurtModeActive(true)}
                      disabled={subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0}
                      className="group relative p-6 bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl border-2 border-amber-700/30 hover:border-amber-600/50 transition-all cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-amber-700/30"
                    >
                      {subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="px-2 py-1 bg-red-600 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Limit Reached
                          </div>
                        </div>
                      )}
                      {subscriptionPlan === 'professor' && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Unlimited
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">⚡</span>
                        <h3 className="text-2xl font-bold text-amber-300">Blurt Mode</h3>
                      </div>
                      <p className="text-amber-100/70 text-sm leading-relaxed">
                        Test your active recall with blurt mode. Write down what you remember before seeing the answer. Perfect for a full knowledge check.
                      </p>
                      {subscriptionPlan === 'scholar' && (
                        <div className="mt-3 pt-3 border-t border-amber-700/30">
                          <p className="text-amber-200/60 text-xs">
                            {Math.max(0, 1 - getRemainingBlurtTests())}/1 blurt test{Math.max(0, 1 - getRemainingBlurtTests()) !== 1 ? 's' : ''} done today
                          </p>
                        </div>
                      )}
                    </motion.button>

                    <motion.div
                      className="group p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-md rounded-2xl border-2 border-blue-700/20 transition-all cursor-not-allowed opacity-50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🧠</span>
                        <h3 className="text-2xl font-bold text-blue-300/50">Active Recall</h3>
                        <span className="ml-auto px-2 py-1 bg-yellow-600/30 text-yellow-300 text-xs rounded">Coming Soon</span>
                      </div>
                      <p className="text-blue-100/40 text-sm leading-relaxed">
                        Answer 10 mixed questions (multiple choice, open-ended, fill-in-the-gap). Get instant AI feedback and track content coverage.
                      </p>
                    </motion.div>

                    <motion.button
                      whileHover={subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0 ? {} : { scale: 1.05, y: -4 }}
                      whileTap={subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0 ? {} : { scale: 0.98 }}
                      onClick={() => setIsMockExamModeActive(true)}
                      disabled={subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0}
                      className="group relative p-6 bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md rounded-2xl border-2 border-red-700/30 hover:border-red-600/50 transition-all cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-red-700/30"
                    >
                      {subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="px-2 py-1 bg-red-600 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Limit Reached
                          </div>
                        </div>
                      )}
                      {subscriptionPlan === 'professor' && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Unlimited
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📋</span>
                        <h3 className="text-2xl font-bold text-red-300">Mock Exams</h3>
                      </div>
                      <p className="text-red-100/70 text-sm leading-relaxed">
                        Full exam-style simulation with realistic questions. Answer all questions at once and get comprehensive AI feedback.
                      </p>
                      {subscriptionPlan === 'scholar' && (
                        <div className="mt-3 pt-3 border-t border-red-700/30">
                          <p className="text-red-200/60 text-xs">
                            {Math.max(0, 1 - getRemainingMockExams())}/1 mock exam{Math.max(0, 1 - getRemainingMockExams()) !== 1 ? 's' : ''} done today
                          </p>
                        </div>
                      )}
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

          {isBlurtModeActive && (
            <BlurtModeSection
              selectedTopics={Object.keys(topicProgress).filter(topicId => topicProgress[topicId]?.selected)}
              masterySetup={masterySetup}
              onContinue={async (blurtData) => {
                setBlurtData(blurtData);

                // If finishing (has percentage), update topic scores
                if (blurtData.percentage !== undefined) {
                  const selectedTopicIds = Object.keys(topicProgress).filter(
                    topicId => topicProgress[topicId]?.selected
                  );

                  const updated = { ...topicProgress };
                  const now = new Date().toISOString();
                  selectedTopicIds.forEach(topicId => {
                    const topicData = {
                      ...updated[topicId],
                      blurtScore: blurtData.percentage,
                      blurtAnalysis: blurtData.analysis,
                      lastPracticeDate: now, // Update last practice date
                    };
                    // Recalculate completion score (without deterioration since just practiced)
                    topicData.completionPercent = calculateCompletionScore(topicData, false);
                    updated[topicId] = topicData;
                  });

                  setTopicProgress(updated);
                  const storageKey = getStorageKey(masterySetup.subject);
                  localStorage.setItem(storageKey, JSON.stringify(updated));

                  // Sync to Supabase
                  try {
                    if (user) {
                      await updateTopicProgress(masterySetup.subject, updated);
                    }
                  } catch (error) {
                    console.error('Error syncing to Supabase:', error);
                  }
                }

                setIsBlurtModeActive(false);
              }}
            />
          )}

          {isActiveRecallModeActive && (
            <ActiveRecallModeSection
              selectedTopics={Object.keys(topicProgress).filter(topicId => topicProgress[topicId]?.selected)}
              masterySetup={masterySetup}
              onContinue={async (activeRecallData) => {
                setActiveRecallData(activeRecallData);

                // If finishing (has percentage), update topic scores
                if (activeRecallData.percentage !== undefined) {
                  const selectedTopicIds = Object.keys(topicProgress).filter(
                    topicId => topicProgress[topicId]?.selected
                  );

                  const updated = { ...topicProgress };
                  const now = new Date().toISOString();
                  selectedTopicIds.forEach(topicId => {
                    const topicData = {
                      ...updated[topicId],
                      activeRecallScore: activeRecallData.percentage,
                      activeRecallData: {
                        summary: activeRecallData.summary,
                        contentCoverage: activeRecallData.contentCoverage,
                      },
                      lastPracticeDate: now, // Update last practice date
                    };
                    // Recalculate completion score (without deterioration since just practiced)
                    topicData.completionPercent = calculateCompletionScore(topicData, false);
                    updated[topicId] = topicData;
                  });

                  setTopicProgress(updated);
                  const storageKey = getStorageKey(masterySetup.subject);
                  localStorage.setItem(storageKey, JSON.stringify(updated));

                  // Sync to Supabase
                  try {
                    if (user) {
                      await updateTopicProgress(masterySetup.subject, updated);
                    }
                  } catch (error) {
                    console.error('Error syncing to Supabase:', error);
                  }
                }

                setIsActiveRecallModeActive(false);
              }}
            />
          )}

          {isMockExamModeActive && (
            <MockExamModeSection
              selectedTopics={Object.keys(topicProgress).filter(topicId => topicProgress[topicId]?.selected)}
              masterySetup={masterySetup}
              onContinue={async (mockExamData) => {
                try {
                  setMockExamData(mockExamData);

                  // If finishing (has percentage), update topic scores
                  if (mockExamData.percentage !== undefined) {
                    const selectedTopicIds = Object.keys(topicProgress).filter(
                      topicId => topicProgress[topicId]?.selected
                    );

                    const updated = { ...topicProgress };
                    const now = new Date().toISOString();
                    selectedTopicIds.forEach(topicId => {
                      const topicData = {
                        ...updated[topicId],
                        mockExamScore: mockExamData.percentage,
                        mockExamData: {
                          marking: mockExamData.marking,
                          exam: mockExamData.exam,
                        },
                        lastPracticeDate: now, // Update last practice date
                      };
                      // Recalculate completion score (without deterioration since just practiced)
                      topicData.completionPercent = calculateCompletionScore(topicData, false);
                      updated[topicId] = topicData;
                    });

                    setTopicProgress(updated);
                    const storageKey = getStorageKey(masterySetup.subject);
                    localStorage.setItem(storageKey, JSON.stringify(updated));

                    // Sync to Supabase
                    try {
                      if (user) {
                        await updateTopicProgress(masterySetup.subject, updated);
                      }
                    } catch (error) {
                      console.error('Error syncing to Supabase:', error);
                    }
                  }
                } catch (error) {
                  console.error('Error processing mock exam results:', error);
                } finally {
                  // Always close the modal, even if there's an error
                  setIsMockExamModeActive(false);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Mastery;
