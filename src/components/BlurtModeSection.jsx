import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { generateBlurtNotes } from '../utils/blurtNotesApi';

const BlurtModeSection = ({ selectedTopics, masterySetup, onContinue }) => {
  const [stage, setStage] = useState('choice'); // 'choice' | 'loading' | 'display'
  const [notes, setNotes] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

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
    setShowNotes(false); // Reset to blurred state
    setStage('display');
    setError(null);
  };

  const handleContinue = () => {
    onContinue({
      notes,
      knowledgeMap,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl border-2 border-amber-700/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">⚡</span>
          <h2 className="text-3xl font-bold text-amber-300">Blurt Mode</h2>
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition mt-6"
              >
                Continue to Blurt Test
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BlurtModeSection;
