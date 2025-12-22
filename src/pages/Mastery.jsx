import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import MasteryWizard from '../components/MasteryWizard';
import BlurtModeSection from '../components/BlurtModeSection';
import MockExamModeSection from '../components/MockExamModeSection';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useGamification } from '../context/GamificationContext';
import { getTopicsForSubject } from '../data/masteryTopics';

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
    const { applyMemoryDeterioration } = require('../utils/memoryDeterioration');
    return applyMemoryDeterioration(baseScore, topicProgress.lastPracticeDate);
  }
  
  return baseScore;
};

const Mastery = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { subscriptionPlan } = useSubscription();
  const { awardMasteryXP, checkSubjectMasteryMilestones } = useGamification();
  const [subjects, setSubjects] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [currentSession, setCurrentSession] = useState(null); // { mode, subject, topics, topicIds, notes, qualification, examBoard }
  const [isBlurtModeActive, setIsBlurtModeActive] = useState(false);
  const [isMockExamModeActive, setIsMockExamModeActive] = useState(false);
  const [recentSubjectData, setRecentSubjectData] = useState(null); // { subject, qualification, examBoard, topics, progress }

  // Helper function to get storage key for a subject
  const getStorageKey = (subject) => {
    return `masteryData_${subject}`;
  };

  useEffect(() => {
    const loadSubjects = () => {
      const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
      setSubjects(savedSubjects);
    };

    loadSubjects();
  }, [user]);

  // Handle summary exam from study session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const subjectName = params.get('subject');
    const topicsString = params.get('topics');

    if (mode === 'summaryExam' && subjectName) {
      // Find subject metadata
      const storageKey = getStorageKey(subjectName);
      const metadata = JSON.parse(localStorage.getItem(`${storageKey}_metadata`) || '{}');
      const qualification = metadata.qualification || 'GCSE';
      const examBoard = metadata.examBoard || 'AQA';

      // Get all topics for this subject
      const availableTopics = getTopicsForSubject(qualification, examBoard, subjectName);
      
      // Parse topics from string
      const requestedTopicNames = topicsString ? topicsString.split(',').map(t => t.trim().toLowerCase()) : [];
      
      // Resolve topic IDs
      let selectedTopicIds = [];
      let selectedTopics = [];

      if (requestedTopicNames.length > 0) {
        availableTopics.forEach(t => {
          if (requestedTopicNames.some(req => t.name.toLowerCase().includes(req) || req.includes(t.name.toLowerCase()))) {
            selectedTopicIds.push(t.id);
            selectedTopics.push(t);
          }
        });
      }

      // If no topics resolved, just use the first few or all
      if (selectedTopicIds.length === 0) {
        selectedTopics = availableTopics.slice(0, 3);
        selectedTopicIds = selectedTopics.map(t => t.id);
      }

      // Start session
      setCurrentSession({
        mode: 'mockExam',
        subject: subjectName,
        topics: selectedTopics,
        topicIds: selectedTopicIds,
        qualification,
        examBoard,
        isSummaryExam: true // New flag
      });
      setIsMockExamModeActive(true);
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location]);

  // Load most recent subject data
  useEffect(() => {
    const loadMostRecentSubject = () => {
      // Get all mastery data keys
      const allKeys = Object.keys(localStorage);
      const masteryKeys = allKeys.filter(key => key.startsWith('masteryData_'));
      
      if (masteryKeys.length === 0) {
        setRecentSubjectData(null);
        return;
      }

      let mostRecentSubject = null;
      let mostRecentDate = null;
      let mostRecentData = null;

      // Find the subject with the most recent practice date
      masteryKeys.forEach(key => {
        const subjectName = key.replace('masteryData_', '');
        const progressData = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Find the most recent lastPracticeDate in this subject's topics
        Object.values(progressData).forEach(topicData => {
          if (topicData.lastPracticeDate) {
            const practiceDate = new Date(topicData.lastPracticeDate);
            if (!mostRecentDate || practiceDate > mostRecentDate) {
              mostRecentDate = practiceDate;
              mostRecentSubject = subjectName;
              mostRecentData = progressData;
            }
          }
        });
      });

      if (!mostRecentSubject || !mostRecentData) {
        setRecentSubjectData(null);
        return;
      }

      // Try to get qualification and examBoard from metadata
      let qualification = 'GCSE';
      let examBoard = 'AQA';
      
      const storageKey = getStorageKey(mostRecentSubject);
      const metadataKey = `${storageKey}_metadata`;
      const metadata = localStorage.getItem(metadataKey);
      if (metadata) {
        try {
          const meta = JSON.parse(metadata);
          if (meta.qualification) qualification = meta.qualification;
          if (meta.examBoard) examBoard = meta.examBoard;
        } catch (e) {
          console.error('Error parsing metadata:', e);
        }
      }

      // Get topics for this subject
      const availableTopics = getTopicsForSubject(qualification, examBoard, mostRecentSubject);
      
      if (availableTopics.length === 0) {
        setRecentSubjectData(null);
        return;
      }

      setRecentSubjectData({
        subject: mostRecentSubject,
        qualification,
        examBoard,
        topics: availableTopics,
        progress: mostRecentData,
        lastPracticeDate: mostRecentDate,
      });
    };

    if (!isBlurtModeActive && !isMockExamModeActive) {
      loadMostRecentSubject();
    }
  }, [user, isBlurtModeActive, isMockExamModeActive]);

  const handleWizardComplete = async (wizardData) => {
    setCurrentSession(wizardData);
    setShowWizard(false);

    // Load existing progress for this subject
    const storageKey = getStorageKey(wizardData.subject);
    let progress = {};

      const existingProgress = localStorage.getItem(storageKey);
      if (existingProgress) {
        progress = JSON.parse(existingProgress);
    }

    // Initialize new topics if they don't exist
    wizardData.topics.forEach(topic => {
        if (!progress[topic.id]) {
          progress[topic.id] = {
            completed: false,
            selected: false,
          notes: wizardData.notes,
            completionPercent: 0,
            blurtScore: undefined,
            spacedRetrievalScore: undefined,
            mockExamScore: undefined,
          };
        } else {
        // Update notes if provided
        if (wizardData.notes) {
          progress[topic.id].notes = wizardData.notes;
        }
          // Recalculate completion score for existing topics (with deterioration)
          progress[topic.id].completionPercent = calculateCompletionScore(progress[topic.id], true);
        }
      });

    localStorage.setItem(storageKey, JSON.stringify(progress));

    // Start the appropriate mode
    if (wizardData.mode === 'blurt') {
      setIsBlurtModeActive(true);
    } else if (wizardData.mode === 'mockExam') {
      setIsMockExamModeActive(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6">
      <AnimatePresence>
        {showWizard && (
          <MasteryWizard
            subjects={subjects}
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {!isBlurtModeActive && !isMockExamModeActive && (
          <>
            {recentSubjectData ? (
        <motion.div
                initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
        >
                <div className="flex items-center justify-between">
            <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-2">
                      {recentSubjectData.subject}
              </h1>
                    <p className="text-white/70 text-sm">
                      {recentSubjectData.qualification} • {recentSubjectData.examBoard}
                    </p>
                    {recentSubjectData.lastPracticeDate && (
                      <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                        <Clock className="w-4 h-4" />
                        Last practiced: {new Date(recentSubjectData.lastPracticeDate).toLocaleDateString()}
                      </div>
                    )}
            </div>
            <motion.button
                    onClick={() => setShowWizard(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
                    <Sparkles className="w-5 h-5" />
                    New Session
            </motion.button>
            </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-700/30">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Topics & Progress
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentSubjectData.topics.map((topic) => {
                      const topicProgress = recentSubjectData.progress[topic.id] || {};
                      const completionScore = calculateCompletionScore(topicProgress, true);
                      const lastPractice = topicProgress.lastPracticeDate 
                        ? new Date(topicProgress.lastPracticeDate).toLocaleDateString()
                        : 'Never';

                  return (
                    <motion.div
                      key={topic.id}
                          initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-semibold text-sm flex-1">{topic.name}</h3>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-400">
                                {Math.round(completionScore)}%
                              </div>
                              <div className="text-xs text-white/50">{lastPractice}</div>
                            </div>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                              animate={{ width: `${completionScore}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
                </div>
              </motion.div>
            ) : (
                <motion.div
                className="flex flex-col items-center justify-center min-h-[60vh]"
                initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-2">
                    Mastery Practice
                  </h1>
                  <p className="text-white/80 text-lg">Your journey to academic excellence, led by an in-depth science-based AI tutor.</p>
                      </div>

                    <motion.button
                  onClick={() => setShowWizard(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Practice Session
                    </motion.button>
                </motion.div>
              )}
            </>
        )}

        {isBlurtModeActive && currentSession && (
            <BlurtModeSection
            selectedTopics={currentSession.topicIds}
            masterySetup={{
              qualification: currentSession.qualification,
              subject: currentSession.subject,
              examBoard: currentSession.examBoard,
              topics: currentSession.topics,
            }}
            initialNotes={currentSession.notes}
            initialKnowledgeMap={currentSession.knowledgeMap}
            initialIsAIGenerated={currentSession.isAIGenerated || false}
              onContinue={async (blurtData) => {
                // If finishing (has percentage), update topic scores
                if (blurtData.percentage !== undefined) {
                const storageKey = getStorageKey(currentSession.subject);
                let progress = {};
                
                const existingProgress = localStorage.getItem(storageKey);
                if (existingProgress) {
                  progress = JSON.parse(existingProgress);
                }

                  const now = new Date().toISOString();

                currentSession.topicIds.forEach(topicId => {
                  const previousScore = progress[topicId]?.blurtScore;

                    const topicData = {
                    ...progress[topicId],
                      blurtScore: blurtData.percentage,
                      blurtAnalysis: blurtData.analysis,
                    lastPracticeDate: now,
                    notes: currentSession.notes,
                    };
                    // Recalculate completion score (without deterioration since just practiced)
                    topicData.completionPercent = calculateCompletionScore(topicData, false);
                  progress[topicId] = topicData;

                  // Award XP for blurt test completion
                  awardMasteryXP("blurt_complete", blurtData.percentage, {
                    previousScore: previousScore,
                    topicCount: currentSession.topicIds.length,
                  });

                  // Award bonus XP if score improved
                  if (previousScore !== null && blurtData.percentage > previousScore) {
                    const improvement = blurtData.percentage - previousScore;
                    awardMasteryXP("score_improvement", blurtData.percentage, {
                      currentScore: blurtData.percentage,
                      previousScore: previousScore,
                      improvement: improvement,
                    });
                  }
                });

                // Store metadata if not already stored
                const metadataKey = `${storageKey}_metadata`;
                const existingMetadata = localStorage.getItem(metadataKey);
                if (!existingMetadata) {
                  const metadata = {
                    qualification: currentSession.qualification,
                    examBoard: currentSession.examBoard,
                    lastUpdated: new Date().toISOString(),
                  };
                  localStorage.setItem(metadataKey, JSON.stringify(metadata));
                }
                localStorage.setItem(storageKey, JSON.stringify(progress));
                checkSubjectMasteryMilestones(currentSession.subject, progress);
                }

                setIsBlurtModeActive(false);
              setCurrentSession(null);
              }}
            />
          )}

        {isMockExamModeActive && currentSession && (
          <MockExamModeSection
            selectedTopics={currentSession.topicIds}
            masterySetup={{
              qualification: currentSession.qualification,
              subject: currentSession.subject,
              examBoard: currentSession.examBoard,
              topics: currentSession.topics,
            }}
            initialNotes={currentSession.notes}
            initialKnowledgeMap={currentSession.knowledgeMap}
            initialIsAIGenerated={currentSession.isAIGenerated || false}
            isSummaryExam={currentSession.isSummaryExam}
            onContinue={async (mockExamData) => {
              try {
                // If finishing (has percentage), update topic scores
                if (mockExamData.percentage !== undefined) {
                  const storageKey = getStorageKey(currentSession.subject);
                  let progress = {};
                  
                  const existingProgress = localStorage.getItem(storageKey);
                  if (existingProgress) {
                    progress = JSON.parse(existingProgress);
                  }

                  const now = new Date().toISOString();

                  currentSession.topicIds.forEach(topicId => {
                    const previousScore = progress[topicId]?.mockExamScore;

                    const topicData = {
                      ...progress[topicId],
                      mockExamScore: mockExamData.percentage,
                      mockExamData: {
                        marking: mockExamData.marking,
                        exam: mockExamData.exam,
                      },
                      lastPracticeDate: now,
                      notes: currentSession.notes,
                    };
                    // Recalculate completion score (without deterioration since just practiced)
                    topicData.completionPercent = calculateCompletionScore(topicData, false);
                    progress[topicId] = topicData;

                    // Award XP for mock exam completion
                    awardMasteryXP("mock_exam_complete", mockExamData.percentage, {
                      previousScore: previousScore,
                      topicCount: currentSession.topicIds.length,
                    });

                    // Award bonus XP if score improved
                    if (previousScore !== null && mockExamData.percentage > previousScore) {
                      const improvement = mockExamData.percentage - previousScore;
                      awardMasteryXP("score_improvement", mockExamData.percentage, {
                        currentScore: mockExamData.percentage,
                        previousScore: previousScore,
                        improvement: improvement,
                      });
                    }
                  });

                  localStorage.setItem(storageKey, JSON.stringify(progress));
                  checkSubjectMasteryMilestones(currentSession.subject, progress);
                  }
                } catch (error) {
                  console.error('Error processing mock exam results:', error);
                } finally {
                  setIsMockExamModeActive(false);
                setCurrentSession(null);
                }
              }}
            />
          )}
      </div>
    </div>
  );
};

export default Mastery;
