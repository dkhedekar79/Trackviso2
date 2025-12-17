import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Crown, FileText, Plus, X, Calendar, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Settings = () => {
  const { user, displayName, deleteUserAccount } = useAuth();
  const { subscriptionPlan } = useSubscription();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [patchNotes, setPatchNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatchNote, setEditingPatchNote] = useState(null);
  const [newPatchNote, setNewPatchNote] = useState({ title: '', description: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);

  const ADMIN_EMAIL = 'dskhedekar7@gmail.com';

  // Check if user is authorized to create patch notes
  useEffect(() => {
    setIsAuthorized(user?.email === ADMIN_EMAIL);
  }, [user]);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteUserAccount();
      navigate('/');
    } catch (error) {
      setDeleteError('Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  // Load patch notes from localStorage
  useEffect(() => {
    const savedPatchNotes = localStorage.getItem('patchNotes');
    if (savedPatchNotes) {
      try {
        const parsed = JSON.parse(savedPatchNotes);
        // Sort by date, newest first
        const sorted = parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPatchNotes(sorted);
      } catch (err) {
        console.error('Error loading patch notes:', err);
      }
    }
  }, []);

  // Save patch notes to localStorage
  useEffect(() => {
    if (patchNotes.length > 0) {
      localStorage.setItem('patchNotes', JSON.stringify(patchNotes));
    }
  }, [patchNotes]);

  const handleCreatePatchNote = () => {
    if (!newPatchNote.title.trim() || !newPatchNote.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    const patchNote = {
      id: Date.now(),
      title: newPatchNote.title.trim(),
      description: newPatchNote.description.trim(),
      date: new Date().toISOString(),
      author: user?.email || 'Unknown'
    };

    setPatchNotes(prev => [patchNote, ...prev]);
    setNewPatchNote({ title: '', description: '' });
    setShowCreateModal(false);
  };

  const handleEditPatchNote = (note) => {
    setEditingPatchNote({ ...note });
    setShowEditModal(true);
  };

  const handleUpdatePatchNote = () => {
    if (!editingPatchNote.title.trim() || !editingPatchNote.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    setPatchNotes(prev => prev.map(note => 
      note.id === editingPatchNote.id 
        ? { ...editingPatchNote, title: editingPatchNote.title.trim(), description: editingPatchNote.description.trim() }
        : note
    ));
    setEditingPatchNote(null);
    setShowEditModal(false);
  };

  const handleDeletePatchNote = (id) => {
    if (window.confirm('Are you sure you want to delete this patch note?')) {
      setPatchNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanDisplayName = (plan) => {
    return plan === 'professor' ? 'Professor Plan (Premium)' : 'Scholar Plan (Free)';
  };

  const getPlanColor = (plan) => {
    return plan === 'professor' 
      ? 'from-purple-600 to-pink-600' 
      : 'from-slate-600 to-slate-700';
  };

  return (
    <>
      <SEO 
        title="Settings - Trackviso"
        description="Manage your Trackviso account settings, view subscription plan, and check patch notes for the latest updates."
        url="/settings"
        robots="noindex, nofollow"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-8 px-4 mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-purple-200/70">Manage your account and view updates</p>
        </motion.div>

        {/* Profile Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-purple-600/20">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Profile Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-300/80 mb-1 block">Name</label>
              <p className="text-white text-lg">{displayName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-purple-300/80 mb-1 block">Email</label>
              <p className="text-white text-lg">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-purple-300/80 mb-1 block">User ID</label>
              <p className="text-white text-sm font-mono">{user?.id || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-purple-300/80 mb-1 block">Account Created</label>
              <p className="text-white">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not available'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Delete Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-red-900/30 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-red-700/30 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-red-600/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
          </div>
          
          <p className="text-purple-200/70 mb-4">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>

          {deleteError && (
            <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
              {deleteError}
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-600/20 border border-red-600/50 text-red-400 font-semibold rounded-lg hover:bg-red-600/30 hover:border-red-500 transition-all"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-200 mb-4 font-medium">
                Are you absolutely sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Subscription Plan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${getPlanColor(subscriptionPlan)}/20`}>
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Subscription Plan</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${getPlanColor(subscriptionPlan)} bg-clip-text text-transparent mb-1`}>
                {getPlanDisplayName(subscriptionPlan)}
              </p>
              <p className="text-purple-300/70 text-sm">
                {subscriptionPlan === 'professor' 
                  ? 'Unlimited access to all premium features'
                  : 'Upgrade to unlock premium features'}
              </p>
            </div>
            {subscriptionPlan === 'scholar' && (
              <a
                href="/payment"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Upgrade Now
              </a>
            )}
          </div>
        </motion.div>

        {/* Patch Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-600/20">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Patch Notes</h2>
            </div>
            {isAuthorized && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Patch Note
              </button>
            )}
          </div>

          {patchNotes.length > 0 ? (
            <div className="space-y-4">
              {patchNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-800/20 border border-purple-700/30 rounded-lg p-5 hover:border-purple-600/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{note.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-purple-300/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(note.date)}
                      </div>
                      {isAuthorized && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditPatchNote(note)}
                            className="p-1.5 rounded-lg bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 hover:text-white transition-colors"
                            title="Edit patch note"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePatchNote(note.id)}
                            className="p-1.5 rounded-lg bg-red-700/40 hover:bg-red-700/60 text-red-300 hover:text-white transition-colors"
                            title="Delete patch note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-purple-200/80 whitespace-pre-wrap leading-relaxed">
                    {note.description}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
              <p className="text-purple-300/80 text-lg">No patch notes yet</p>
              <p className="text-purple-300/60 text-sm mt-2">
                {isAuthorized 
                  ? 'Create the first patch note to keep users updated'
                  : 'Check back later for updates'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Edit Patch Note Modal */}
        <AnimatePresence>
          {showEditModal && editingPatchNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                setShowEditModal(false);
                setEditingPatchNote(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Edit2 className="w-6 h-6 text-purple-400" />
                    Edit Patch Note
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPatchNote(null);
                    }}
                    className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={editingPatchNote.title}
                      onChange={(e) => setEditingPatchNote(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition"
                      placeholder="e.g., Version 0.20 - New Features"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={editingPatchNote.description}
                      onChange={(e) => setEditingPatchNote(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition resize-none"
                      placeholder="Describe the update, new features, bug fixes, etc."
                      rows={8}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingPatchNote(null);
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePatchNote}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                      Update Patch Note
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Patch Note Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-2xl p-6 border border-purple-700/30 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-400" />
                    Create New Patch Note
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newPatchNote.title}
                      onChange={(e) => setNewPatchNote(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition"
                      placeholder="e.g., Version 0.20 - New Features"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={newPatchNote.description}
                      onChange={(e) => setNewPatchNote(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-purple-900/40 text-white border border-purple-700/50 focus:outline-none focus:border-purple-600/80 transition resize-none"
                      placeholder="Describe the update, new features, bug fixes, etc."
                      rows={8}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewPatchNote({ title: '', description: '' });
                      }}
                      className="flex-1 px-4 py-3 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePatchNote}
                      className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                      Create Patch Note
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default Settings;

