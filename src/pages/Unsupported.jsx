import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Laptop, Sparkles, ArrowRight, Heart, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import MagneticParticles from '../components/MagneticParticles';
import { supabase } from '../supabaseClient';

const Unsupported = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    try {
      // 1. Save to database for tracking
      const { error: dbError } = await supabase
        .from('desktop_access_requests')
        .insert([{ email }]);

      if (dbError) {
        console.error('Supabase error:', dbError);
        throw new Error(dbError.message || 'Failed to save request');
      }

      // 2. Call the API to actually send the email
      // We use a more robust fetch approach
      const apiEndpoint = '/api/send-desktop-link';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).catch(err => {
        if (err.message === 'The string did not match the expected pattern') {
          throw new Error('Network error: Could not reach the email server. If you are in development, make sure you are using "vercel dev".');
        }
        throw err;
      });

      if (!response.ok) {
        let errorMsg = 'Failed to send email';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `Server error: ${response.statusText || response.status}`;
        }
        throw new Error(errorMsg);
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Error in email system:', err);
      setStatus('error');
      // Provide a more user-friendly message for the "pattern" error
      const msg = err.message === 'The string did not match the expected pattern'
        ? 'Browser error: The email request was blocked or malformed. Please try again.'
        : err.message;
      setErrorMessage(msg || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Particle Effect Background */}
      <div className="absolute inset-0 z-0">
        <MagneticParticles />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl w-full text-center"
        >
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 flex justify-center items-center gap-4"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Smartphone className="w-20 h-20 text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-12 h-12 text-pink-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Laptop className="w-20 h-20 text-purple-500" />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              Mobile Not Supported
            </span>
          </motion.h1>

          {/* Apology Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-xl md:text-2xl text-purple-200 mb-2">
              We're sorry! 😔
            </p>
            <p className="text-lg text-purple-300/80">
              Trackviso is currently optimized for desktop and tablet devices.
            </p>
          </motion.div>

          {/* Feature Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-purple-700/30 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">
                Why Desktop?
              </h2>
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-purple-800/20 rounded-xl p-4 border border-purple-700/20"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Better Experience
                </h3>
                <p className="text-purple-200/80 text-sm">
                  Full-screen ambient mode, detailed analytics, and immersive study sessions work best on larger screens.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-purple-800/20 rounded-xl p-4 border border-purple-700/20"
              >
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  More Features
                </h3>
                <p className="text-purple-200/80 text-sm">
                  Access all gamification features, advanced insights, and study modes designed for desktop productivity.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <p className="text-xl text-white font-semibold mb-2 px-4">
              Switch to your laptop or desktop for the full Trackviso experience! 💻
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="https://trackviso-beta.vercel.app"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <Laptop className="w-6 h-6" />
                  Open on Desktop
                  <ArrowRight className="w-6 h-6" />
                </a>
              </motion.div>

              {/* Email System */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="w-full max-w-md mx-auto px-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md text-center">
                  <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Email me the link
                  </h3>
                  <p className="text-purple-300/60 text-xs mb-4">
                    We'll send you a direct link so you can easily open Trackviso when you're back at your computer.
                  </p>

                  <AnimatePresence mode="wait">
                    {status === 'success' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center py-2"
                      >
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-green-400 font-bold text-sm">Link Sent! Check your inbox.</p>
                        <button 
                          onClick={() => setStatus('idle')}
                          className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                          Send to another email
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-3"
                      >
                        <div className="relative group">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={status === 'submitting'}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-all disabled:opacity-50"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={status === 'submitting'}
                          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-purple-100 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {status === 'submitting' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Link'
                          )}
                        </button>
                        {status === 'error' && (
                          <p className="text-rose-500 text-[10px] font-medium text-center">{errorMessage}</p>
                        )}
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Coming Soon Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-purple-400 text-sm mt-8 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Mobile support coming soon! Stay tuned for updates.
            <Sparkles className="w-4 h-4" />
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Unsupported;

