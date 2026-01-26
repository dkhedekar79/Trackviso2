import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Award, Sparkles, ArrowRight, Bolt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CreddrPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false); // Track if opened manually
  const { user } = useAuth();
  const location = useLocation();

  // Listen for manual open event from Settings page
  useEffect(() => {
    const handleManualOpen = () => {
      if (user) {
        setIsManualOpen(true);
        setIsOpen(true);
      }
    };

    window.addEventListener('openCreddrPopup', handleManualOpen);
    return () => window.removeEventListener('openCreddrPopup', handleManualOpen);
  }, [user]);

  // Auto-show popup on first visit
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
      const hasSeenInLocalStorage = localStorage.getItem('hasSeenCreddrPopup_v3') === 'true';
      
      if (hasSeenInLocalStorage) {
        return; // User has already seen it
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
    setIsManualOpen(false);
    
    // Only mark as seen if it wasn't opened manually (first-time auto-show)
    if (!isManualOpen) {
      // Mark as seen in localStorage immediately
      localStorage.setItem('hasSeenCreddrPopup_v3', 'true');

      // Mark as seen in Supabase if user is logged in
      if (user) {
        try {
          await supabase
            .from('user_stats')
            .update({ has_seen_creddr_popup: true }) // We still use this flag but v3 key handles reset
            .eq('user_id', user.id);
        } catch (error) {
          console.error('Error updating Creddr popup status:', error);
        }
      }
    }
  };

  const handleJoinWaitlist = () => {
    // Open waitlist link in new tab
    window.open('https://creddr.vercel.app', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-4 right-4 z-50 w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-[#0d0d12] rounded-xl border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[450px]">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>

            {/* Content - Small and Scrollable */}
            <div className="p-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Exclusive</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Master Finance with Creddr
                </h2>
              </div>

              {/* Brief Description */}
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Jumpstart your finance career. Learn IB, PE, and Quant finance through interactive missions.
              </p>

              {/* How It Works - Tiny version */}
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">1</div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Start from Zero</h4>
                    <p className="text-[10px] text-gray-500">Accounting to complex deals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">2</div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Learn by Doing</h4>
                    <p className="text-[10px] text-gray-500">Real analyst missions.</p>
                  </div>
                </div>
              </div>

              {/* Benefits List - Very compact */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">First 50 Get:</h3>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { icon: <Users className="w-3 h-3" />, text: "Founder Role & Badge" },
                    { icon: <Award className="w-3 h-3" />, text: "50% Lifetime Discount" },
                    { icon: <Sparkles className="w-3 h-3" />, text: "Early Course Access" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 border border-white/5">
                      <span className="text-emerald-400">{item.icon}</span>
                      <span className="text-[10px] text-gray-300 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinWaitlist}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  Join the Waitlist
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreddrPopup;

