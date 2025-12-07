import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
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

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setIsAdmin(true);
          setAdminPermissions(data.permissions || {});
        } else {
          setIsAdmin(false);
          setAdminPermissions({});
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
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
