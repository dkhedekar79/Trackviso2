import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Sparkles
} from "lucide-react";

const Landing = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Trackviso
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Reviews
              </button>
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Login</Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Let's go!
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <motion.div 
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Track your academic journey like never before
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
            variants={itemVariants}
          >
            Make every{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
              Study Session
            </span>{" "}
            Count.
          </motion.h1>
          
          <motion.p 
            className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            Your revision dashboard: study tracker, analytics, calendar, and XP system in one.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            variants={itemVariants}
          >
            <Link 
              to="/signup"
              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              It's 100% Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button 
              onClick={() => scrollToSection('demo')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 flex items-center justify-center"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            className="mt-16 relative"
            variants={itemVariants}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="w-6 h-6 text-emerald-500" />
                      <span className="text-sm text-gray-500">This Week</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">32.5h</div>
                    <div className="text-sm text-emerald-600">+18% from last week</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <Trophy className="w-6 h-6 text-blue-500" />
                      <span className="text-sm text-gray-500">Goals</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">8/10</div>
                    <div className="text-sm text-blue-600">Completed</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-500" />
                      <span className="text-sm text-gray-500">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">94%</div>
                    <div className="text-sm text-purple-600">On track</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to track, analyze, and improve your academic performance
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Smart Analytics */}
            <motion.div 
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <BarChart3 className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Track every session</h3>
              <p className="text-emerald-100 text-lg mb-6">
                Smart revision timer with inbuilt pomodoro mode, custom, and stopwatch features. Log every session you do.
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Time left</span>
                  <span className="text-sm font-semibold">2 minutes</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </motion.div>

            {/* Goal Tracking */}
            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Target className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Gamified experience</h3>
              <p className="text-blue-100 text-lg mb-6">
                Become addicted to studying with streaks, xp, levels, achievements, quests, and more!
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Level 3 - 234 XP needed</span>
                  <span className="text-sm font-semibold">87%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              
            </motion.div>

            {/* AI Insights */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Brain className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Get the best Insights</h3>
              <p className="text-purple-100 text-lg mb-6">
                Get personalized recommendations and insights to optimize your study schedule and improve performance.
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Smart Tip</span>
                </div>
                <p className="text-sm text-purple-100">
                  Study math between 2-4 PM for 23% better retention
                </p>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              { icon: Clock, title: "Time Tracking", desc: "Log your study sessions" },
              { icon: Award, title: "Achievement System", desc: "Gamified progress rewards" },
              { icon: Shield, title: "Privacy First", desc: "Your data stays secure" },
              { icon: Smartphone, title: "Cross-Platform", desc: "Works on all devices" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="w-8 h-8 text-emerald-500 mb-4" />
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              How Trackviso{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and see immediate improvements in your academic tracking
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Connect Your Courses",
                desc: "Add your own subjects and tasks to create your own study experience.",
                icon: BookOpen,
                color: "emerald"
              },
              {
                step: "02", 
                title: "Track Your Progress",
                desc: "Log study sessions, assignments, and achievements. Earn XP and level up.",
                icon: BarChart3,
                color: "blue"
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white shadow-lg`}>
                  <item.icon className="w-10 h-10" />
                </div>
                <div className={`text-4xl font-bold text-${item.color}-500 mb-4`}>{item.step}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                See Trackviso in{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                  Action
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Watch how students are transforming their academic journey with intelligent tracking and insights.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-lg">Real-time progress tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-lg">Personalized study insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <span className="text-lg">Goal achievement system</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div 
                className="relative bg-gradient-to-br from-emerald-600 to-blue-700 rounded-3xl overflow-hidden group cursor-pointer aspect-video flex items-center justify-center"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                {!isVideoPlaying ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white text-xl font-semibold">Watch 2-minute demo</p>
                  </div>
                ) : (
                  <div className="text-white text-center">
                    <p className="text-xl">If the video does not play, feel free to contact us</p>
                    <button 
                      className="mt-4 bg-white/20 px-4 py-2 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoPlaying(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Simple{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free, Stay free. No hidden fees, No Paywalls.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl shadow-xl text-white relative px-48 py-8">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">The Scholar</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-emerald-100">/month</span></div>
              <p className="text-emerald-100">It's all free</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <span>Unlimited subjects</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <span>Unlimited logging</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <span>Full insight access</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <span>Full gamification access</span>
              </li>
            </ul>
            <Link
              to="/signup"
              className="w-full bg-white text-emerald-600 py-3 rounded-xl font-semibold text-center block hover:bg-gray-50 transition-colors"
            >
              Start for free
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              What Students{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who have transformed their academic journey
            </p>
          </div>

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
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                <div className="text-center">
                  <div className="font-semibold text-lg">{testimonial.name}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-blue-700">
        <motion.div 
          className="max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Join thousands of students who are already achieving better results with Trackviso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link 
              to="/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              Start Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button 
              onClick={() => scrollToSection('demo')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center justify-center"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      
    </div>
  );
};

export default Landing;
