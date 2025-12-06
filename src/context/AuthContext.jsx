import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { migrateLegacyDataToSupabase } from '../utils/migrateLegacyData';
import { initializeDatabase } from '../utils/supabaseDb';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [freeQuizQuestionsUsed, setFreeQuizQuestionsUsed] = useState(0);
  const [lastQuizResetDate, setLastQuizResetDate] = useState(null);

  // Get initial session
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setUser(session?.user ?? null);
        setIsPremiumUser(session?.user?.user_metadata?.is_premium || false);
        setFreeQuizQuestionsUsed(session?.user?.user_metadata?.free_quiz_questions_used || 0);
        setLastQuizResetDate(session?.user?.user_metadata?.last_quiz_reset_date || null);

        // Client-side daily reset check
        const today = new Date().toDateString();
        const lastReset = session?.user?.user_metadata?.last_quiz_reset_date ? new Date(session.user.user_metadata.last_quiz_reset_date).toDateString() : null;

        if (session?.user && lastReset !== today) {
          await resetFreeQuizQuestions();
        }

        // Initialize database and migrate legacy data on first login
        if (session?.user) {
          await initializeDatabase();
          await migrateLegacyDataToSupabase();
        }

      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setIsPremiumUser(false);
        setFreeQuizQuestionsUsed(0);
        setLastQuizResetDate(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setIsPremiumUser(session?.user?.user_metadata?.is_premium || false);
      setFreeQuizQuestionsUsed(session?.user?.user_metadata?.free_quiz_questions_used || 0);
      setLastQuizResetDate(session?.user?.user_metadata?.last_quiz_reset_date || null);

      // Client-side daily reset check on auth state change
      const today = new Date().toDateString();
      const lastReset = session?.user?.user_metadata?.last_quiz_reset_date ? new Date(session.user.user_metadata.last_quiz_reset_date).toDateString() : null;

      if (session?.user && lastReset !== today) {
        await resetFreeQuizQuestions();
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Update premium status on login
    setIsPremiumUser(data.user?.user_metadata?.is_premium || false);
    setFreeQuizQuestionsUsed(data.user?.user_metadata?.free_quiz_questions_used || 0);
    setLastQuizResetDate(data.user?.user_metadata?.last_quiz_reset_date || null);
    // Migrate legacy data on login
    await migrateLegacyDataToSupabase();
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
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsPremiumUser(false);
    setFreeQuizQuestionsUsed(0);
    setLastQuizResetDate(null);
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isPremiumUser, updatePremiumStatus, freeQuizQuestionsUsed, updateFreeQuizQuestionsUsed, lastQuizResetDate, resetFreeQuizQuestions }}>
      {children}
    </AuthContext.Provider>
  );
};
