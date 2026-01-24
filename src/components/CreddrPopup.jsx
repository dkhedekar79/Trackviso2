import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Award, Sparkles, ArrowRight, Bolt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CreddrPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkAndShowPopup = async () => {
      // Only show for logged-in users
      if (!user) {
        return;
      }

      // Don't show on landing page
      if (location.pathname === '/') {
        return;
      }

      // Check localStorage first
      const hasSeenInLocalStorage = localStorage.getItem('hasSeenCreddrPopup') === 'true';
      
      if (hasSeenInLocalStorage) {
        return; // User has already seen it
      }

      // Check Supabase
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

      // Show popup if user hasn't seen it
      setIsOpen(true);
    };

    // Small delay to ensure auth is ready
    const timer = setTimeout(checkAndShowPopup, 1500);
    return () => clearTimeout(timer);
  }, [user, location.pathname]);

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
            <div className="relative w-full max-w-lg max-h-[90vh] bg-gradient-to-br from-[#0a0a0f] via-[#1a1625] to-[#0a0a0f] rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>

              {/* Content - Scrollable */}
              <div className="p-6 md:p-7 space-y-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
                {/* Header Section */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400">Exclusive Launch Offer</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-2xl font-bold text-white leading-tight">
                    Calling All Finance Students & Aspiring Professionals
                  </h2>
                  
                  <p className="text-sm text-gray-300/80 max-w-xl mx-auto">
                    Jumpstart your finance career from zero knowledge. Master investment banking, private equity, and quant finance through the platform built by students, for students.
                  </p>
                </div>

                {/* What is Creddr Section */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Bolt className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1.5">What is Creddr?</h3>
                    <div className="text-xs text-gray-300/80 leading-relaxed space-y-1.5">
                      <p>
                        Creddr is an interactive learning platform that jumpstarts finance careers from zero knowledge. Whether you're a complete beginner or looking to break into high finance, we teach you everything from scratch.
                      </p>
                      <p>
                        No prior experience needed. We start with the basics and build you up to master DCF modeling, M&A analysis, LBO structures, and technical interview skills.
                      </p>
                      <p>
                        Learn by actually thinking like an analyst—not just memorizing formulas. Our realistic missions and AI-powered practice prepare you for real finance roles.
                      </p>
                      <p>
                        Perfect for students, career changers, and anyone who wants to land their first role in investment banking, private equity, venture capital, or quant finance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works Section */}
                <div className="space-y-2.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    How Creddr Jumpstarts Your Career
                  </h3>
                  
                  <div className="space-y-2">
                    {/* Point 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mt-0.5">
                        <span className="text-xs font-bold text-emerald-400">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Start from Zero</h4>
                        <p className="text-xs text-gray-300/70">No finance background? No problem. We teach you everything from accounting basics to complex deal structures.</p>
                      </div>
                    </div>

                    {/* Point 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mt-0.5">
                        <span className="text-xs font-bold text-emerald-400">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Learn by Doing</h4>
                        <p className="text-xs text-gray-300/70">Interactive missions that mirror real analyst work. Practice DCF models, analyze M&A deals, and master technical interviews.</p>
                      </div>
                    </div>

                    {/* Point 3 */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mt-0.5">
                        <span className="text-xs font-bold text-emerald-400">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Land Your First Role</h4>
                        <p className="text-xs text-gray-300/70">Build the exact skills investment banks and PE firms look for. Get interview-ready with our comprehensive prep.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">First 50 Waitlist Members Get:</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Benefit 1 */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Exclusive Founder Role & Badge</h4>
                        <p className="text-xs text-gray-300/70">Permanent recognition as a founding member</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 2 */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Award className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">50% Lifetime Discount</h4>
                        <p className="text-xs text-gray-300/70">Half-price membership forever</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 3 */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Early Access to All Courses</h4>
                        <p className="text-xs text-gray-300/70">Be first to master IB, PE, Quant & more</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Benefit 4 */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-0.5">Shape the Platform</h4>
                        <p className="text-xs text-gray-300/70">Your feedback directly influences features</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinWaitlist}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  >
                    Join the Exclusive Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  
                  <p className="text-center text-xs text-gray-400">
                    Limited spots available • No payment required
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-center text-xs text-gray-400/80">
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

