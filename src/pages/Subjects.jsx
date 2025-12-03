import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  BookOpen,
  X,
  Check,
  Calculator,
  Dna,
  FlaskConical,
  Atom,
  Scroll,
  Globe,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useGamification } from '../context/GamificationContext';

// Map icon names to actual Lucide React components
const ICON_COMPONENTS = {
  BookOpen: BookOpen,
  Calculator: Calculator,
  Dna: Dna,
  FlaskConical: FlaskConical,
  Atom: Atom,
  Scroll: Scroll,
  Globe: Globe,
  TrendingUp: TrendingUp,
  // Add other icons as needed
};

// Fixed list of GCSE subjects with predefined colors and icons


const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6C5DD3'); // Default color
  const [newSubjectGoal, setNewSubjectGoal] = useState(0);
  const [goalHours, setGoalHours] = useState({});
  const navigate = useNavigate();
  const { setTimerSubject } = useTimer();
  const { userStats } = useGamification();

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    const subjectsWithIcons = savedSubjects.map(subject => ({
      ...subject,
      icon: ICON_COMPONENTS[subject.iconName] || BookOpen, // Use mapped component or default
    }));
    setSubjects(subjectsWithIcons);
  }, []);



  const handleStartTimer = (subjectName) => {
    setTimerSubject(subjectName);
    navigate(`/study?subject=${encodeURIComponent(subjectName)}`);
  };

  const handleAddSubjects = () => {
    if (newSubjectName.trim() !== '') {
      const newSubject = {
        id: Date.now() + Math.random(),
        name: newSubjectName.trim(),
        color: newSubjectColor,
        goalHours: parseFloat(newSubjectGoal) || 0,
        iconName: 'BookOpen', // Store icon name as string
        icon: ICON_COMPONENTS['BookOpen'] || BookOpen, // Map the icon component
      };

      const updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects.map(({ icon, ...rest }) => rest))); // Save only serializable data

      // Reset state
      setNewSubjectName('');
      setNewSubjectColor('#6C5DD3');
      setNewSubjectGoal(0);
      setShowAddModal(false);
    }
  };

  const handleEditSubject = () => {
    if (editingSubject) {
      const updatedSubjects = subjects.map(subject =>
        subject.id === editingSubject.id
          ? { ...editingSubject, iconName: subject.iconName, icon: subject.icon }
          : subject
      );
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects.map(({ icon, ...rest }) => rest))); // Save only serializable data
      setEditingSubject(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteSubject = (subjectId) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects.map(({ icon, ...rest }) => rest))); // Save only serializable data
  };





  const getSubjectStudyTime = (subjectName) => {
    const studySessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    return studySessions
      .filter(session => session.subjectName === subjectName)
      .reduce((total, session) => total + session.durationMinutes, 0);
  };

  const getLastStudied = (subjectName) => {
    const studySessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    const subjectSessions = studySessions
      .filter(session => session.subjectName === subjectName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return subjectSessions.length > 0 ? subjectSessions[0].timestamp : null;
  };

  const getSubjectLevel = (studyTime) => {
    return Math.floor(studyTime / 120) + 1;
  };

  const getSubjectProgress = (studyTime, goalHours) => {
    const goalMinutes = goalHours * 60;
    return goalMinutes > 0 ? Math.min(100, (studyTime / goalMinutes) * 100) : 0;
  };

  const getSubjectBadge = (studyTime) => {
    if (studyTime >= 600) return { icon: '🏆', name: 'Master', color: 'text-yellow-500' };
    if (studyTime >= 300) return { icon: '⭐', name: 'Expert', color: 'text-purple-500' };
    if (studyTime >= 120) return { icon: '🎯', name: 'Intermediate', color: 'text-blue-500' };
    if (studyTime >= 60) return { icon: '📚', name: 'Beginner', color: 'text-green-500' };
    return { icon: '🌱', name: 'New', color: 'text-gray-500' };
  };

  const availableSubjects = true;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">Subjects</h1>
            <p className="text-white">Manage your study subjects and track progress</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              onClick={() => {
              setNewSubjectName('');
              setNewSubjectColor('#6C5DD3');
              setNewSubjectGoal(0);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subject</span>
          </motion.button>
        </motion.div>  
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const studyTime = getSubjectStudyTime(subject.name);
          const lastStudied = getLastStudied(subject.name);
          const level = getSubjectLevel(studyTime);
          const progress = getSubjectProgress(studyTime, subject.goalHours);
          const badge = getSubjectBadge(studyTime);
          const SubjectIcon = subject.icon; // Already mapped in useEffect

          return (
            <motion.div
               key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-6 border-2 transition-all group"
              style={{ borderColor: subject.color }}
            >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subject.color }}
                    >
                      <SubjectIcon className="w-6 h-6 text-white" />
                    </div>
                  <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{subject.name}</h3>
                      <p className={`text-sm text-gray-300`}>{badge.icon} {badge.name} • Level {level}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingSubject({ ...subject, iconName: subject.iconName });
                      setShowEditModal(true);
                      }}
                    className="p-2 rounded-lg text-white opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteSubject(subject.id)}
                    className="p-2 rounded-lg text-white opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Study Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Total Studied</span>
                  <span className="font-semibold text-white">
                      {Math.round(studyTime / 60)}h {Math.round(studyTime % 60)}m
                    </span>
                  </div>
                  
                  {subject.goalHours > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">Weekly Goal</span>
                      <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
                      </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  )}

                  {lastStudied && (
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Last Studied</span>
                    <span className="text-sm text-gray-300">
                        {new Date(lastStudied).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

              {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartTimer(subject.name)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-white/10 text-white hover:bg-white/20"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Timer</span>
                  </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No subjects yet</h3>
          <p className="text-gray-300 mb-6">Add your first subject to start tracking your study progress</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Add Your First Subject
          </motion.button>
        </motion.div>
      )}

      {/* Add Subjects Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-700/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Add Subjects</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-300 mb-6">
                Create your own custom subject by providing a name, color, and an optional weekly goal.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Advanced Astrophysics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject Color</label>
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="w-full h-10 rounded-lg border-none overflow-hidden cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weekly Goal (hours)</label>
                  <input
                    type="number"
                    value={newSubjectGoal}
                    onChange={(e) => setNewSubjectGoal(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSubjectName('');
                    setNewSubjectColor('#6C5DD3');
                    setNewSubjectGoal(0);
                  }}
                  className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddSubjects}
                  disabled={newSubjectName.trim() === ''}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    newSubjectName.trim() !== ''
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Subject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {showEditModal && editingSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-md border border-purple-700/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Subject</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
                <input
                    type="text"
                    value={editingSubject.name}
                    disabled
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-not-allowed"
                />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weekly Goal (hours)</label>
                <input
                  type="number"
                    value={editingSubject.goalHours}
                    onChange={(e) => setEditingSubject({
                      ...editingSubject,
                      goalHours: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                  onClick={handleEditSubject}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                  Save Changes
              </motion.button>
            </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default Subjects;
