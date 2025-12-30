import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, FileText, Check, Loader, Wand2, PenTool, ArrowRight, X, Plus } from 'lucide-react';
import { generateTopics } from '../utils/geminiApi';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const MasteryWizard = ({ subjects, onComplete, onClose }) => {
  const { subscriptionPlan, getRemainingMockExams, getRemainingBlurtTests, canUseBlurtTest, canUseMockExam } = useSubscription();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Mode, 2: Subject, 3: Topics, 4: Notes
  const [selectedMode, setSelectedMode] = useState(null); // 'blurt' or 'mockExam'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [notes, setNotes] = useState('');
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [qualification, setQualification] = useState('GCSE');
  const [examBoard, setExamBoard] = useState('AQA');

  const examBoards = {
    GCSE: ['AQA', 'Edexcel', 'OCR', 'Eduqas'],
    IGCSE: ['Cambridge', 'Edexcel'],
    'A-Level': ['AQA', 'Edexcel', 'OCR', 'Cambridge'],
  };

  // Load topics when subject is selected
  useEffect(() => {
    if (selectedSubject && step >= 3) {
      loadTopics();
    }
  }, [selectedSubject, step]);

  const loadTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const topics = await generateTopics(qualification, examBoard, selectedSubject);
      setAvailableTopics(topics);
    } catch (err) {
      setError(err.message || 'Failed to load topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    if (mode === 'blurt' && !canUseBlurtTest()) {
      setShowUpgradeModal(true);
      return;
    }
    if (mode === 'mockExam' && !canUseMockExam()) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedMode(mode);
    setStep(2);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setStep(3);
  };

  const handleTopicToggle = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleAIGenerateNotes = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const selectedTopicNames = availableTopics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.name);

      // Use the appropriate API based on mode
      if (selectedMode === 'blurt') {
        const { generateBlurtNotes } = await import('../utils/blurtNotesApi');
        const data = await generateBlurtNotes(
          selectedTopicNames,
          qualification,
          selectedSubject,
          examBoard
        );
        setNotes(data.notes || '');
        setKnowledgeMap(data.knowledgeMap || data.notes || '');
        setIsAIGenerated(true);
      } else {
        const { generateMockExamNotes } = await import('../utils/mockExamApi');
        const data = await generateMockExamNotes(
          selectedTopicNames,
          qualification,
          selectedSubject,
          examBoard
        );
        setNotes(data.notes || '');
        setKnowledgeMap(data.knowledgeMap || data.notes || '');
        setIsAIGenerated(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate notes. Please try again.');
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
    setKnowledgeMap(manualInput); // Use manual input as knowledge map
    setIsAIGenerated(false);
    setError('');
  };

  const handleComplete = () => {
    if (!notes.trim()) {
      setError('Please generate or enter notes before continuing');
      return;
    }

    const selectedTopicNames = availableTopics
      .filter(t => selectedTopics.includes(t.id))
      .map(t => t.name);

    onComplete({
      mode: selectedMode,
      subject: selectedSubject,
      topics: availableTopics.filter(t => selectedTopics.includes(t.id)),
      topicIds: selectedTopics,
      notes: notes,
      knowledgeMap: knowledgeMap || notes, // Pass knowledgeMap as well
      qualification,
      examBoard,
      isAIGenerated: isAIGenerated, // Pass AI generation flag
    });
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl border border-purple-700/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-purple-900/80 backdrop-blur-md border-b border-purple-700/30 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Mastery Practice</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= s ? 'bg-purple-600 text-white' : 'bg-purple-800/40 text-purple-300'
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 ${step > s ? 'bg-purple-600' : 'bg-purple-800/40'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Mode Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Select Practice Mode</h3>
                    <p className="text-purple-200/70">Choose how you want to practice</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect('blurt')}
                      disabled={subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedMode === 'blurt'
                          ? 'border-amber-500 bg-amber-900/40'
                          : 'border-amber-700/30 bg-amber-900/20 hover:border-amber-600/50'
                      } ${subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">⚡</span>
                        <h4 className="text-xl font-bold text-amber-300">Blurt Mode</h4>
                      </div>
                      <p className="text-amber-100/70 text-sm mb-3">
                        Test your active recall by writing everything you remember about the topics.
                      </p>
                      {subscriptionPlan === 'scholar' && (
                        <p className="text-amber-200/60 text-xs">
                          {getRemainingBlurtTests()}/1 remaining today
                        </p>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect('mockExam')}
                      disabled={subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedMode === 'mockExam'
                          ? 'border-red-500 bg-red-900/40'
                          : 'border-red-700/30 bg-red-900/20 hover:border-red-600/50'
                      } ${subscriptionPlan === 'scholar' && getRemainingMockExams() <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📋</span>
                        <h4 className="text-xl font-bold text-red-300">Mock Exam Mode</h4>
                      </div>
                      <p className="text-red-100/70 text-sm mb-3">
                        Take a full exam-style test with realistic questions and comprehensive feedback.
                      </p>
                      {subscriptionPlan === 'scholar' && (
                        <p className="text-red-200/60 text-xs">
                          {getRemainingMockExams()}/1 remaining today
                        </p>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Subject Selection */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Select Subject</h3>
                    <p className="text-purple-200/70">Choose the subject you want to practice</p>
                  </div>

                  {subjects.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                      <p className="text-purple-300/80 text-lg mb-2">No subjects available</p>
                      <p className="text-purple-300/60 text-sm mb-6">Add subjects to get started with mastery practice</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onClose();
                          navigate('/subjects');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        Go to Subjects Page
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {subjects.map((subject) => (
                        <motion.button
                          key={subject.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubjectSelect(subject.name)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedSubject === subject.name
                              ? 'border-purple-500 bg-purple-600/40'
                              : 'border-purple-700/30 bg-purple-800/20 hover:border-purple-600/50'
                          }`}
                        >
                          <p className="text-white font-medium">{subject.name}</p>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm text-purple-300/80 mb-2">Qualification</label>
                      <select
                        value={qualification}
                        onChange={(e) => {
                          setQualification(e.target.value);
                          // Reset exam board to first available option when qualification changes
                          const boards = examBoards[e.target.value] || [];
                          if (boards.length > 0) {
                            setExamBoard(boards[0]);
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80"
                      >
                        <option value="GCSE">GCSE</option>
                        <option value="IGCSE">IGCSE</option>
                        <option value="A-Level">A-Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300/80 mb-2">Exam Board</label>
                      <select
                        value={examBoard}
                        onChange={(e) => setExamBoard(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80"
                      >
                        {examBoards[qualification]?.map(board => (
                          <option key={board} value={board}>{board}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Topic Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Select Topics</h3>
                    <p className="text-purple-200/70">Choose one or more topics to practice</p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="bg-red-900/30 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availableTopics.map((topic) => (
                        <motion.button
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTopicToggle(topic.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedTopics.includes(topic.id)
                              ? 'border-purple-500 bg-purple-600/40'
                              : 'border-purple-700/30 bg-purple-800/20 hover:border-purple-600/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedTopics.includes(topic.id)
                                ? 'bg-purple-600 border-purple-400'
                                : 'border-purple-500 bg-transparent'
                            }`}>
                              {selectedTopics.includes(topic.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-white font-medium">{topic.name}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    {selectedTopics.length > 0 && (
                      <button
                        onClick={() => setStep(4)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition ml-auto"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Notes Input */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Prepare Your Notes</h3>
                    <p className="text-purple-200/70">Generate notes with AI or enter them manually</p>
                  </div>

                  {!notes ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAIGenerateNotes}
                        disabled={loading}
                        className="p-6 rounded-xl border-2 border-purple-700/30 bg-purple-900/20 hover:border-purple-600/50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Wand2 className="w-6 h-6 text-purple-400" />
                          <h4 className="text-lg font-bold text-white">AI Generate</h4>
                        </div>
                        <p className="text-purple-200/70 text-sm">
                          Let AI create comprehensive notes based on your selected topics.
                        </p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNotes('manual')}
                        className="p-6 rounded-xl border-2 border-purple-700/30 bg-purple-900/20 hover:border-purple-600/50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <PenTool className="w-6 h-6 text-purple-400" />
                          <h4 className="text-lg font-bold text-white">Manual Input</h4>
                        </div>
                        <p className="text-purple-200/70 text-sm">
                          Enter your own notes or paste content from your study materials.
                        </p>
                      </motion.button>
                    </div>
                  ) : notes === 'manual' ? (
                    <div className="space-y-4">
                      <textarea
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Enter your notes here..."
                        className="w-full px-4 py-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition resize-none"
                        rows={12}
                      />
                      <button
                        onClick={handleManualInput}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                      >
                        Use These Notes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-700/50">
                        <p className="text-white whitespace-pre-wrap">{notes}</p>
                      </div>
                      <button
                        onClick={() => setNotes('')}
                        className="px-4 py-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition text-sm"
                      >
                        Change Notes
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-900/30 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setStep(3);
                        setNotes('');
                        setManualInput('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                    {notes && notes !== 'manual' && (
                      <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition ml-auto"
                      >
                        Start Practice
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default MasteryWizard;

