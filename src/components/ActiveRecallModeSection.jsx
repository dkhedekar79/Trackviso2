import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Eye, EyeOff, Send, RotateCcw, CheckCircle, X, ChevronRight } from 'lucide-react';
import { 
  generateActiveRecallNotes, 
  generateActiveRecallQuestions, 
  markActiveRecallAnswer,
  generateActiveRecallSummary 
} from '../utils/activeRecallApi';

const ActiveRecallModeSection = ({ selectedTopics, masterySetup, onContinue }) => {
  const [stage, setStage] = useState('choice'); // 'choice' | 'loading' | 'display' | 'questions' | 'answering' | 'marked' | 'summary'
  const [notes, setNotes] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [knowledgeMap, setKnowledgeMap] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Question state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [markings, setMarkings] = useState([]);
  const [contentCoverage, setContentCoverage] = useState({});
  const [allQuestions, setAllQuestions] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [allMarkings, setAllMarkings] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Current answer state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [fillGapAnswers, setFillGapAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

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

      const data = await generateActiveRecallNotes(
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

  const handleStartQuestions = async () => {
    if (!knowledgeMap) {
      setError('Knowledge map is required. Please generate or input notes first.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsGeneratingQuestions(true);
    setStage('loading');

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      if (selectedTopicNames.length === 0) {
        throw new Error('No topics selected');
      }

      console.log('Generating questions with knowledge map length:', knowledgeMap.length);
      const generatedQuestions = await generateActiveRecallQuestions(
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard,
        allQuestions,
        contentCoverage
      );

      console.log('Generated questions:', generatedQuestions);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setMarkings([]);
      setCurrentAnswer('');
      setFillGapAnswers([]);
      setSelectedOption('');
      setStage('questions');
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
      setStage('display');
    } finally {
      setLoading(false);
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    let answerToSubmit = '';

    if (currentQuestion.type === 'multiple_choice') {
      if (!selectedOption) {
        setError('Please select an answer');
        return;
      }
      answerToSubmit = selectedOption;
    } else if (currentQuestion.type === 'fill_gap') {
      if (fillGapAnswers.length !== currentQuestion.blanks.length) {
        setError('Please fill in all blanks');
        return;
      }
      answerToSubmit = fillGapAnswers;
    } else {
      if (!currentAnswer.trim()) {
        setError('Please enter your answer');
        return;
      }
      answerToSubmit = currentAnswer;
    }

    setLoading(true);
    setError(null);
    setStage('answering');

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      const marking = await markActiveRecallAnswer(
        currentQuestion,
        answerToSubmit,
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard
      );

      // Update content coverage
      const newCoverage = { ...contentCoverage };
      currentQuestion.keyPoints.forEach(point => {
        newCoverage[point] = (newCoverage[point] || 0) + 1;
      });
      marking.keyPoints.forEach(point => {
        newCoverage[point] = (newCoverage[point] || 0) + 1;
      });
      setContentCoverage(newCoverage);

      const newAnswers = [...userAnswers, answerToSubmit];
      const newMarkings = [...markings, marking];
      setUserAnswers(newAnswers);
      setMarkings(newMarkings);

      setStage('marked');
    } catch (err) {
      setError(err.message || 'Failed to mark answer. Please try again.');
      setStage('questions');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setFillGapAnswers([]);
      setSelectedOption('');
      setError(null);
      setStage('questions');
    } else {
      // All questions answered, generate summary
      handleGenerateSummary();
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedTopicNames = selectedTopics
        .map(topicId => masterySetup.topics.find(t => t.id === topicId)?.name)
        .filter(Boolean);

      // Add current batch to all questions/answers/markings
      const updatedAllQuestions = [...allQuestions, ...questions];
      const updatedAllAnswers = [...allAnswers, ...userAnswers];
      const updatedAllMarkings = [...allMarkings, ...markings];

      const summaryData = await generateActiveRecallSummary(
        updatedAllQuestions,
        updatedAllAnswers,
        updatedAllMarkings,
        knowledgeMap,
        selectedTopicNames,
        masterySetup.qualification,
        masterySetup.subject,
        masterySetup.examBoard,
        contentCoverage
      );

      setSummary(summaryData);
      setAllQuestions(updatedAllQuestions);
      setAllAnswers(updatedAllAnswers);
      setAllMarkings(updatedAllMarkings);
      setStage('summary');
    } catch (err) {
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Generate 10 new questions
    handleStartQuestions();
  };

  const handleFinish = () => {
    const overallScore = summary?.overallScore || 
      (allMarkings.length > 0 ? allMarkings.reduce((sum, m) => sum + (m.score || 0), 0) / allMarkings.length : 0);
    
    onContinue({
      notes,
      knowledgeMap,
      questions: allQuestions,
      answers: allAnswers,
      markings: allMarkings,
      summary,
      percentage: overallScore,
      contentCoverage,
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentMarking = markings[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl border-2 border-blue-700/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🧠</span>
          <h2 className="text-3xl font-bold text-blue-300">Active Recall Mode</h2>
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
              <p className="text-blue-100/80 mb-6">
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
                className="text-blue-300 hover:text-blue-200 transition text-sm mb-2"
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
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Your Study Notes
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste or type your notes here..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition"
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
              <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-blue-100/80 text-center">
                {isGeneratingQuestions 
                  ? 'Generating 10 active recall questions...'
                  : 'Generating knowledge map from grade 9 sources...'}
              </p>
              {isGeneratingQuestions && (
                <p className="text-blue-100/60 text-sm text-center mt-2">
                  This may take a moment as we create diverse question types
                </p>
              )}
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
                  <div className="flex-1">
                    <p className="text-red-200 text-sm font-semibold mb-1">Error</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-blue-300">Knowledge Map Created</h3>
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
                            Click "View Notes" button to preview before starting the active recall test
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartQuestions}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition mt-6"
              >
                Start Active Recall Test
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {stage === 'questions' && currentQuestion && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <div className="flex gap-2">
                  {['multiple_choice', 'open_ended', 'fill_gap'].map((type, i) => {
                    const count = questions.filter(q => q.type === type).length;
                    return (
                      <span key={type} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                        {type === 'multiple_choice' ? 'MC' : type === 'open_ended' ? 'OE' : 'FG'}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentQuestion.type === 'multiple_choice' 
                      ? 'bg-purple-600/30 text-purple-300'
                      : currentQuestion.type === 'open_ended'
                      ? 'bg-green-600/30 text-green-300'
                      : 'bg-orange-600/30 text-orange-300'
                  }`}>
                    {currentQuestion.type === 'multiple_choice' 
                      ? 'Multiple Choice'
                      : currentQuestion.type === 'open_ended'
                      ? `Open Ended (${currentQuestion.marks} marks)`
                      : 'Fill in the Gap'}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-white mb-4">
                  {currentQuestion.question}
                </h4>

                {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = ['A', 'B', 'C', 'D'][index];
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedOption(optionLetter)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            selectedOption === optionLetter
                              ? 'border-blue-500 bg-blue-600/20 text-white'
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

                {currentQuestion.type === 'open_ended' && (
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm min-h-[150px]"
                    autoFocus
                  />
                )}

                {currentQuestion.type === 'fill_gap' && (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.passage.split('[BLANK]').map((part, index, array) => (
                          <React.Fragment key={index}>
                            {part}
                            {index < array.length - 1 && (
                              <input
                                type="text"
                                value={fillGapAnswers[index] || ''}
                                onChange={(e) => {
                                  const newAnswers = [...fillGapAnswers];
                                  newAnswers[index] = e.target.value;
                                  setFillGapAnswers(newAnswers);
                                }}
                                placeholder={`Blank ${index + 1}`}
                                className="inline-block mx-2 px-3 py-1 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/50 rounded-lg mt-4">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitAnswer}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition"
                >
                  Submit Answer
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === 'answering' && (
            <motion.div
              key="answering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-blue-100/80 text-center text-lg font-semibold mb-2">
                Marking your answer...
              </p>
              <p className="text-blue-100/60 text-sm text-center">
                AI is analyzing your response
              </p>
            </motion.div>
          )}

          {stage === 'marked' && currentMarking && (
            <motion.div
              key={`marked-${currentQuestionIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className={`rounded-xl p-6 border-2 ${
                currentMarking.isCorrect
                  ? 'bg-green-900/40 border-green-600/50'
                  : 'bg-red-900/40 border-red-600/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {currentMarking.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </h3>
                  <div className={`text-3xl font-bold ${
                    currentMarking.isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {Math.round(currentMarking.score)}%
                  </div>
                </div>

                {currentQuestion.type === 'open_ended' && (
                  <div className="mb-4">
                    <p className="text-white/80 text-sm">
                      Marks Awarded: <span className="font-semibold">{currentMarking.marksAwarded || 0}</span> / {currentQuestion.marks}
                    </p>
                  </div>
                )}

                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Explanation</h4>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {currentMarking.explanation}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Feedback</h4>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {currentMarking.feedback}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Summary'}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {stage === 'summary' && summary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-blue-300 mb-2">Active Recall Test Summary</h3>
                <p className="text-blue-100/80 text-sm">
                  Here's your overall performance
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-800/40 to-indigo-800/40 rounded-xl p-6 border-2 border-blue-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-blue-200">Overall Score</h4>
                  <div className="text-4xl font-bold text-blue-300">
                    {Math.round(summary.overallScore)}%
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.overallScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-4 rounded-full ${
                      summary.overallScore >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : summary.overallScore >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-200/80">Content Coverage</span>
                  <span className="text-blue-300 font-semibold">{Math.round(summary.contentCoverage)}%</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h4 className="text-lg font-bold text-blue-200 mb-3">Summary</h4>
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </p>
              </div>

              {summary.strengths && summary.strengths.length > 0 && (
                <div className="bg-green-900/20 rounded-lg p-5 border border-green-700/30">
                  <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {summary.strengths.map((strength, index) => (
                      <li key={index} className="text-green-100/90 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.weakAreas && summary.weakAreas.length > 0 && (
                <div className="bg-red-900/20 rounded-lg p-5 border border-red-700/30">
                  <h4 className="text-lg font-bold text-red-300 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {summary.weakAreas.map((area, index) => (
                      <li key={index} className="text-red-100/90 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations && summary.recommendations.length > 0 && (
                <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-700/30">
                  <h4 className="text-lg font-bold text-blue-300 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {summary.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-100/90 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinue}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600/50 text-blue-300 rounded-lg font-semibold hover:bg-blue-600/20 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Continue (10 More Questions)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition"
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
  );
};

export default ActiveRecallModeSection;

