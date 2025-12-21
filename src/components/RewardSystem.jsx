import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '../context/GamificationContext';
import { 
  XPGainAnimation,
  LevelUpCelebration,
  AchievementUnlock,
  StreakMilestone,
  VariableRewardPopup,
  QuestComplete,
  FloatingNotifications
} from './RewardAnimations';

const RewardSystem = () => {
  const { 
    rewardQueue, 
    showRewards,
    dismissReward,
    setShowRewards,
    userStats
  } = useGamification();
  const navigate = useNavigate();

  // Get the current reward from the top of the queue
  const currentReward = rewardQueue && rewardQueue.length > 0 ? rewardQueue[0] : null;

  if (!currentReward) return null;

  return (
    <AnimatePresence mode="wait">
      <div key={currentReward.id}>
        {(() => {
          switch (currentReward.type) {
            case 'SESSION_COMPLETE':
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                  className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4 border-4 border-yellow-400"
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4">{currentReward.title}</h2>
                    <p className="text-lg mb-6">{currentReward.description}</p>

                    {currentReward.bonuses &&
                      Object.keys(currentReward.bonuses).length > 0 && (
                        <div className="bg-black/20 rounded-lg p-4 mb-6">
                          <h3 className="font-semibold mb-2 text-left">XP Breakdown:</h3>
                          {Object.entries(currentReward.bonuses).map(
                            ([type, value]) =>
                              value > 0 && (
                                <div
                                  key={type}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="capitalize">
                                    {type.replace('_', ' ')} Bonus:
                                  </span>
                                  <span className="font-bold">+{value} XP</span>
                                </div>
                              ),
                          )}
                        </div>
                      )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          dismissReward(currentReward.id);
                          navigate("/dashboard");
                        }}
                        className="flex-1 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => dismissReward(currentReward.id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );

            case 'XP_EARNED':
            case 'MASTERY_XP':
            case 'SCHEDULE_COMPLETE':
              return (
                <XPGainAnimation
                  amount={currentReward.xp || currentReward.amount || 0}
                  bonuses={currentReward.bonuses || {}}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            case 'LEVEL_UP':
              return (
                <LevelUpCelebration
                  newLevel={currentReward.level || userStats.level}
                  isPrestige={currentReward.isPrestige || false}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            case 'ACHIEVEMENT':
              return (
                <AchievementUnlock
                  achievement={currentReward}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            case 'STREAK_MILESTONE':
              return (
                <StreakMilestone
                  streak={currentReward.streak || userStats.currentStreak}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            case 'QUEST_COMPLETE':
              return (
                <QuestComplete
                  quest={currentReward}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            case 'VARIABLE_REWARD':
            case 'MYSTERY_BOX':
              return (
                <VariableRewardPopup
                  reward={currentReward}
                  onComplete={() => dismissReward(currentReward.id)}
                />
              );
              
            default:
              // For any other reward types, show as floating notification
              return (
                <FloatingNotificationWrapper
                  reward={currentReward}
                  onDismiss={() => dismissReward(currentReward.id)}
                />
              );
          }
        })()}
      </div>
    </AnimatePresence>
  );
};

// Internal wrapper to handle auto-dismiss for floating notifications
const FloatingNotificationWrapper = ({ reward, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [reward.id, onDismiss]);

  return (
    <FloatingNotifications
      notifications={[{
        id: reward.id,
        title: reward.title,
        message: reward.description
      }]}
      onRemove={onDismiss}
    />
  );
};

export default RewardSystem;
