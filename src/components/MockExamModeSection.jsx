import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff, Send, CheckCircle, Clock, Lock, Crown } from 'lucide-react';
import { 
  generateMockExamNotes, 
  generateMockExam, 
  markMockExam 
} from '../utils/mockExamApi';
import { useSubscription } from '../context/SubscriptionContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const MockExamModeSection = ({ selectedTopics, masterySetup, onContinue }) => {
  const { canUseMockExam, incrementMockExamUsage, subscriptionPlan, getRemainingMockExams } = useSubscription();
  const [stage, setStage] = useState('choice'); // 'choice' | 'loading' | 'display' | 'setup' | 'exam' | 'marking' | 'results'
  const [notes, setNotes] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Setup state
  const [tier, setTier] = useState(null); // 'higher' | 'foundation'
  const [totalMarks, setTotalMarks] = useState(null); // 20 | 50 | 100
  
  // Exam state
  const [exam, setExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [marking, setMarking] = useState(null);

  const handleAIGenerate = async () => {
    setLoading(true);
    setError(null);
    setStage('loading');

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      if (selectedTopicNames.length === 0) {
        throw new Error('No topics selected for knowledge map generation');
      }

      const data = await generateMockExamNotes(
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard
      );

      setNotes(data.notes || '');
      setKnowledgeMap(data.knowledgeMap || null);
      setShowNotes(false);
      setStage('display');
    } catch (err) {
      setError(err.message || 'Failed to generate knowledge map. Please try again.');
      setStage('choice');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    if (manualInput.trim().length === 0) {
      setError('Please enter your notes');
      return;
    }
    setNotes(manualInput);
    setKnowledgeMap(manualInput);
    setShowNotes(false);
    setStage('display');
    setError(null);
  };

  const handleContinueToSetup = () => {
    // Check if user can use mock exam
    if (!canUseMockExam()) {
      setShowUpgradeModal(true);
      return;
    }
    setStage('setup');
  };

  const handleStartExam = async () => {
    if (!tier || !totalMarks) {
      setError('Please select both tier and total marks');
      return;
    }

    // Check usage limit before generating exam
    if (!canUseMockExam()) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStage('loading');

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      if (selectedTopicNames.length === 0) {
        throw new Error('No topics selected');
      }

      const generatedExam = await generateMockExam(
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard,
        tier,
        totalMarks
      );

      setExam(generatedExam);
      setUserAnswers(new Array(generatedExam.questions.length).fill(''));
      
      // Increment usage after successful exam generation
      await incrementMockExamUsage();
      
      setStage('exam');
    } catch (err) {
      console.error('Error generating exam:', err);
      setError(err.message || 'Failed to generate exam. Please try again.');
      setStage('setup');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    // Check if all questions are answered
    const unanswered = userAnswers.findIndex((ans, i) => {
      const q = exam.questions[i];
      if (q.type === 'multiple_choice') {
        return !ans || ans.trim() === '';
      }
      return !ans || ans.trim() === '';
    });

    if (unanswered !== -1) {
      setError(`Please answer question ${exam.questions[unanswered].number} before submitting`);
      return;
    }

    setLoading(true);
    setError(null);
    setStage('marking');

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      const markingResult = await markMockExam(
        exam,
        userAnswers,
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard,
        tier
      );

      setMarking(markingResult);
      setStage('results');
    } catch (err) {
      console.error('Error marking exam:', err);
      setError(err.message || 'Failed to mark exam. Please try again.');
      setStage('exam');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onContinue({
      notes,
      knowledgeMap,
      exam,
      answers: userAnswers,
      marking,
      percentage: marking?.percentage || 0,
    });
  };

  return (
    <>
      <PremiumUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="mock_exam"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md rounded-2xl border-2 border-red-700/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📋</span>
              <h2 className="text-3xl font-bold text-red-300">Mock Exam Mode</h2>
            </div>
            {subscriptionPlan === 'scholar' && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg border border-purple-400/50"
              >
                <Lock className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">
                  {getRemainingMockExams()} / 1 Free
                </span>
              </motion.div>
            )}
            {subscriptionPlan === 'professor' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">Unlimited</span>
              </div>
            )}
          </div>

        <AnimatePresence mode="wait">
          {stage === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-red-100/80 mb-6">
                How would you like to prepare your knowledge map for {selectedTopics.length} selected topic{selectedTopics.length !== 1 ? 's' : ''}?
              </p>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAIGenerate}
                  className="p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-700/30 hover:border-blue-600/50 rounded-xl transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-blue-300 mb-1">AI Generate</h3>
                      <p className="text-blue-100/70 text-sm">
                        Let AI fetch grade 9 notes from trusted sources
                      </p>
                    </div>
                    <div className="text-2xl">🤖</div>
                  </div>
                  <p className="text-blue-100/60 text-xs">
                    Uses web search + AI to find detailed content
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('manual')}
                  className="p-6 bg-gradient-to-br from-purple-900/40 to-violet-900/40 border-2 border-purple-700/30 hover:border-purple-600/50 rounded-xl transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-purple-300 mb-1">Manual Input</h3>
                      <p className="text-purple-100/70 text-sm">
                        Input your own notes manually
                      </p>
                    </div>
                    <div className="text-2xl">✏️</div>
                  </div>
                  <p className="text-purple-100/60 text-xs">
                    Paste or type your study notes
                  </p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <button
                onClick={() => {
                  setStage('choice');
                  setError(null);
                  setShowNotes(false);
                }}
                className="text-red-300 hover:text-red-200 transition text-sm mb-2"
              >
                ← Back
              </button>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-red-200 mb-2">
                  Your Study Notes
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste or type your notes here..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  rows="8"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStage('choice');
                    setManualInput('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualInput}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition"
                >
                  Add Notes
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader className="w-12 h-12 text-red-400 animate-spin mb-4" />
              <p className="text-red-100/80 text-center">
                {exam ? 'Marking your exam...' : 'Generating knowledge map from grade 9 sources...'}
              </p>
            </motion.div>
          )}

          {stage === 'display' && (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-red-300">Knowledge Map Created</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all"
                  >
                    {showNotes ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Notes
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Notes
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="relative bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm overflow-hidden">
                  {showNotes ? (
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <p className="text-white/90 text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {notes}
                      </p>
                    </div>
                  ) : (
                    <div className="relative p-6 min-h-64">
                      <div className="blur-sm select-none pointer-events-none">
                        <p className="text-white/70 text-sm whitespace-pre-wrap break-words">
                          {notes.substring(0, 300)}...
                        </p>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🔒</div>
                          <p className="text-white font-medium mb-2">Notes Locked</p>
                          <p className="text-white/70 text-sm max-w-sm">
                            Click "View Notes" button to preview before starting the mock exam
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {subscriptionPlan === 'scholar' && getRemainingMockExams() === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold mb-1">Daily limit reached</p>
                      <p className="text-white/70 text-sm">Upgrade to Professor Plan for unlimited Mock Exams</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm"
                    >
                      Upgrade
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinueToSetup}
                disabled={subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continue to Setup
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {stage === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-red-300 mb-2">Exam Setup</h3>
                <p className="text-red-100/80 text-sm">
                  Configure your mock exam settings
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-red-200 mb-3">
                  Select Tier
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTier('higher')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tier === 'higher'
                        ? 'bg-red-600/30 border-red-500 text-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">Higher</div>
                    <div className="text-xs">More challenging questions</div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTier('foundation')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tier === 'foundation'
                        ? 'bg-red-600/30 border-red-500 text-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">Foundation</div>
                    <div className="text-xs">Standard difficulty</div>
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-200 mb-3">
                  Select Total Marks
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[20, 50, 100].map((marks) => (
                    <motion.button
                      key={marks}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTotalMarks(marks)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        totalMarks === marks
                          ? 'bg-red-600/30 border-red-500 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                      }`}
                    >
                      <div className="text-2xl font-bold mb-1">{marks}</div>
                      <div className="text-xs">marks</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStage('display');
                    setTier(null);
                    setTotalMarks(null);
                    setError(null);
                  }}
                  className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartExam}
                  disabled={!tier || !totalMarks}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Exam
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'exam' && exam && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-red-300 mb-2">{exam.title || 'Mock Exam'}</h3>
                {exam.instructions && (
                  <p className="text-white/80 text-sm mb-4">{exam.instructions}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>Tier: <span className="font-semibold text-white">{tier === 'higher' ? 'Higher' : 'Foundation'}</span></span>
                  <span>Total Marks: <span className="font-semibold text-white">{exam.questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</span></span>
                  <span>Questions: <span className="font-semibold text-white">{exam.questions.length}</span></span>
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {exam.questions.map((question, index) => (
                  <motion.div
                    key={question.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-5 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600/30 text-red-300 rounded-full text-sm font-semibold">
                          Question {question.number}
                        </span>
                        <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs">
                          {question.marks} mark{question.marks !== 1 ? 's' : ''}
                        </span>
                        <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs capitalize">
                          {question.type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-white font-medium mb-4">{question.question}</p>

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const optionLetter = ['A', 'B', 'C', 'D'][optIndex];
                          return (
                            <motion.button
                              key={optIndex}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleAnswerChange(index, optionLetter)}
                              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                userAnswers[index] === optionLetter
                                  ? 'border-red-500 bg-red-600/20 text-white'
                                  : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40'
                              }`}
                            >
                              <span className="font-semibold mr-3">{optionLetter}.</span>
                              {option}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {(question.type === 'short_answer' || question.type === 'calculation' || question.type === 'extended_writing' || question.type === 'data_interpretation') && (
                      <textarea
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                        rows={question.type === 'extended_writing' ? 6 : 3}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitExam}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
              >
                Submit Exam
                <Send className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {stage === 'marking' && (
            <motion.div
              key="marking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader className="w-12 h-12 text-red-400 animate-spin mb-4" />
              <p className="text-red-100/80 text-center text-lg font-semibold mb-2">
                Marking your exam...
              </p>
              <p className="text-red-100/60 text-sm text-center">
                AI is analyzing your answers and providing detailed feedback
              </p>
            </motion.div>
          )}

          {stage === 'results' && marking && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-red-300 mb-2">Exam Results</h3>
                <p className="text-red-100/80 text-sm">
                  Here's your performance on the mock exam
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-800/40 to-rose-800/40 rounded-xl p-6 border-2 border-red-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-red-200">Overall Score</h4>
                  <div className="text-4xl font-bold text-red-300">
                    {Math.round(marking.percentage)}%
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-red-200/80">Marks Awarded</span>
                    <span className="text-red-300 font-semibold">
                      {marking.marksAwarded} / {marking.totalMarks}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${marking.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-4 rounded-full ${
                        marking.percentage >= 80
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : marking.percentage >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h4 className="text-lg font-bold text-red-200 mb-3">Overall Feedback</h4>
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {marking.overallFeedback}
                </p>
              </div>

              {marking.strengths && marking.strengths.length > 0 && (
                <div className="bg-green-900/20 rounded-lg p-5 border border-green-700/30">
                  <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {marking.strengths.map((strength, index) => (
                      <li key={index} className="text-green-100/90 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {marking.weakAreas && marking.weakAreas.length > 0 && (
                <div className="bg-red-900/20 rounded-lg p-5 border border-red-700/30">
                  <h4 className="text-lg font-bold text-red-300 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {marking.weakAreas.map((area, index) => (
                      <li key={index} className="text-red-100/90 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {marking.recommendations && marking.recommendations.length > 0 && (
                <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-700/30">
                  <h4 className="text-lg font-bold text-blue-300 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {marking.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-100/90 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {marking.questionMarkings && marking.questionMarkings.length > 0 && (
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h4 className="text-lg font-bold text-red-200 mb-3">Question Breakdown</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {marking.questionMarkings.map((qm, index) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">Q{qm.questionNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              qm.isCorrect ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
                            }`}>
                              {qm.isCorrect ? '✓' : '✗'}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs">{qm.feedback}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-bold text-white">
                            {qm.marksAwarded} / {qm.maxMarks}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Finish & Save Results
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};

export default MockExamModeSection;
