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
  BookText,
  Book,
  Dna,
  FlaskConical,
  Atom,
  Scroll,
  Globe,
  Languages,
  Code2,
  Palette,
  Church,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { useGamification } from '../context/GamificationContext';

// Fixed list of 15 most common GCSE subjects with predefined colors and icons
const GCSE_SUBJECTS = [
  { name: 'Mathematics', color: '#6C5DD3', icon: Calculator },
  { name: 'English Language', color: '#B6E4CF', icon: BookText },
  { name: 'English Literature', color: '#FEC260', icon: Book },
  { name: 'Biology', color: '#4ECDC4', icon: Dna },
  { name: 'Chemistry', color: '#FF6B6B', icon: FlaskConical },
  { name: 'Physics', color: '#95E1D3', icon: Atom },
  { name: 'History', color: '#F38181', icon: Scroll },
  { name: 'Geography', color: '#AA96DA', icon: Globe },
  { name: 'French', color: '#C5E3F6', icon: Languages },
  { name: 'Spanish', color: '#FCBAD3', icon: Languages },
  { name: 'German', color: '#FFD93D', icon: Languages },
  { name: 'Computer Science', color: '#6BCB77', icon: Code2 },
  { name: 'Art & Design', color: '#FF6B9D', icon: Palette },
  { name: 'Religious Studies', color: '#C7CEEA', icon: Church },
  { name: 'Business Studies', color: '#FFB347', icon: TrendingUp },
];

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [goalHours, setGoalHours] = useState({});
  const navigate = useNavigate();
  const { setTimerSubject } = useTimer();
  const { userStats } = useGamification();

  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    setSubjects(savedSubjects);
  }, []);

  // Get available subjects (not yet selected)
  const getAvailableSubjects = () => {
    const selectedNames = subjects.map(s => s.name);
    return GCSE_SUBJECTS.filter(subject => !selectedNames.includes(subject.name));
  };

  const handleStartTimer = (subjectName) => {
    setTimerSubject(subjectName);
    navigate(`/study?subject=${encodeURIComponent(subjectName)}`);
  };

  const handleAddSubjects = () => {
    if (selectedSubjects.length > 0) {
      const newSubjects = selectedSubjects.map(subjectName => {
        const subjectData = GCSE_SUBJECTS.find(s => s.name === subjectName);
        return {
          id: Date.now() + Math.random(),
          name: subjectName,
          color: subjectData.color,
          goalHours: goalHours[subjectName] || 0
        };
      });
      
      const updatedSubjects = [...subjects, ...newSubjects];
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      
      // Reset state
      setSelectedSubjects([]);
      setGoalHours({});
      setShowAddModal(false);
    }
  };

  const handleEditSubject = () => {
    if (editingSubject) {
      const updatedSubjects = subjects.map(subject =>
        subject.id === editingSubject.id ? editingSubject : subject
      );
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      setEditingSubject(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteSubject = (subjectId) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
  };

  const toggleSubjectSelection = (subjectName) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName)
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleGoalHoursChange = (subjectName, hours) => {
    setGoalHours(prev => ({
      ...prev,
      [subjectName]: parseFloat(hours) || 0
    }));
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

  const availableSubjects = getAvailableSubjects();

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
          {availableSubjects.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subject</span>
          </motion.button>
          )}
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
          const subjectData = GCSE_SUBJECTS.find(s => s.name === subject.name);
          const SubjectIcon = subjectData?.icon || BookOpen;

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
                        setEditingSubject(subject);
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
                Select the subjects you'd like to add. You can set weekly goals for each one.
              </p>

              {availableSubjects.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">All subjects added!</h3>
                  <p className="text-gray-300">You've already added all available GCSE subjects.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {availableSubjects.map((subject) => {
                      const Icon = subject.icon;
                      return (
                        <motion.div
                          key={subject.name}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                            selectedSubjects.includes(subject.name)
                              ? 'bg-purple-600/30 border-purple-400 shadow-lg shadow-purple-500/20'
                              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          }`}
                          onClick={() => toggleSubjectSelection(subject.name)}
                        >
                          {/* Checkbox indicator */}
                          <div className="absolute top-2 right-2">
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                selectedSubjects.includes(subject.name)
                                  ? 'bg-purple-500 border-purple-400'
                                  : 'border-gray-400 bg-white/10'
                              }`}
                            >
                              {selectedSubjects.includes(subject.name) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: subject.color }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Subject Name */}
                          <span className="text-white font-semibold text-sm text-center">
                            {subject.name}
                          </span>

                          {/* Goal input for selected subjects */}
                          {selectedSubjects.includes(subject.name) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                <input
                                type="number"
                                value={goalHours[subject.name] || ''}
                                onChange={(e) => handleGoalHoursChange(subject.name, e.target.value)}
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Goal (hrs)"
                                min="0"
                                step="0.5"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedSubjects([]);
                        setGoalHours({});
                      }}
                      className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddSubjects}
                      disabled={selectedSubjects.length === 0}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                        selectedSubjects.length > 0
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add {selectedSubjects.length > 0 ? `${selectedSubjects.length} ` : ''}Subject{selectedSubjects.length !== 1 ? 's' : ''}
                    </motion.button>
                  </div>
                </>
              )}
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
