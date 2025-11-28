
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

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
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setIsPremiumUser(false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setIsPremiumUser(session?.user?.user_metadata?.is_premium || false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Update premium status on login
    setIsPremiumUser(data.user?.user_metadata?.is_premium || false);
    return data;
  };

  const signup = async (email, password) => {
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          is_premium: false // Default to false on signup
        },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
    // Update premium status on signup
    setIsPremiumUser(data.user?.user_metadata?.is_premium || false);
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsPremiumUser(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isPremiumUser, updatePremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
