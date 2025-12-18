import { supabase } from '../supabaseClient';
import {
  updateUserStats,
  addStudySession,
  updateTopicProgress,
  upsertUserSubject,
  upsertUserTask,
} from './supabaseDb';
import logger from './logger';

export const migrateLegacyDataToSupabase = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    // Check if user already has data in Supabase
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single();

    if (existingStats) {
      logger.log('✅ User already has Supabase data, skipping migration');
      return false;
    }

    logger.log('🔄 Starting migration of legacy data to Supabase...');

    // Migrate user stats from localStorage
    const userStats = localStorage.getItem('userStats');
    if (userStats) {
      const stats = JSON.parse(userStats);
      const statsToSync = {
        xp: stats.xp || 0,
        level: stats.level || 1,
        prestige_level: stats.prestigeLevel || 0,
        total_sessions: stats.totalSessions || 0,
        total_study_time: stats.totalStudyTime || 0,
        current_streak: stats.currentStreak || 0,
        longest_streak: stats.longestStreak || 0,
        last_study_date: stats.lastStudyDate,
        streak_savers: stats.streakSavers || 3,
        badges: stats.badges || [],
        achievements: stats.achievements || [],
        unlocked_titles: stats.unlockedTitles || [],
        current_title: stats.currentTitle || 'Rookie Scholar',
        weekly_xp: stats.weeklyXP || 0,
        weekly_rank: stats.weeklyRank || 0,
        friends: stats.friends || [],
        challenges: stats.challenges || [],
        is_premium: stats.isPremium || false,
        xp_multiplier: stats.xpMultiplier || 1.0,
        premium_skins: stats.premiumSkins || [],
        current_skin: stats.currentSkin || 'default',
        subject_mastery: stats.subjectMastery || {},
        weekly_goal: stats.weeklyGoal || 0,
        weekly_progress: stats.weeklyProgress || 0,
        total_xp_earned: stats.totalXPEarned || 0,
        last_reward_time: stats.lastRewardTime,
        reward_streak: stats.rewardStreak || 0,
        lucky_streak: stats.luckyStreak || 0,
        jackpot_count: stats.jackpotCount || 0,
        gems: stats.gems || 0,
        xp_events: stats.xpEvents || [],
        daily_quests: stats.dailyQuests || [],
        weekly_quests: stats.weeklyQuests || [],
        completed_quests_today: stats.completedQuestsToday || 0,
      };

      await updateUserStats(statsToSync);
      logger.log('✅ User stats migrated');
    }

    // Migrate study sessions
    const studySessions = localStorage.getItem('studySessions');
    if (studySessions) {
      const sessions = JSON.parse(studySessions);
      for (const session of sessions) {
        await addStudySession({
          subject_name: session.subjectName,
          duration_minutes: session.durationMinutes,
          difficulty: session.difficulty || 1.0,
          mood: session.mood || 'neutral',
          xp_earned: session.xpEarned,
          bonuses: session.bonuses,
          timestamp: session.timestamp,
        });
      }
      logger.log(`✅ ${sessions.length} study sessions migrated`);
    }

    // Migrate subjects
    const subjects = localStorage.getItem('subjects');
    if (subjects) {
      const subjectsArray = JSON.parse(subjects);
      for (const subject of subjectsArray) {
        await upsertUserSubject({
          id: subject.id,
          name: subject.name,
          goal_hours: subject.goalHours || 0,
          color: subject.color,
        });
      }
      logger.log(`✅ ${subjectsArray.length} subjects migrated`);
    }

    // Migrate tasks
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
      const tasksArray = JSON.parse(tasks);
      for (const task of tasksArray) {
        await upsertUserTask({
          id: task.id,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          done: task.done || false,
          done_at: task.doneAt,
          priority: task.priority || 'medium',
          subject_id: task.subjectId,
        });
      }
      logger.log(`✅ ${tasksArray.length} tasks migrated`);
    }

    // Migrate mastery setup and progress for all subjects
    const masterySetup = localStorage.getItem('masterySetup');
    if (masterySetup) {
      const setup = JSON.parse(masterySetup);
      const storageKey = `masteryData_${setup.subject}`;
      const topicProgress = localStorage.getItem(storageKey);
      if (topicProgress) {
        const progress = JSON.parse(topicProgress);
        await updateTopicProgress(setup.subject, progress);
        logger.log(`✅ Mastery data for ${setup.subject} migrated`);
      }
    }

    // Check for any other masteryData_* entries in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('masteryData_')) {
        const subject = key.replace('masteryData_', '');
        const data = localStorage.getItem(key);
        if (data) {
          const progress = JSON.parse(data);
          await updateTopicProgress(subject, progress);
          logger.log(`✅ Mastery data for ${subject} migrated`);
        }
      }
    }

    logger.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    logger.error('❌ Error during migration:', error);
    return false;
  }
};
