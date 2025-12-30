import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, X, Loader } from 'lucide-react';
import { generateTopics } from '../utils/geminiApi';

const qualifications = [
  { name: 'GCSE', available: true },
  { name: 'IGCSE', available: true },
  { name: 'A-Level', available: false },
  { name: 'IB', available: false },
  { name: 'AP', available: false },
  { name: 'High School', available: false },
  { name: 'University', available: false },
  { name: 'Professional', available: false }
];

const examBoards = {
  GCSE: ['AQA', 'Edexcel', 'OCR', 'Eduqas'],
  IGCSE: ['Cambridge', 'Edexcel'],
  'A-Level': ['AQA', 'Edexcel', 'OCR', 'Cambridge'],
  IB: ['IB'],
  AP: ['AP'],
  'High School': ['State', 'Private'],
  University: ['General'],
  Professional: ['General']
};

export default function MasterySetupModal({ subjects, onComplete, onClose }) {
  const [step, setStep] = useState(1);
  const [qualification, setQualification] = useState('');
  const [subject, setSubject] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const subjectNames = subjects.map(s => s.name);
  const availableExamBoards = qualification ? (examBoards[qualification] || []) : [];
  const qualificationName = typeof qualification === 'string' ? qualification : qualification?.name;

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
    const qualName = typeof qualification === 'string' ? qualification : qualification?.name;
    if (qualName && subject && examBoard) {
      setIsLoading(true);
      setError('');
      try {
        const topics = await generateTopics(qualName, examBoard, subject);
        onComplete({
          qualification: qualName,
          subject,
          examBoard,
          topics,
          setupDate: new Date().toISOString()
        });
      } catch (err) {
        setError(err.message || 'Failed to generate topics. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const isStep1Complete = qualification !== '' && (typeof qualification === 'string' ? true : qualification.available);
  const isStep2Complete = subject !== '';
  const isStep3Complete = examBoard !== '';
  const isAllComplete = isStep1Complete && isStep2Complete && isStep3Complete;

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
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white hover:bg-purple-800/50 rounded-lg transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Close"
        >
          <X className="w-5 h-5" />
        </motion.button>

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
                <h2 className="text-2xl font-bold text-white mb-2">What subject needs to be studied?</h2>
                <p className="text-purple-200/80 mb-6">First, let's identify what you want to master</p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {subjectNames.length > 0 ? (
                    subjectNames.map((subj) => (
                      <motion.button
                        key={subj}
                        onClick={() => {
                          setSubject(subj);
                          handleNext();
                        }}
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-purple-300 mb-3">No subjects found</p>
                      <p className="text-purple-400/80 text-sm">Please create subjects first in the Subjects section</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">What qualification are you studying?</h2>
                <p className="text-purple-200/80 mb-6">Select your qualification level</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {qualifications.map((qual) => {
                    const qualName = typeof qual === 'string' ? qual : qual.name;
                    const isAvailable = typeof qual === 'string' ? true : qual.available;
                    const isSelected = typeof qualification === 'string' ? qualification === qualName : qualification?.name === qualName;

                    return (
                      <motion.button
                        key={qualName}
                        onClick={() => isAvailable && setQualification(qualName)}
                        disabled={!isAvailable}
                        className={`px-4 py-3 rounded-lg font-medium transition border relative ${
                          isSelected && isAvailable
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/50'
                            : isAvailable
                              ? 'bg-purple-800/30 text-purple-200 border-purple-700/50 hover:bg-purple-800/50 cursor-pointer'
                              : 'bg-purple-900/20 text-purple-400/50 border-purple-800/30 cursor-not-allowed'
                        }`}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                      >
                        {qualName}
                        {!isAvailable && (
                          <span className="text-xs ml-2 opacity-70">Coming Soon</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Which exam board?</h2>
                <p className="text-purple-200/80 mb-6">Select your exam board for {qualificationName}</p>
                
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-900/50 border border-red-700/50 rounded-lg"
          >
            <p className="text-red-200">{error}</p>
          </motion.div>
        )}

        <div className="flex gap-3 justify-between">
          <motion.button
            onClick={handlePrevious}
            disabled={step === 1 || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              step === 1 || isLoading
                ? 'bg-purple-800/20 text-purple-400/50 cursor-not-allowed'
                : 'bg-purple-800/50 text-white hover:bg-purple-700/50'
            }`}
            whileHover={step > 1 && !isLoading ? { scale: 1.05 } : {}}
            whileTap={step > 1 && !isLoading ? { scale: 0.95 } : {}}
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
                  (step === 2 && !isStep2Complete) ||
                  isLoading
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  (step === 1 && !isStep1Complete) ||
                  (step === 2 && !isStep2Complete) ||
                  isLoading
                    ? 'bg-gradient-to-r from-purple-800/30 to-pink-800/30 text-purple-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                }`}
                whileHover={
                  ((step === 1 && isStep1Complete) ||
                  (step === 2 && isStep2Complete)) && !isLoading
                    ? { scale: 1.05 }
                    : {}
                }
                whileTap={
                  ((step === 1 && isStep1Complete) ||
                  (step === 2 && isStep2Complete)) && !isLoading
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
                disabled={!isAllComplete || isLoading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${
                  isAllComplete && !isLoading
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50'
                    : 'bg-gradient-to-r from-green-800/30 to-emerald-800/30 text-green-400/50 cursor-not-allowed'
                }`}
                whileHover={isAllComplete && !isLoading ? { scale: 1.05 } : {}}
                whileTap={isAllComplete && !isLoading ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating Topics...
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
