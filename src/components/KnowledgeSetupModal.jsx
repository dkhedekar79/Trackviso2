import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, X, AlertCircle, Zap } from 'lucide-react';
import { fetchTopicsFromHuggingFace } from '../utils/huggingfaceApi';

const qualifications = [
  'GCSE',
  'A-Level',
  'IB',
  'AP',
  'High School',
  'University',
  'Professional'
];

const examBoards = {
  GCSE: ['AQA', 'Edexcel', 'OCR', 'Eduqas'],
  'A-Level': ['AQA', 'Edexcel', 'OCR', 'Cambridge'],
  IB: ['IB'],
  AP: ['AP'],
  'High School': ['State', 'Private'],
  University: ['General'],
  Professional: ['General']
};

export default function KnowledgeSetupModal({ subjects, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subjectNames = subjects.map(s => s.name);
  const availableExamBoards = qualification ? (examBoards[qualification] || []) : [];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (qualification && subject && examBoard) {
      setLoading(true);
      setError(null);
      try {
        // Fetch topics from AI API with web search
        const topics = await fetchTopicsFromHuggingFace(qualification, subject, examBoard);

        onComplete({
          qualification,
          subject,
          examBoard,
          topics,
          setupDate: new Date().toISOString()
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err.message || 'Failed to fetch topics. Please check your API configuration and try again.');
        setLoading(false);
      }
    }
  };

  const isStep1Complete = qualification !== '';
  const isStep2Complete = subject !== '';
  const isStep3Complete = examBoard !== '';
  const isAllComplete = isStep1Complete && isStep2Complete && isStep3Complete;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
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
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl p-8 max-w-2xl w-full mx-4 border border-purple-700/50 shadow-2xl relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white hover:bg-purple-800/50 rounded-lg transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Close"
        >
          <X className="w-5 h-5" />
        </motion.button>
        {/* Progress Indicator */}
        <div className="mb-8 pr-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
                    num === step
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110'
                      : num < step
                        ? 'bg-green-600 text-white'
                        : 'bg-purple-800/50 text-purple-300'
                  }`}
                  animate={num === step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {num < step ? <CheckCircle className="w-5 h-5" /> : num}
                </motion.div>
                {num < 3 && (
                  <motion.div
                    className={`h-1 w-12 mx-2 rounded-full transition ${
                      num < step ? 'bg-green-600' : 'bg-purple-800/50'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-purple-200 text-sm">Step {step} of 3</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-semibold text-sm">Error Fetching Topics</p>
              <p className="text-red-300/80 text-xs mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="mb-8"
          >
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">What qualification are you studying?</h2>
                <p className="text-purple-200/80 mb-6">Select your qualification level</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {qualifications.map((qual) => (
                    <motion.button
                      key={qual}
                      onClick={() => setQualification(qual)}
                      className={`px-4 py-3 rounded-lg font-medium transition border ${
                        qualification === qual
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/50'
                          : 'bg-purple-800/30 text-purple-200 border-purple-700/50 hover:bg-purple-800/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {qual}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">What subject are you studying?</h2>
                <p className="text-purple-200/80 mb-6">Select your main subject</p>
                
                {subjectNames.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {subjectNames.map((subj) => (
                      <motion.button
                        key={subj}
                        onClick={() => setSubject(subj)}
                        className={`w-full px-4 py-3 rounded-lg font-medium text-left transition border ${
                          subject === subj
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/50'
                            : 'bg-purple-800/30 text-purple-200 border-purple-700/50 hover:bg-purple-800/50'
                        }`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {subj}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-purple-300 mb-3">No subjects found</p>
                    <p className="text-purple-400/80 text-sm">Please create subjects first in the Subjects section</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Which exam board?</h2>
                <p className="text-purple-200/80 mb-6">Select your exam board for {qualification}</p>
                
                {availableExamBoards.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {availableExamBoards.map((board) => (
                      <motion.button
                        key={board}
                        onClick={() => setExamBoard(board)}
                        className={`px-4 py-3 rounded-lg font-medium transition border ${
                          examBoard === board
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/50'
                            : 'bg-purple-800/30 text-purple-200 border-purple-700/50 hover:bg-purple-800/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {board}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-purple-300">Select a qualification to see available exam boards</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex gap-3 justify-between">
          <motion.button
            onClick={handlePrevious}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              step === 1
                ? 'bg-purple-800/20 text-purple-400/50 cursor-not-allowed'
                : 'bg-purple-800/50 text-white hover:bg-purple-700/50'
            }`}
            whileHover={step > 1 ? { scale: 1.05 } : {}}
            whileTap={step > 1 ? { scale: 0.95 } : {}}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div className="flex gap-3">
            {step < 3 ? (
              <motion.button
                onClick={handleNext}
                disabled={
                  (step === 1 && !isStep1Complete) ||
                  (step === 2 && !isStep2Complete)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  (step === 1 && !isStep1Complete) ||
                  (step === 2 && !isStep2Complete)
                    ? 'bg-gradient-to-r from-purple-800/30 to-pink-800/30 text-purple-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                }`}
                whileHover={
                  (step === 1 && isStep1Complete) ||
                  (step === 2 && isStep2Complete)
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  (step === 1 && isStep1Complete) ||
                  (step === 2 && isStep2Complete)
                    ? { scale: 0.95 }
                    : {}
                }
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleComplete}
                disabled={!isAllComplete || loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${
                  isAllComplete && !loading
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
                    : 'bg-gradient-to-r from-green-800/30 to-emerald-800/30 text-green-400/50 cursor-not-allowed'
                }`}
                whileHover={isAllComplete && !loading ? { scale: 1.05 } : {}}
                whileTap={isAllComplete && !loading ? { scale: 0.95 } : {}}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Fetching Topics...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
