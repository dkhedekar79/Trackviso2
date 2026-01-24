import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Award, Sparkles, ArrowRight, Bolt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const CreddrPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAndShowPopup = async () => {
      // Check localStorage first (works for both logged in and logged out users)
      const hasSeenInLocalStorage = localStorage.getItem('hasSeenCreddrPopup') === 'true';
      
      if (hasSeenInLocalStorage) {
        return; // User has already seen it
      }

      // If user is logged in, also check Supabase
      if (user) {
        try {
          const { data: userStats } = await supabase
            .from('user_stats')
            .select('has_seen_creddr_popup')
            .eq('user_id', user.id)
            .single();

          // If user has seen it in Supabase, mark in localStorage and don't show
          if (userStats?.has_seen_creddr_popup) {
            localStorage.setItem('hasSeenCreddrPopup', 'true');
            return;
          }
        } catch (error) {
          // If Supabase check fails, continue with localStorage check
          console.error('Error checking Creddr popup status:', error);
        }
      }

      // Show popup if user hasn't seen it
      setIsOpen(true);
    };

    // Small delay to ensure auth is ready
    const timer = setTimeout(checkAndShowPopup, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = async () => {
    setIsOpen(false);
    
    // Mark as seen in localStorage immediately
    localStorage.setItem('hasSeenCreddrPopup', 'true');

    // Mark as seen in Supabase if user is logged in
    if (user) {
      try {
        await supabase
          .from('user_stats')
          .update({ has_seen_creddr_popup: true })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating Creddr popup status:', error);
      }
    }
  };

  const handleJoinWaitlist = () => {
    // Open waitlist link in new tab
    window.open('https://creddr.com/waitlist', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1625] to-[#0a0a0f] rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-10 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Exclusive Launch Offer</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Calling All Finance Students & Aspiring Professionals
                  </h2>
                  
                  <p className="text-lg text-gray-300/80 max-w-2xl mx-auto">
                    Master investment banking, private equity, and quant finance through the platform built by students, for students.
                  </p>
                </div>

                {/* What is Creddr Section */}
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Bolt className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">What is Creddr?</h3>
                    <p className="text-gray-300/80 leading-relaxed">
                      Interactive learning for finance careers. Learn by thinking like an analyst. Covers DCF, M&A, LBO, technical interviews. 
                      Realistic missions and AI-powered practice to master investment banking, private equity, and quant finance.
                    </p>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">First 50 Waitlist Members Get:</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Benefit 1 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Users className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Exclusive Founder Role & Badge</h4>
                        <p className="text-sm text-gray-300/70">Permanent recognition as a founding member</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 2 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">50% Lifetime Discount</h4>
                        <p className="text-sm text-gray-300/70">Half-price membership forever</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 3 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Early Access to All Courses</h4>
                        <p className="text-sm text-gray-300/70">Be first to master IB, PE, Quant & more</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 4 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Zap className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Shape the Platform</h4>
                        <p className="text-sm text-gray-300/70">Your feedback directly influences features</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinWaitlist}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  >
                    Join the Exclusive Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  
                  <p className="text-center text-sm text-gray-400">
                    Limited spots available • No payment required
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-sm text-gray-400/80">
                    Built for students breaking into investment banking, private equity, venture capital, and quant finance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreddrPopup;

