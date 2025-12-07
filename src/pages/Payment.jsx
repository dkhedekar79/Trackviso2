import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const { updateSubscriptionPlan } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      if (!user?.id) {
        alert('Please log in to continue with payment.');
        return;
      }

      // Call backend to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Failed to initiate payment: ${error.message}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 pt-20 px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Crown className="w-20 h-20 text-yellow-400 mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Upgrade to Professor Plan
          </h1>
          <p className="text-white/70 text-xl">
            Unlock unlimited Mock Exams and Blurt Tests
          </p>
        </motion.div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Scholar Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Scholar (Free)</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white/80">1 Mock Exam per day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white/80">1 Blurt Test per day</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-white/50">Limited features</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">£0<span className="text-lg text-white/60">/month</span></div>
          </motion.div>

          {/* Professor Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                RECOMMENDED
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Professor Plan
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Unlimited Mock Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Unlimited Blurt Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Priority AI Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">All Premium Features</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">£4.99<span className="text-lg text-white/60">/month</span></div>
          </motion.div>
        </div>

        {/* Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={loading}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </motion.button>
          <p className="text-white/50 text-sm mt-4">
            🔒 Secure payment powered by Stripe
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;

