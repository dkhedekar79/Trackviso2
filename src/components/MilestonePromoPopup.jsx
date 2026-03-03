import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, X, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PROMO_KEY = 'hasSeen500UsersPromo_v1';
const COUPON_ID = 'LhVn3S9g';

const MilestonePromoPopup = () => {
  const { user, isPremiumUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isPremiumUser) return;
    if (typeof window === 'undefined') return;

    try {
      const hasSeen = localStorage.getItem(PROMO_KEY) === 'true';
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, [user, isPremiumUser]);

  const markSeen = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROMO_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    markSeen();
  };

  const handleClaim = async () => {
    if (!user?.id) {
      alert('Please log in to claim this discount.');
      return;
    }

    setIsLoading(true);
    markSeen();

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          couponId: COUPON_ID,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create discounted checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Promo checkout error:', error);
      alert(
        'This discount may have already been fully claimed (limited to the first 10 uses), or there was an error starting checkout. Please try again or contact support if the problem continues.'
      );
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && !isPremiumUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative max-w-lg w-[90%] bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-7 text-left"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              aria-label="Dismiss 500 users celebration"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/40">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Thank you for 500 users!
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h2>
                <p className="mt-1 text-sm text-amber-100/80">
                  As a thank you, we&apos;re giving <span className="font-semibold">50% off</span> your first month of the Professor Plan.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <p>
                Use this limited-time celebration offer to unlock unlimited mock exams, blurt tests, and all premium study tools.
              </p>
              <p className="text-amber-200 font-semibold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-300" />
                Only the <span className="underline decoration-amber-400/80">first 10 users</span> can claim this 50% discount.
              </p>
              <p className="text-xs text-slate-400">
                Discount is automatically applied at checkout using our Stripe-powered payment system.
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={handleClaim}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 disabled:from-amber-700 disabled:to-pink-700 text-white text-sm font-semibold shadow-lg shadow-amber-500/30 transition"
              >
                {isLoading ? 'Starting secure checkout…' : 'Claim 50% off (first 10)'}
              </button>
              <button
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestonePromoPopup;

