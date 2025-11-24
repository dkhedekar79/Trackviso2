import React from 'react';
import { AnimatePresence } from 'framer-motion';
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

const RewardSystem = ({ userStats }) => {
  const { 
    rewardQueue, 
    showRewards,
    setShowRewards
  } = useGamification();

  return (
    <AnimatePresence mode="wait">
      {rewardQueue && rewardQueue.length > 0 && rewardQueue.map((reward, index) => {
        // Handle different types of rewards
        switch (reward.type) {
          case 'XP_EARNED':
            return (
              <XPGainAnimation
                key={reward.id}
                amount={reward.xp || reward.amount || 0}
                bonuses={reward.bonuses || {}}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          case 'LEVEL_UP':
            return (
              <LevelUpCelebration
                key={reward.id}
                newLevel={reward.level || userStats.level}
                isPrestige={reward.isPrestige || false}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          case 'ACHIEVEMENT':
            return (
              <AchievementUnlock
                key={reward.id}
                achievement={reward}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          case 'STREAK_MILESTONE':
            return (
              <StreakMilestone
                key={reward.id}
                streak={reward.streak || userStats.currentStreak}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          case 'QUEST_COMPLETE':
            return (
              <QuestComplete
                key={reward.id}
                quest={reward}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          case 'VARIABLE_REWARD':
          case 'MYSTERY_BOX':
            return (
              <VariableRewardPopup
                key={reward.id}
                reward={reward}
                onComplete={() => setShowRewards(false)}
              />
            );
            
          default:
            // For any other reward types, show as floating notification
            return (
              <FloatingNotifications
                key={reward.id}
                notifications={[{
                  id: reward.id,
                  title: reward.title,
                  message: reward.description
                }]}
                onRemove={() => setShowRewards(false)}
              />
            );
        }
      })}
    </AnimatePresence>
  );
};

export default RewardSystem;
