import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BookOpen, ChevronDown, Zap, CheckCircle, AlertCircle, Lightbulb, Brain, Settings } from 'lucide-react';
import KnowledgeSetupModal from '../components/KnowledgeSetupModal';
import { knowledgeDatabase, getTopicsForSubject, getNotesForTopic } from '../data/knowledgeData';

export default function Knowledge() {
  const [activeSection, setActiveSection] = useState('notes'); // notes or practice
  const [userSetup, setUserSetup] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notes, setNotes] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }

    const savedSetup = localStorage.getItem('knowledgeSetup');
    if (savedSetup) {
      setUserSetup(JSON.parse(savedSetup));
    }
  }, []);

  const handleSetupComplete = (setup) => {
    setUserSetup(setup);
    localStorage.setItem('knowledgeSetup', JSON.stringify(setup));
    setShowSetupModal(false);
  };

  const generateNotes = async (topic) => {
    if (!userSetup) return;

    setLoading(true);

    try {
      // Simulate a small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch notes from local data
      const topicData = getTopicsForSubject(userSetup.qualification, userSetup.examBoard, userSetup.subject);
      const topicRecord = topicData.find(t => t.name === topic || t.id === topic);

      if (topicRecord && topicRecord.notes) {
        setNotes(topicRecord.notes);
        setPracticeQuestions(topicRecord.notes.practiceQuestions || []);
      } else {
        setNotes({
          title: topic,
          summary: `Notes for "${topic}" are not available yet. They will be added soon!`,
          mainPoints: [],
          keyTerms: [],
          practiceQuestions: []
        });
        setPracticeQuestions([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes({
        title: topic,
        summary: 'Unable to load notes at the moment. Please try again.',
        mainPoints: [],
        keyTerms: [],
        practiceQuestions: []
      });
      setPracticeQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTopicsForDisplay = () => {
    if (!userSetup) return [];

    // Fetch from knowledge database
    const topics = getTopicsForSubject(userSetup.qualification, userSetup.examBoard, userSetup.subject);
    return topics.map(t => t.name); // Return topic names for display
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setNotes(null);
    setPracticeQuestions(null);
    generateNotes(topic);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen mt-20 flex bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Sidebar />
      
      {showSetupModal && (
        <KnowledgeSetupModal 
          subjects={subjects}
          onComplete={handleSetupComplete}
          onClose={() => setShowSetupModal(false)}
        />
      )}

      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">Knowledge Base</h1>
              <p className="text-purple-200/80 text-lg">AI-powered study notes and practice questions for mastery</p>
            </div>
          </motion.div>

          {/* Section Toggle */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-2 bg-purple-900/30 backdrop-blur-md rounded-xl p-1 w-fit border border-purple-700/30">
              {[
                { key: 'notes', label: 'Notes', icon: BookOpen },
                { key: 'practice', label: 'Practice', icon: Brain }
              ].map(section => {
                const Icon = section.icon;
                return (
                  <motion.button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition ${
                      activeSection === section.key
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                        : 'text-purple-300 hover:text-purple-200'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Setup Info or Setup Prompt */}
          {!userSetup ? (
            subjects.length === 0 ? (
              // No subjects - show link to subjects page
              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-purple-700/30 mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">No Subjects Found</p>
                <p className="text-purple-200/80 mb-6">Create subjects first to use the Knowledge Base. Head to the Subjects page to get started.</p>
                <Link
                  to="/subjects"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                >
                  <BookOpen className="w-4 h-4" />
                  Go to Subjects
                </Link>
              </motion.div>
            ) : (
              // Has subjects - show setup button
              <motion.div
                className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-purple-700/30 mb-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">Get Started with Knowledge Base</p>
                <p className="text-purple-200/80 mb-6">Configure your qualification and subject to begin accessing AI-generated study notes and practice questions tailored just for you.</p>
                <motion.button
                  onClick={() => setShowSetupModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-4 h-4" />
                  Configure Now
                </motion.button>
              </motion.div>
            )
          ) : (
            // Setup exists - show setup info
            <motion.div
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <p className="text-purple-300 text-sm">Study Program</p>
                  <p className="text-white text-lg font-semibold">
                    {userSetup.qualification} - {userSetup.subject} ({userSetup.examBoard})
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowSetupModal(true)}
                  className="px-4 py-2 text-sm text-purple-300 border border-purple-500/50 rounded-lg hover:bg-purple-600/20 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Change
                </motion.button>
              </div>
            </motion.div>
          )}

          {userSetup && (
            <>

              {/* Topic Selector */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label className="block text-white text-sm font-medium mb-2">Select Topic</label>
                <div className="relative">
                  <select
                    value={selectedTopic || ''}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full px-4 py-3 bg-purple-900/40 border border-purple-700/50 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose a topic...</option>
                    {getTopicsForDisplay().map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-purple-300 pointer-events-none" />
                </div>
              </motion.div>

              {/* Notes Section */}
              {activeSection === 'notes' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {loading ? (
                    <motion.div
                      className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-purple-700/30 flex flex-col items-center justify-center"
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-12 h-12 text-purple-400 mb-4" />
                      <p className="text-white text-lg font-semibold">Generating notes...</p>
                      <p className="text-purple-200/80 text-sm mt-2">Our AI is creating comprehensive study materials for you</p>
                    </motion.div>
                  ) : notes && selectedTopic ? (
                    <motion.div
                      className="space-y-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Notes Title */}
                      <motion.div
                        className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-8 border border-purple-700/30"
                        variants={itemVariants}
                      >
                        <h2 className="text-3xl font-bold text-white mb-2">{notes.title}</h2>
                        <p className="text-purple-200/80">{notes.summary}</p>
                      </motion.div>

                      {/* Main Points */}
                      {notes.mainPoints && notes.mainPoints.length > 0 && (
                        <motion.div
                          className="space-y-4"
                          variants={itemVariants}
                        >
                          {notes.mainPoints.map((point, index) => (
                            <motion.div
                              key={index}
                              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all"
                              whileHover={{ y: -5 }}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                {point.heading}
                              </h3>
                              <p className="text-purple-200/90 mb-4">{point.content}</p>
                              {point.examples && point.examples.length > 0 && (
                                <div className="bg-purple-800/30 rounded-lg p-3 mt-4">
                                  <p className="text-purple-300 text-sm font-medium mb-2">Examples:</p>
                                  <ul className="space-y-1">
                                    {point.examples.map((example, idx) => (
                                      <li key={idx} className="text-purple-200/80 text-sm">• {example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {/* Key Terms */}
                      {notes.keyTerms && notes.keyTerms.length > 0 && (
                        <motion.div
                          className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-pink-700/30 hover:border-pink-600/50 transition-all"
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                        >
                          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-pink-400" />
                            Key Terms & Definitions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notes.keyTerms.map((term, index) => (
                              <motion.div
                                key={index}
                                className="bg-pink-800/20 rounded-lg p-4 border border-pink-700/30"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                              >
                                <p className="text-white font-semibold text-sm mb-1">{term.term}</p>
                                <p className="text-pink-200/80 text-sm">{term.definition}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : selectedTopic ? (
                    <motion.div
                      className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-purple-700/30 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold">No notes available</p>
                      <p className="text-purple-200/80 text-sm mt-2">Please select a topic to get started</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-purple-700/30 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold">Select a topic to begin</p>
                      <p className="text-purple-200/80 text-sm mt-2">Choose a topic from the dropdown above to view AI-generated study notes</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Practice Section */}
              {activeSection === 'practice' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {loading ? (
                    <motion.div
                      className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-blue-700/30 flex flex-col items-center justify-center"
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-12 h-12 text-blue-400 mb-4" />
                      <p className="text-white text-lg font-semibold">Generating practice questions...</p>
                    </motion.div>
                  ) : practiceQuestions && practiceQuestions.length > 0 ? (
                    <motion.div
                      className="space-y-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div
                        className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-8 border border-blue-700/30"
                        variants={itemVariants}
                      >
                        <h2 className="text-3xl font-bold text-white mb-2">Practice Questions</h2>
                        <p className="text-blue-200/80">Test your knowledge with these practice questions for {selectedTopic}</p>
                      </motion.div>

                      {practiceQuestions.map((question, index) => (
                        <PracticeQuestion
                          key={index}
                          question={question}
                          questionNumber={index + 1}
                          variants={itemVariants}
                        />
                      ))}
                    </motion.div>
                  ) : selectedTopic ? (
                    <motion.div
                      className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-blue-700/30 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold">No practice questions available</p>
                      <p className="text-blue-200/80 text-sm mt-2">Please generate notes first to see practice questions</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-12 border border-blue-700/30 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold">No practice content yet</p>
                      <p className="text-blue-200/80 text-sm mt-2">Select a topic and view notes to access practice questions</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PracticeQuestion({ question, questionNumber, variants }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-blue-700/30 hover:border-blue-600/50 transition-all"
      variants={variants}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {questionNumber}
        </div>
        <h3 className="text-white text-lg font-semibold flex-1">{question.question}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options && question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => !answered && handleAnswer(option)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition ${
              selectedAnswer === option
                ? isCorrect
                  ? 'bg-green-800/40 border-green-600/50 text-green-200'
                  : 'bg-red-800/40 border-red-600/50 text-red-200'
                : answered && option === question.correctAnswer
                  ? 'bg-green-800/40 border-green-600/50 text-green-200'
                  : 'bg-blue-800/20 border-blue-700/30 text-blue-200 hover:bg-blue-800/40'
            }`}
            whileHover={!answered ? { scale: 1.02 } : {}}
            whileTap={!answered ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded border border-current" />
              <span>{option}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {answered && (
        <motion.div
          className={`p-4 rounded-lg border ${
            isCorrect
              ? 'bg-green-800/20 border-green-600/30'
              : 'bg-red-800/20 border-red-600/30'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-200 font-semibold">Correct!</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-200 font-semibold">Incorrect</p>
              </>
            )}
          </div>
          <p className="text-gray-300 text-sm">{question.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
