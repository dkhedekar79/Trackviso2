import logger from './logger';
import { supabase } from '../supabaseClient';
import {
  fetchStudySessions,
  addStudySession,
  fetchUserSubjects,
  upsertUserSubject,
  fetchUserTasks,
  upsertUserTask,
} from './supabaseDb';

const STUDY_STORAGE_SYNC_EVENT = 'trackviso-local-study-storage-updated';

export { STUDY_STORAGE_SYNC_EVENT };

let syncInProgress = false;

export function sessionFingerprint(s) {
  const subject = String(s.subjectName ?? s.subject_name ?? '');
  const dm = Math.round((Number(s.durationMinutes ?? s.duration_minutes) || 0) * 100) / 100;
  const ts = s.timestamp ? new Date(s.timestamp).getTime() : 0;
  return `${subject}|${dm}|${ts}`;
}

function remoteRowToLocalSession(row) {
  return {
    cloudSessionId: row.id,
    id: `cloud-${row.id}`,
    subjectName: row.subject_name,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty ?? 1,
    mood: row.mood ?? 'neutral',
    xpEarned: row.xp_earned,
    bonuses: row.bonuses,
    timestamp: row.timestamp,
    task: null,
    isTaskComplete: false,
  };
}

function mergeSessionPreferLocal(base, loc) {
  const cid = base.cloudSessionId;
  Object.assign(base, loc);
  base.cloudSessionId = cid;
}

function mergeStudySessions(localArr, remoteRows) {
  const out = remoteRows.map(remoteRowToLocalSession);
  const byCloudId = new Map(
    out
      .filter((s) => s.cloudSessionId != null)
      .map((s) => [String(s.cloudSessionId), s]),
  );
  const fpToSession = new Map(out.map((s) => [sessionFingerprint(s), s]));

  for (const loc of localArr) {
    if (loc.cloudSessionId != null && byCloudId.has(String(loc.cloudSessionId))) {
      mergeSessionPreferLocal(byCloudId.get(String(loc.cloudSessionId)), loc);
      continue;
    }
    const fp = sessionFingerprint(loc);
    if (fpToSession.has(fp)) {
      mergeSessionPreferLocal(fpToSession.get(fp), loc);
      continue;
    }
    const copy = { ...loc };
    out.push(copy);
    fpToSession.set(fp, copy);
  }

  out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return out;
}

function remoteSubjectToLocal(r) {
  return {
    id: r.id,
    name: r.name,
    goalHours: r.goal_hours ?? 0,
    color: r.color,
    iconName: 'BookOpen',
  };
}

function mergeSubjects(localArr, remoteRows) {
  const byId = new Map(localArr.map((s) => [String(s.id), { ...s }]));
  for (const r of remoteRows) {
    const id = String(r.id);
    const incoming = remoteSubjectToLocal(r);
    const ex = byId.get(id);
    if (!ex) byId.set(id, incoming);
    else byId.set(id, { ...incoming, iconName: ex.iconName || incoming.iconName });
  }
  return Array.from(byId.values());
}

function normPriority(p) {
  const x = String(p || 'medium').toLowerCase();
  if (x === 'high') return 'High';
  if (x === 'low') return 'Low';
  return 'Medium';
}

function remoteTaskToLocal(r) {
  return {
    id: r.id,
    name: r.title,
    subject: r.subject_id || '',
    time: '',
    priority: normPriority(r.priority),
    description: r.description || '',
    scheduledDate: r.due_date ? String(r.due_date).slice(0, 10) : '',
    done: !!r.done,
    doneAt: r.done_at,
    recurrence: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
    subtasks: [],
    tags: [],
  };
}

function mergeTasks(localArr, remoteRows) {
  const merged = new Map(localArr.map((t) => [String(t.id), { ...t }]));
  for (const r of remoteRows) {
    const id = String(r.id);
    const incoming = remoteTaskToLocal(r);
    if (!merged.has(id)) merged.set(id, incoming);
    else {
      const L = merged.get(id);
      merged.set(id, {
        ...L,
        name: incoming.name,
        subject: incoming.subject || L.subject,
        description: incoming.description ?? L.description,
        scheduledDate: incoming.scheduledDate || L.scheduledDate,
        done: incoming.done,
        doneAt: incoming.doneAt ?? L.doneAt,
        priority: incoming.priority || L.priority,
      });
    }
  }
  return Array.from(merged.values());
}

