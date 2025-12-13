// src/pages/Signup.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import MagneticParticles from "../components/MagneticParticles";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate inputs
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);

    try {
      const { data } = await signup(email, password);
      console.log('Signup response:', data);

      // If signup is successful, show success message and redirect to login
      if (data?.user) {
        setLoading(false);
        setSuccess(true);
        console.log('Success state set to true');
        // Show success notification for 2 seconds, then redirect
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Still show success if the signup call didn't error
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError("Failed to sign up. " + err.message);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, rotateX: 20 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <MagneticParticles />
      </div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Link */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors z-20"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold">Trackviso</span>
      </Link>

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-700/50 rounded-3xl shadow-2xl shadow-purple-500/20 p-10 backdrop-blur-md"
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)" }}
          transition={{ duration: 0.3 }}
        >
          <motion.h2
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Sign Up
          </motion.h2>
          <motion.p
            className="text-purple-200/70 mb-8"
            variants={itemVariants}
          >
            Join thousands of students transforming their academic journey
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm z-50 relative"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/40 border-2 border-green-400 text-green-100 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm shadow-lg shadow-green-500/30 z-50 relative"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-white">Account created! Please login on the login page.</span>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mb-6">
            <label className="block text-sm font-medium text-purple-300 mb-2">Email</label>
            <input
              className="w-full bg-purple-900/30 border border-purple-700/30 text-white placeholder-purple-300/50 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <label className="block text-sm font-medium text-purple-300 mb-2">Password</label>
            <input
              className="w-full bg-purple-900/30 border border-purple-700/30 text-white placeholder-purple-300/50 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </motion.div>

          <motion.button
            variants={itemVariants}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                Signing up...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Login Link */}
        <motion.div
          className="text-center mt-8"
          variants={itemVariants}
        >
          <span className="text-purple-200/70">Already have an account? </span>
          <Link
            to="/login"
            className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
