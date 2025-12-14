import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <SEO 
        title="404 - Page Not Found | Trackviso"
        description="The page you're looking for doesn't exist. Return to Trackviso homepage to continue your study journey."
        url="/404"
        robots="noindex, nofollow"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-purple-200/80 text-lg mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800/40 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;

