import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Plus, X, Crown, Sparkles, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Predefined color palette
const COLOR_PALETTE = [
  '#6C5DD3', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF8C42', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1', '#FF69B4'
];

const OnboardingFlow = ({ onComplete }) => {
  const { user, updateUserMetadata } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Stage 1: Name
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Stage 2: Subjects
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(COLOR_PALETTE[0]);
  const [newSubjectGoal, setNewSubjectGoal] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Stage 3: Premium
  const [selectedPlan, setSelectedPlan] = useState('free');

  const handleNext = async () => {
    if (isAnimating) return;
    
    if (stage === 1) {
      if (!name.trim()) {
        setNameError('Please enter your name');
        return;
      }
      setNameError('');
    }
    
    if (stage === 2) {
      // Save subjects to localStorage
      localStorage.setItem('subjects', JSON.stringify(subjects));
    }
    
    if (stage === 3) {
      // Complete onboarding
      setIsAnimating(true); // Prevent multiple clicks
      try {
        // Save name and mark onboarding as complete
        await updateUserMetadata({
          display_name: name.trim(),
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // If premium selected, redirect to payment
        if (selectedPlan === 'premium') {
          onComplete();
          navigate('/payment');
        } else {
          // For free plan, complete onboarding and navigate to dashboard
          onComplete();
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Even if update fails, allow user to proceed
        onComplete();
        navigate('/dashboard');
      }
      return;
    }
    
    setIsAnimating(true);
    setTimeout(() => {
      setStage(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (isAnimating || stage === 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStage(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    
    const newSubject = {
      id: Date.now() + Math.random(),
      name: newSubjectName.trim(),
      color: newSubjectColor,
      goalHours: parseFloat(newSubjectGoal) || 0,
      iconName: 'BookOpen'
    };
    
    setSubjects(prev => [...prev, newSubject]);
    setNewSubjectName('');
    setNewSubjectColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setNewSubjectGoal(5);
    setShowAddForm(false);
  };

  const removeSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const stageVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl"
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 gap-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: stage === step ? 1.2 : 1,
                  backgroundColor: stage >= step ? '#6C5DD3' : 'rgba(255,255,255,0.2)'
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {stage > step ? <Check className="w-5 h-5" /> : step}
              </motion.div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${
                  stage > step ? 'bg-purple-600' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Stage 1: Name Collection */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-700/30 shadow-2xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-3">Welcome to Trackviso!</h1>
                <p className="text-purple-200/80 text-lg">Let's get you set up in just a few steps</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3 text-lg">What should we call you?</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {nameError}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Subjects */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-700/30 shadow-2xl"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <BookOpen className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Add Your Subjects</h2>
                <p className="text-purple-200/80">Set up subjects you want to study with weekly goals</p>
              </div>

              {/* Subject list */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/10"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    >
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{subject.name}</p>
                      <p className="text-sm text-purple-300/70">{subject.goalHours}h weekly goal</p>
                    </div>
                    <button
                      onClick={() => removeSubject(subject.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {subjects.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-purple-300/60">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No subjects added yet</p>
                  </div>
                )}
              </div>

              {/* Add subject form */}
              <AnimatePresence>
                {showAddForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="Subject name (e.g., Mathematics)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    
                    <div>
                      <label className="block text-sm text-purple-300 mb-2">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewSubjectColor(color)}
                            className={`w-8 h-8 rounded-lg transition-all ${
                              newSubjectColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-purple-900 scale-110' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-purple-300 mb-2">Weekly goal (hours)</label>
                      <input
                        type="number"
                        value={newSubjectGoal}
                        onChange={(e) => setNewSubjectGoal(e.target.value)}
                        min="0"
                        max="40"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addSubject}
                        disabled={!newSubjectName.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Add Subject
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-4 border-2 border-dashed border-purple-500/50 rounded-xl text-purple-300 hover:text-white hover:border-purple-500 transition-colors flex items-center justify-center gap-2 mb-6"
                  >
                    <Plus className="w-5 h-5" /> Add Subject
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="text-center text-purple-300/60 text-sm mt-4">
                You can always add more subjects later
              </p>
            </motion.div>
          )}

          {/* Stage 3: Premium Upsell */}
          {stage === 3 && (
            <motion.div
              key="stage3"
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-700/30 shadow-2xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
                <p className="text-purple-200/80">Start studying smarter today</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Free Plan */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan('free')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan === 'free'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Scholar Plan</h3>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'free' ? 'border-purple-500 bg-purple-500' : 'border-white/30'
                    }`}>
                      {selectedPlan === 'free' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-4">Free</p>
                  <ul className="space-y-2 text-sm text-purple-200/80">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> Study timer & sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> Progress tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> XP & achievements
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> 1 AI test per day
                    </li>
                  </ul>
                </motion.button>

                {/* Premium Plan */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan('premium')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                    selectedPlan === 'premium'
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" /> Professor Plan
                    </h3>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'premium' ? 'border-yellow-500 bg-yellow-500' : 'border-white/30'
                    }`}>
                      {selectedPlan === 'premium' && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-4">$4.99<span className="text-sm font-normal text-purple-300">/mo</span></p>
                  <ul className="space-y-2 text-sm text-purple-200/80">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-yellow-400" /> Everything in Scholar
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-yellow-400" /> Unlimited AI mock exams
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-yellow-400" /> Unlimited blurt tests
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-yellow-400" /> Advanced analytics
                    </li>
                  </ul>
                </motion.button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: isAnimating ? 1 : 1.02 }}
                  whileTap={{ scale: isAnimating ? 1 : 0.98 }}
                  onClick={handleNext}
                  disabled={isAnimating}
                  className={`flex-1 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isAnimating 
                      ? 'opacity-50 cursor-not-allowed'
                      : selectedPlan === 'premium'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/50'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  }`}
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedPlan === 'premium' ? 'Get Premium' : 'Start with Free'}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;

