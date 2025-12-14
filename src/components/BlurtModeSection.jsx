import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff, Send, RotateCcw, CheckCircle, Lock, Crown, FileText } from 'lucide-react';
import { generateBlurtNotes, analyzeBlurtResponse } from '../utils/blurtNotesApi';
import { useSubscription } from '../context/SubscriptionContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const BlurtModeSection = ({ selectedTopics, masterySetup, onContinue, initialNotes = null, initialKnowledgeMap = null }) => {
  const { canUseBlurtTest, incrementBlurtTestUsage, subscriptionPlan, getRemainingBlurtTests } = useSubscription();
  // If initialNotes is provided, skip the choice stage and go straight to display
  const [stage, setStage] = useState(initialNotes ? 'display' : 'choice'); // 'choice' | 'loading' | 'display' | 'blurt' | 'analyzing' | 'results'
  const [notes, setNotes] = useState(initialNotes || '');
  const [manualInput, setManualInput] = useState('');
  const [blurtInput, setBlurtInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [knowledgeMap, setKnowledgeMap] = useState(initialKnowledgeMap || initialNotes || null);
  const [showNotes, setShowNotes] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(initialIsAIGenerated); // Track if notes are AI-generated

  const handleAIGenerate = async () => {
    setLoading(true);
    setError(null);
    setStage('loading');

    try {
      // Get the names of selected topics
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      if (selectedTopicNames.length === 0) {
        throw new Error('No topics selected for knowledge map generation');
      }

      const data = await generateBlurtNotes(
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard
      );

      setNotes(data.notes || '');
      setKnowledgeMap(data.knowledgeMap || null);
      setIsAIGenerated(true); // Mark as AI-generated
      setShowNotes(false); // Reset to blurred state
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
    setKnowledgeMap(manualInput); // Use manual input as knowledge map reference
    setIsAIGenerated(false); // Mark as manual entry
    setShowNotes(false); // Reset to blurred state
    setStage('display');
    setError(null);
  };

  const handleContinue = () => {
    // Check if user can use blurt test
    if (!canUseBlurtTest()) {
      setShowUpgradeModal(true);
      return;
    }
    // Change to blurt input stage instead of immediately calling onContinue
    setStage('blurt');
  };

  const handleSubmitBlurt = async () => {
    if (blurtInput.trim().length === 0) {
      setError('Please enter your blurt response before submitting');
      return;
    }

    // Check usage limit before submitting
    if (!canUseBlurtTest()) {
      setShowUpgradeModal(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setStage('analyzing');

    try {
      // Get the names of selected topics
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      const analysis = await analyzeBlurtResponse(
        blurtInput,
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard
      );

      setAnalysisResults(analysis);
      
      // Increment usage after successful submission
      await incrementBlurtTestUsage();
      
      setStage('results');
    } catch (err) {
      setError(err.message || 'Failed to analyze your response. Please try again.');
      setStage('blurt');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setBlurtInput('');
    setAnalysisResults(null);
    setError(null);
    setStage('blurt');
  };

  const handleFinish = () => {
    onContinue({
      notes,
      knowledgeMap,
      blurtResponse: blurtInput,
      analysis: analysisResults,
      percentage: analysisResults?.percentage || 0,
    });
  };

  return (
    <>
      <PremiumUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature="blurt_test"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl border-2 border-amber-700/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              <h2 className="text-3xl font-bold text-amber-300">Blurt Mode</h2>
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
                  {getRemainingBlurtTests()} / 1 Free
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
              <p className="text-amber-100/80 mb-6">
                How would you like to prepare your knowledge map for {selectedTopics.length} selected topic{selectedTopics.length !== 1 ? 's' : ''}?
              </p>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Generate Option */}
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

                {/* Manual Input Option */}
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
                className="text-amber-300 hover:text-amber-200 transition text-sm mb-2"
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
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Your Study Notes
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste or type your notes here... You can include key concepts, definitions, formulas, or any study material."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-amber-500/50 transition"
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
              <Loader className="w-12 h-12 text-amber-400 animate-spin mb-4" />
              <p className="text-amber-100/80 text-center">
                Generating knowledge map from grade 9 sources...
              </p>
              <p className="text-amber-100/60 text-sm text-center mt-2">
                This may take a moment as we search for the best resources
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-amber-300">Knowledge Map Created</h3>
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
                      {/* Blurred notes preview */}
                      <div className="blur-sm select-none pointer-events-none">
                        <p className="text-white/70 text-sm whitespace-pre-wrap break-words">
                          {notes.substring(0, 300)}...
                        </p>
                      </div>

                      {/* Lock overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-4xl mb-3">🔒</div>
                          <p className="text-white font-medium mb-2">Notes Locked</p>
                          <p className="text-white/70 text-sm max-w-sm">
                            Click "View Notes" button to preview before starting the blurt test
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-white/60 text-xs mt-2">
                  💡 Tip: Press F12 and go to Console to see the full API response
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-amber-100/80 text-sm">
                  ✓ Topics: {selectedTopics.length} selected
                </p>
                <p className="text-amber-100/80 text-sm">
                  ✓ Knowledge map generated and ready
                </p>
              </div>

              {subscriptionPlan === 'scholar' && getRemainingBlurtTests() === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold mb-1">Daily limit reached</p>
                      <p className="text-white/70 text-sm">Upgrade to Professor Plan for unlimited Blurt Tests</p>
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
                onClick={handleContinue}
                disabled={subscriptionPlan === 'scholar' && getRemainingBlurtTests() <= 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continue to Blurt Test
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {stage === 'blurt' && (
            <motion.div
              key="blurt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-amber-300 mb-2">Blurt Test</h3>
                <p className="text-amber-100/80 text-sm mb-4">
                  Write everything you can remember about the selected topics. Don't worry about structure or perfection - just blurt out everything that comes to mind!
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className={`grid grid-cols-1 ${isAIGenerated ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
                {/* Left side - Blurt Input */}
                <div className={isAIGenerated ? "lg:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-amber-200 mb-3">
                    Your Blurt Response
                  </label>
                  <textarea
                    value={blurtInput}
                    onChange={(e) => {
                      setBlurtInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="Start typing everything you remember... Write freely without worrying about structure. Include key concepts, definitions, examples, formulas, or any related information that comes to mind."
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500/50 resize-none text-base leading-relaxed min-h-[500px]"
                    rows="20"
                    autoFocus
                  />
                  <p className="text-white/50 text-xs mt-2">
                    {blurtInput.length} characters
                  </p>
                </div>

                {/* Right side - Key Points Card (only show if AI-generated) */}
                {isAIGenerated && (
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-xl p-6 border-2 border-amber-600/30 h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-amber-300" />
                        <h4 className="text-lg font-bold text-amber-200">Topics to Write About</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedTopics
                          .map(topicId => masterySetup?.topics?.find(t => t.id === topicId)?.name)
                          .filter(Boolean)
                          .map((topicName, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                              <p className="text-amber-100/90 text-sm leading-relaxed">{topicName}</p>
                            </div>
                          ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-amber-700/30">
                        <p className="text-amber-200/80 text-xs italic">
                          💡 Tip: Write about everything you remember for these topics!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStage('display');
                    setBlurtInput('');
                    setError(null);
                  }}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitBlurt}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition"
                >
                  Submit Blurt Response
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader className="w-12 h-12 text-amber-400 animate-spin mb-4" />
              <p className="text-amber-100/80 text-center text-lg font-semibold mb-2">
                Analyzing your response...
              </p>
              <p className="text-amber-100/60 text-sm text-center">
                Comparing your blurt response with the knowledge map and identifying key points
              </p>
            </motion.div>
          )}

          {stage === 'results' && analysisResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-amber-300 mb-2">Blurt Test Results</h3>
                <p className="text-amber-100/80 text-sm">
                  Here's how you performed on the blurt test
                </p>
              </div>

              {/* Percentage Score */}
              <div className="bg-gradient-to-br from-amber-800/40 to-orange-800/40 rounded-xl p-6 border-2 border-amber-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-amber-200">Overall Knowledge Score</h4>
                  <div className="text-4xl font-bold text-amber-300">
                    {Math.round(analysisResults.percentage)}%
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisResults.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-4 rounded-full ${
                      analysisResults.percentage >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : analysisResults.percentage >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h4 className="text-lg font-bold text-amber-200 mb-3">Feedback</h4>
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {analysisResults.feedback}
                </p>
              </div>

              {/* Strengths */}
              {analysisResults.strengths && analysisResults.strengths.length > 0 && (
                <div className="bg-green-900/20 rounded-lg p-5 border border-green-700/30">
                  <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysisResults.strengths.map((strength, index) => (
                      <li key={index} className="text-green-100/90 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missed Points */}
              {analysisResults.missedPoints && analysisResults.missedPoints.length > 0 && (
                <div className="bg-red-900/20 rounded-lg p-5 border border-red-700/30">
                  <h4 className="text-lg font-bold text-red-300 mb-3">Key Points You Missed</h4>
                  <ul className="space-y-2">
                    {analysisResults.missedPoints.map((point, index) => (
                      <li key={index} className="text-red-100/90 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {analysisResults.areasForImprovement && analysisResults.areasForImprovement.length > 0 && (
                <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-700/30">
                  <h4 className="text-lg font-bold text-blue-300 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {analysisResults.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-blue-100/90 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-600/50 text-amber-300 rounded-lg font-semibold hover:bg-amber-600/20 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Test
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finish & Complete
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};

export default BlurtModeSection;
