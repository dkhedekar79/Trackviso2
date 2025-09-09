import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  BookOpen,
  Star,
  Trophy,
  Award,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useGamification } from '../context/GamificationContext';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#6C5DD3', goalHours: 0 });
  const navigate = useNavigate();
  const { setTimerSubject } = useTimer();
  const { userStats } = useGamification();

  // Load subjects from Supabase
  useEffect(() => {
    const loadSubjects = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const mappedSubjects = (data || []).map(s => ({
          id: s.id,
          name: s.name,
          color: s.color,
          goalHours: Number(s.goal_hours) || 0,
        }));
        
        setSubjects(mappedSubjects);
      } catch (e) {
        console.error('Failed loading subjects:', e);
        // Fallback to localStorage
        const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
        setSubjects(savedSubjects);
      }
    };

    loadSubjects();
  }, [user?.id]);

  const handleStartTimer = (subjectName) => {
    setTimerSubject(subjectName);
    navigate(`/study?subject=${encodeURIComponent(subjectName)}`);
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim() || !user?.id) return;
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: newSubject.name.trim(),
          color: newSubject.color,
          goal_hours: newSubject.goalHours,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSubjectWithId = {
        id: data.id,
        name: data.name,
        color: data.color,
        goalHours: Number(data.goal_hours) || 0,
      };
      
      setSubjects(prev => [newSubjectWithId, ...prev]);
      setNewSubject({ name: '', color: '#6C5DD3', goalHours: 0 });
      setShowModal(false);
    } catch (e) {
      console.error('Failed adding subject:', e);
      // Fallback to localStorage
      const updatedSubjects = [...subjects, { ...newSubject, id: Date.now() }];
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      setNewSubject({ name: '', color: '#6C5DD3', goalHours: 0 });
      setShowModal(false);
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject?.name.trim() || !user?.id) return;
    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: editingSubject.name.trim(),
          color: editingSubject.color,
          goal_hours: editingSubject.goalHours,
        })
        .eq('id', editingSubject.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? editingSubject : s));
      setEditingSubject(null);
      setShowModal(false);
    } catch (e) {
      console.error('Failed updating subject:', e);
      // Fallback to localStorage
      const updatedSubjects = subjects.map(subject =>
        subject.id === editingSubject.id ? editingSubject : subject
      );
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      setEditingSubject(null);
      setShowModal(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
    } catch (e) {
      console.error('Failed deleting subject:', e);
      // Fallback to localStorage
      const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    }
  };

  const getSubjectStudyTime = (subjectName) => {
    // Use userStats.sessionHistory from GamificationContext (already synced with Supabase)
    const studySessions = userStats?.sessionHistory || [];
    return studySessions
      .filter(session => session.subjectName === subjectName)
      .reduce((total, session) => total + session.durationMinutes, 0);
  };

  const getLastStudied = (subjectName) => {
    // Use userStats.sessionHistory from GamificationContext (already synced with Supabase)
    const studySessions = userStats?.sessionHistory || [];
    const subjectSessions = studySessions
      .filter(session => session.subjectName === subjectName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return subjectSessions.length > 0 ? subjectSessions[0].timestamp : null;
  };

  const getSubjectLevel = (studyTime) => {
    // Calculate level based on study time (1 level per 2 hours)
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

  const calculateLuminance = (hex) => {
    const rgb = hex.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(v, 16));
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] min-h-screen mt-20 pl-[100px] pr-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Subjects</h1>
          <p className="text-gray-600">Manage your study subjects and track progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#6C5DD3] text-white rounded-xl font-semibold shadow-lg hover:bg-[#7A6AD9] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </motion.button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const studyTime = getSubjectStudyTime(subject.name);
          const lastStudied = getLastStudied(subject.name);
          const level = getSubjectLevel(studyTime);
          const progress = getSubjectProgress(studyTime, subject.goalHours);
          const badge = getSubjectBadge(studyTime);
          const textColor = calculateLuminance(subject.color) > 0.5 ? 'text-gray-800' : 'text-white';

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl shadow-lg"
              style={{ backgroundColor: subject.color }}
            >
              {/* Subject Badge */}
              <div className="absolute top-3 right-3">
                <div className={`${badge.color} text-2xl`}>{badge.icon}</div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${textColor} mb-1`}>{subject.name}</h3>
                    <p className={`text-sm ${textColor} opacity-80`}>{badge.name} Level {level}</p>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingSubject(subject);
                        setShowModal(true);
                      }}
                      className={`p-2 rounded-lg ${textColor} opacity-70 hover:opacity-100 transition-opacity`}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteSubject(subject.id)}
                      className={`p-2 rounded-lg ${textColor} opacity-70 hover:opacity-100 transition-opacity`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Study Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textColor} opacity-80`}>Total Studied</span>
                    <span className={`font-semibold ${textColor}`}>
                      {Math.round(studyTime / 60)}h {Math.round(studyTime % 60)}m
                    </span>
                  </div>
                  
                  {subject.goalHours > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm ${textColor} opacity-80`}>Weekly Goal</span>
                        <span className={`text-sm ${textColor} opacity-80`}>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-black bg-opacity-20 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-white bg-opacity-80 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  )}

                  {lastStudied && (
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${textColor} opacity-80`}>Last Studied</span>
                      <span className={`text-sm ${textColor} opacity-80`}>
                        {new Date(lastStudied).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartTimer(subject.name)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                      textColor === 'text-white' 
                        ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                        : 'bg-black bg-opacity-10 text-gray-800 hover:bg-opacity-20'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Timer</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                      textColor === 'text-white' 
                        ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                        : 'bg-black bg-opacity-10 text-gray-800 hover:bg-opacity-20'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No subjects yet</h3>
          <p className="text-gray-500 mb-6">Add your first subject to start tracking your study progress</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl font-semibold shadow-lg hover:bg-[#7A6AD9] transition-colors"
          >
            Add Your First Subject
          </motion.button>
        </motion.div>
      )}

      {/* Add/Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={editingSubject ? editingSubject.name : newSubject.name}
                  onChange={(e) => {
                    if (editingSubject) {
                      setEditingSubject({ ...editingSubject, name: e.target.value });
                    } else {
                      setNewSubject({ ...newSubject, name: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent"
                  placeholder="Enter subject name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  value={editingSubject ? editingSubject.color : newSubject.color}
                  onChange={(e) => {
                    if (editingSubject) {
                      setEditingSubject({ ...editingSubject, color: e.target.value });
                    } else {
                      setNewSubject({ ...newSubject, color: e.target.value });
                    }
                  }}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Goal (hours)</label>
                <input
                  type="number"
                  value={editingSubject ? editingSubject.goalHours : newSubject.goalHours}
                  onChange={(e) => {
                    if (editingSubject) {
                      setEditingSubject({ ...editingSubject, goalHours: parseFloat(e.target.value) || 0 });
                    } else {
                      setNewSubject({ ...newSubject, goalHours: parseFloat(e.target.value) || 0 });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent"
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
                  setShowModal(false);
                  setEditingSubject(null);
                  setNewSubject({ name: '', color: '#6C5DD3', goalHours: 0 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={editingSubject ? handleEditSubject : handleAddSubject}
                className="flex-1 px-4 py-2 bg-[#6C5DD3] text-white rounded-lg font-semibold hover:bg-[#7A6AD9] transition-colors"
              >
                {editingSubject ? 'Save Changes' : 'Add Subject'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
