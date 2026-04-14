import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userErr } = await authClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = userData.user;
  const {
    improvements = '',
    bugs = '',
    not_as_good: notAsGood = '',
    premium_blockers: premiumBlockers = '',
    total_study_time_minutes: totalStudyTimeMinutes = null,
  } = req.body || {};

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const studyMins =
    typeof totalStudyTimeMinutes === 'number' && Number.isFinite(totalStudyTimeMinutes)
      ? Math.floor(totalStudyTimeMinutes)
      : null;

  const { data, error } = await admin
    .from('user_feedback_surveys')
    .insert([
      {
        user_id: user.id,
        user_email: user.email || null,
        total_study_time_minutes: studyMins,
        improvements: String(improvements || '').slice(0, 8000),
        bugs: String(bugs || '').slice(0, 8000),
        not_as_good: String(notAsGood || '').slice(0, 8000),
        premium_blockers: String(premiumBlockers || '').slice(0, 8000),
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('[feedback-survey] insert error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save feedback' });
  }

  return res.status(200).json({ success: true, id: data?.id });
}
