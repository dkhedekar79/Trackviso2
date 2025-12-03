import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MagneticParticles from "../components/MagneticParticles";
import {
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Users,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Smartphone,
  Laptop,
  Tablet,
  Target,
  Clock,
  BarChart3,
  GraduationCap,
  Award,
  Lightbulb,
  TrendingUp,
  Shield,
  Sparkles,
  Flame,
  Gem
} from "lucide-react";
import ImageCarousel from '../components/ImageCarousel';
import { ChevronDown } from "lucide-react";
import Skillpulse from '../components/Skillpulse';

const Landing = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const rotatingTexts = [
    {
      title: (
        <>
          Make every{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Study Session
          </span>{" "}
          Count.
        </>
      ),
      subtitle:
        "Your revision dashboard: study tracker, analytics, calendar, and XP system in one.",
    },
    {
      title: (
        <>
          Feel{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Addicted
          </span>{" "}
          to studying.
        </>
      ),
      subtitle:
        "Gamified progress, streaks, and rewards make learning irresistible.",
    },
    {
      title: (
        <>
          Science meets{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            AI
          </span>{" "}
          in your hands.
        </>
      ),
      subtitle:
        "Personalized insights, the three best study modes, and smart recommendations for optimal learning.",
    },
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(
        (prevIndex) => (prevIndex + 1) % rotatingTexts.length
      );
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: {
      y: [-10, 10, -10],
      opacity: 1,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    hidden: { rotateX: 0, opacity: 0 },
    visible: {
      rotateX: [0, 360],
      opacity: 1,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl z-50 border-b border-purple-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trackviso
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                Reviews
              </button>
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Login</Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Let's go!
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 h-96 bg-gradient-to-b from-purple-600/20 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 h-full overflow-hidden">
          <MagneticParticles />
        </div>

        <motion.div
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center bg-purple-900/50 border border-purple-700/50 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Track your academic journey like never before
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={currentTextIndex}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-8 text-white"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ perspective: "1000px" }}
            >
              {rotatingTexts[currentTextIndex].title}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentTextIndex + "p"}
              className="text-xl lg:text-2xl text-purple-200/80 mb-12 max-w-4xl mx-auto"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {rotatingTexts[currentTextIndex].subtitle}
            </motion.p>
          </AnimatePresence>

          <motion.div
            className="flex justify-center items-center"
            variants={itemVariants}
          >
            <Link
              to="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="mt-20 relative"
            variants={itemVariants}
            whileInView={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-700/30 rounded-3xl shadow-2xl shadow-purple-500/20 p-8 max-w-4xl mx-auto backdrop-blur-md">
              <div className="bg-gradient-to-br from-purple-800/20 to-slate-800/20 rounded-2xl p-6 border border-purple-700/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    className="bg-gradient-to-br from-purple-800/40 to-slate-800/40 rounded-xl p-4 border border-purple-700/30 backdrop-blur-sm hover:border-purple-600/50 transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-purple-300/70">This Week</span>
                    </div>
                    <div className="text-2xl font-bold text-white">32.5h</div>
                    <div className="text-sm text-purple-300">+18% from last week</div>
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-br from-pink-800/40 to-slate-800/40 rounded-xl p-4 border border-pink-700/30 backdrop-blur-sm hover:border-pink-600/50 transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Trophy className="w-6 h-6 text-pink-400" />
                      <span className="text-sm text-pink-300/70">Goals</span>
                    </div>
                    <div className="text-2xl font-bold text-white">8/10</div>
                    <div className="text-sm text-pink-300">Completed</div>
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-br from-purple-800/40 to-pink-800/40 rounded-xl p-4 border border-purple-700/30 backdrop-blur-sm hover:border-purple-600/50 transition-all"
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-purple-300/70">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-white">94%</div>
                    <div className="text-sm text-purple-300">On track</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Everything you need to track, analyze, and improve your academic performance
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Smart Analytics */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 border border-purple-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-purple-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <BarChart3 className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Track every session</h3>
              <p className="text-purple-100/80 text-lg mb-6">
                Smart revision timer with inbuilt pomodoro mode, custom, and stopwatch features. Log every session you do.
              </p>
              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-200">Time left</span>
                  <span className="text-sm font-semibold text-purple-300">2 minutes</span>
                </div>
                <div className="w-full bg-purple-500/30 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                    style={{ width: '96%' }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            {/* Goal Tracking */}
            <motion.div
              className="bg-gradient-to-br from-pink-600/40 to-purple-600/40 border border-pink-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-pink-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <Target className="w-12 h-12 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Gamified experience</h3>
              <p className="text-pink-100/80 text-lg mb-6">
                Become addicted to studying with streaks, xp, levels, achievements, quests, and more!
              </p>
              <div className="bg-pink-500/20 rounded-xl p-4 border border-pink-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-pink-200">Level 3 - 234 XP needed</span>
                  <span className="text-sm font-semibold text-pink-300">87%</span>
                </div>
                <div className="w-full bg-pink-500/30 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full"
                    style={{ width: '87%' }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-purple-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <Brain className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Get the best Insights</h3>
              <p className="text-purple-100/80 text-lg mb-6">
                Get personalized recommendations and insights to optimize your study schedule and improve performance.
              </p>
              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-purple-200">Smart Tip</span>
                </div>
                <p className="text-sm text-purple-100/80">
                  Study math between 2-4 PM for 23% better retention
                </p>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Clock, title: "Time Tracking", desc: "Log your study sessions" },
              { icon: Award, title: "Achievement System", desc: "Gamified progress rewards" },
              { icon: Shield, title: "Privacy First", desc: "Your data stays secure" },
              { icon: Smartphone, title: "Cross-Platform", desc: "Works on all devices" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-purple-900/30 border border-purple-700/30 rounded-2xl p-6 hover:bg-purple-800/40 hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm group"
                initial={{ opacity: 0, y: 30, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-purple-400 mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                <p className="text-purple-200/70 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              A powerful new{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI revision system
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Science-proven best methods to make every study session count.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Smart Analytics */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/40 to-purple-700/40 border border-purple-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-purple-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <Target className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Blurt mode</h3>
              <p className="text-purple-100/80 text-lg mb-6">
                An advanced AI system maximising active recall, with detailed analysis as the end of every session. AI generate grade 9 knowledge maps, or manually input your own notes, then see how well you can do at remembering them!
              </p>
            </motion.div>

            {/* Goal Tracking */}
            <motion.div
              className="bg-gradient-to-br from-pink-600/40 to-purple-600/40 border border-pink-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-pink-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <Brain className="w-12 h-12 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Spaced retrieval</h3>
              <p className="text-pink-100/80 text-lg mb-6">
                The most efficient study method meets the efficiency of AI. Quizzes, flashcards and more. Detailed analytics.
              </p>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/30 rounded-3xl p-8 text-white backdrop-blur-md hover:border-purple-500/60 transition-all group cursor-pointer"
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 mb-6">
                <BarChart3 className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mock Exam</h3>
              <p className="text-purple-100/80 text-lg mb-6">
               Realistic exam practice for the best real life practice.
              </p>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { icon: Clock, title: "Saved data", desc: "See all your progress" },
              { icon: Award, title: "Analytics", desc: "Keep track wiht insights" },
              { icon: Shield, title: "Privacy First", desc: "Your data stays secure" },
              { icon: Smartphone, title: "Cross platform", desc: "Works on all devices" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-purple-900/30 border border-purple-700/30 rounded-2xl p-6 hover:bg-purple-800/40 hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm group"
                initial={{ opacity: 0, y: 30, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-purple-400 mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                <p className="text-purple-200/70 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 bg-gradient-to-b from-purple-900/50 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              How Trackviso{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Get started in minutes and see immediate improvements in your academic tracking
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Connect Your Courses",
                desc: "Add your own subjects and tasks to create your own study experience.",
                icon: BookOpen,
                color: "purple"
              },
              {
                step: "02",
                title: "Track Your Progress",
                desc: "Log study sessions, assignments, and achievements. Earn XP and level up.",
                icon: BarChart3,
                color: "pink"
              },
              {
                step: "03",
                title: "Optimize & Improve",
                desc: "Get personalized insights and recommendations to maximize your academic performance.",
                icon: TrendingUp,
                color: "purple"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50, rotateZ: index === 1 ? -5 : 5 }}
                whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xl shadow-purple-500/50 transform group-hover:scale-125 transition-transform hover:scale-125">
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-purple-200/80 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Introducing Skillpulse Section */}
      <section id="introducing-skillpulse" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
      <div className="absolute -top-40 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
      <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      >
      <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
      Introducing
      <span className="ml-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Skillpulse</span>
      </h2>
      <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
      A gamified progression system that turns consistent studying into rewards.
      </p>
      </motion.div>
      
      
      <div className="max-w-6xl mx-auto">
      <Skillpulse />
      </div>
     
      </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
        <div className="absolute -top-40 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              See Trackviso in{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              See how Trackviso helps students achieve their academic goals.
            </p>
          </motion.div>

          <ImageCarousel />
        </div>
      </section>

      

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Simple{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Start free, Stay free. No hidden fees, No Paywalls.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 text-white relative px-8 sm:px-48 py-12 max-w-3xl mx-auto backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Most Popular
              </motion.div>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">The Scholar</h3>
              <div className="text-5xl font-bold mb-4">$0<span className="text-lg text-purple-200/80">/month</span></div>
              <p className="text-purple-200/80">It's all free</p>
            </div>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-300" />
                <span>Unlimited subjects</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pink-300" />
                <span>Unlimited logging</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-purple-300" />
                <span>Full insight access</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pink-300" />
                <span>Full gamification access</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold text-center block hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Start for free
            </Link>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-4 bg-gradient-to-b from-purple-900/50 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/2 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              What Students{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Say
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Join thousands of students who have transformed their academic journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sara_672",
                role: "Computer Science Major",
                text: "Trackviso saved my junior year, I used to journal all of my sessions but I became so burnt out, now this keeps me going!",
                rating: 5
              },
              {
                name: "IDK875_9",
                role: "Secondary school student",
                text: "It actually helped me study a fair bit, I wasn't getting lost anymore and I could keep track while having fun.",
                rating: 5
              },
              {
                name: "Emma_GOAT_",
                role: "Engineering Student",
                text: "Finally, a tool that actually helps me stay organized. The gamification feature keeps me motivated every day.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-purple-900/30 border border-purple-700/30 p-8 rounded-2xl hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm group"
                initial={{ opacity: 0, y: 50, rotateY: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-purple-100/80 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                <div className="text-center">
                  <div className="font-semibold text-lg text-white">{testimonial.name}</div>
                  <div className="text-purple-300/70">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-4 bg-gradient-to-b from-purple-900/50 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-purple-200/80 max-w-3xl mx-auto">
              Still have doubts?
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-purple-900/30 border border-purple-700/30 p-6 rounded-2xl hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <button
                    className="w-full flex items-start justify-between text-left"
                    onClick={(e) => {
                      const answer = e.currentTarget.nextElementSibling;
                      if (!answer) return;
                      // simple collapsible toggle
                      if (answer.style.maxHeight && answer.style.maxHeight !== "0px") {
                        answer.style.maxHeight = "0px";
                        answer.style.opacity = "0";
                      } else {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                        answer.style.opacity = "1";
                      }
                    }}
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{item.q}</h3>
                    </div>
                    <ChevronDown className="w-5 h-5 text-purple-300 mt-1 flex-shrink-0" />
                  </button>
                  <div className="mt-2 text-purple-200/80 leading-relaxed overflow-hidden transition-all duration-300" style={{ maxHeight: "0px", opacity: 0 }}>
                    {item.a}
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -translate-y-1/2"></div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto text-center text-white relative z-10"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-xl text-purple-200/80 mb-10">
            Join thousands of students who are already achieving better results with Trackviso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/signup"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-lg shadow-purple-500/30"
              >
                Start Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              
            </motion.div>
          </div>
        </motion.div>
      </section>

      
    </div>
  );
};

export default Landing;

const faqs = [
  {
    q: "What actually is trackviso?",
    a: "Trackviso is a gamified academic tracker that helps you stay organized by letting you log study sessions and gain insights to improve performance."
  },
  {
    q: "Is Trackviso free?",
    a: "Yes. Trackviso is 100% free to use. You can start for free and keep using all the core features without paywalls."
  },
  {
    q: "How does gamification help me study?",
    a: "You earn XP and complete quests as well as unlocking achievements by logging tasks and studying consistently. This creates positive reinforcement and keeps you motivated."
  },
  {
    q: "How does the Skillpulse system work?",
    a: "A very complex and engineered system where the more you study, the longer your streak, and a mix of a few random rewards can get you to level 100 in either flying time, or it will take more work. Unlock mystery boxes, streak multipliers, and random bonuses after sessions. "
  },
  {
    q: "How do I get started?",
    a: "Create a free account, add your subjects, and start logging study sessions."
  }
];
