import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Crown,
  Headphones,
  RefreshCw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'trackviso-trial-offer-seen-v1';

const benefits = [
  { icon: Zap, text: 'Unlimited mock exams and blurt tests' },
  { icon: Brain, text: 'Unlimited AI study schedules and revision tools' },
  { icon: RefreshCw, text: 'Cross-device sync for sessions, subjects, and tasks' },
  { icon: Headphones, text: 'Exclusive 1-to-1 support to help you get the most from Trackviso' },
];

const TrialOfferPopup = () => {
  const { user, isPremiumUser, onboardingCompleted, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.id || isPremiumUser || !onboardingCompleted) return;
    if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') return;

    const userMetadata = user.user_metadata || {};
    if (userMetadata.trial_used === true || userMetadata.trial_started_at) return;

    try {
      const seenUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (seenUsers.includes(user.id)) return;

      // Mark on display so this offer does not compete with older promotions.
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenUsers, user.id]));
      setIsOpen(true);
    } catch {
      setIsOpen(true);
    }
  }, [authLoading, isPremiumUser, location.pathname, onboardingCompleted, user]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStartTrial = async () => {
    if (!user?.id || isStarting) return;

    setIsStarting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          billingPeriod,
          trial: true,
          accessToken: session.access_token,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to start your free trial');
      }
      if (!data.url) {
        throw new Error('No checkout URL was returned');
      }

      window.location.href = data.url;
    } catch (trialError) {
      console.error('Trial checkout error:', trialError);
      setError(trialError.message || 'Unable to start your free trial. Please try again.');
      setIsStarting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && !isPremiumUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-offer-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white shadow-2xl shadow-purple-950/60 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
              aria-label="Close free trial offer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shadow-orange-500/30">
                  <Crown className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Exclusive member offer</p>
                  <p className="text-sm text-white/60">Available once per account</p>
                </div>
              </div>

              <h2 id="trial-offer-title" className="max-w-xl text-3xl font-black leading-tight sm:text-5xl">
                Try Professor free for one full week.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Get seven days to experience the complete Trackviso study system, with personal guidance from our team included.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
                    <span className="text-sm font-medium leading-relaxed text-white/85">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                  <p className="text-sm leading-relaxed text-amber-50/90">
                    A payment method is collected securely by Stripe, but you will not be charged during the first 7 days. Cancel anytime before the trial ends to avoid the regular subscription charge.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${billingPeriod === 'monthly' ? 'bg-white text-slate-950' : 'text-white/60 hover:text-white'}`}
                  >
                    £4.99/month after trial
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('yearly')}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${billingPeriod === 'yearly' ? 'bg-white text-slate-950' : 'text-white/60 hover:text-white'}`}
                  >
                    £49.99/year
                  </button>
                </div>
                <p className="text-xs font-semibold text-emerald-300">Yearly includes 2 months free</p>
              </div>

              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

              <button
                type="button"
                onClick={handleStartTrial}
                disabled={isStarting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 px-6 py-4 text-base font-black text-slate-950 shadow-xl shadow-orange-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? 'Opening secure checkout…' : 'Start my 7-day free trial'}
                {!isStarting && <ArrowRight className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-white/50 transition hover:text-white/80"
              >
                Maybe later
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrialOfferPopup;
