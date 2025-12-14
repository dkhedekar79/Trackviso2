import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MasteryWizard from '../components/MasteryWizard';
import BlurtModeSection from '../components/BlurtModeSection';
import MockExamModeSection from '../components/MockExamModeSection';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useGamification } from '../context/GamificationContext';

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
  const { subscriptionPlan } = useSubscription();
  const { awardMasteryXP, checkSubjectMasteryMilestones } = useGamification();
  const [subjects, setSubjects] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [currentSession, setCurrentSession] = useState(null); // { mode, subject, topics, topicIds, notes, qualification, examBoard }
  const [isBlurtModeActive, setIsBlurtModeActive] = useState(false);
  const [isMockExamModeActive, setIsMockExamModeActive] = useState(false);

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
