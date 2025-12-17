import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Crown,
  Lock,
  Unlock,
  RotateCcw,
  Search,
  ChevronDown,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  AlertCircle
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Redirect if not admin - check email specifically
  useEffect(() => {
    if (!adminLoading) {
      // Check if user is the specific admin email
      const isSpecificAdmin = user?.email === 'dskhedekar7@gmail.com';
      if (!isAdmin && !isSpecificAdmin) {
      navigate('/dashboard');
      }
    }
  }, [isAdmin, adminLoading, navigate, user]);

  // Load users
  useEffect(() => {
    if (isAdmin && user) {
      loadUsers();
    }
  }, [isAdmin, user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-admin-user-id': user.id
        }
      });

      const contentType = response.headers.get('content-type') || '';
      const parseBody = async () => {
        if (contentType.includes('application/json')) return await response.json();
        const text = await response.text();
        try { return JSON.parse(text); } catch { return { error: text || 'Unknown error' }; }
      };

      const body = await parseBody();

      if (response.ok) {
        setUsers(body.users || []);
      } else {
        const msg = body?.error || body?.message || `HTTP ${response.status}`;
        const errorDetails = body?.details ? `\n\nDetails: ${body.details}` : '';
        // Common local-dev issue: Vite proxies /api -> localhost:3000 but vercel dev isn't running.
        if (String(msg).includes('ECONNREFUSED') || 
            String(msg).includes('Failed to fetch') ||
            response.status === 502 || 
            response.status === 504 ||
            response.status === 500 && String(msg).includes('Missing Supabase')) {
          alert(`Admin API is not running or misconfigured.\n\nRun this in another terminal:\n\nnpm run dev:api\n\n(That starts Vercel functions on http://localhost:3000, which Vite proxies /api to.)\n\nError: ${msg}${errorDetails}`);
        } else {
          alert(`Error loading users: ${msg}${errorDetails}`);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      const msg = error?.message || String(error);
      if (msg.includes('Failed to fetch') || msg.includes('ECONNREFUSED')) {
        alert(`Admin API is not running.\n\nRun this in another terminal:\n\nnpm run dev:api\n\n(That starts Vercel functions on http://localhost:3000, which Vite proxies /api to.)`);
      } else {
      alert('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async (userId, email) => {
    setActionInProgress(`${userId}-make-admin`);
    try {
      const response = await fetch(`/api/admin/users?action=make-admin&userId=${userId}`, {
        method: 'POST',
        headers: {
          'x-admin-user-id': user.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('User promoted to admin');
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to make user admin');
    } finally {
      setActionInProgress(null);
    }
  };

  const removeUserAdmin = async (userId) => {
    setActionInProgress(`${userId}-remove-admin`);
    try {
      const response = await fetch(`/api/admin/users?action=remove-admin&userId=${userId}`, {
        method: 'POST',
        headers: {
          'x-admin-user-id': user.id,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Admin status removed');
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove admin');
    } finally {
      setActionInProgress(null);
    }
  };

  const updateSubscription = async (userId, plan) => {
    setActionInProgress(`${userId}-sub-${plan}`);
    try {
      const response = await fetch(`/api/admin/users?action=update-subscription&userId=${userId}`, {
        method: 'POST',
        headers: {
          'x-admin-user-id': user.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan })
      });

      if (response.ok) {
        alert(`Subscription updated to ${plan}`);
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update subscription');
    } finally {
      setActionInProgress(null);
    }
  };

  const resetUsage = async (userId) => {
    setActionInProgress(`${userId}-reset`);
    try {
      const response = await fetch(`/api/admin/users?action=reset-usage&userId=${userId}`, {
        method: 'POST',
        headers: {
          'x-admin-user-id': user.id,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Daily usage reset');
        loadUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reset usage');
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 mt-20 pl-[100px] pr-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-purple-200/80">Manage users, subscriptions, and system settings</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200/80 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl p-6 border border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200/80 text-sm">Premium Users</p>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.is_premium).length}</p>
              </div>
              <Crown className="w-8 h-8 text-amber-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl p-6 border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/80 text-sm">Admin Users</p>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.is_admin).length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-slate-900/40 rounded-xl p-6 border border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200/80 text-sm">Free Users</p>
                <p className="text-3xl font-bold text-white">{users.filter(u => !u.is_premium).length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-purple-900/30 border border-purple-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-600"
            />
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-purple-900/20 rounded-xl border border-purple-700/30">
              <Users className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
              <p className="text-purple-300">No users found</p>
            </div>
          ) : (
            filteredUsers.map((u, idx) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 rounded-xl border border-purple-700/30 overflow-hidden"
              >
                {/* User Row */}
                <button
                  onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-purple-900/20 transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{u.email}</p>
                      {u.is_admin && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-900/50 border border-amber-700/50 rounded text-xs text-amber-300">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                      {u.is_premium && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/50 border border-purple-700/50 rounded text-xs text-purple-300">
                          <Zap className="w-3 h-3" />
                          Professor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-purple-300/60">
                      Level {u.level} • {Math.round(u.total_study_time / 60)}h {u.total_study_time % 60}m studied
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mr-4">
                    <div className="text-right">
                      <p className="text-xs text-purple-300/60">XP</p>
                      <p className="font-semibold text-white">{u.xp?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-300/60">Website Time</p>
                      <p className="font-semibold text-white">
                        {u.website_time_minutes ? (
                          <>
                            {Math.floor(u.website_time_minutes / 60)}h {u.website_time_minutes % 60}m
                          </>
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-300/60">Blurt Tests</p>
                      <p className="font-semibold text-white">{u.blurt_tests_used || 0}/1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-300/60">Mock Exams</p>
                      <p className="font-semibold text-white">{u.mock_exams_used || 0}/1</p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 transition ${expandedUser === u.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedUser === u.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-purple-700/20 bg-purple-950/30"
                    >
                      <div className="p-6 space-y-4">
                        {/* Admin Actions */}
                        <div>
                          <h4 className="text-sm font-semibold text-purple-300 mb-3">Admin Status</h4>
                          <div className="flex gap-2">
                            {u.is_admin ? (
                              <button
                                onClick={() => removeUserAdmin(u.id)}
                                disabled={actionInProgress === `${u.id}-remove-admin`}
                                className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                <Unlock className="w-4 h-4" />
                                {actionInProgress === `${u.id}-remove-admin` ? 'Removing...' : 'Remove Admin'}
                              </button>
                            ) : (
                              <button
                                onClick={() => makeUserAdmin(u.id, u.email)}
                                disabled={actionInProgress === `${u.id}-make-admin`}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 rounded-lg text-sm font-medium transition disabled:opacity-50"
                              >
                                <Crown className="w-4 h-4" />
                                {actionInProgress === `${u.id}-make-admin` ? 'Promoting...' : 'Make Admin'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subscription Actions */}
                        <div>
                          <h4 className="text-sm font-semibold text-purple-300 mb-3">Subscription</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateSubscription(u.id, 'scholar')}
                              disabled={actionInProgress?.includes(`${u.id}-sub`)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                u.subscription_plan === 'scholar'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-900/40 hover:bg-purple-900/60 text-purple-300'
                              } disabled:opacity-50`}
                            >
                              {actionInProgress === `${u.id}-sub-scholar` ? 'Updating...' : 'Scholar (Free)'}
                            </button>
                            <button
                              onClick={() => updateSubscription(u.id, 'professor')}
                              disabled={actionInProgress?.includes(`${u.id}-sub`)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                u.subscription_plan === 'professor'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-900/40 hover:bg-amber-900/60 text-amber-300'
                              } disabled:opacity-50`}
                            >
                              {actionInProgress === `${u.id}-sub-professor` ? 'Updating...' : 'Professor'}
                            </button>
                          </div>
                        </div>

                        {/* Reset Usage */}
                        <div>
                          <h4 className="text-sm font-semibold text-purple-300 mb-3">Daily Usage</h4>
                          <button
                            onClick={() => resetUsage(u.id)}
                            disabled={actionInProgress === `${u.id}-reset`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 rounded-lg text-sm font-medium transition disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {actionInProgress === `${u.id}-reset` ? 'Resetting...' : 'Reset Daily Usage'}
                          </button>
                        </div>

                        {/* User Stats */}
                        <div>
                          <h4 className="text-sm font-semibold text-purple-300 mb-3">User Statistics</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-purple-950/50 rounded p-3">
                              <p className="text-xs text-purple-300/60 mb-1">Total Study Time</p>
                              <p className="text-sm font-semibold text-white">
                                {Math.floor((u.total_study_time || 0) / 60)}h {(u.total_study_time || 0) % 60}m
                              </p>
                            </div>
                            <div className="bg-purple-950/50 rounded p-3">
                              <p className="text-xs text-purple-300/60 mb-1">Website Time</p>
                              <p className="text-sm font-semibold text-white">
                                {u.website_time_minutes ? (
                                  <>
                                    {Math.floor(u.website_time_minutes / 60)}h {u.website_time_minutes % 60}m
                                  </>
                                ) : (
                                  'No data'
                                )}
                              </p>
                            </div>
                            <div className="bg-purple-950/50 rounded p-3">
                              <p className="text-xs text-purple-300/60 mb-1">Level</p>
                              <p className="text-sm font-semibold text-white">{u.level || 1}</p>
                            </div>
                            <div className="bg-purple-950/50 rounded p-3">
                              <p className="text-xs text-purple-300/60 mb-1">XP Amount</p>
                              <p className="text-sm font-semibold text-white">{(u.xp || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-700/20">
                          <div className="bg-purple-950/50 rounded p-3">
                            <p className="text-xs text-purple-300/60 mb-1">User ID</p>
                            <p className="text-xs font-mono text-white">{u.id.slice(0, 12)}...</p>
                          </div>
                          <div className="bg-purple-950/50 rounded p-3">
                            <p className="text-xs text-purple-300/60 mb-1">Joined</p>
                            <p className="text-xs text-white">{new Date(u.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
