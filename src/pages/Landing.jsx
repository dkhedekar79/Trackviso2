import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MagneticParticles from "../components/MagneticParticles";
import SEO from "../components/SEO";
import LoadingScreen from "../components/LoadingScreen";
import {
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Users,
  Activity,
  Star,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Laptop,
  Tablet,
  Target,
  Clock,
  Clock3,
  BarChart3,
  BarChart2,
  PieChart,
  GraduationCap,
  Award,
  Lightbulb,
  TrendingUp,
  Shield,
  Sparkles,
  Flame,
  Gem,
  FileText,
  RefreshCw,
  Eye,
  Moon,
  Maximize2,
  Image as ImageIcon,
  Video,
  Music,
  PlayCircle,
  PauseCircle,
  Settings,
  Play,
  Pause,
  Square,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Coffee,
  ChevronDown,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ImageCarousel from '../components/ImageCarousel';
import Skillpulse from '../components/Skillpulse';
import ambientImages, { ambientVideos } from '../data/ambientImages';

const Landing = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { id: 'hero', label: 'Top' },
    { id: 'features', label: 'Features' },
    { id: 'study-modes', label: 'Study Modes' },
    { id: 'ambient-mode', label: 'Ambient' },
    { id: 'ai-timetable', label: 'AI Schedule' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'introducing-skillpulse', label: 'Skillpulse' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'testimonials', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' }
  ];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Center-focused zone
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const observeSections = () => {
      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.observe(element);
        }
      });
    };

    const timeoutId = setTimeout(observeSections, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

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
        "Your revision dashboard: study tracker, analytics, AI study tutor, and XP system in one.",
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
    return <LoadingScreen />;
  }

  const containerVariants = {
    hidden: { scale: 1 },
    visible: {
      scale: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30 },
    visible: {
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: 1,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    hidden: { rotateX: 0 },
    visible: {
      rotateX: [0, 360],
      transition: {
        duration: 4,
        repeat: 1,
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

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Trackviso — Gamified Study Tracker | Make Every Study Session Count"
        description="Transform your academic journey with Trackviso. Track study sessions, earn XP, complete quests, and get AI-powered insights. Free study tracker with gamification features, streaks, achievements, and personalized analytics."
        keywords="study tracker, gamified learning, study productivity app, academic tracker, study streaks, study quests, AI study tutor, revision tracker, study analytics, pomodoro timer, study motivation, exam preparation, study habits, learning tracker"
        url=""
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      {/* Mini Side Progress Bar */}
      <motion.div 
        className="fixed left-4 top-[20%] -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center py-6 px-2 group rounded-2xl transition-all duration-500 hover:px-4"
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 1 }}
      >
        {/* Glass Background that expands */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm border border-white/5 rounded-3xl group-hover:bg-slate-950/60 group-hover:backdrop-blur-xl group-hover:border-purple-500/30 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500" />
        
        {/* Background Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-purple-500/40 transition-colors duration-500" />
        
        <div className="relative flex flex-col gap-4 py-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="relative flex items-center justify-center w-8 h-8 group/item"
            >
              {/* Label that slides out */}
              <div
                className="absolute left-10 px-3 py-1.5 rounded-xl bg-purple-600 border border-purple-400/50 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 -translate-x-4 pointer-events-none group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] z-50"
              >
                {section.label}
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 border-l border-b border-purple-400/50 rotate-45" />
              </div>

              {/* Indicator Dot */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={`relative z-10 w-2 h-2 rounded-full border-2 transition-all duration-500 ${
                    activeSection === section.id
                      ? 'bg-white border-purple-400 scale-150 shadow-[0_0_15px_rgba(168,85,247,1)]'
                      : 'bg-slate-900 border-white/20 group-hover/item:border-purple-400 group-hover/item:scale-125'
                  }`}
                  animate={activeSection === section.id ? { 
                    scale: [1.2, 1.5, 1.2],
                    backgroundColor: "#ffffff"
                  } : { 
                    scale: 1,
                    backgroundColor: "transparent"
                  }}
                  transition={activeSection === section.id ? { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  } : {}}
                />
                
                {/* Glow for Active Section */}
                {activeSection === section.id && (
                  <motion.div 
                    className="absolute inset-0 bg-purple-500 rounded-full blur-sm"
                    initial={{ scale: 1 }}
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

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
      <section id="hero" className="relative pt-32 pb-20 px-4 overflow-hidden">
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
              Track your academic journey like never before - The world's most advanced study tracker
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={currentTextIndex}
              className="text-5xl lg:text-7xl font-bold leading-tight mb-8 text-white"
              variants={itemVariants}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
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
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
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

          {/* REORGANIZED HERO DASHBOARD CLUSTER (Mainpiece: Study Time + Distribution) */}
          <motion.div
            className="mt-32 relative z-10 w-full max-w-6xl mx-auto px-4 perspective-1000"
            variants={itemVariants}
          >
            <div className="relative h-[800px] sm:h-[900px] w-full flex items-center justify-center">
              
              {/* 1. MAIN CENTERPIECE: Insights Hub (Centralized) */}
                  <motion.div
                className="relative w-[95%] sm:w-[85%] lg:w-[75%] z-10 bg-slate-900/80 backdrop-blur-3xl border-2 border-purple-500/20 rounded-[3rem] p-8 sm:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  scale: { duration: 1 },
                  y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Side: Total Study Time & Major Stat */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                      <div>
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                          <div className="p-2 bg-purple-500/20 rounded-xl">
                            <Clock3 className="w-6 h-6 text-purple-400" />
                    </div>
                          <h3 className="text-xl font-black text-white uppercase tracking-widest">Global Insights</h3>
                        </div>
                        <div className="space-y-1">
                          <div className="text-5xl sm:text-7xl font-black text-white tracking-tighter">
                            24h <span className="text-3xl sm:text-4xl text-purple-400/50">39m</span>
                          </div>
                          <p className="text-purple-300/60 font-bold uppercase tracking-widest text-sm">Total Study Time This Week</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-2xl font-black text-emerald-400">92%</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Avg Accuracy</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-2xl font-black text-purple-400">42</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sessions done</div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-400 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">+18% vs last week</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-medium">
                          Your focus is 12% higher during afternoon sessions. Keep it up!
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Subject Distribution (Pie Chart Style) */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white/5 rounded-[2.5rem] border border-white/5">
                      <div className="text-center mb-6">
                        <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">Subject Distribution</h4>
                      </div>
                      
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                        {/* Circular Progress Rings (Mocking the Distribution) */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background Circle */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                          {/* Math Ring */}
                          <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2"
                            initial={{ strokeDashoffset: 251.2 }} whileInView={{ strokeDashoffset: 251.2 * (1 - 0.45) }} viewport={{ once: true }} transition={{ duration: 2, delay: 0.5 }} strokeLinecap="round" />
                          {/* Physics Ring */}
                          <motion.circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="188.4"
                            initial={{ strokeDashoffset: 188.4 }} whileInView={{ strokeDashoffset: 188.4 * (1 - 0.30) }} viewport={{ once: true }} transition={{ duration: 2, delay: 0.7 }} strokeLinecap="round" />
                          {/* Bio Ring */}
                          <motion.circle cx="50" cy="50" r="20" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="125.6"
                            initial={{ strokeDashoffset: 125.6 }} whileInView={{ strokeDashoffset: 125.6 * (1 - 0.25) }} viewport={{ once: true }} transition={{ duration: 2, delay: 0.9 }} strokeLinecap="round" />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <PieChart className="w-8 h-8 text-white/20 mb-1" />
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap justify-center gap-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-black text-white/60">Math (45%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-black text-white/60">Physics (30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-[10px] font-black text-white/60">Bio (25%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative BG for Centerpiece */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-600/5 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                  </motion.div>

              {/* SATELLITE CARDS (Organized around the center) */}

              {/* Top Center: XP & Level Bar (The "Crown") */}
                  <motion.div
                className="absolute top-[5%] sm:top-[8%] left-1/2 -translate-x-1/2 w-[280px] sm:w-[400px] z-40 bg-gradient-to-r from-purple-600 to-pink-600 p-0.5 rounded-full shadow-2xl"
                initial={{ y: -50 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                animate={{ y: [0, -5, 0] }}
                transition={{ 
                  y: { 
                    initial: { delay: 0.2, duration: 0.8 },
                    animate: { duration: 4, repeat: Infinity }
                  }
                }}
              >
                <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">12</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-white/60 uppercase tracking-widest">
                      <span>Pro Scholar</span>
                      <span className="text-purple-400">1,240 XP</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" initial={{ width: 0 }} whileInView={{ width: '62%' }} transition={{ duration: 1.5, delay: 0.5 }} />
                    </div>
                  </div>
                </div>
                  </motion.div>

              {/* Top Right: Performance Prediction */}
                  <motion.div
                className="absolute top-[12%] right-[2%] sm:right-[5%] w-[180px] sm:w-[240px] z-30 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] shadow-2xl rotate-6"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, 0, 0], rotate: [6, 9, 6] }}
                transition={{ 
                  scale: { delay: 0.4, duration: 0.6 },
                  rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-white/60" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80">AI Forecast</span>
                    </div>
                <div className="text-4xl font-black text-white">94%</div>
                <p className="text-[10px] text-white/70 font-bold">Predicted Exam Score</p>
                  </motion.div>

              {/* Top Left: Study Patterns */}
              <motion.div
                className="absolute top-[15%] left-[2%] sm:left-[5%] w-[180px] sm:w-[240px] z-30 bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 p-5 rounded-[2rem] shadow-2xl -rotate-6"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, 0, 0], rotate: [-6, -9, -6] }}
                transition={{ 
                  scale: { delay: 0.5, duration: 0.6 },
                  rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-300">Patterns</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/40 font-bold">Peak</span>
                    <span className="text-white font-black">14:00</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[80%]" />
              </div>
                </div>
              </motion.div>

              {/* Bottom Right: Live Schedule */}
              <motion.div
                className="absolute bottom-[10%] right-[2%] sm:right-[5%] w-[200px] sm:w-[280px] z-30 bg-slate-900/90 border border-white/10 p-5 rounded-[2rem] shadow-2xl"
                initial={{ y: 50 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 9, repeat: Infinity }}
                animate={{ x: [0, 10, 0] }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Next Up</span>
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs font-black text-white mb-1">Advanced Algebra</div>
                  <div className="text-[9px] font-bold text-white/30">14:00 - 15:30</div>
                </div>
              </motion.div>

              {/* Bottom Left: Quests */}
              <motion.div
                className="absolute bottom-[12%] left-[2%] sm:left-[5%] w-[180px] sm:w-[220px] z-30 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl"
                initial={{ y: 50 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 8, repeat: Infinity }}
                animate={{ x: [0, -10, 0] }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Quests</span>
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 w-[66%]" />
                  </div>
                  <div className="text-[9px] font-black text-white/60 text-center uppercase tracking-tighter">Daily Focus: 2/3h</div>
                </div>
              </motion.div>

              {/* Small Floating Overlap Detail: Streak */}
              <motion.div
                className="absolute top-[45%] left-[5%] sm:left-[10%] z-50 bg-orange-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2"
                animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Flame className="w-4 h-4" />
                <span className="text-xs font-black">12 Day Streak</span>
              </motion.div>

              {/* Small Floating Overlap Detail: Gems */}
              <motion.div
                className="absolute top-[40%] right-[5%] sm:right-[10%] z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2"
                animate={{ y: [0, 10, 0], rotate: [2, -2, 2] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Gem className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-black">450 Gems</span>
              </motion.div>

              {/* Small Floating Overlap Detail: Accuracy */}
              <motion.div
                className="absolute bottom-[25%] right-[15%] z-50 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-emerald-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3 }}
              >
                <Activity className="w-4 h-4" />
                <span className="text-xs font-black">98% Focus</span>
              </motion.div>

              {/* Floating Particles/Bubbles */}
              <motion.div className="absolute top-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full blur-sm" animate={{ y: [0, -40], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity }} />
              <motion.div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-pink-400 rounded-full blur-sm" animate={{ y: [0, -60], opacity: [0, 1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
              <motion.div className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400/20 rounded-full blur-md" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 6 }} />

              {/* Decorative Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
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
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
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
              initial={{ y: 50, rotateY: 20 }}
              whileInView={{ y: 0, rotateY: 0 }}
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
              initial={{ y: 50, rotateY: -20 }}
              whileInView={{ y: 0, rotateY: 0 }}
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
              initial={{ y: 50, rotateY: 20 }}
              whileInView={{ y: 0, rotateY: 0 }}
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
              { icon: Clock, title: "AI schedule", desc: "World's leading AI timetable maker" },
              { icon: Award, title: "Achievement System", desc: "Gamified progress rewards" },
              { icon: Shield, title: "Enhanced analytics", desc: "Leapfrog your own limits" },
              { icon: Smartphone, title: "Ambient mode", desc: "The all-new aesthetic way to study" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-purple-900/30 border border-purple-700/30 rounded-2xl p-6 hover:bg-purple-800/40 hover:border-purple-600/50 transition-all duration-300 backdrop-blur-sm group"
                initial={{ y: 30, rotateX: 45 }}
                whileInView={{ y: 0, rotateX: 0 }}
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

      <StudyModesSection />

      <AmbientModeSection />

      <AITimetableSection />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 bg-gradient-to-b from-purple-900/50 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
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

          <div className="grid lg:grid-cols-4 gap-9">
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
              },
              {
                step: "04",
                title: "Master everything",
                desc: "The best AI powered revision with key progression steps",
                icon: Brain,
                color: "purple"
              }
      
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ y: 50, rotateZ: index === 1 ? -5 : 5 }}
                whileInView={{ y: 0, rotateZ: 0 }}
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
      initial={{ y: 50 }}
      whileInView={{ y: 0 }}
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

      

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden">
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
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
              Choose the plan that works for you. All plans include core tracking features.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Scholar - Free Plan */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/20 text-white relative px-8 py-12 backdrop-blur-md"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">The Scholar</h3>
                <div className="text-5xl font-bold mb-4">£0<span className="text-lg text-purple-200/80">/month</span></div>
                <p className="text-purple-200/80">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-300" />
                  <span>Unlimited subjects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-300" />
                  <span>Unlimited logging</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>1 AI Study Schedule</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-300" />
                  <span>Full gamification access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Daily AI revision trial</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold text-center block hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Start for free
              </Link>
            </motion.div>

            {/* The Professor - Premium Plan */}
            <motion.div
              className="bg-gradient-to-br from-amber-600/40 to-orange-600/40 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/20 text-white relative px-8 py-12 backdrop-blur-md"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
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
                <h3 className="text-3xl font-bold mb-4">The Professor</h3>
                <div className="text-5xl font-bold mb-4">£4.99<span className="text-lg text-amber-200/80">/month</span></div>
                <p className="text-amber-200/80">Unlock unlimited AI power</p>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                  <span>Everything in The Scholar</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Unlimited AI Study Schedules</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-amber-300" />
                  <span>Advanced cognitive engine</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Unlimited AI revision</span>
                </li>
                <li className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-300" />
                  <span>Enhanced Analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span>8K Animated Wallpapers</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="w-full bg-gradient-to-r from-yellow-300 to-orange-300 text-amber-900 py-3 rounded-xl font-semibold text-center block hover:from-yellow-200 hover:to-orange-200 transition-all duration-300 transform hover:scale-105"
              >
                Upgrade to Professor
              </Link>
            </motion.div>
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
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
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
                initial={{ y: 50, rotateY: 30 }}
                whileInView={{ y: 0, rotateY: 0 }}
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
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
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
                  initial={{ y: 50 }}
                  whileInView={{ y: 0 }}
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
          initial={{ y: 50, scale: 0.95 }}
          whileInView={{ y: 0, scale: 1 }}
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
    </>
  );
};

// Study Modes Section Component
const StudyModesSection = () => {
  const [activeMode, setActiveMode] = useState(0); // 0: Blurt, 1: Mock Exam
  const [showBlurtFeedback, setShowBlurtFeedback] = useState(false);
  const [showMockExamFeedback, setShowMockExamFeedback] = useState(false);

  const modes = [
    {
      name: "Blurt Mode",
      icon: Zap,
      description: "An advanced active-recall engine designed to maximise memory performance. Upload an image of your notes, paste your own content or generate a Grade-9-level knowledge map using AI. Then \"blurt\" everything you can remember in one go. The system evaluates your response line by line, identifying missing points, incorrect assumptions and areas of weak recall. Every session ends with a detailed breakdown, showing what you remembered, what you missed and how to improve next time.",
      features: [
        "AI-powered knowledge maps: Generate comprehensive study notes from your topics or input your own content",
        "Active recall testing: Write everything you remember in one go—no structure needed, just pure recall",
        "Intelligent analysis: Get detailed feedback comparing your response to the knowledge map with missed points and strengths",
        "Progress tracking: Your scores are saved and displayed in your topic grid, tracking improvement over time"
      ],
      color: "amber",
      isAvailable: true
    },
    {
      name: "Mock Exam",
      icon: FileText,
      description: "A realistic exam-simulation environment built for high-stakes preparation. Generate full papers aligned to your exam board, practice under timed conditions and receive structured, examiner-style marking. The system analyses your answers for accuracy, technique and depth, while also pinpointing content gaps and recurring weaknesses.",
      features: [
        "Exam board alignment: Generate papers aligned to your specific exam board",
        "Timed conditions: Practice under realistic exam time constraints",
        "Examiner-style marking: Receive detailed feedback on accuracy, technique and depth",
        "Performance analysis: Identify content gaps and recurring weaknesses"
      ],
      color: "red",
      isAvailable: true
    }
  ];


  const currentMode = modes[activeMode];
  const ModeIcon = currentMode.icon;

  return (
    <section 
      id="study-modes" 
      className="py-32 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-purple-900/50 relative overflow-hidden min-h-screen flex items-center"
    >
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Description */}
          <motion.div
            key={activeMode}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            exit={{ x: 50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Mode Toggle */}
            <div className="flex gap-3 mb-8">
              {modes.map((mode, index) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setActiveMode(index);
                      setShowBlurtFeedback(false);
                      setShowMockExamFeedback(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeMode === index
                        ? mode.color === 'amber'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                          : mode.color === 'purple'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{mode.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Icon and Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl border flex items-center justify-center backdrop-blur-sm ${
                currentMode.color === 'amber'
                  ? 'bg-gradient-to-br from-amber-600/40 to-orange-600/40 border-amber-500/30'
                  : currentMode.color === 'purple'
                  ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-purple-500/30'
                  : 'bg-gradient-to-br from-red-600/40 to-rose-600/40 border-red-500/30'
              }`}>
                <ModeIcon className={`w-8 h-8 ${
                  currentMode.color === 'amber'
                    ? 'text-amber-300'
                    : currentMode.color === 'purple'
                    ? 'text-purple-300'
                    : 'text-red-300'
                }`} />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                {currentMode.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-purple-200/80 leading-relaxed">
              {currentMode.description}
            </p>

            {/* Features List */}
            <div className="space-y-3 mt-6">
              {currentMode.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    currentMode.color === 'amber'
                      ? 'text-amber-400'
                      : currentMode.color === 'purple'
                      ? 'text-purple-400'
                      : 'text-red-400'
                  }`} />
                  <span className="text-purple-100/80 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Work in Progress Badge */}
            {!currentMode.isAvailable && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    currentMode.color === 'amber'
                      ? 'bg-amber-900/30 border border-amber-700/50 text-amber-300'
                      : currentMode.color === 'purple'
                      ? 'bg-purple-900/30 border border-purple-700/50 text-purple-300'
                      : 'bg-red-900/30 border border-red-700/50 text-red-300'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Work in Progress
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Interactive Mockup */}
          <motion.div
            key={`mockup-${activeMode}`}
            initial={{ x: 50, scale: 0.95 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: -50, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full relative"
          >
            {activeMode === 0 ? (
              /* Blurt Mode Dummy UI */
              <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-amber-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-xl mx-auto min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-amber-500/10 bg-amber-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-left">GCSE Biology: Cell Division</h4>
                      <p className="text-amber-300/60 text-[10px] font-black uppercase tracking-widest text-left">
                        {showBlurtFeedback ? 'Analysis Results' : 'Active Recall Session'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!showBlurtFeedback && (
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                        Timer: 04:12
                      </div>
                    )}
                    {showBlurtFeedback && (
                      <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest">
                        Score: 88%
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 flex-1">
                  <AnimatePresence mode="wait">
                    {!showBlurtFeedback ? (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="relative min-h-[350px] bg-black/20 rounded-2xl p-6 border border-white/5 font-mono text-sm text-amber-100/90 leading-relaxed text-left">
                          <p>The cell cycle has three main stages.</p>
                          <p className="mt-4">Stage 1: The cell grows and increases the number of sub-cellular structures like ribosomes and mitochondria. The DNA replicates to form two copies of each chromosome.</p>
                          <p className="mt-4">Stage 2: Mitosis. One set of chromosomes is pulled to each end of the cell and the nucleus divides.</p>
                          <p className="mt-4">Stage 3: The cytoplasm and cell membranes divide to form two identical daughter cells.</p>
                          <p className="mt-4">Mitosis is important for growth and development of multicellular organisms.</p>
                          <motion.div 
                            className="inline-block w-1 h-5 bg-amber-400 align-middle ml-1"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowBlurtFeedback(true)}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 group"
                        >
                          Click for detailed feedback 
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 text-left"
                      >
                        {/* Score Section */}
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Overall Accuracy</p>
                            <h5 className="text-2xl font-black text-white">88% Captured</h5>
                          </div>
                          <div className="h-12 w-12 rounded-full border-4 border-green-500/30 border-t-green-500 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <p className="text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" /> Captured Points
                            </p>
                            <ul className="text-xs text-white/70 space-y-2">
                              <li>• 3 Main stages of cycle</li>
                              <li>• DNA Replication</li>
                              <li>• Organelle growth</li>
                              <li>• Nucleus division</li>
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <XCircle className="w-3 h-3" /> Missed Concepts
                            </p>
                            <ul className="text-xs text-white/70 space-y-2">
                              <li>• Prophase/Metaphase/etc</li>
                              <li>• Role in repair</li>
                              <li>• Stem cell connection</li>
                            </ul>
                          </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Brain className="w-3 h-3" /> AI Insight
                          </p>
                          <p className="text-xs text-amber-100/80 leading-relaxed">
                            Excellent recall on the mechanics of mitosis. To reach Grade 9, ensure you can name the individual phases and explain their role in tissue repair.
                          </p>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowBlurtFeedback(false)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Back to session
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20"
                          >
                            Save Analysis
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Mock Exam Dummy UI */
              <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-red-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-xl mx-auto min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-red-500/10 bg-red-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-left">AQA Biology Paper 1</h4>
                      <p className="text-red-300/60 text-[10px] font-black uppercase tracking-widest text-left">
                        {showMockExamFeedback ? 'Exam Grading Result' : 'Realistic Simulation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!showMockExamFeedback && (
                      <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest text-left">
                        1h 45m left
                      </div>
                    )}
                    {showMockExamFeedback && (
                      <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest text-left">
                        Grade: 9 (High)
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 flex-1">
                  <AnimatePresence mode="wait">
                    {!showMockExamFeedback ? (
                      <motion.div
                        key="exam-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
                          <h5 className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-3">Question 1.1</h5>
                          <p className="text-white font-bold text-lg mb-4">Explain how the structure of a root hair cell is adapted to its function. [3 marks]</p>
                          <div className="bg-black/20 rounded-xl p-4 min-h-[120px] border border-white/5 font-mono text-sm text-red-100/80">
                            Root hair cells have a large surface area...
                            <motion.div 
                              className="inline-block w-1 h-4 bg-red-400 align-middle ml-1"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Mark Scheme</p>
                            <p className="text-white font-black">AI Grade 9</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Accuracy</p>
                            <p className="text-white font-black">94% Target</p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowMockExamFeedback(true)}
                          className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 group"
                        >
                          Finish and Grade
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="exam-results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 text-left"
                      >
                        {/* Grade Card */}
                        <div className="flex items-center justify-between bg-red-500/10 p-6 rounded-2xl border border-red-500/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award className="w-24 h-24 text-red-400" />
                          </div>
                          <div className="relative z-10">
                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Mock Exam Grade</p>
                            <h5 className="text-4xl font-black text-white">Grade 9</h5>
                            <p className="text-white/60 text-xs mt-1">Exceptional performance (92/100 marks)</p>
                          </div>
                        </div>

                        {/* Marking Feedback */}
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-white font-bold text-sm">Question 1.1: Root Hair Cells</p>
                              <span className="text-green-400 font-black text-xs">3/3 Marks</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                              Correctly identified large surface area and thin cell wall. Perfect technical explanation of osmosis potential.
                            </p>
                          </div>

                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-white font-bold text-sm">Question 1.2: Active Transport</p>
                              <span className="text-amber-400 font-black text-xs">2/3 Marks</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                              Good mention of mitochondria and energy. Missed the keyword "against the concentration gradient" for full marks.
                            </p>
                          </div>
                        </div>

                        {/* Performance Insights */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2">
                              <TrendingUp className="w-3 h-3" /> Strengths
                            </p>
                            <ul className="text-[10px] text-white/70 space-y-1">
                              <li>• Technical terminology</li>
                              <li>• Data analysis (Q4.2)</li>
                              <li>• Time management</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-3 h-3" /> Focus Areas
                            </p>
                            <ul className="text-[10px] text-white/70 space-y-1">
                              <li>• Calculation precision</li>
                              <li>• Link to stem cells</li>
                              <li>• Practical methods</li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowMockExamFeedback(false)}
                            className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl"
                          >
                            Retake Paper
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20"
                          >
                            View Mark Scheme
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
                  </motion.div>
        </div>
      </div>
    </section>
  );
};

// AI Timetable Generator Section Component
const AITimetableSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const engineeringPrinciples = [
    {
      title: "Spaced Repetition",
      desc: "Optimized intervals (1, 3, 7 days) to lock knowledge into long-term memory.",
      icon: RefreshCw,
      color: "from-blue-400 to-cyan-400"
    },
    {
      title: "Subject Interleaving",
      desc: "Smart mixing of topics to improve pattern recognition and problem-solving.",
      icon: Zap,
      color: "from-purple-400 to-pink-400"
    },
    {
      title: "Cognitive Load Balancing",
      desc: "Adjusts session intensity based on your biological peak energy windows.",
      icon: Brain,
      color: "from-amber-400 to-orange-400"
    },
    {
      title: "Active Recovery",
      desc: "Engineered micro & macro breaks to prevent burnout and maintain focus.",
      icon: Coffee,
      color: "from-emerald-400 to-teal-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % engineeringPrinciples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="ai-timetable" className="py-32 px-4 bg-[#050505] relative overflow-hidden">
      {/* High-tech Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Dummy Timetable Visual */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="relative w-full max-w-[600px] mx-auto p-4 lg:p-0">
              {/* Background Glass Panel */}
              <div className="absolute -inset-4 bg-indigo-500/5 rounded-[40px] blur-3xl -z-10" />
              
              <motion.div 
                className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl"
                initial={{ y: 30 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Timetable Header */}
                <div className="p-6 border-b border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Week 1: Focus Cycle</h4>
                      <p className="text-indigo-300/60 text-xs font-medium">Monday, Dec 22 - Sunday, Dec 28</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4 text-white/40" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Closed Block 1 */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Photosynthesis Deep Dive</p>
                        <p className="text-white/40 text-xs">Biology • 09:00 - 10:30</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 font-bold text-xs">90m</p>
                    </div>
                  </div>

                  {/* Expanded Block (The Star) */}
                  <motion.div 
                    className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-400/50 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/10"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 3 }}
                  >
                    <div className="p-5 flex items-center justify-between border-b border-indigo-400/20">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/30 rounded-xl text-indigo-300 animate-pulse">
                          <Brain className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-white font-black text-lg">Organic Chemistry II</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Chemistry</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20">High Priority</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black text-xl">11:00</p>
                        <p className="text-indigo-300/60 text-xs">120m Session</p>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-6">
                      <div className="space-y-3">
                        <h6 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Engineered Plan</h6>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <p className="text-indigo-100 text-sm leading-relaxed italic">
                            "Focus on Nucleophilic Substitution mechanisms. Use the Feynman technique for SN1 vs SN2 differences, then attempt 3 past paper questions."
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 group cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                            <span className="text-xs">📚</span>
                          </div>
                          <span className="text-white/70 text-xs font-bold truncate">SaveMyExams</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 group cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                            <span className="text-xs">⚛️</span>
                          </div>
                          <span className="text-white/70 text-xs font-bold truncate">PMT Notes</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>

                      <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group transition-all">
                        Start Studying Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Closed Block 2 (Break) */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Engineered Recovery</p>
                        <p className="text-white/40 text-xs">Active Break • 13:00 - 13:30</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 font-bold text-xs">30m</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Accents */}
              <motion.div 
                className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
                </div>
              </div>

          {/* Right: Text and Features */}
          <div className="flex-1 order-1 lg:order-2">
            <motion.div
              initial={{ x: 50 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6">
                <Sparkles className="w-4 h-4" />
                The Professor's Engine
                  </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-[1.1]">
                Perfectly Engineered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Study Timetables
                </span>
              </h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                Our AI doesn't just list tasks. It applies world-class educational psychology to engineer your cognitive performance.
              </p>

              <div className="space-y-6">
                {engineeringPrinciples.map((p, i) => (
                  <motion.div
                    key={i}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      activeStep === i 
                        ? 'bg-indigo-500/10 border-indigo-500/50 translate-x-4' 
                        : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                    }`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${p.color} bg-opacity-20`}>
                        <p.icon className="w-6 h-6 text-white" />
                </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{p.title}</h4>
                        <p className="text-sm text-slate-400">{p.desc}</p>
              </div>
                    </div>
          </motion.div>
                ))}
              </div>

              <motion.div className="mt-12" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/signup"
                  className="px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3 transition-all"
                >
                  Generate Your Engine <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Ambient Mode Section Component
const AmbientModeSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreenHover, setIsFullscreenHover] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60 + 34); // 25:34 in seconds
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const sectionRef = useRef(null);

  const features = [
    {
      icon: Maximize2,
      title: "Fullscreen Focus",
      description: "Immerse yourself in distraction-free study sessions with fullscreen ambient mode"
    },
    {
      icon: ImageIcon,
      title: "Beautiful Backgrounds",
      description: "Choose from curated static images or animated wallpapers to create your perfect study atmosphere"
    },
    {
      icon: Music,
      title: "Music Integration",
      description: "Select from a curated list of background music to enhance your study sessions, or search your own songs."
    },
    {
      icon: Moon,
      title: "Minimalist Design",
      description: "Clean, focused interface that keeps your attention on what matters - your study time"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Scroll detection to fade out overlay
  useEffect(() => {
    if (!isFullscreenHover) return;

    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      
      // If user scrolled more than 50px, fade out the overlay
      if (scrollDelta > 50) {
        setIsFullscreenHover(false);
        setIsHovered(false);
        lastScrollY = currentScrollY;
        return;
      }
      
      // Also check if section is out of view
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // If scrolled past the section significantly, fade out
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
          setIsFullscreenHover(false);
          setIsHovered(false);
        }
      }
      
      lastScrollY = currentScrollY;
    };

    // Use throttled scroll for better performance
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 50);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('wheel', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('wheel', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isFullscreenHover]);

  // Set default selected image
  useEffect(() => {
    if (ambientImages.length > 0 && !selectedImage) {
      setSelectedImage(ambientImages[0].id);
    }
  }, [ambientImages, selectedImage]);

  return (
    <section 
      id="ambient-mode" 
      className="py-32 px-4 bg-gradient-to-b from-purple-900/50 via-slate-900 to-slate-900 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
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
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-700/50 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Moon className="w-4 h-4" />
            New Feature
          </motion.div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Introducing{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Ambient Mode
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-purple-200/80 max-w-3xl mx-auto leading-relaxed">
            Transform your study sessions into immersive, distraction-free experiences. 
            Focus deeply with beautiful backgrounds, integrated music, and minimalist design.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Side - Feature Cards */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={index}
                  className={`relative bg-gradient-to-br ${
                    isActive 
                      ? 'from-purple-600/40 to-pink-600/40 border-purple-500/60' 
                      : 'from-purple-900/30 to-slate-900/30 border-purple-700/30'
                  } border rounded-2xl p-6 backdrop-blur-md transition-all duration-500 cursor-pointer group`}
                  initial={{ x: -50 }}
                  whileInView={{ x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onHoverStart={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.02, y: -5 }}
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    borderColor: isActive ? 'rgba(168, 85, 247, 0.6)' : 'rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isActive 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : 'bg-purple-800/40'
                      } transition-all duration-500`}
                      animate={{
                        rotate: isActive ? [0, 10, -10, 0] : 0,
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-7 h-7 ${
                        isActive ? 'text-white' : 'text-purple-300'
                      } transition-colors duration-500`} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${
                        isActive ? 'text-white' : 'text-purple-200'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                        isActive ? 'text-purple-100' : 'text-purple-300/70'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-2xl"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Right Side - Visual Demo */}
          <motion.div
            className="relative"
            initial={{ x: 50 }}
            whileInView={{ x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            onMouseEnter={() => {
              setIsHovered(true);
              setIsFullscreenHover(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              // Don't close immediately, let the fullscreen overlay handle it
            }}
          >
            {/* Preview Card */}
            <div 
              className="relative bg-gradient-to-br from-slate-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl border-2 border-purple-700/50 shadow-2xl shadow-purple-500/30 overflow-hidden cursor-pointer"
              onMouseEnter={() => {
                setIsHovered(true);
                setIsFullscreenHover(true);
              }}
            >
              {/* Bouncing "Hover on me" Tag */}
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm border border-white/20"
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✨ Hover on me ✨
              </motion.div>
              
              {/* Mock Ambient Mode Screen */}
              <div className="aspect-[9/16] relative bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
                {/* Background Image Effect */}
                {ambientImages.length > 0 && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${ambientImages[0]?.data || ambientImages[0]?.path || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      opacity: 0.7
                    }}
                  />
                )}
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                  <motion.div
                    className="text-center"
                    animate={{
                      y: isHovered ? [-5, 5, -5] : 0,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.h3
                      className="text-6xl font-bold text-white mb-4"
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {formatTime(timerSeconds)}
                    </motion.h3>
                    <motion.p
                      className="text-2xl text-white/90 mt-8"
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Biology
                    </motion.p>
                  </motion.div>

                  {/* Floating Controls */}
                  <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4"
                    initial={{ y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isRunning ? (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRunning(false);
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Pause"
                      >
                        <Pause className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRunning(true);
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Start"
                      >
                        <Play className="w-5 h-5" />
                      </motion.button>
                    )}
                    
                    {/* End Session Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRunning(false);
                      }}
                      className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="End Session"
                    >
                      <Square className="w-5 h-5" />
                    </motion.button>
                  </motion.div>

                  {/* YouTube Music Widget Preview */}
                  <motion.div
                    className="absolute top-20 right-4 w-48 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl"
                    initial={{ x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center relative overflow-hidden group">
                        <Music className="w-5 h-5 text-white animate-pulse" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">Lofi Girl - Study Beats</p>
                        <p className="text-[8px] text-white/60 truncate">YouTube Music</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-1 h-3 bg-white/40 rounded-full animate-[bounce_1s_infinite]" />
                        <div className="w-1 h-3 bg-white/60 rounded-full animate-[bounce_1.2s_infinite]" />
                        <div className="w-1 h-3 bg-white/40 rounded-full animate-[bounce_0.8s_infinite]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-white/80" />
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Settings Button */}
                  <motion.button
                    className="absolute top-4 right-4 p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    title="Manage Background Images"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl -z-10"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Moon className="w-5 h-5" />
              Try Ambient Mode Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Fullscreen Overlay on Hover - Outside section container */}
      <AnimatePresence>
        {isFullscreenHover && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-auto"
            onMouseLeave={() => {
              setIsFullscreenHover(false);
              setIsHovered(false);
            }}
          >
            {/* Background - Video or Image */}
            {selectedVideo && ambientVideos ? (() => {
              const currentVideo = ambientVideos.find(vid => vid.id === selectedVideo);
              return currentVideo ? (
                <video
                  src={currentVideo.path}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : null;
            })() : ambientImages.length > 0 && (() => {
              const currentImage = selectedImage 
                ? ambientImages.find(img => img.id === selectedImage) 
                : ambientImages[0];
              return currentImage ? (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${currentImage.data || currentImage.path || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : null;
            })()}
            {(!selectedVideo && (!ambientImages || ambientImages.length === 0)) && (
              <div className="absolute inset-0 bg-black" />
            )}
            
            {/* Subtle overlay for better text readability */}
            <div className="absolute inset-0" />
            
            {/* Settings Button in Corner */}
            <motion.button
              className="absolute top-6 right-6 z-20 px-6 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/30 hover:bg-black/60 transition-all flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
              }}
            >
              <Settings className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-base">Change Background</span>
            </motion.button>

              {/* YouTube Music Widget Preview (Fullscreen) */}
              <motion.div
                className="absolute bottom-32 right-12 w-64 bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl z-20"
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-lg">
                    <Music className="w-8 h-8 text-white animate-pulse" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Lofi Girl - Study Beats</p>
                    <p className="text-xs text-white/60 truncate">YouTube Music</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5 items-end h-4">
                    <motion.div className="w-1 bg-white/40 rounded-full" animate={{ height: [8, 16, 8] }} transition={{ duration: 1, repeat: Infinity }} />
                    <motion.div className="w-1 bg-white/60 rounded-full" animate={{ height: [12, 6, 12] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    <motion.div className="w-1 bg-white/40 rounded-full" animate={{ height: [6, 14, 6] }} transition={{ duration: 0.8, repeat: Infinity }} />
                    <motion.div className="w-1 bg-white/50 rounded-full" animate={{ height: [10, 4, 10] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <PauseCircle className="w-6 h-6 text-white/80 cursor-pointer hover:text-white transition-colors" />
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </div>
                </div>
              </motion.div>
            
            <div className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white drop-shadow-2xl"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <div className="text-9xl font-bold tracking-wider mb-4" style={{ fontWeight: 900 }}>
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-2xl text-white/90 mt-8 drop-shadow-lg font-bold" style={{ fontWeight: 700 }}>
                  Biology
                </div>
              </motion.div>
              
              {/* Minimal Control Buttons */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex items-center justify-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Start/Pause Button */}
                {isRunning ? (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRunning(false);
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Pause"
                  >
                    <Pause className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRunning(true);
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Start"
                  >
                    <Play className="w-5 h-5" />
                  </motion.button>
                )}
                
                {/* End Session Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRunning(false);
                  }}
                  className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="End Session"
                >
                  <Square className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                  Ambient Mode Background Gallery
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Animated Wallpapers Section - Featured First */}
              {ambientVideos && ambientVideos.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Video className="w-6 h-6 text-purple-400" />
                      Animated Wallpapers
                      <motion.span
                        className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full"
                        animate={{
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        ✨ COOLER ✨
                      </motion.span>
                    </h3>
                  </div>
                  <p className="text-purple-300/70 text-sm mb-4">
                    Dynamic, immersive backgrounds that bring your study space to life
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ambientVideos.map((video) => (
                      <motion.div
                        key={video.id}
                        className="relative group aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
                        style={{
                          borderColor: selectedVideo === video.id 
                            ? 'rgba(168, 85, 247, 1)' 
                            : 'rgba(168, 85, 247, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedVideo(video.id);
                          setSelectedImage(null);
                          setShowSettings(false);
                        }}
                      >
                        <video
                          src={video.path}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedVideo === video.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/20 text-white opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {selectedVideo === video.id ? 'Selected' : 'Select'}
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                            {video.name}
                          </p>
                          <span className="text-purple-300 text-xs bg-purple-600/30 px-2 py-1 rounded">
                            MP4
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Static Images Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Static Backgrounds
                </h3>
                {ambientImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ambientImages.map((image) => (
                      <motion.div
                        key={image.id}
                        className="relative group aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
                        style={{
                          borderColor: selectedImage === image.id 
                            ? 'rgba(168, 85, 247, 1)' 
                            : 'rgba(168, 85, 247, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedImage(image.id);
                          setShowSettings(false);
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${image.data || image.path || ''})`
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedImage === image.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/20 text-white opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {selectedImage === image.id ? 'Selected' : 'Select'}
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                            {image.name}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-300/70 text-sm">No static backgrounds available</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
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
