import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  fetchUserStats,
  updateUserStats,
  fetchStudySessions,
  addStudySession,
  fetchUserSubjects,
  upsertUserSubject,
  fetchUserTasks,
  upsertUserTask,
  fetchTopicProgress,
  updateTopicProgress,
  subscribeToUserStats,
} from '../utils/supabaseDb';

// Hook to sync user stats from Supabase
export const useSupabaseUserStats = (userStats, setUserStats) => {
  const syncTimeoutRef = useRef(null);
  const lastSyncRef = useRef(null);

  const syncToSupabase = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Debounce updates to avoid too many requests
      const now = Date.now();
      if (lastSyncRef.current && now - lastSyncRef.current < 2000) {
        return;
      }

      lastSyncRef.current = now;

      const statsToSync = {
        xp: userStats.xp,
        level: userStats.level,
        prestige_level: userStats.prestigeLevel,
        total_sessions: userStats.totalSessions,
        total_study_time: userStats.totalStudyTime,
        current_streak: userStats.currentStreak,
        longest_streak: userStats.longestStreak,
        last_study_date: userStats.lastStudyDate,
        streak_savers: userStats.streakSavers,
        badges: userStats.badges,
        achievements: userStats.achievements,
        unlocked_titles: userStats.unlockedTitles,
        current_title: userStats.currentTitle,
        weekly_xp: userStats.weeklyXP,
        weekly_rank: userStats.weeklyRank,
        friends: userStats.friends,
        challenges: userStats.challenges,
        is_premium: userStats.isPremium,
        xp_multiplier: userStats.xpMultiplier,
        premium_skins: userStats.premiumSkins,
        current_skin: userStats.currentSkin,
        subject_mastery: userStats.subjectMastery,
        weekly_goal: userStats.weeklyGoal,
        weekly_progress: userStats.weeklyProgress,
        total_xp_earned: userStats.totalXPEarned,
        last_reward_time: userStats.lastRewardTime,
        reward_streak: userStats.rewardStreak,
        lucky_streak: userStats.luckyStreak,
        jackpot_count: userStats.jackpotCount,
        gems: userStats.gems,
        xp_events: userStats.xpEvents?.slice(0, 500) || [],
        daily_quests: userStats.dailyQuests || [],
        weekly_quests: userStats.weeklyQuests || [],
        completed_quests_today: userStats.completedQuestsToday,
      };

      await updateUserStats(statsToSync);
    } catch (error) {
      console.error('Error syncing stats to Supabase:', error);
    }
  }, [userStats]);

  // Sync to Supabase when stats change (debounced)
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToSupabase();
    }, 1000); // Debounce by 1 second

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [userStats, syncToSupabase]);

  // Load initial stats from Supabase
  useEffect(() => {
    const loadStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const stats = await fetchUserStats();
      if (stats) {
        setUserStats((prev) => ({
          ...prev,
          xp: stats.xp || 0,
          level: stats.level || 1,
          prestigeLevel: stats.prestige_level || 0,
          totalSessions: stats.total_sessions || 0,
          totalStudyTime: stats.total_study_time || 0,
          currentStreak: stats.current_streak || 0,
          longestStreak: stats.longest_streak || 0,
          lastStudyDate: stats.last_study_date,
          streakSavers: stats.streak_savers || 3,
          badges: stats.badges || [],
          achievements: stats.achievements || [],
          unlockedTitles: stats.unlocked_titles || [],
          currentTitle: stats.current_title || 'Rookie Scholar',
          weeklyXP: stats.weekly_xp || 0,
          weeklyRank: stats.weekly_rank || 0,
          friends: stats.friends || [],
          challenges: stats.challenges || [],
          isPremium: stats.is_premium || false,
          xpMultiplier: stats.xp_multiplier || 1.0,
          premiumSkins: stats.premium_skins || [],
          currentSkin: stats.current_skin || 'default',
          subjectMastery: stats.subject_mastery || {},
          weeklyGoal: stats.weekly_goal || 0,
          weeklyProgress: stats.weekly_progress || 0,
          totalXPEarned: stats.total_xp_earned || 0,
          lastRewardTime: stats.last_reward_time,
          rewardStreak: stats.reward_streak || 0,
          luckyStreak: stats.lucky_streak || 0,
          jackpotCount: stats.jackpot_count || 0,
          gems: stats.gems || 0,
          xpEvents: stats.xp_events || [],
          dailyQuests: stats.daily_quests || [],
          weeklyQuests: stats.weekly_quests || [],
          completedQuestsToday: stats.completed_quests_today || 0,
        }));
      }

      // Subscribe to real-time updates
      const subscription = subscribeToUserStats(session.user.id, (newStats) => {
        if (newStats) {
          setUserStats((prev) => ({
            ...prev,
            xp: newStats.xp ?? prev.xp,
            level: newStats.level ?? prev.level,
            prestigeLevel: newStats.prestige_level ?? prev.prestigeLevel,
            totalSessions: newStats.total_sessions ?? prev.totalSessions,
            totalStudyTime: newStats.total_study_time ?? prev.totalStudyTime,
            currentStreak: newStats.current_streak ?? prev.currentStreak,
            longestStreak: newStats.longest_streak ?? prev.longestStreak,
            lastStudyDate: newStats.last_study_date ?? prev.lastStudyDate,
            streakSavers: newStats.streak_savers ?? prev.streakSavers,
            badges: newStats.badges ?? prev.badges,
            achievements: newStats.achievements ?? prev.achievements,
            unlockedTitles: newStats.unlocked_titles ?? prev.unlockedTitles,
            currentTitle: newStats.current_title ?? prev.currentTitle,
            weeklyXP: newStats.weekly_xp ?? prev.weeklyXP,
            weeklyRank: newStats.weekly_rank ?? prev.weeklyRank,
            friends: newStats.friends ?? prev.friends,
            challenges: newStats.challenges ?? prev.challenges,
            isPremium: newStats.is_premium ?? prev.isPremium,
            xpMultiplier: newStats.xp_multiplier ?? prev.xpMultiplier,
            premiumSkins: newStats.premium_skins ?? prev.premiumSkins,
            currentSkin: newStats.current_skin ?? prev.currentSkin,
            subjectMastery: newStats.subject_mastery ?? prev.subjectMastery,
            weeklyGoal: newStats.weekly_goal ?? prev.weeklyGoal,
            weeklyProgress: newStats.weekly_progress ?? prev.weeklyProgress,
            totalXPEarned: newStats.total_xp_earned ?? prev.totalXPEarned,
            lastRewardTime: newStats.last_reward_time ?? prev.lastRewardTime,
            rewardStreak: newStats.reward_streak ?? prev.rewardStreak,
            luckyStreak: newStats.lucky_streak ?? prev.luckyStreak,
            jackpotCount: newStats.jackpot_count ?? prev.jackpotCount,
            gems: newStats.gems ?? prev.gems,
            xpEvents: newStats.xp_events ?? prev.xpEvents,
            dailyQuests: newStats.daily_quests ?? prev.dailyQuests,
            weeklyQuests: newStats.weekly_quests ?? prev.weeklyQuests,
            completedQuestsToday: newStats.completed_quests_today ?? prev.completedQuestsToday,
          }));
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    loadStats();
  }, [setUserStats]);
};

// Hook to sync study sessions
export const useSupabaseStudySessions = () => {
  const sessionsRef = useRef([]);

  const addSession = useCallback(async (sessionData) => {
    try {
      const newSession = await addStudySession(sessionData);
      if (newSession) {
        sessionsRef.current = [newSession, ...sessionsRef.current];
      }
      return newSession;
    } catch (error) {
      console.error('Error adding study session:', error);
      return null;
    }
  }, []);

  const getSessions = useCallback(async () => {
    try {
      const sessions = await fetchStudySessions();
      sessionsRef.current = sessions;
      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }, []);

  return { addSession, getSessions, sessions: sessionsRef.current };
};

// Hook to sync subjects
export const useSupabaseSubjects = () => {
  const [subjects, setSubjects] = useState(null);

  const loadSubjects = useCallback(async () => {
    try {
      const fetchedSubjects = await fetchUserSubjects();
      setSubjects(fetchedSubjects);
      return fetchedSubjects;
    } catch (error) {
      console.error('Error loading subjects:', error);
      return [];
    }
  }, []);

  const saveSubject = useCallback(async (subjectData) => {
    try {
      const result = await upsertUserSubject(subjectData);
      if (result) {
        await loadSubjects();
      }
      return result;
    } catch (error) {
      console.error('Error saving subject:', error);
      return null;
    }
  }, [loadSubjects]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  return { subjects, loadSubjects, saveSubject };
};

// Hook to sync tasks
export const useSupabaseTasks = () => {
  const [tasks, setTasks] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      const fetchedTasks = await fetchUserTasks();
      setTasks(fetchedTasks);
      return fetchedTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }, []);

  const saveTask = useCallback(async (taskData) => {
    try {
      const result = await upsertUserTask(taskData);
      if (result) {
        await loadTasks();
      }
      return result;
    } catch (error) {
      console.error('Error saving task:', error);
      return null;
    }
  }, [loadTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return { tasks, loadTasks, saveTask };
};

// Hook to sync mastery topic progress
export const useSupabaseTopicProgress = (subject) => {
  const [topicProgress, setTopicProgress] = useState(null);

  const loadProgress = useCallback(async () => {
    if (!subject) return;
    try {
      const progress = await fetchTopicProgress(subject);
      setTopicProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error loading topic progress:', error);
      return null;
    }
  }, [subject]);

  const saveProgress = useCallback(async (progressData) => {
    if (!subject) return;
    try {
      const result = await updateTopicProgress(subject, progressData);
      if (result) {
        setTopicProgress(progressData);
      }
      return result;
    } catch (error) {
      console.error('Error saving topic progress:', error);
      return null;
    }
  }, [subject]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return { topicProgress, loadProgress, saveProgress };
};