function taskToRemoteRow(t) {
  return {
    id: String(t.id),
    title: t.name,
    description: t.description || null,
    due_date: t.scheduledDate ? new Date(t.scheduledDate).toISOString() : null,
    done: !!t.done,
    done_at: t.doneAt != null ? t.doneAt : null,
    priority: (t.priority || 'medium').toLowerCase(),
    subject_id: t.subject || t.subjectId || null,
  };
}

function dispatchStudySessionsUpdated() {
  window.dispatchEvent(new CustomEvent('trackviso-study-sessions-updated'));
}

function dispatchStudyStorageUpdated() {
  window.dispatchEvent(new CustomEvent(STUDY_STORAGE_SYNC_EVENT));
}

async function performSync(signal) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || signal?.aborted) return;

  const [remoteSessions, remoteSubjects, remoteTasks] = await Promise.all([
    fetchStudySessions(),
    fetchUserSubjects(),
    fetchUserTasks(),
  ]);

  if (signal?.aborted) return;

  const rawSessions = localStorage.getItem('studySessions');
  const localSessions = rawSessions ? JSON.parse(rawSessions) : [];
  const mergedSessions = mergeStudySessions(
    Array.isArray(localSessions) ? localSessions : [],
    remoteSessions || [],
  );
  localStorage.setItem('studySessions', JSON.stringify(mergedSessions));
  dispatchStudySessionsUpdated();

  const rawSubjects = localStorage.getItem('subjects');
  const localSubjects = rawSubjects ? JSON.parse(rawSubjects) : [];
  const mergedSubjects = mergeSubjects(
    Array.isArray(localSubjects) ? localSubjects : [],
    remoteSubjects || [],
  );
  localStorage.setItem('subjects', JSON.stringify(mergedSubjects));
  localStorage.setItem('subjects_backup', JSON.stringify(mergedSubjects));

  const rawTasks = localStorage.getItem('tasks');
  const localTasks = rawTasks ? JSON.parse(rawTasks) : [];
  const mergedTasks = mergeTasks(
    Array.isArray(localTasks) ? localTasks : [],
    remoteTasks || [],
  );
  localStorage.setItem('tasks', JSON.stringify(mergedTasks));

  dispatchStudyStorageUpdated();

  for (const s of mergedSessions) {
    if (signal?.aborted) return;
    if (s.cloudSessionId != null) continue;
    const inserted = await addStudySession({
      subject_name: s.subjectName,
      duration_minutes: s.durationMinutes,
      difficulty: s.difficulty ?? 1,
      mood: s.mood || 'neutral',
      xp_earned: s.xpEarned ?? null,
      bonuses: s.bonuses ?? null,
      timestamp: s.timestamp,
    });
    if (inserted) {
      s.cloudSessionId = inserted.id;
      if (!s.id || String(s.id).startsWith('session-')) s.id = `cloud-${inserted.id}`;
    }
  }
  localStorage.setItem('studySessions', JSON.stringify(mergedSessions));
  dispatchStudySessionsUpdated();

  for (const sub of mergedSubjects) {
    if (signal?.aborted) return;
    await upsertUserSubject({
      id: sub.id,
      name: sub.name,
      goal_hours: sub.goalHours ?? 0,
      color: sub.color,
    });
  }

  for (const t of mergedTasks) {
    if (signal?.aborted) return;
    await upsertUserTask(taskToRemoteRow(t));
  }

  logger.log('Cross-device study sync completed');
}

/**
 * Pull remote study sessions, subjects, and tasks; merge into localStorage; push local-only rows to Supabase.
 * Intended for Professor (premium) users only — callers should gate on subscription.
 */
export async function runCrossDeviceStudySync(options = {}) {
  const { signal } = options;
  if (syncInProgress) return;
  syncInProgress = true;
  try {
    await performSync(signal);
  } catch (e) {
    logger.error('Cross-device study sync error:', e);
  } finally {
    syncInProgress = false;
  }
}
