import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

// Provide default value to prevent initialization errors
const defaultSubscriptionContext = {
  subscriptionPlan: 'scholar',
  usage: {
    mockExamsUsed: 0,
    blurtTestsUsed: 0,
    aiSchedulesGenerated: 0,
    scheduleRegenerationsUsed: 0,
    lastResetDate: null,
  },
  loading: true,
  canUseMockExam: () => false,
  canUseBlurtTest: () => false,
  canGenerateAISchedule: () => false,
  canRegenerateSchedule: () => false,
  incrementMockExamUsage: async () => false,
  incrementBlurtTestUsage: async () => false,
  incrementAIScheduleUsage: async () => false,
  incrementScheduleRegenerationUsage: async () => false,
  updateSubscriptionPlan: async () => {},
  getRemainingMockExams: () => 0,
  getRemainingBlurtTests: () => 0,
  getHoursUntilReset: () => 24,
  resetDailyUsage: async () => {},
};

const SubscriptionContext = createContext(defaultSubscriptionContext);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  // Return context even if provider isn't ready (defensive)
  return context || defaultSubscriptionContext;
};

export const SubscriptionProvider = ({ children }) => {
  // Always call useAuth unconditionally (React hooks rule)
  // If AuthProvider isn't ready, useAuth will return undefined/null
  const authContext = useAuth();
  const user = authContext?.user ?? null;
  
  const [subscriptionPlan, setSubscriptionPlan] = useState('scholar'); // 'scholar' (free) or 'professor' (premium)
  const [usage, setUsage] = useState({
    mockExamsUsed: 0,
    blurtTestsUsed: 0,
    aiSchedulesGenerated: 0,
    scheduleRegenerationsUsed: 0,
    lastResetDate: null
  });
  const [loading, setLoading] = useState(true);

  const resetDailyUsage = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          mock_exams_used: 0,
          blurt_tests_used: 0,
          schedule_regenerations_used: 0,
          usage_reset_date: new Date().toISOString()
        }
      });

      if (error) throw error;

      setUsage(prev => ({
        ...prev,
        mockExamsUsed: 0,
        blurtTestsUsed: 0,
        scheduleRegenerationsUsed: 0,
        lastResetDate: new Date().toISOString()
      }));

      return data.user;
    } catch (error) {
      console.error('Error resetting daily usage:', error);
      throw error;
    }
  }, []);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) {
        setSubscriptionPlan('scholar');
        setUsage({ mockExamsUsed: 0, blurtTestsUsed: 0, aiSchedulesGenerated: 0, scheduleRegenerationsUsed: 0, lastResetDate: null });
        setLoading(false);
        return;
      }

      try {
        // Get user metadata
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          const isPremium = currentUser.user_metadata?.subscription_plan === 'professor' ||
                           currentUser.user_metadata?.is_premium === true;
          setSubscriptionPlan(isPremium ? 'professor' : 'scholar');

          // Get usage data
          const mockExamsUsed = currentUser.user_metadata?.mock_exams_used || 0;
          const blurtTestsUsed = currentUser.user_metadata?.blurt_tests_used || 0;
          const aiSchedulesGenerated = currentUser.user_metadata?.ai_schedules_generated || 0;
          const scheduleRegenerationsUsed = currentUser.user_metadata?.schedule_regenerations_used || 0;
          const lastResetDate = currentUser.user_metadata?.usage_reset_date || null;

          setUsage({
            mockExamsUsed,
            blurtTestsUsed,
            aiSchedulesGenerated,
            scheduleRegenerationsUsed,
            lastResetDate
          });

          // Check if we need to reset daily usage
          if (lastResetDate) {
            const lastReset = new Date(lastResetDate);
            const now = new Date();
            const lastResetDay = lastReset.toDateString();
            const today = now.toDateString();

            // Reset if it's a new day
            if (lastResetDay !== today) {
              await resetDailyUsage();
            }
          } else {
            // First time, set reset date
            await resetDailyUsage();
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();

    // Set up periodic check for daily reset (check every minute for faster detection)
    const checkInterval = setInterval(async () => {
      if (user) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();

          if (currentUser?.user_metadata?.usage_reset_date) {
            const lastReset = new Date(currentUser.user_metadata.usage_reset_date);
            const now = new Date();
            const lastResetDay = lastReset.toDateString();
            const today = now.toDateString();

            // Reset if it's a new day
            if (lastResetDay !== today) {
              await resetDailyUsage();
            }
          }
        } catch (error) {
          console.error('Error checking if reset is needed:', error);
        }
      }
    }, 60 * 1000); // Check every minute (reduced from 60 minutes)

    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();

          if (currentUser?.user_metadata?.usage_reset_date) {
            const lastReset = new Date(currentUser.user_metadata.usage_reset_date);
            const now = new Date();
            const lastResetDay = lastReset.toDateString();
            const today = now.toDateString();

            // Reset if it's a new day
            if (lastResetDay !== today) {
              await resetDailyUsage();
            }
          }
        } catch (error) {
          console.error('Error checking if reset is needed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, resetDailyUsage]);

  const incrementMockExamUsage = async () => {
    if (subscriptionPlan === 'professor') return true; // Unlimited for premium
    
    const newCount = usage.mockExamsUsed + 1;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { mock_exams_used: newCount }
      });
      
      if (error) throw error;
      
      setUsage(prev => ({ ...prev, mockExamsUsed: newCount }));
      return true;
    } catch (error) {
      console.error('Error incrementing mock exam usage:', error);
      return false;
    }
  };

  const incrementBlurtTestUsage = async () => {
    if (subscriptionPlan === 'professor') return true; // Unlimited for premium
    
    const newCount = usage.blurtTestsUsed + 1;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { blurt_tests_used: newCount }
      });
      
      if (error) throw error;
      
      setUsage(prev => ({ ...prev, blurtTestsUsed: newCount }));
      return true;
    } catch (error) {
      console.error('Error incrementing blurt test usage:', error);
      return false;
    }
  };

  const incrementAIScheduleUsage = async () => {
    const newCount = (usage.aiSchedulesGenerated || 0) + 1;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { ai_schedules_generated: newCount }
      });
      
      if (error) throw error;
      
      setUsage(prev => ({ ...prev, aiSchedulesGenerated: newCount }));
      return true;
    } catch (error) {
      console.error('Error incrementing AI schedule usage:', error);
      return false;
    }
  };

  const incrementScheduleRegenerationUsage = async () => {
    if (subscriptionPlan === 'professor') return true; // Unlimited for premium
    
    const newCount = (usage.scheduleRegenerationsUsed || 0) + 1;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { schedule_regenerations_used: newCount }
      });
      
      if (error) throw error;
      
      setUsage(prev => ({ ...prev, scheduleRegenerationsUsed: newCount }));
      return true;
    } catch (error) {
      console.error('Error incrementing schedule regeneration usage:', error);
      return false;
    }
  };

  const canGenerateAISchedule = () => {
    if (subscriptionPlan === 'professor') return true;
    return (usage.aiSchedulesGenerated || 0) < 1;
  };

  const canUseMockExam = () => {
    if (subscriptionPlan === 'professor') return true;
    return usage.mockExamsUsed < 1;
  };

  const canUseBlurtTest = () => {
    if (subscriptionPlan === 'professor') return true;
    return usage.blurtTestsUsed < 1;
  };

  const canRegenerateSchedule = () => {
    if (subscriptionPlan === 'professor') return true;
    return (usage.scheduleRegenerationsUsed || 0) < 1;
  };

  const updateSubscriptionPlan = async (plan) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          subscription_plan: plan,
          is_premium: plan === 'professor'
        }
      });
      
      if (error) throw error;
      
      setSubscriptionPlan(plan);
      return data.user;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  };

  const getRemainingMockExams = () => {
    if (subscriptionPlan === 'professor') return Infinity;
    return Math.max(0, 1 - usage.mockExamsUsed);
  };

  const getRemainingBlurtTests = () => {
    if (subscriptionPlan === 'professor') return Infinity;
    return Math.max(0, 1 - usage.blurtTestsUsed);
  };

  const getHoursUntilReset = () => {
    if (!usage.lastResetDate) return 24;

    // Calculate hours until next midnight (when reset happens)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursUntilMidnight = (tomorrow - now) / (1000 * 60 * 60);
    return Math.ceil(hoursUntilMidnight);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionPlan,
        usage,
        loading,
        canUseMockExam,
        canUseBlurtTest,
        canGenerateAISchedule,
        canRegenerateSchedule,
        incrementMockExamUsage,
        incrementBlurtTestUsage,
        incrementAIScheduleUsage,
        incrementScheduleRegenerationUsage,
        updateSubscriptionPlan,
        getRemainingMockExams,
        getRemainingBlurtTests,
        getHoursUntilReset,
        resetDailyUsage
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
