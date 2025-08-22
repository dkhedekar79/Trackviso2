import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Star, Zap, Shield, Sparkles, Gift, Gem, Flame,
  TrendingUp, Award, Lock, Unlock, CheckCircle, X, Plus,
  Calendar, Clock, Users, BookOpen, Target, Trophy, Heart
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { AnimatedProgressBar } from './RewardAnimations';

// Premium Plans
const PREMIUM_PLANS = {
  scholar: {
    id: 'scholar',
    name: 'Scholar Premium',
    price: 4.99,
    period: 'month',
    color: 'from-blue-500 to-purple-600',
    icon: BookOpen,
    badge: '📚',
    description: 'Perfect for dedicated students',
    features: [
      { id: 'xp_multiplier', name: '1.5x XP Multiplier', icon: Star, premium: true },
      { id: 'streak_savers', name: '5 Streak Savers/month', icon: Shield, premium: true },
      { id: 'exclusive_themes', name: '3 Exclusive Themes', icon: Sparkles, premium: true },
      { id: 'priority_support', name: 'Priority Support', icon: Heart, premium: true },
      { id: 'advanced_stats', name: 'Advanced Analytics', icon: TrendingUp, premium: true }
    ],
    limits: {
      xpMultiplier: 1.5,
      streakSavers: 5,
      themes: 3,
      questSlots: 5,
      studyGroups: 5
    }
  },
  
  elite: {
    id: 'elite',
    name: 'Elite Premium',
    price: 9.99,
    period: 'month',
    color: 'from-purple-500 to-pink-600',
    icon: Crown,
    badge: '👑',
    description: 'For serious academic achievers',
    popular: true,
    features: [
      { id: 'xp_multiplier', name: '2x XP Multiplier', icon: Star, premium: true },
      { id: 'streak_savers', name: '10 Streak Savers/month', icon: Shield, premium: true },
      { id: 'exclusive_themes', name: '10 Exclusive Themes', icon: Sparkles, premium: true },
      { id: 'priority_support', name: 'Priority Support', icon: Heart, premium: true },
      { id: 'advanced_stats', name: 'Advanced Analytics', icon: TrendingUp, premium: true },
      { id: 'exclusive_quests', name: 'Elite Quests', icon: Target, premium: true },
      { id: 'custom_titles', name: 'Custom Titles', icon: Award, premium: true },
      { id: 'elite_badge', name: 'Elite Badge', icon: Gem, premium: true }
    ],
    limits: {
      xpMultiplier: 2.0,
      streakSavers: 10,
      themes: 10,
      questSlots: 10,
      studyGroups: 15
    }
  },
  
  legend: {
    id: 'legend',
    name: 'Legend Premium',
    price: 19.99,
    period: 'month',
    color: 'from-yellow-400 to-orange-500',
    icon: Trophy,
    badge: '🏆',
    description: 'Ultimate experience for legends',
    features: [
      { id: 'xp_multiplier', name: '3x XP Multiplier', icon: Star, premium: true },
      { id: 'streak_savers', name: 'Unlimited Streak Savers', icon: Shield, premium: true },
      { id: 'exclusive_themes', name: 'All Exclusive Themes', icon: Sparkles, premium: true },
      { id: 'priority_support', name: '24/7 VIP Support', icon: Heart, premium: true },
      { id: 'advanced_stats', name: 'Advanced Analytics', icon: TrendingUp, premium: true },
      { id: 'exclusive_quests', name: 'Legend Quests', icon: Target, premium: true },
      { id: 'custom_titles', name: 'Custom Titles', icon: Award, premium: true },
      { id: 'legend_badge', name: 'Legend Badge', icon: Gem, premium: true },
      { id: 'private_coaching', name: 'Private Study Coach', icon: Users, premium: true },
      { id: 'unlimited_groups', name: 'Unlimited Study Groups', icon: Users, premium: true }
    ],
    limits: {
      xpMultiplier: 3.0,
      streakSavers: -1, // Unlimited
      themes: -1, // All
      questSlots: -1, // Unlimited
      studyGroups: -1 // Unlimited
    }
  }
};

