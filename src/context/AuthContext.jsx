import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { initializeDatabase } from '../utils/supabaseDb';
import logger from '../utils/logger';
import { APP_CONFIG } from '../constants/appConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [freeQuizQuestionsUsed, setFreeQuizQuestionsUsed] = useState(0);
  const [lastQuizResetDate, setLastQuizResetDate] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true); // Default true to avoid flash
  const [displayName, setDisplayName] = useState('');
  const [debugInfo, setDebugInfo] = useState({ step: 'Initializing...', details: '', progress: 0 });

  // Get initial session
  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        logger.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, APP_CONFIG.SESSION_TIMEOUT);

    const getInitialSession = async () => {
      try {
        setDebugInfo({ step: 'Fetching session...', details: 'Connecting to authentication service', progress: 10 });
        
        // Fetch session with timeout protection
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session fetch timeout')), APP_CONFIG.SESSION_FETCH_TIMEOUT)
          )
        ]).catch(async () => {
          // If timeout, try once more without timeout
          setDebugInfo({ step: 'Session timeout, retrying...', details: 'Retrying connection', progress: 15 });
          logger.warn('Session fetch timed out, retrying...');
          return await supabase.auth.getSession();
        });

        setDebugInfo({ step: 'Processing session...', details: 'Validating user data', progress: 40 });
        const { data: { session }, error } = sessionResult || { data: { session: null }, error: null };

        if (error) {
          logger.error('Error getting session:', error);
          setDebugInfo({ step: 'Session error', details: error.message || 'Unknown error', progress: 50 });
        }

        if (!isMounted) return;

        setDebugInfo({ step: 'Loading user data...', details: 'Setting up user profile', progress: 60 });
        setUser(session?.user ?? null);
        setIsPremiumUser(session?.user?.user_metadata?.is_premium || false);
        setFreeQuizQuestionsUsed(session?.user?.user_metadata?.free_quiz_questions_used || 0);
        setLastQuizResetDate(session?.user?.user_metadata?.last_quiz_reset_date || null);
        setOnboardingCompleted(session?.user?.user_metadata?.onboarding_completed || false);
        setDisplayName(session?.user?.user_metadata?.display_name || '');

        // Client-side daily reset check - don't block on this
        if (session?.user) {
          setDebugInfo({ step: 'Checking daily reset...', details: 'Validating quiz question limits', progress: 70 });
          const today = new Date().toDateString();
          const lastReset = session.user.user_metadata?.last_quiz_reset_date 
            ? new Date(session.user.user_metadata.last_quiz_reset_date).toDateString() 
            : null;

          if (lastReset !== today) {
            // Don't await - let it run in background
            resetFreeQuizQuestions().catch(err => {
              logger.error('Error resetting quiz questions:', err);
            });
          }

          setDebugInfo({ step: 'Initializing database...', details: 'Setting up user statistics', progress: 80 });
          // Initialize database - don't block on this either
          // Use a timeout to ensure it doesn't hang forever
          Promise.race([
            initializeDatabase(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database init timeout')), APP_CONFIG.DB_INIT_TIMEOUT))
          ]).then(() => {
            setDebugInfo({ step: 'Database ready', details: 'All systems initialized', progress: 95 });
          }).catch(err => {
            logger.error('Error initializing database (non-blocking):', err);
            setDebugInfo({ step: 'Database init warning', details: err.message || 'Non-critical error', progress: 90 });
          });
        } else {
          setDebugInfo({ step: 'No session found', details: 'User not authenticated', progress: 100 });
        }

      } catch (error) {
        logger.error('Error in getInitialSession:', error);
        setDebugInfo({ step: 'Initialization error', details: error.message || 'Unknown error occurred', progress: 100 });
        if (!isMounted) return;
        setUser(null);
        setIsPremiumUser(false);
        setFreeQuizQuestionsUsed(0);
        setLastQuizResetDate(null);
        setOnboardingCompleted(true);
        setDisplayName('');
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setDebugInfo({ step: 'Complete', details: 'Ready to proceed', progress: 100 });
          setTimeout(() => setLoading(false), 300); // Small delay to show completion
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('Auth state change:', event, session?.user?.email);
      
      // Always set loading to false first to prevent infinite loading
      setLoading(false);
      
      setUser(session?.user ?? null);
      setIsPremiumUser(session?.user?.user_metadata?.is_premium || false);
      setFreeQuizQuestionsUsed(session?.user?.user_metadata?.free_quiz_questions_used || 0);
      setLastQuizResetDate(session?.user?.user_metadata?.last_quiz_reset_date || null);
      setOnboardingCompleted(session?.user?.user_metadata?.onboarding_completed || false);
      setDisplayName(session?.user?.user_metadata?.display_name || '');

      // Client-side daily reset check on auth state change - don't block
      if (session?.user) {
        const today = new Date().toDateString();
        const lastReset = session.user.user_metadata?.last_quiz_reset_date 
          ? new Date(session.user.user_metadata.last_quiz_reset_date).toDateString() 
          : null;

        if (lastReset !== today) {
          // Don't await - let it run in background
          resetFreeQuizQuestions().catch(err => {
            console.error('Error resetting quiz questions:', err);
          });
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Update premium status on login
    setIsPremiumUser(data.user?.user_metadata?.is_premium || false);
    setFreeQuizQuestionsUsed(data.user?.user_metadata?.free_quiz_questions_used || 0);
    setLastQuizResetDate(data.user?.user_metadata?.last_quiz_reset_date || null);
    // Initialize database on login
    if (data.user) {
      await initializeDatabase();
    }
    return data;
  };

  const signup = async (email, password) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          is_premium: false, // Default to false on signup
          free_quiz_questions_used: 0,
          last_quiz_reset_date: new Date().toISOString()
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
    // Update premium status on signup
    setIsPremiumUser(data.user?.user_metadata?.is_premium || false);
    setFreeQuizQuestionsUsed(data.user?.user_metadata?.free_quiz_questions_used || 0);
    setLastQuizResetDate(data.user?.user_metadata?.last_quiz_reset_date || null);
    
    // Initialize database for new user
    if (data.user) {
      await initializeDatabase();
      
      // Handle referral if present
      const refCode = sessionStorage.getItem('referralCode');
      if (refCode) {
        try {
          const { createReferral } = await import('../utils/supabaseDb');
          await createReferral(refCode);
          sessionStorage.removeItem('referralCode');
        } catch (err) {
          console.error('Error handling referral during signup:', err);
        }
      }
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsPremiumUser(false);
    setFreeQuizQuestionsUsed(0);
    setLastQuizResetDate(null);
    setOnboardingCompleted(true);
    setDisplayName('');
  };

  // Update user metadata (for onboarding, display name, etc.)
  const updateUserMetadata = async (metadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      if (error) throw error;
      
      setUser(data.user);
      if (metadata.onboarding_completed !== undefined) {
        setOnboardingCompleted(metadata.onboarding_completed);
      }
      if (metadata.display_name !== undefined) {
        setDisplayName(metadata.display_name);
      }
      return data.user;
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
  };

  // Delete user account
  const deleteUserAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        throw new Error('No active session');
      }

      // Call API endpoint to delete account
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: session.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Clear all local data
      localStorage.clear();
      
      // Sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out after deletion:', error);
        // Continue anyway since account is deleted
      }
      
      setUser(null);
      setIsPremiumUser(false);
      setFreeQuizQuestionsUsed(0);
      setLastQuizResetDate(null);
      setOnboardingCompleted(true);
      setDisplayName('');
      
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  };

  // Function to update premium status (will be called after successful payment)
  const updatePremiumStatus = async (userId, isPremium) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { is_premium: isPremium }
      });
      if (error) throw error;
      setUser(data.user);
      setIsPremiumUser(isPremium);
      return data.user;
    } catch (error) {
      console.error('Error updating premium status:', error);
      throw error;
    }
  };

  const updateFreeQuizQuestionsUsed = async (count) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { free_quiz_questions_used: count }
      });
      if (error) throw error;
      setUser(data.user);
      setFreeQuizQuestionsUsed(count);
      return data.user;
    } catch (error) {
      console.error('Error updating free quiz questions used:', error);
      throw error;
    }
  };

  const resetFreeQuizQuestions = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { free_quiz_questions_used: 0, last_quiz_reset_date: new Date().toISOString() }
      });
      if (error) throw error;
      setUser(data.user);
      setFreeQuizQuestionsUsed(0);
      setLastQuizResetDate(new Date().toISOString());
      return data.user;
    } catch (error) {
      console.error('Error resetting free quiz questions:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      isPremiumUser, 
      updatePremiumStatus, 
      freeQuizQuestionsUsed, 
      updateFreeQuizQuestionsUsed, 
      lastQuizResetDate, 
      resetFreeQuizQuestions,
      onboardingCompleted,
      displayName,
      updateUserMetadata,
      deleteUserAccount,
      debugInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};
