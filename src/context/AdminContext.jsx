import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

// Provide default value to prevent initialization errors
const defaultAdminContext = {
  isAdmin: false,
  adminLoading: true,
  adminPermissions: {},
  canManageUsers: () => false,
  canManageSubscriptions: () => false,
  canViewAnalytics: () => false,
};

const AdminContext = createContext(defaultAdminContext);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  // Return context even if provider isn't ready (defensive)
  return context || defaultAdminContext;
};

export const AdminProvider = ({ children }) => {
  // Always call useAuth unconditionally (React hooks rule)
  // If AuthProvider isn't ready, useAuth will return default value
  const authContext = useAuth();
  const user = authContext?.user ?? null;
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminPermissions, setAdminPermissions] = useState({});

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      // Check if user is the specific admin email - grant access immediately without DB query
      const isSpecificAdmin = user.email === 'dskhedekar7@gmail.com';
      
      if (isSpecificAdmin) {
        setIsAdmin(true);
        setAdminPermissions({
          manage_users: true,
          manage_subscriptions: true,
          view_analytics: true
        });
        setAdminLoading(false);
        return; // Skip database query to avoid 406 errors
      }

      // For other users, check admin_users table
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Suppress error logging for expected cases (table doesn't exist, RLS blocks, etc.)
          const isExpectedError = error.code === 'PGRST116' || 
                                  error.code === 'PGRST301' || 
                                  error.status === 406 ||
                                  error.message?.includes('does not exist') ||
                                  error.message?.includes('permission denied');
          
          if (!isExpectedError) {
            console.warn('Error checking admin status:', error.message || error);
          }
          
          setIsAdmin(false);
          setAdminPermissions({});
        } else if (data) {
          // User is in admin_users table
          setIsAdmin(true);
          setAdminPermissions(data?.permissions || {
            manage_users: true,
            manage_subscriptions: true,
            view_analytics: true
          });
        } else {
          setIsAdmin(false);
          setAdminPermissions({});
        }
      } catch (error) {
        // Suppress error logging for expected cases
        const isExpectedError = error.message?.includes('does not exist') ||
                                error.message?.includes('permission denied');
        
        if (!isExpectedError) {
        console.error('Error checking admin status:', error);
        }
        
        setIsAdmin(false);
        setAdminPermissions({});
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const canManageUsers = () => adminPermissions.manage_users || false;
  const canManageSubscriptions = () => adminPermissions.manage_subscriptions || false;
  const canViewAnalytics = () => adminPermissions.view_analytics || false;

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        adminLoading,
        adminPermissions,
        canManageUsers,
        canManageSubscriptions,
        canViewAnalytics
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
