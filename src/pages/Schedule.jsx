import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Sun, CloudSun, Moon, 
  Sparkles, Plus, X, BookOpen, Coffee, Calendar,
  Clock, Repeat, Trash2, Edit2, Zap, Brain, ArrowLeft,
  CalendarDays, List
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import SEO from "../components/SEO";
import AIScheduleSetup from "../components/AIScheduleSetup";
import AIScheduleViews from "../components/AIScheduleViews";
import EditScheduleModal from "../components/EditScheduleModal";
import { useSubscription } from "../context/SubscriptionContext";
import { useGamification } from "../context/GamificationContext";
import PremiumUpgradeModal from "../components/PremiumUpgradeModal";

export default function AISchedule() {
  const { canGenerateAISchedule, subscriptionPlan } = useSubscription();
  const { awardScheduleCompletionXP } = useGamification();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const handleToggleComplete = (blockId) => {
    setSchedules(prevSchedules => {
      const updatedSchedules = prevSchedules.map(schedule => {
        const block = schedule.blocks?.find(b => b.id === blockId);
        if (block) {
          const newCompletedStatus = !block.completed;
          
          // Award XP only if marking as completed (not reverting)
          if (newCompletedStatus) {
            awardScheduleCompletionXP(block);
          }

          return {
            ...schedule,
            blocks: schedule.blocks.map(b => 
              b.id === blockId ? { ...b, completed: newCompletedStatus, completedAt: newCompletedStatus ? new Date().toISOString() : null } : b
            )
          };
        }
        return schedule;
      });

      // Update current schedule if it's the one being modified
      if (currentSchedule) {
        const updatedCurrent = updatedSchedules.find(s => s.id === currentSchedule.id);
        if (updatedCurrent) {
          setCurrentSchedule(updatedCurrent);
        }
      }

      return updatedSchedules;
    });
  };

  const handleScheduleUpdate = (updatedSchedule) => {
    setSchedules(prevSchedules => {
      const updatedSchedules = prevSchedules.map(s => 
        s.id === updatedSchedule.id ? updatedSchedule : s
      );
      return updatedSchedules;
    });
    
    // Update current schedule if it's the one being modified
    if (currentSchedule && currentSchedule.id === updatedSchedule.id) {
      setCurrentSchedule(updatedSchedule);
    }
  };

  const handleEditScheduleComplete = (updatedSchedule) => {
    handleScheduleUpdate(updatedSchedule);
    setIsEditModalOpen(false);
  };

  // Calendar view states (when viewing a specific schedule)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [scheduledBlocks, setScheduledBlocks] = useState([]);
  const [selectedBlockType, setSelectedBlockType] = useState('Study');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('None');
  const [blockName, setBlockName] = useState('');
  const [blockDescription, setBlockDescription] = useState('');
  const [blockSubject, setBlockSubject] = useState('');
  const [blockEventName, setBlockEventName] = useState('');
  const [editingBlock, setEditingBlock] = useState(null);
  const [isAISetupOpen, setIsAISetupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // For AI schedules: 'calendar' or 'topics'


  useEffect(() => {
    const savedSchedules = localStorage.getItem("aiSchedules");
    if (savedSchedules) {
      const parsed = JSON.parse(savedSchedules);
      setSchedules(parsed);
    }

    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      setAvailableSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aiSchedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    if (currentSchedule) {
      setScheduledBlocks(currentSchedule.blocks || []);
      // Set week start to the schedule's start date
      const startDate = new Date(currentSchedule.startDate);
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      setCurrentWeekStart(new Date(startDate.setDate(diff)));
    }
  }, [currentSchedule]);

  useEffect(() => {
    if (currentSchedule) {
      // Update the schedule's blocks in the schedules array
      setSchedules(prev => prev.map(s => 
        s.id === currentSchedule.id 
          ? { ...s, blocks: scheduledBlocks }
          : s
      ));
    }
  }, [scheduledBlocks, currentSchedule]);


  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      if (currentSchedule?.id === scheduleId) {
        setCurrentSchedule(null);
      }
    }
  };

  const handleViewSchedule = (schedule) => {
    setCurrentSchedule(schedule);
  };

  const handleAISetupComplete = (newSchedule) => {
    setSchedules(prev => [...prev, newSchedule].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    ));
    setIsAISetupOpen(false);
    setCurrentSchedule(newSchedule);
  };

  const handleAISetupCancel = () => {
    setIsAISetupOpen(false);
  };

  const handleBackToList = () => {
    setCurrentSchedule(null);
  };

  const handlePrevWeek = () => {
    if (!currentSchedule) return;
    const scheduleStart = new Date(currentSchedule.startDate);
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    if (newWeekStart >= scheduleStart) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const handleNextWeek = () => {
    if (!currentSchedule) return;
    const scheduleEnd = new Date(currentSchedule.endDate);
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    const weekEnd = new Date(newWeekStart);
    weekEnd.setDate(newWeekStart.getDate() + 6);
    
    if (weekEnd <= scheduleEnd) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const getWeekDays = (startOfWeek) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = currentSchedule ? getWeekDays(currentWeekStart) : [];

  const handleHourClick = (day, category) => {
    if (!currentSchedule) return;
    const scheduleStart = new Date(currentSchedule.startDate);
    const scheduleEnd = new Date(currentSchedule.endDate);
    
    if (day < scheduleStart || day > scheduleEnd) {
      alert('This date is outside the schedule range');
      return;
    }

    setSelectedTimeSlot({ day, category });
    setIsBlockModalOpen(true);
    setEditingBlock(null);
  };

  const handleCloseBlockModal = () => {
    setIsBlockModalOpen(false);
    setSelectedTimeSlot(null);
    setStartTime('');
    setEndTime('');
    setRecurrence('None');
    setBlockName('');
    setBlockDescription('');
    setBlockSubject('');
    setBlockEventName('');
    setEditingBlock(null);
  };

  const handleAddBlock = () => {
    if (!currentSchedule || !selectedTimeSlot || !startTime || !endTime) return;

    const [hours] = startTime.split(':').map(Number);
      let category = '';
      if (hours >= 0 && hours < 12) {
        category = 'Morning';
      } else if (hours >= 12 && hours < 17) {
        category = 'Afternoon';
      } else {
        category = 'Evening';
      }

      const baseBlock = {
      id: Date.now(),
      day: selectedTimeSlot.day.toISOString().split('T')[0],
        category: category,
        type: selectedBlockType,
      name: blockName || `${selectedBlockType} Block`,
        description: blockDescription,
        subject: selectedBlockType === 'Study' ? blockSubject : undefined,
        eventName: selectedBlockType === 'Event' ? blockEventName : undefined,
        color: selectedBlockType === 'Study' ? 'green' : selectedBlockType === 'Break' ? 'grey' : 'red',
        recurrence: recurrence,
        startTime: startTime,
        endTime: endTime,
      };

      let blocksToAdd = [];

      if (recurrence === 'None') {
        blocksToAdd.push(baseBlock);
      } else if (recurrence === 'Daily') {
      const scheduleEnd = new Date(currentSchedule.endDate);
      let currentDay = new Date(selectedTimeSlot.day);
      let i = 0;
      while (currentDay <= scheduleEnd && i < 30) {
          blocksToAdd.push({
            ...baseBlock,
            id: Date.now() + i,
          day: currentDay.toISOString().split('T')[0],
          });
        currentDay.setDate(currentDay.getDate() + 1);
        i++;
        }
      } else if (recurrence === 'Weekly') {
      const scheduleEnd = new Date(currentSchedule.endDate);
      let currentDay = new Date(selectedTimeSlot.day);
      let i = 0;
      while (currentDay <= scheduleEnd && i < 4) {
          blocksToAdd.push({
            ...baseBlock,
            id: Date.now() + i,
          day: currentDay.toISOString().split('T')[0],
        });
        currentDay.setDate(currentDay.getDate() + 7);
        i++;
      }
    }

    setScheduledBlocks((prevBlocks) => [...prevBlocks, ...blocksToAdd]);
    handleCloseBlockModal();
  };

  const handleEditBlock = (block) => {
    setEditingBlock(block);
    setSelectedBlockType(block.type);
    setBlockName(block.name);
    setBlockDescription(block.description || '');
    setBlockSubject(block.subject || '');
    setBlockEventName(block.eventName || '');
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setRecurrence(block.recurrence || 'None');
    setIsBlockModalOpen(true);
  };

  const handleUpdateBlock = () => {
    if (editingBlock) {
      setScheduledBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === editingBlock.id
            ? {
                ...block,
                name: blockName || `${selectedBlockType} Block`,
                description: blockDescription,
                subject: selectedBlockType === 'Study' ? blockSubject : undefined,
                eventName: selectedBlockType === 'Event' ? blockEventName : undefined,
                startTime: startTime,
                endTime: endTime,
                recurrence: recurrence,
                type: selectedBlockType,
              }
            : block
        )
      );
      handleCloseBlockModal();
    }
  };

  const handleDeleteBlock = (blockId) => {
    setScheduledBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== blockId));
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthDay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Schedules List View
  if (!currentSchedule) {
    // Filter to only show AI-generated schedules
    const aiSchedules = schedules.filter(s => s.isAIGenerated);

  return (
      <>
        <SEO title="AI Schedule - Trackviso" description="AI-powered study schedule planner" />
        <Sidebar />
    <motion.div
      className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </motion.div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    AI Schedule
                  </h1>
                  <p className="text-white/70 text-lg">
                    AI-powered intelligent study timetables
                  </p>
                </div>
              </div>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (canGenerateAISchedule()) {
                    setIsAISetupOpen(true);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-6 h-6" />
                {subscriptionPlan === 'professor' 
                  ? 'Create Timetable' 
                  : canGenerateAISchedule() 
                    ? 'Create Free Timetable' 
                    : 'Unlock Unlimited Schedules'
                }
              </motion.button>
            </div>
          </div>

          {/* Schedules List */}
          <div className="space-y-4">
            {aiSchedules.length === 0 ? (
              <motion.div
                className="text-center py-20 bg-slate-900/30 rounded-2xl border border-purple-500/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Brain className="w-20 h-20 text-purple-400/50 mx-auto mb-6" />
                <p className="text-white/70 text-xl mb-2 font-semibold">No timetables yet</p>
                  <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                    {subscriptionPlan === 'professor' 
                      ? "Create unlimited AI-generated timetables. Our AI will analyze your subjects, topics, confidence levels, and availability to create the perfect study schedule."
                      : "Create your first AI-generated timetable for free. Our AI will analyze your subjects, topics, confidence levels, and availability to create the perfect study schedule."
                    }
                  </p>
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canGenerateAISchedule()) {
                      setIsAISetupOpen(true);
                    } else {
                      setShowUpgradeModal(true);
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all text-lg shadow-lg shadow-violet-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-5 h-5 inline mr-2" />
                  {subscriptionPlan === 'professor' 
                    ? 'Create Timetable' 
                    : canGenerateAISchedule() 
                      ? 'Create Free Timetable' 
                      : 'Unlock Unlimited Schedules'
                  }
                </motion.button>
              </motion.div>
            ) : (
              aiSchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group"
                  onClick={() => handleViewSchedule(schedule)}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30">
                        <Sparkles className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                            {schedule.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-violet-600/30 text-violet-300 text-xs rounded-lg font-semibold">
                            AI Generated
                          </span>
                        </div>
                        <p className="text-purple-300 font-medium">
                          {formatDateRange(schedule.startDate, schedule.endDate)}
                        </p>
                        {schedule.aiSummary && (
                          <div className="space-y-1 mt-1">
                            <p className="text-white/50 text-sm">
                              {schedule.aiSummary.totalStudySessions || 0} study sessions • {schedule.aiSummary.totalBreakSessions || 0} breaks
                            </p>
                            {schedule.aiSummary.aiStrategyNote && (
                              <p className="text-violet-400/80 text-xs italic">
                                "{schedule.aiStrategyNote || schedule.aiSummary.aiStrategyNote}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
        <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSchedule(schedule);
                        }}
                        className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition-all opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
                        <List className="w-5 h-5" />
        </motion.button>
        <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(schedule.id);
                        }}
                        className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 transition-all opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
                        <Trash2 className="w-5 h-5" />
        </motion.button>
                    </div>
                  </div>
                    </motion.div>
              ))
                  )}
          </div>

        </motion.div>

        {/* AI Setup Modal - Must be outside the conditional return */}
        <AnimatePresence>
          {isAISetupOpen && (
            <AIScheduleSetup
              onComplete={handleAISetupComplete}
              onCancel={handleAISetupCancel}
              availableSubjects={availableSubjects}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Calendar View (when viewing a specific schedule)
  return (
    <>
      <SEO title={`${currentSchedule.name} - AI Schedule`} description="AI-powered study schedule planner" />
      <Sidebar />
    <motion.div
      className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleBackToList}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-purple-500/30 transition-all"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-5 h-5 text-purple-400" />
              </motion.button>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {currentSchedule.name}
                </h1>
                <p className="text-white/70 text-lg">
                  {formatDateRange(currentSchedule.startDate, currentSchedule.endDate)}
                </p>
              </div>
            </div>
            {currentSchedule?.isAIGenerated && (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Edit & Regenerate
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* AI Schedule Views (only for AI-generated schedules) */}
        {currentSchedule?.isAIGenerated ? (
          <AIScheduleViews 
            schedule={currentSchedule} 
            onToggleComplete={handleToggleComplete}
            onScheduleUpdate={handleScheduleUpdate}
          />
        ) : (
          // Fallback for non-AI schedules (shouldn't happen, but just in case)
          <div className="text-center py-12 text-white/50">
            <p>This schedule was not AI-generated. Please create a new AI timetable.</p>
          </div>
        )}

        {/* Block Modal - Same as before */}
        <AnimatePresence>
          {isBlockModalOpen && (
        <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
              onClick={handleCloseBlockModal}
        >
          <motion.div
                className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-purple-500/30"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                      {editingBlock ? 'Edit Block' : 'Add Block'}
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseBlockModal}
                    className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Block Type Selection */}
                <div className="flex justify-center space-x-3 mb-6">
                  {['Study', 'Break', 'Event'].map((type) => (
              <motion.button
                      key={type}
                      className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                        selectedBlockType === type
                          ? type === 'Study'
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                            : type === 'Break'
                            ? 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg shadow-slate-500/30'
                            : 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
                      }`}
                      onClick={() => setSelectedBlockType(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                      {type === 'Study' && <BookOpen className="w-4 h-4" />}
                      {type === 'Break' && <Coffee className="w-4 h-4" />}
                      {type === 'Event' && <Calendar className="w-4 h-4" />}
                      {type}
              </motion.button>
                  ))}
            </div>

            <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Block Name</label>
                <input
                  type="text"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter block name"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                />
              </div>

              {selectedBlockType === 'Study' && (
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Subject</label>
                  <select
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    value={blockSubject}
                    onChange={(e) => setBlockSubject(e.target.value)}
                  >
                        <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedBlockType === 'Event' && (
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Event Name</label>
                  <input
                    type="text"
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Enter event name"
                    value={blockEventName}
                    onChange={(e) => setBlockEventName(e.target.value)}
                  />
                </div>
              )}

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Description</label>
                <textarea
                  rows="3"
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Add a description..."
                  value={blockDescription}
                  onChange={(e) => setBlockDescription(e.target.value)}
                    />
              </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Start Time
                      </label>
                  <input
                    type="time"
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        End Time
                      </label>
                  <input
                    type="time"
                        className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Recurrence
                    </label>
                <select
                      className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  <option>None</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
            </div>

                <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                    className="py-2 px-6 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors text-white"
                    onClick={handleCloseBlockModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                    className="py-2 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg text-sm font-semibold transition-all text-white shadow-lg shadow-violet-500/30"
                onClick={editingBlock ? handleUpdateBlock : handleAddBlock}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                    {editingBlock ? 'Update' : 'Save'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
        </AnimatePresence>
    </motion.div>

      {/* AI Setup Modal */}
      <AnimatePresence>
        {isAISetupOpen && (
          <AIScheduleSetup
            onComplete={handleAISetupComplete}
            onCancel={handleAISetupCancel}
            availableSubjects={availableSubjects}
          />
        )}
      </AnimatePresence>

      {/* Edit Schedule Modal */}
      {currentSchedule && (
        <EditScheduleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          schedule={currentSchedule}
          onScheduleUpdated={handleEditScheduleComplete}
        />
      )}

      <PremiumUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
      />

    </>
  );
}
