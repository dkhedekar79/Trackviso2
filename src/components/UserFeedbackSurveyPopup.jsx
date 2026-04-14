import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

const STORAGE_KEY = 'trackviso-feedback-survey-v1';
const MIN_WEBSITE_MINUTES = 20;

export default function UserFeedbackSurveyPopup() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [websiteMinutes, setWebsiteMinutes] = useState(null);
  const [improvements, setImprovements] = useState('');
  const [bugs, setBugs] = useState('');
  const [notAsGood, setNotAsGood] = useState('');
  const [premiumBlockers, setPremiumBlockers] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const markDone = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;

    (async () => {
      try {
        const status = localStorage.getItem(STORAGE_KEY);
        if (status === 'done' || status === 'skipped') return;

        const { data, error } = await supabase
          .from('user_stats')
          .select('website_time_minutes')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          logger.warn('Feedback survey: could not load website time', error.message);
          return;
        }

        const mins = Number(data?.website_time_minutes) || 0;
        setWebsiteMinutes(mins);
        if (mins > MIN_WEBSITE_MINUTES) {
          setOpen(true);
        }
      } catch (e) {
        logger.warn('Feedback survey init', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSkip = () => {
    markDone('skipped');
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        alert('Please sign in again to send feedback.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/feedback-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          improvements,
          bugs,
          not_as_good: notAsGood,
          premium_blockers: premiumBlockers,
          website_time_minutes: websiteMinutes,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      markDone('done');
      setOpen(false);
    } catch (e) {
      logger.error('Feedback survey submit', e);
      alert(e.message || 'Could not send feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-survey-title"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/90 shadow-2xl"
          >
            <button
              type="button"
              onClick={handleSkip}
              className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              aria-label="Close without sending"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-start gap-3 pr-10">
                <div className="rounded-xl bg-purple-600/30 p-2.5">
                  <Heart className="h-7 w-7 text-pink-400" aria-hidden />
                </div>
                <div>
                  <h2
                    id="feedback-survey-title"
                    className="text-xl font-bold text-white sm:text-2xl"
                  >
                    Thank you for using Trackviso
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-purple-200/85">
                    You&apos;ve spent a good amount of time here — we&apos;d love your honest input so we can
                    improve. This is optional; skip anytime.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Field
                  label="What could we improve?"
                  value={improvements}
                  onChange={setImprovements}
                  placeholder="Features, clarity, performance, anything…"
                />
                <Field
                  label="What bugs have you noticed?"
                  value={bugs}
                  onChange={setBugs}
                  placeholder="Broken flows, errors, weird UI…"
                />
                <Field
                  label="What isn’t as good as you hoped?"
                  value={notAsGood}
                  onChange={setNotAsGood}
                  placeholder="Expectations vs reality…"
                />
                <Field
                  label="What’s stopping you from going Premium (Professor)?"
                  value={premiumBlockers}
                  onChange={setPremiumBlockers}
                  placeholder="Price, value, missing features…"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl border border-slate-600/60 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800/60 transition"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-purple-300/90">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-slate-600/50 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
      />
    </div>
  );
}
