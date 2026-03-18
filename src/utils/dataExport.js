/**
 * Data export/import utilities
 * Allows users to export and import their data for backup/portability
 */

import logger from './logger';
import { supabase } from '../supabaseClient';

/**
 * Export all user data to JSON
 */
export const exportUserData = async () => {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      userStats: JSON.parse(localStorage.getItem('userStats') || '{}'),
      subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      studySessions: JSON.parse(localStorage.getItem('studySessions') || '[]'),
      masteryData: {},
    };

    // Export mastery data for each subject
    const subjects = data.subjects || [];
    for (const subject of subjects) {
      const masteryKey = `mastery_${subject.name || subject.id}`;
      const mastery = localStorage.getItem(masteryKey);
      if (mastery) {
        try {
          data.masteryData[subject.name || subject.id] = JSON.parse(mastery);
        } catch (e) {
          logger.error('Error parsing mastery data:', e);
        }
      }
    }

    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.error('Error exporting user data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Download data as JSON file
 */
export const downloadUserData = async (filename = 'trackviso-backup.json') => {
  try {
    const data = await exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    logger.error('Error downloading user data:', error);
    throw error;
  }
};

/**
 * Import user data from JSON
 */
export const importUserData = async (jsonData, options = {}) => {
  const { 
    merge = false, 
    overwrite = false,
    validate = true 
  } = options;

  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Validate data structure
    if (validate) {
      if (!data.version || !data.exportDate) {
        throw new Error('Invalid data format');
      }
    }

    if (overwrite) {
      // Clear existing data
      localStorage.removeItem('userStats');
      localStorage.removeItem('subjects');
      localStorage.removeItem('tasks');
      localStorage.removeItem('studySessions');
    }

    // Import data
    if (data.userStats) {
      if (merge) {
        const existing = JSON.parse(localStorage.getItem('userStats') || '{}');
        localStorage.setItem('userStats', JSON.stringify({ ...existing, ...data.userStats }));
      } else {
        localStorage.setItem('userStats', JSON.stringify(data.userStats));
      }
    }

    if (data.subjects) {
      localStorage.setItem('subjects', JSON.stringify(data.subjects));
    }

    if (data.tasks) {
      localStorage.setItem('tasks', JSON.stringify(data.tasks));
    }

    if (data.studySessions) {
      localStorage.setItem('studySessions', JSON.stringify(data.studySessions));
    }

    if (data.masteryData) {
      Object.keys(data.masteryData).forEach(subject => {
        localStorage.setItem(`mastery_${subject}`, JSON.stringify(data.masteryData[subject]));
      });
    }

    logger.log('Data imported successfully');
    return true;
  } catch (error) {
    logger.error('Error importing user data:', error);
    throw error;
  }
};

/**
 * Import data from file input
 */
export const importUserDataFromFile = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const result = await importUserData(e.target.result, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export default {
  exportUserData,
  downloadUserData,
  importUserData,
  importUserDataFromFile
};

/**
 * Export "all" user data including Supabase tables (source of truth)
 * plus legacy localStorage backup fields for backwards compatibility.
 *
 * Output includes:
 * - userStats, subjects, tasks, studySessions, masteryData (legacy/local)
 * - supabase: { userStats, subjects, tasks, studySessions, topicProgress, schedules }
 */
export const exportAllUserData = async () => {
  try {
    const legacy = JSON.parse(await exportUserData());

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const session = sessionData?.session;
    if (!session) throw new Error('No active session');

    const userId = session.user.id;
    const userEmail = session.user.email || null;

    const [
      userStatsRes,
      subjectsRes,
      tasksRes,
      studySessionsRes,
      topicProgressRes,
      schedulesRes,
    ] = await Promise.all([
      supabase.from('user_stats').select('*').eq('user_id', userId).single(),
      supabase.from('user_subjects').select('*').eq('user_id', userId),
      supabase.from('user_tasks').select('*').eq('user_id', userId),
      supabase.from('study_sessions').select('*').eq('user_id', userId).order('timestamp', { ascending: true }),
      supabase.from('topic_progress').select('*').eq('user_id', userId),
      supabase.from('user_schedules').select('*').eq('user_id', userId),
    ]);

    const supabaseData = {
      userStats: userStatsRes.data,
      subjects: subjectsRes.data || [],
      tasks: tasksRes.data || [],
      studySessions: studySessionsRes.data || [],
      topicProgress: topicProgressRes.data || [],
      schedules: schedulesRes.data || [],
    };

    // Basic validation: if any of the required legacy blobs are missing, export still works
    // but we include Supabase data as the "complete" set.
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        version: '2.0',
        user: { id: userId, email: userEmail },
        supabase: supabaseData,
        // legacy/local shape fields (for local restore + UI compatibility)
        userStats: legacy.userStats || {},
        subjects: legacy.subjects || [],
        tasks: legacy.tasks || [],
        studySessions: legacy.studySessions || [],
        masteryData: legacy.masteryData || {},
      },
      null,
      2
    );
  } catch (error) {
    logger.error('Error exporting all user data:', error);
    throw new Error('Failed to export all data');
  }
};

