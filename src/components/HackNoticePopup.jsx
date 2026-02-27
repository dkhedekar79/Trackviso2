import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HACK_NOTICE_KEY = 'hackIncidentNotice_v1';

const HackNoticePopup = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;

    try {
      const hasSeen = localStorage.getItem(HACK_NOTICE_KEY) === 'true';
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch (e) {
      // If localStorage is unavailable, still show once for this session
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(HACK_NOTICE_KEY, 'true');
    } catch (e) {
      // Ignore storage errors; best-effort only
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative max-w-lg w-[90%] bg-slate-950 border border-red-500/40 rounded-2xl shadow-2xl p-6 sm:p-7 text-left"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              aria-label="Dismiss security notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/40">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Important security notice
                </h2>
                <p className="mt-1 text-sm text-red-200/80">
                  A recent security issue briefly allowed unwanted advertisements to appear on Trackviso.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <p>
                If you saw any strange pop‑ups or ads that didn&apos;t feel like part of Trackviso,
                we&apos;re really sorry. Those were not created or approved by us.
              </p>
              <p>
                The malicious code has been fully removed and the issue has been fixed. We&apos;re adding
                extra monitoring and safeguards to reduce the chance of anything like this happening again.
              </p>
              <p>
                If you ever see anything suspicious on Trackviso in the future, please reach out so we can
                investigate immediately.
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-slate-400">
                Thank you for your patience and for trusting us with your study time.
              </p>
              <button
                onClick={handleClose}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-500/30 transition"
              >
                I understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HackNoticePopup;

