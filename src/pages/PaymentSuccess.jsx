import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Loader } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateSubscriptionPlan } = useSubscription();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setVerifying(false);
        return;
      }

      try {
        // Verify payment with backend
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setVerified(true);
          // Update subscription plan in context
          if (user) {
            await updateSubscriptionPlan('professor');
          }
        } else {
          setError('Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support if you were charged.');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user, updateSubscriptionPlan]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gradient-to-br from-slate-900/50 to-purple-900/50 rounded-3xl p-12 border-2 border-purple-500/50"
        >
          <Loader className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
          <p className="text-white/70">Please wait while we confirm your subscription</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gradient-to-br from-slate-900/50 to-red-900/50 rounded-3xl p-12 border-2 border-red-500/50 max-w-md"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Verification Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-gradient-to-br from-slate-900/50 to-purple-900/50 rounded-3xl p-12 border-2 border-purple-500/50 max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-block mb-4"
        >
          <Crown className="w-12 h-12 text-yellow-400 mx-auto" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-white/70 text-lg mb-8">
          Welcome to the Professor Plan. You now have unlimited access to all features!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/mastery')}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
        >
          Start Using Premium Features
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