// Premium Themes
const PREMIUM_THEMES = {
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy Explorer',
    description: 'Study among the stars',
    preview: 'from-purple-900 via-blue-900 to-indigo-900',
    icon: '🌌',
    tier: 'scholar'
  },
  forest: {
    id: 'forest',
    name: 'Mystic Forest',
    description: 'Focus in nature\'s embrace',
    preview: 'from-green-800 via-emerald-700 to-teal-800',
    icon: '🌲',
    tier: 'scholar'
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Dive into knowledge',
    preview: 'from-blue-900 via-cyan-800 to-teal-900',
    icon: '🌊',
    tier: 'scholar'
  },
  sunset: {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Study in golden hour',
    preview: 'from-orange-600 via-pink-500 to-purple-600',
    icon: '🌅',
    tier: 'elite'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    description: 'Futuristic study vibes',
    preview: 'from-pink-600 via-purple-600 to-cyan-500',
    icon: '🏙️',
    tier: 'elite'
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights magic',
    preview: 'from-green-400 via-blue-500 to-purple-600',
    icon: '🌌',
    tier: 'legend'
  }
};

// Premium Features Display
const PremiumFeatureCard = ({ feature, isUnlocked, plan }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border-2 transition-all ${
        isUnlocked 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        {isUnlocked ? (
          <Unlock className="w-5 h-5 text-green-600" />
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
        <Icon className={`w-5 h-5 ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`} />
        <h3 className={`font-semibold ${isUnlocked ? 'text-green-800' : 'text-gray-600'}`}>
          {feature.name}
        </h3>
      </div>
      
      {!isUnlocked && (
        <p className="text-sm text-gray-500">
          Upgrade to {plan} to unlock this feature
        </p>
      )}
    </motion.div>
  );
};

// Theme Selector
const ThemeSelector = ({ userPlan, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  
  const getThemeAccess = (theme) => {
    if (!userPlan) return false;
    
    const planTiers = { scholar: 1, elite: 2, legend: 3 };
    const themeTiers = { scholar: 1, elite: 2, legend: 3 };
    
    return planTiers[userPlan] >= themeTiers[theme.tier];
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-purple-500" />
        Premium Themes
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PREMIUM_THEMES).map(([key, theme]) => {
          const hasAccess = getThemeAccess(theme);
          const isSelected = selectedTheme === key;
          
          return (
            <motion.div
              key={key}
              whileHover={{ scale: hasAccess ? 1.02 : 1 }}
              whileTap={{ scale: hasAccess ? 0.98 : 1 }}
              onClick={() => {
                if (hasAccess) {
                  setSelectedTheme(key);
                  onThemeChange?.(key);
                }
              }}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected && hasAccess
                  ? 'border-purple-500 shadow-purple-200/50'
                  : hasAccess
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Theme Preview */}
              <div className={`w-full h-20 rounded-lg bg-gradient-to-r ${theme.preview} mb-3 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {theme.icon}
                </div>
                
                {!hasAccess && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
                
                {isSelected && hasAccess && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <h4 className={`font-bold ${hasAccess ? 'text-gray-800' : 'text-gray-500'}`}>
                {theme.name}
              </h4>
              <p className={`text-sm ${hasAccess ? 'text-gray-600' : 'text-gray-400'}`}>
                {theme.description}
              </p>
              
              {!hasAccess && (
                <div className="mt-2 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold text-center">
                  {theme.tier.toUpperCase()} ONLY
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Usage Stats
const PremiumUsageStats = ({ userStats, userPlan }) => {
  const plan = PREMIUM_PLANS[userPlan];
  if (!plan) return null;
  
  const stats = [
    {
      name: 'XP Multiplier Active',
      current: '2.5x',
      icon: Star,
      color: 'yellow'
    },
    {
      name: 'Streak Savers Used',
      current: userStats.streakSavers || 0,
      max: plan.limits.streakSavers === -1 ? '∞' : plan.limits.streakSavers,
      icon: Shield,
      color: 'blue'
    },
    {
      name: 'Elite Quests Completed',
      current: 5,
      max: 10,
      icon: Target,
      color: 'purple'
    },
    {
      name: 'Study Groups Joined',
      current: 3,
      max: plan.limits.studyGroups === -1 ? '∞' : plan.limits.studyGroups,
      icon: Users,
      color: 'green'
    }
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-purple-500" />
        Premium Usage
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = stat.max && stat.max !== '∞' 
            ? (stat.current / stat.max) * 100 
            : 100;
          
          return (
            <div key={index} className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                <h4 className="font-semibold text-gray-800">{stat.name}</h4>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-800">
                  {stat.current}
                </span>
                {stat.max && (
                  <span className="text-sm text-gray-600">
                    / {stat.max}
                  </span>
                )}
              </div>
              
              {stat.max && stat.max !== '∞' && (
                <AnimatedProgressBar
                  progress={percentage}
                  color={stat.color}
                  height="h-2"
                  showPercentage={false}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Premium Plan Card
const PremiumPlanCard = ({ plan, isCurrentPlan, onSelect }) => {
  const Icon = plan.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative p-6 rounded-3xl border-2 transition-all ${
        plan.popular
          ? 'border-purple-500 shadow-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${isCurrentPlan ? 'ring-4 ring-green-200' : ''}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
            Most Popular
          </div>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <div className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
            Current Plan
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-800">${plan.price}</span>
          <span className="text-gray-600">/{plan.period}</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature.name}</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : plan.popular
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
            : 'bg-gray-800 text-white hover:bg-gray-900'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
      </button>
    </motion.div>
  );
};

// Main Premium System Component
const PremiumSystem = () => {
  const { userStats } = useGamification();
  const [activeTab, setActiveTab] = useState('plans');
  const [currentPlan, setCurrentPlan] = useState(() => {
    // Check if user has premium features enabled
    return userStats.isPremium ? (userStats.premiumPlan || 'scholar') : null;
  });
  const [selectedTheme, setSelectedTheme] = useState('galaxy');
  
  const tabs = [
    { id: 'plans', name: 'Premium Plans', icon: Crown },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'themes', name: 'Themes', icon: Sparkles },
    { id: 'usage', name: 'Usage Stats', icon: TrendingUp }
  ];
  
  const handlePlanSelect = (planId) => {
    // In a real app, this would trigger payment flow
    console.log('Selected plan:', planId);
    setCurrentPlan(planId);
  };
  
  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    // In a real app, this would update the user's theme preference
    console.log('Changed theme to:', themeId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Crown className="w-8 h-8 text-yellow-500" />
          Premium Experience
        </h1>
        <p className="text-gray-600">
          Unlock exclusive features and supercharge your learning journey!
        </p>
      </div>
      
      {/* Current Plan Status */}
      {currentPlan && (
        <div className={`bg-gradient-to-r ${PREMIUM_PLANS[currentPlan].color} rounded-3xl shadow-xl p-6 text-white mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {PREMIUM_PLANS[currentPlan].badge}
                {PREMIUM_PLANS[currentPlan].name} Active
              </h2>
              <p className="opacity-90">
                Enjoying premium benefits • Next billing: January 15, 2025
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">
                {PREMIUM_PLANS[currentPlan].limits.xpMultiplier}x
              </div>
              <div className="opacity-90">XP Multiplier</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </motion.button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.values(PREMIUM_PLANS).map((plan) => (
              <PremiumPlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan === plan.id}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(PREMIUM_PLANS).flatMap(plan => 
              plan.features.map(feature => (
                <PremiumFeatureCard
                  key={`${plan.id}-${feature.id}`}
                  feature={feature}
                  isUnlocked={currentPlan && PREMIUM_PLANS[currentPlan] && 
                    PREMIUM_PLANS[currentPlan].features.some(f => f.id === feature.id)}
                  plan={plan.name}
                />
              ))
            )}
          </div>
        )}
        
        {activeTab === 'themes' && (
          <ThemeSelector
            userPlan={currentPlan}
            currentTheme={selectedTheme}
            onThemeChange={handleThemeChange}
          />
        )}
        
        {activeTab === 'usage' && (
          <PremiumUsageStats
            userStats={userStats}
            userPlan={currentPlan}
          />
        )}
      </div>
      
      {/* Premium Benefits Summary */}
      <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why Go Premium?</h2>
          <p className="text-xl opacity-90">
            Join thousands of successful students who've unlocked their potential
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">3x Faster Progress</h3>
            <p className="opacity-90">Accelerate your learning with premium XP multipliers</p>
          </div>
          
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-bold mb-2">Never Lose Progress</h3>
            <p className="opacity-90">Protect your streaks with unlimited streak savers</p>
          </div>
          
          <div className="text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-purple-300" />
            <h3 className="text-xl font-bold mb-2">Exclusive Access</h3>
            <p className="opacity-90">Unlock exclusive themes, quests, and features</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSystem;
export { PREMIUM_PLANS, PREMIUM_THEMES, PremiumFeatureCard, ThemeSelector };
