import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ChevronRight, ChevronLeft, X, Calendar, BookOpen, Brain,
  AlertCircle, CheckCircle, Clock, FileText, Sparkles, Loader2,
  Plus, Trash2, Sun, Moon, Zap, Trophy, EyeOff, ChevronDown, ChevronUp
} from "lucide-react";
import { generateAISchedule } from "../utils/scheduleGeneratorApi";
import { useSubscription } from "../context/SubscriptionContext";

export default function AIScheduleSetup({ onComplete, onCancel, availableSubjects }) {
  const { incrementAIScheduleUsage } = useSubscription();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generationStages = [
    "Initializing Engineered Engine...",
    "Analyzing Cognitive Profiles...",
    "Mapping Peak Performance Windows...",
    "Calculating School Hours Blocking...",
    "Prioritizing Homework Deadlines...",
    "Optimizing Subject Interleaving...",
    "Engineering Micro & Macro Breaks...",
    "Calibrating Spaced Repetition Cycles...",
    "Applying Variable Duration Formulas...",
    "Finalizing Perfectly Engineered Timetable..."
  ];

  // Logic for the fake loading animation
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setGenerationStage(0);
      setGenerationProgress(0);
      
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) return 100;
          const next = prev + (Math.random() * 5 + 2);
          
          // Update stage based on progress
          const stageIndex = Math.min(
            Math.floor((next / 100) * generationStages.length),
            generationStages.length - 1
          );
          setGenerationStage(stageIndex);
          
          return next;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Step 1: Duration
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scheduleName, setScheduleName] = useState('');

  // Step 2: Subjects and Topics
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectModes, setSubjectModes] = useState({}); // { subjectId: mode }
  const [topics, setTopics] = useState([]); // Array of { id, name, subjectId, subjectName }

  // Step 3: Confidence Ratings
  const [confidenceRatings, setConfidenceRatings] = useState({}); // { topicId: 'red' | 'yellow' | 'green' }
  const [topicReasoning, setTopicReasoning] = useState({}); // { topicId: reasoning }

  // Step 4: School & Homework (New)
  const [homeworks, setHomeworks] = useState([]);
  const [schoolSchedule, setSchoolSchedule] = useState({
    start: '08:30',
    end: '15:30',
    studyBefore: false,
    studyLunch: false,
    studyFree: false
  });

  // Step 5: Advanced Parameters (Optional)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [timetableMode, setTimetableMode] = useState('balanced'); // short-term-exam, long-term-exam, balanced
  const [peakEnergy, setPeakEnergy] = useState('morning'); // morning, afternoon, evening, night
  const [examDates, setExamDates] = useState({}); // { subjectId: date }
  const [studyRhythm, setStudyRhythm] = useState('balanced'); // pomodoro, deepwork, balanced, block
  const [subjectDifficulty, setSubjectDifficulty] = useState({}); // { subjectId: 1-10 }
  const [noGoZones, setNoGoZones] = useState([]); // Array of hours (0-23) representing typical "busy" daily hours
  const [topicTimes, setTopicTimes] = useState({}); // { topicId: minutes } (Moved from Step 4 state)

  // Step 6: Busy Times and Instructions
  const [busyTimes, setBusyTimes] = useState('');
  const [instructions, setInstructions] = useState('');

  const totalSteps = 6;

  useEffect(() => {
    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, []);

  const handleAddSubject = (subject) => {
    if (!selectedSubjects.find(s => s.id === subject.id)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleRemoveSubject = (subjectId) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.id !== subjectId));
    setTopics(topics.filter(t => t.subjectId !== subjectId));
    // Remove confidence ratings for removed topics
    const topicIdsToRemove = topics.filter(t => t.subjectId === subjectId).map(t => t.id);
    const newRatings = { ...confidenceRatings };
    topicIdsToRemove.forEach(id => delete newRatings[id]);
    setConfidenceRatings(newRatings);
  };

  const handleAddTopic = (subjectId, subjectName) => {
    const newTopic = {
      id: `topic-${Date.now()}-${Math.random()}`,
      name: '',
      subjectId,
      subjectName,
      isNew: true,
    };
    setTopics([...topics, newTopic]);
  };

  const handleUpdateTopic = (topicId, field, value) => {
    setTopics(topics.map(t => 
      t.id === topicId ? { ...t, [field]: value, isNew: false } : t
    ));
  };

  const handleRemoveTopic = (topicId) => {
    setTopics(topics.filter(t => t.id !== topicId));
    const newRatings = { ...confidenceRatings };
    delete newRatings[topicId];
    setConfidenceRatings(newRatings);
  };

  const handleSetConfidence = (topicId, rating) => {
    setConfidenceRatings({ ...confidenceRatings, [topicId]: rating });
  };

  const handleSetTopicTime = (topicId, time) => {
    setTopicTimes({ ...topicTimes, [topicId]: time });
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return startDate && endDate && new Date(startDate) <= new Date(endDate);
      case 2:
        return selectedSubjects.length > 0 && topics.length > 0 && 
               topics.every(t => t.name.trim() !== '');
      case 3:
        return topics.every(t => confidenceRatings[t.id]);
      case 4:
        // Homework is optional, but if present must have title and date
        return homeworks.every(hw => hw.title.trim() !== '' && hw.dueDate !== '');
      case 5:
        return true; // Advanced parameters are optional
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    if (!canProceedToNextStep()) return;

    setIsGenerating(true);
    try {
      const duration = calculateDuration();
      const scheduleData = {
        duration,
        subjects: selectedSubjects,
        subjectModes,
        topics: topics.filter(t => t.name.trim() !== ''),
        confidenceRatings,
        topicReasoning,
        topicTimes,
        homeworks,
        schoolSchedule,
        advanced: {
          timetableMode,
          peakEnergy,
          examDates,
          studyRhythm,
          subjectDifficulty,
          noGoZones
        },
        busyTimes,
        instructions,
        startDate,
        endDate,
      };

      const generatedSchedule = await generateAISchedule(scheduleData);
      
      // Convert AI schedule to blocks format
      const blocks = [];
      generatedSchedule.schedule.forEach(day => {
        day.sessions.forEach(session => {
          const [hours, minutes] = session.startTime.split(':').map(Number);
          let category = '';
          if (hours >= 0 && hours < 12) {
            category = 'Morning';
          } else if (hours >= 12 && hours < 17) {
            category = 'Afternoon';
          } else {
            category = 'Evening';
          }

          blocks.push({
            id: `block-${Date.now()}-${Math.random()}`,
            day: day.date,
            category,
            type: session.type === 'break' ? 'Break' : 'Study',
            name: `${session.subject} - ${session.topic}`,
            description: `AI-generated session: ${session.type}`,
            subject: session.subject,
            topic: session.topic,
            topicId: session.topicId,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            priority: session.priority,
            detailedPlan: session.detailedPlan,
            resources: session.resources,
            color: session.type === 'break' ? 'grey' : 'green',
            recurrence: 'None',
          });
        });
      });

      const newSchedule = {
        id: Date.now(),
        name: scheduleName || `AI Schedule ${new Date().toLocaleDateString()}`,
        startDate,
        endDate,
        blocks,
        isAIGenerated: true,
        setupData: scheduleData,
        aiSummary: generatedSchedule.summary,
        createdAt: new Date().toISOString(),
      };

      // Wait for animation to finish or at least a few seconds for effect
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Increment usage if successful
      await incrementAIScheduleUsage();

      onComplete(newSchedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30 flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                {isGenerating ? 'AI Engineering in Progress' : 'AI Schedule Generator'}
              </h2>
              <p className="text-white/60 text-sm">
                {isGenerating ? 'Applying advanced cognitive algorithms' : `Step ${currentStep} of ${totalSteps}`}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="h-full flex flex-col items-center justify-center space-y-8 py-12"
              >
                <div className="relative">
                  <motion.div
                    className="w-32 h-32 rounded-full border-4 border-violet-500/20 border-t-violet-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-violet-400 animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-4 max-w-md">
                  <h3 className="text-2xl font-bold text-white">Engineering Your Timetable</h3>
                  <div className="space-y-2">
                    <p className="text-violet-400 font-medium h-6">
                      {generationStages[generationStage]}
                    </p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                      />
                    </div>
                    <p className="text-white/40 text-sm">
                      {Math.round(generationProgress)}% Complete (this may take a few minutes even after completion)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {generationStages.slice(0, generationStage).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-violet-500" />
                  ))}
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                  {generationStages.slice(generationStage + 1).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-slate-700" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {/* Step 1: Duration */}
                {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    Schedule Duration
                  </h3>
                  <p className="text-white/70 mb-6">Set the time range for your study schedule</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Schedule Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="My Study Schedule"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <p className="text-violet-300 font-medium">
                      Duration: {calculateDuration()} days
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Subjects and Topics */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                    Subjects & Topics
                  </h3>
                  <p className="text-white/70 mb-6">Select subjects and add topics for each</p>
                </div>

                {/* Available Subjects */}
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">Available Subjects</label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {availableSubjects
                      .filter(s => !selectedSubjects.find(sel => sel.id === s.id))
                      .map(subject => (
                        <motion.button
                          key={subject.id}
                          onClick={() => handleAddSubject(subject)}
                          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-purple-500/30 rounded-lg text-white text-sm transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          {subject.name}
                        </motion.button>
                      ))}
                  </div>
                </div>

                {/* Selected Subjects with Topics */}
                {selectedSubjects.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No subjects selected. Add subjects above to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSubjects.map(subject => {
                      const subjectTopics = topics.filter(t => t.subjectId === subject.id);
                      return (
                        <div key={subject.id} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                              <h4 className="text-lg font-semibold text-white">{subject.name}</h4>
                              <div className="flex gap-2 mt-1">
                                {['short-term-exam', 'long-term-exam', 'no-exam'].map(mode => (
                                  <button
                                    key={mode}
                                    onClick={() => setSubjectModes({ ...subjectModes, [subject.id]: mode })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                                      (subjectModes[subject.id] || 'no-exam') === mode
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-slate-700/50 text-white/40 hover:text-white/60'
                                    }`}
                                  >
                                    {mode.split('-').join(' ')}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddTopic(subject.id, subject.name)}
                                className="px-3 py-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-lg text-sm transition-all"
                              >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Topic
                              </button>
                              <button
                                onClick={() => handleRemoveSubject(subject.id)}
                                className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg text-sm transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {subjectTopics.map(topic => (
                              <div key={topic.id} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  className="flex-1 bg-slate-700/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                  placeholder="Enter topic name"
                                  value={topic.name}
                                  onChange={(e) => handleUpdateTopic(topic.id, 'name', e.target.value)}
                                />
                                <button
                                  onClick={() => handleRemoveTopic(topic.id)}
                                  className="p-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {subjectTopics.length === 0 && (
                              <p className="text-white/50 text-sm">No topics added yet</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Confidence Ratings */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    Confidence Ratings
                  </h3>
                  <p className="text-white/70 mb-6">Rate your confidence level for each topic</p>
                </div>

                <div className="space-y-4">
                  {selectedSubjects.map(subject => {
                    const subjectTopics = topics.filter(t => t.subjectId === subject.id && t.name.trim() !== '');
                    if (subjectTopics.length === 0) return null;

                    return (
                      <div key={subject.id} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                        <h4 className="text-lg font-semibold text-white mb-4">{subject.name}</h4>
                        <div className="space-y-3">
                          {subjectTopics.map(topic => {
                            const rating = confidenceRatings[topic.id] || null;
                            return (
                              <div key={topic.id} className="p-3 bg-slate-700/30 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-medium">{topic.name}</span>
                                  <div className="flex gap-2">
                                    {['red', 'yellow', 'green'].map(color => (
                                      <button
                                        key={color}
                                        onClick={() => handleSetConfidence(topic.id, color)}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                          rating === color
                                            ? color === 'red'
                                              ? 'bg-red-600 border-red-400 scale-110'
                                              : color === 'yellow'
                                              ? 'bg-yellow-600 border-yellow-400 scale-110'
                                              : 'bg-green-600 border-green-400 scale-110'
                                            : color === 'red'
                                            ? 'bg-red-600/20 border-red-600/50 hover:bg-red-600/40'
                                            : color === 'yellow'
                                            ? 'bg-yellow-600/20 border-yellow-600/50 hover:bg-yellow-600/40'
                                            : 'bg-green-600/20 border-green-600/50 hover:bg-green-600/40'
                                        }`}
                                        title={color === 'red' ? 'Low Confidence' : color === 'yellow' ? 'Medium Confidence' : 'High Confidence'}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {(rating === 'red' || rating === 'yellow') && (
                                  <div className="animate-in slide-in-from-top-2 duration-200">
                                    <textarea
                                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                                      placeholder="Why do you struggle with this? (e.g., 'don't understand algebra', 'forget formulas')"
                                      value={topicReasoning[topic.id] || ''}
                                      onChange={(e) => setTopicReasoning({ ...topicReasoning, [topic.id]: e.target.value })}
                                      rows={2}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                  <p className="text-violet-300 text-sm">
                    <strong>Red:</strong> Low confidence - needs more time<br />
                    <strong>Yellow:</strong> Medium confidence - moderate time<br />
                    <strong>Green:</strong> High confidence - less time needed
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: School & Homework */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* School Schedule */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-400" />
                      School Schedule
                    </h3>
                    <p className="text-white/70 mb-4">When are you at school? (Mon-Fri only)</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/20">
                      <label className="text-xs text-white/40 block mb-1 uppercase font-bold">Start Time</label>
                      <input
                        type="time"
                        value={schoolSchedule.start}
                        onChange={(e) => setSchoolSchedule({ ...schoolSchedule, start: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/20">
                      <label className="text-xs text-white/40 block mb-1 uppercase font-bold">End Time</label>
                      <input
                        type="time"
                        value={schoolSchedule.end}
                        onChange={(e) => setSchoolSchedule({ ...schoolSchedule, end: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'studyBefore', label: 'Study Before School', icon: Sun },
                      { id: 'studyLunch', label: 'Study During Lunch', icon: Zap },
                      { id: 'studyFree', label: 'Study During Free Periods', icon: BookOpen }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSchoolSchedule({ ...schoolSchedule, [opt.id]: !schoolSchedule[opt.id] })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                          schoolSchedule[opt.id]
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        <span className="text-xs font-bold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Homework Manager */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Homework Manager
                      </h3>
                      <p className="text-white/70">Add specific assignments with hard deadlines</p>
                    </div>
                    <button
                      onClick={() => setHomeworks([...homeworks, { id: Date.now(), title: '', subjectId: selectedSubjects[0]?.id || '', dueDate: '', duration: 60 }])}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Homework
                    </button>
                  </div>

                  <div className="space-y-3">
                    {homeworks.map(hw => (
                      <div key={hw.id} className="p-4 bg-slate-800/50 rounded-xl border border-blue-500/20 space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Homework title (e.g., 'Essay on Macbeth')"
                            value={hw.title}
                            onChange={(e) => setHomeworks(homeworks.map(h => h.id === hw.id ? { ...h, title: e.target.value } : h))}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                          />
                          <button
                            onClick={() => setHomeworks(homeworks.filter(h => h.id !== hw.id))}
                            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={hw.subjectId}
                            onChange={(e) => setHomeworks(homeworks.map(h => h.id === hw.id ? { ...h, subjectId: e.target.value } : h))}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                          >
                            {selectedSubjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={hw.dueDate}
                            onChange={(e) => setHomeworks(homeworks.map(h => h.id === hw.id ? { ...h, dueDate: e.target.value } : h))}
                            className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                          />
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2">
                            <input
                              type="number"
                              value={hw.duration}
                              onChange={(e) => setHomeworks(homeworks.map(h => h.id === hw.id ? { ...h, duration: parseInt(e.target.value) } : h))}
                              className="w-full bg-transparent p-1 text-xs text-white"
                            />
                            <span className="text-[10px] text-white/30">min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {homeworks.length === 0 && (
                      <div className="text-center py-6 bg-slate-800/20 rounded-xl border border-dashed border-white/10">
                        <p className="text-white/30 text-xs italic">No homework added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Advanced Parameters */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      Advanced Engineering
                    </h3>
                    <p className="text-white/70">Fine-tune the cognitive engine for your biological rhythm</p>
                  </div>
                  <button
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                  >
                    {isAdvancedOpen ? 'Collapse' : 'Expand Advanced Options'}
                    {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isAdvancedOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-8 overflow-hidden"
                    >
                      {/* 0. Timetable Mode */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-violet-500/20">
                        <label className="block text-violet-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Timetable Strategy
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { id: 'short-term-exam', label: 'Intensive Prep', desc: 'Final weeks before exams', icon: Zap },
                            { id: 'balanced', label: 'Balanced', desc: 'Standard weekly study', icon: Sparkles },
                            { id: 'long-term-exam', label: 'Steady Progress', desc: 'Early learning & foundation', icon: Clock }
                          ].map(mode => (
                            <button
                              key={mode.id}
                              onClick={() => setTimetableMode(mode.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                                timetableMode === mode.id
                                  ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">{mode.label}</span>
                                <mode.icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] opacity-70 leading-tight">{mode.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 1. Biological Prime Time */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-amber-500/20">
                        <label className="block text-amber-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Biological Prime Time
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { id: 'morning', label: 'Morning Bird', icon: Sun },
                            { id: 'afternoon', label: 'Mid-Day', icon: Zap },
                            { id: 'evening', label: 'Evening', icon: Moon },
                            { id: 'night', label: 'Night Owl', icon: Moon }
                          ].map(mode => (
                            <button
                              key={mode.id}
                              onClick={() => setPeakEnergy(mode.id)}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                peakEnergy === mode.id
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              <mode.icon className="w-5 h-5" />
                              <span className="text-xs font-bold">{mode.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Study Rhythm */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-blue-500/20">
                        <label className="block text-blue-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Study Flow Rhythm
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { id: 'pomodoro', label: 'Pomodoro (25/5)', desc: 'Frequent breaks for focus' },
                            { id: 'deepwork', label: 'Deep Work (90m)', desc: 'Uninterrupted long sessions' },
                            { id: 'balanced', label: 'Balanced Rhythm', desc: 'Standard interleaving mix' },
                            { id: 'block', label: 'Subject Blocking', desc: 'One subject for half the day' }
                          ].map(rhythm => (
                            <button
                              key={rhythm.id}
                              onClick={() => setStudyRhythm(rhythm.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                studyRhythm === rhythm.id
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold text-sm mb-1">{rhythm.label}</div>
                              <div className="text-[10px] opacity-70">{rhythm.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Difficulty Weighting */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-purple-500/20">
                        <label className="block text-purple-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Subject Intensity (1-10)
                        </label>
                        <div className="space-y-4">
                          {selectedSubjects.map(subject => (
                            <div key={subject.id} className="flex items-center justify-between">
                              <span className="text-white/80 text-sm">{subject.name}</span>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={subjectDifficulty[subject.id] || 5}
                                  onChange={(e) => setSubjectDifficulty({ ...subjectDifficulty, [subject.id]: parseInt(e.target.value) })}
                                  className="w-32 accent-purple-500"
                                />
                                <span className="text-purple-400 font-bold w-4 text-center">{subjectDifficulty[subject.id] || 5}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Exam Dates */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-red-500/20">
                        <label className="block text-red-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Exam Milestones (Optional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedSubjects.map(subject => (
                            <div key={subject.id}>
                              <label className="text-[10px] text-white/40 block mb-1 uppercase font-bold">{subject.name}</label>
                              <input
                                type="date"
                                value={examDates[subject.id] || ''}
                                onChange={(e) => setExamDates({ ...examDates, [subject.id]: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Visual No-Go Zones */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-500/20">
                        <label className="block text-slate-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          Typical Daily "No-Go" Hours
                        </label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1">
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <button
                              key={hour}
                              onClick={() => {
                                if (noGoZones.includes(hour)) {
                                  setNoGoZones(noGoZones.filter(h => h !== hour));
                                } else {
                                  setNoGoZones([...noGoZones, hour]);
                                }
                              }}
                              className={`p-1.5 rounded text-[9px] font-bold border transition-all ${
                                noGoZones.includes(hour)
                                  ? 'bg-red-500/40 border-red-500 text-white'
                                  : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'
                              }`}
                            >
                              {hour.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-white/30 mt-2 italic text-center">Tap hours you are typically asleep or at school/work every day.</p>
                      </div>

                      {/* 6. Custom Time Allocation */}
                      <div className="p-5 bg-slate-800/50 rounded-2xl border border-violet-500/20">
                        <label className="block text-violet-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Custom Time Allocation (Minutes)
                        </label>
                        <div className="space-y-4">
                          {selectedSubjects.map(subject => {
                            const subjectTopics = topics.filter(t => t.subjectId === subject.id && t.name.trim() !== '');
                            if (subjectTopics.length === 0) return null;
                            return (
                              <div key={subject.id} className="space-y-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">{subject.name}</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {subjectTopics.map(topic => (
                                    <div key={topic.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                                      <span className="text-xs text-white/70 truncate mr-2">{topic.name}</span>
                                      <input
                                        type="number"
                                        className="w-16 bg-slate-800/50 border border-white/10 rounded-md py-1 px-2 text-white text-[10px] focus:outline-none"
                                        placeholder="Auto"
                                        value={topicTimes[topic.id] || ''}
                                        onChange={(e) => handleSetTopicTime(topic.id, e.target.value)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer"
                      onClick={() => setIsAdvancedOpen(true)}
                    >
                      <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:bg-amber-500/20 transition-all">
                        <Sparkles className="w-8 h-8 text-white/20 group-hover:text-amber-400" />
                      </div>
                      <p className="text-white/40 font-medium">Standard engineering active.<br /><span className="text-xs">Expand to calibrate biological prime time and exam milestones.</span></p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 6: Busy Times and Instructions */}
            {currentStep === 6 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-400" />
                    Busy Times & Instructions (highly recommeded)
                  </h3>
                  <p className="text-white/70 mb-6">Tell us when you're busy and any special requirements</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Busy Times
                  </label>
                  <textarea
                    rows="4"
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    placeholder="e.g., Mondays 2pm-4pm (sports), Fridays 6pm-8pm (dinner with family), Weekends 10am-12pm (gym)"
                    value={busyTimes}
                    onChange={(e) => setBusyTimes(e.target.value)}
                  />
                  <p className="text-white/50 text-xs mt-1">Describe when you're typically unavailable for studying</p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Additional Instructions
                  </label>
                  <textarea
                    rows="6"
                    className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    placeholder="e.g., Prefer morning sessions for difficult topics, need at least 1 hour break between subjects, want to review topics every 3 days..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                  <p className="text-white/50 text-xs mt-1">Any specific preferences or requirements for your schedule</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="p-6 border-t border-purple-500/30 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canProceedToNextStep()}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Schedule
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  // Use portal to render at document body level to avoid z-index issues
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : modalContent;
}