export const downloadAllUserData = async (filename = 'trackviso-all-backup.json') => {
  const data = await exportAllUserData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

function stripNumericId(rows) {
  // study_sessions + user_schedules use BIGSERIAL PKs; safe to omit for import.
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    if (!r || typeof r !== 'object') return r;
    const next = { ...r };
    delete next.id;
    return next;
  });
}

/**
 * Import "all" user data:
 * - restores legacy localStorage first (for immediate UI consistency)
 * - overwrites Supabase tables to match the backup
 */
export const importAllUserData = async (jsonData, options = {}) => {
  const { overwrite = true, validate = true } = options;

  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  if (validate) {
    if (!data.version || !data.exportDate) {
      throw new Error('Invalid data format');
    }
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const session = sessionData?.session;
  if (!session) throw new Error('No active session');

  const userId = session.user.id;

  // 1) Restore localStorage (legacy fields)
  if (overwrite) {
    await importUserData(data, { overwrite: true, merge: false, validate: false });
  } else {
    await importUserData(data, { overwrite: false, merge: true, validate: false });
  }

  // 2) Overwrite Supabase tables (source of truth)
  if (!data.supabase) {
    // If we only have local fields, we consider the import complete for local restore.
    return true;
  }

  const supabaseData = data.supabase;
  const userStats = supabaseData.userStats || null;
  const subjects = supabaseData.subjects || [];
  const tasks = supabaseData.tasks || [];
  const studySessions = supabaseData.studySessions || [];
  const topicProgress = supabaseData.topicProgress || [];
  const schedules = supabaseData.schedules || [];

  // Replace: delete rows that are safe to delete.
  // topic_progress has no delete policy, so we upsert the whole set we export.
  if (overwrite) {
    const [
      delSessions,
      delTasks,
      delSubjects,
      delSchedules,
    ] = await Promise.all([
      supabase.from('study_sessions').delete().eq('user_id', userId),
      supabase.from('user_tasks').delete().eq('user_id', userId),
      supabase.from('user_subjects').delete().eq('user_id', userId),
      supabase.from('user_schedules').delete().eq('user_id', userId),
    ]);

    if (delSessions.error) throw delSessions.error;
    if (delTasks.error) throw delTasks.error;
    if (delSubjects.error) throw delSubjects.error;
    if (delSchedules.error) throw delSchedules.error;
  }

  // Upsert user_stats
  if (userStats) {
    const statsRow = { ...userStats, user_id: userId };
    const { error } = await supabase
      .from('user_stats')
      .upsert([statsRow], { onConflict: 'user_id' });
    if (error) throw error;
  }

  // Insert/replace user subjects
  if (subjects.length > 0) {
    const insertRows = subjects.map((r) => ({ ...r, user_id: userId }));
    const { error } = await supabase.from('user_subjects').insert(insertRows);
    if (error) throw error;
  }

  // Insert/replace tasks
  if (tasks.length > 0) {
    const insertRows = tasks.map((r) => ({ ...r, user_id: userId }));
    const { error } = await supabase.from('user_tasks').insert(insertRows);
    if (error) throw error;
  }

  // Insert/replace study sessions
  if (studySessions.length > 0) {
    const insertRows = stripNumericId(studySessions).map((r) => ({ ...r, user_id: userId }));
    const { error } = await supabase.from('study_sessions').insert(insertRows);
    if (error) throw error;
  }

  // Upsert topic progress (no delete policy)
  if (topicProgress.length > 0) {
    const rows = topicProgress.map((row) => {
      const r = { ...row };
      delete r.id;
      r.user_id = userId; // ensure correct auth user
      return r;
    });

    const { error } = await supabase
      .from('topic_progress')
      .upsert(rows, { onConflict: 'user_id,subject' });
    if (error) throw error;
  }

  // Insert/replace schedules
  if (schedules.length > 0) {
    const insertRows = stripNumericId(schedules).map((r) => ({ ...r, user_id: userId }));
    const { error } = await supabase.from('user_schedules').insert(insertRows);
    if (error) throw error;
  }

  return true;
};

export const importAllUserDataFromFile = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await importAllUserData(e.target.result, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

