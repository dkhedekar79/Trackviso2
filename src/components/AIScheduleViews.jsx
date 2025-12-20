import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, List, Clock, BookOpen, Coffee, Zap, ChevronLeft, ChevronRight, PieChart, Info, Sparkles, X, ArrowRight, ExternalLink } from "lucide-react";

// Helper functions defined before component to avoid ReferenceErrors
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

const calculateDuration = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end - start;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function AIScheduleViews({ schedule }) {
  const [viewMode, setViewMode] = useState('hour'); // 'hour', 'topics', or 'overview'
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const navigate = useNavigate();

  const handleStartStudying = (block) => {
    // Navigate to study page with subject in URL and other details in state
    navigate(`/study?subject=${encodeURIComponent(block.subject)}`, { 
      state: { 
        duration: block.duration,
        subject: block.subject,
        topic: block.topic,
        isFromSchedule: true
      } 
    });
  };

  // Convert blocks to organized format
  const organizedSchedule = useMemo(() => {
    if (!schedule?.blocks) return { days: [], topicsMap: {}, hourGrid: {} };

    // Group blocks by day
    const daysMap = {};
    const topicsMap = {};
    const hourGrid = {}; // { date: { hour: [blocks] } }

    schedule.blocks.forEach(block => {
      if (!daysMap[block.day]) {
        daysMap[block.day] = [];
      }
      daysMap[block.day].push(block);

      // Track topics (skip breaks)
      if (block.type?.toLowerCase() !== 'break') {
        // Robust ID: Use name-based key to ENSURE no duplicates in view
        // Fallback: if topic starts with "topic-", it's likely an ID leak, use name instead
        const isTopicIdLeaked = block.topic?.startsWith('topic-');
        const displayName = isTopicIdLeaked ? block.name?.split(' - ')[1] || block.name : block.topic || block.name;
        
        const normalizedName = (displayName || '').toLowerCase().trim();
        const subjectName = (block.subject || '').toLowerCase().trim();
        const topicKey = `${subjectName}-${normalizedName}`;
        
        if (!topicsMap[topicKey]) {
          topicsMap[topicKey] = {
            id: topicKey,
            originalId: block.topicId,
            name: displayName,
            subject: block.subject,
            sessions: [],
            totalMinutes: 0
          };
        }
        const duration = block.duration || calculateDuration(block.startTime, block.endTime);
        topicsMap[topicKey].sessions.push({
          day: block.day,
          startTime: block.startTime,
          endTime: block.endTime,
          duration: duration,
        });
        topicsMap[topicKey].totalMinutes += duration;
      }

      // Add to hour grid - show what's happening at each hour
      if (!hourGrid[block.day]) {
        hourGrid[block.day] = {};
      }
      const startHour = parseInt(block.startTime.split(':')[0]);
      const startMinutes = parseInt(block.startTime.split(':')[1]);
      const endHour = parseInt(block.endTime.split(':')[0]);
      const endMinutes = parseInt(block.endTime.split(':')[1]);
      
      // Add block to each hour it spans
      for (let hour = startHour; hour <= endHour; hour++) {
        if (!hourGrid[block.day][hour]) {
          hourGrid[block.day][hour] = [];
        }
        
        let hourStart = hour === startHour ? block.startTime : `${hour.toString().padStart(2, '0')}:00`;
        let hourEnd = hour === endHour ? block.endTime : `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        const hourStartMinutes = timeToMinutes(hourStart);
        const hourEndMinutes = timeToMinutes(hourEnd);
        const blockStartMinutes = timeToMinutes(block.startTime);
        const blockEndMinutes = timeToMinutes(block.endTime);
        
        if (hourStartMinutes < blockEndMinutes && hourEndMinutes > blockStartMinutes) {
          hourGrid[block.day][hour].push({
            ...block,
            hourStart,
            hourEnd,
            isPartialStart: hour === startHour && startMinutes > 0,
            isPartialEnd: hour === endHour && endMinutes < 60,
          });
        }
      }
    });

    // Convert to array and sort by date
    const days = Object.entries(daysMap)
      .map(([date, blocks]) => ({
        date,
        blocks: blocks.sort((a, b) => {
          const timeA = timeToMinutes(a.startTime);
          const timeB = timeToMinutes(b.startTime);
          return timeA - timeB;
        }),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { days, topicsMap: Object.values(topicsMap), hourGrid };
  }, [schedule]);

  // Get all unique dates split into weeks
  const weeks = useMemo(() => {
    if (!schedule?.blocks) return [];
    const dates = [...new Set(schedule.blocks.map(b => b.day))].sort((a, b) => new Date(a) - new Date(b));
    const chunks = [];
    for (let i = 0; i < dates.length; i += 7) {
      chunks.push(dates.slice(i, i + 7));
    }
    return chunks;
  }, [schedule]);

  const currentWeekDates = weeks[currentWeekIndex] || [];

  // Generate hours array (6 AM to 11 PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 to 23

  return (
    <div className="space-y-6">
      {/* View Toggle and Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Engineered Timetable</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Week Navigation */}
          {weeks.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-purple-500/30">
              <button
                onClick={() => setCurrentWeekIndex(prev => Math.max(0, prev - 1))}
                disabled={currentWeekIndex === 0}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-white px-2">
                Week {currentWeekIndex + 1} / {weeks.length}
              </span>
              <button
                onClick={() => setCurrentWeekIndex(prev => Math.min(weeks.length - 1, prev + 1))}
                disabled={currentWeekIndex === weeks.length - 1}
                className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-all text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode Toggles */}
          <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1 border border-purple-500/30">
            {[
              { id: 'hour', icon: Clock, label: 'Hours' },
              { id: 'topics', icon: List, label: 'Topics' },
              { id: 'overview', icon: PieChart, label: 'Overview' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                  viewMode === mode.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hour View */}
      {viewMode === 'hour' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 rounded-xl border border-purple-500/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left p-4 text-purple-300 font-semibold sticky left-0 bg-slate-900 z-10 min-w-[80px]">
                    Time
                  </th>
                  {currentWeekDates.map(date => (
                    <th key={date} className="text-center p-4 text-purple-300 font-semibold min-w-[200px]">
                      {formatDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, hourIndex) => {
                  const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                  const displayHour = hour % 12 || 12;
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  
                  return (
                    <motion.tr
                      key={hour}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: hourIndex * 0.02 }}
                      className="border-b border-purple-500/20 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 text-white/70 font-medium sticky left-0 bg-slate-900 z-10">
                        <div className="flex flex-col">
                          <span className="font-semibold">{displayHour}:00 {ampm}</span>
                          <span className="text-xs text-white/40">{hourStr}</span>
                        </div>
                      </td>
                      {currentWeekDates.map(date => {
                        const blocksForThisHour = organizedSchedule.hourGrid[date]?.[hour] || [];
                        
                        return (
                          <td key={date} className="p-2 align-top">
                            {blocksForThisHour.length === 0 ? (
                              <div className="h-20 flex items-center justify-center border border-dashed border-purple-500/10 rounded-lg">
                                <span className="text-white/10 text-xs">-</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {blocksForThisHour.map((block, blockIndex) => {
                                  const duration = calculateDuration(block.hourStart, block.hourEnd);
                                  const durationMinutes = Math.round(duration);
                                  const isBreak = block.type?.toLowerCase() === 'break' || block.topicId === 'small-break' || block.topicId === 'large-break';
                                  const isLargeBreak = block.topicId === 'large-break';
                                  const isTopicIdLeaked = block.topic?.startsWith('topic-');
                                  const displayName = isTopicIdLeaked ? block.name?.split(' - ')[1] || block.name : block.topic || block.name;
                                  
                                  return (
                                    <motion.div
                                      key={block.id || blockIndex}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      whileHover={{ scale: 1.02, y: -2 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setSelectedBlock(block)}
                                      className={`p-3 rounded-lg border text-xs shadow-md cursor-pointer transition-all ${
                                        isLargeBreak
                                          ? 'bg-blue-600/20 border-blue-400/50 text-blue-100'
                                          : isBreak
                                          ? 'bg-slate-700/40 border-slate-500/30 text-slate-200'
                                          : block.priority === 'high'
                                          ? 'bg-red-600/20 border-red-500/50 text-red-200'
                                          : block.priority === 'medium'
                                          ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-200'
                                          : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200'
                                      }`}
                                    >
                                      <div className="font-semibold mb-1 truncate flex items-center gap-1">
                                        {isBreak ? <Coffee className="w-3 h-3" /> : <Zap className="w-3 h-3 text-yellow-400" />}
                                        {displayName}
                                      </div>
                                      {!isBreak && (
                                        <div className="text-[10px] opacity-80 flex items-center gap-1 mb-1 font-medium">
                                          <BookOpen className="w-3 h-3" />
                                          {block.subject}
                                        </div>
                                      )}
                                      <div className="text-[10px] opacity-70 font-medium">
                                        {formatTime(block.hourStart)} - {formatTime(block.hourEnd)}
                                      </div>
                                      {durationMinutes < 60 && (
                                        <div className="text-[10px] opacity-60 mt-1">
                                          {durationMinutes} min
                                        </div>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Topics View */}
      {viewMode === 'topics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 rounded-xl border border-purple-500/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left p-4 text-purple-300 font-semibold sticky left-0 bg-slate-900 z-10">
                    Topic
                  </th>
                  {currentWeekDates.map(date => (
                    <th key={date} className="text-center p-4 text-purple-300 font-semibold min-w-[120px]">
                      {formatDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organizedSchedule.topicsMap.length === 0 ? (
                  <tr>
                    <td colSpan={currentWeekDates.length + 1} className="text-center py-12 text-white/50">
                      No topics scheduled for this week
                    </td>
                  </tr>
                ) : (
                  organizedSchedule.topicsMap.map((topic, index) => (
                    <motion.tr
                      key={topic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-purple-500/20 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 text-white font-medium sticky left-0 bg-slate-900 z-10">
                        <div>
                          <div className="font-semibold">{topic.name}</div>
                          <div className="text-sm text-white/60">{topic.subject}</div>
                        </div>
                      </td>
                      {currentWeekDates.map(date => {
                        const sessions = topic.sessions.filter(s => s.day === date);
                        if (sessions.length === 0) {
                          return (
                            <td key={date} className="p-4 text-center">
                              <span className="text-white/20">-</span>
                            </td>
                          );
                        }
                        return (
                          <td key={date} className="p-4">
                            <div className="flex flex-col gap-2 items-center">
                              {sessions.map((session, sIdx) => {
                                const durationHours = Math.round((session.duration / 60) * 10) / 10;
                                return (
                                  <div key={sIdx} className="w-full inline-flex flex-col items-center gap-1 p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                                    <span className="text-emerald-300 text-xs font-semibold">
                                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                    </span>
                                    <span className="text-emerald-400 text-[10px]">
                                      {durationHours}h
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Overview View */}
      {viewMode === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 p-6 rounded-2xl border border-violet-500/30 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-400/30 text-violet-300">
                  <PieChart className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white">Time Allocation</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/80">Study Time</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {Math.round((schedule.aiSummary?.totalStudyHours || 0) * 10) / 10}h
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80">Rest Time</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">
                    {Math.round((schedule.aiSummary?.totalBreakHours || 0) * 10) / 10}h
                  </span>
                </div>
              </div>

              {schedule.aiSummary?.aiStrategyNote && (
                <div className="mt-8 p-4 bg-violet-600/20 rounded-xl border border-violet-400/30">
                  <div className="flex items-center gap-2 mb-2 text-violet-300">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Strategy Note</span>
                  </div>
                  <p className="text-sm text-white/70 italic leading-relaxed">
                    {schedule.aiSummary.aiStrategyNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Topic Breakdown Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-purple-500/30 h-full shadow-xl">
              <h4 className="text-xl font-bold text-white mb-6">Topic Breakdown</h4>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {organizedSchedule.topicsMap
                  .sort((a, b) => b.totalMinutes - a.totalMinutes)
                  .map((topic, index) => (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-white font-semibold">{topic.name}</span>
                          <span className="text-xs text-white/40 ml-2">{topic.subject}</span>
                        </div>
                        <span className="text-sm font-medium text-purple-300">
                          {Math.round((topic.totalMinutes / 60) * 10) / 10}h
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (topic.totalMinutes / (schedule.aiSummary?.totalStudyHours * 60 || 1)) * 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Block Details Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/30 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-purple-500/30 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      selectedBlock.type?.toLowerCase() === 'break' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                        : 'bg-violet-500/20 text-violet-400 border border-violet-400/30'
                    }`}>
                      {selectedBlock.type?.toLowerCase() === 'break' ? <Coffee className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {selectedBlock.topic?.startsWith('topic-') ? (selectedBlock.name?.split(' - ')[1] || selectedBlock.name) : (selectedBlock.topic || selectedBlock.name)}
                      </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/60 text-sm font-medium">{selectedBlock.subject}</span>
                      <span className="text-white/20">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedBlock.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-400/30' :
                        selectedBlock.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      }`}>
                        {selectedBlock.priority || 'Normal'} Priority
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Time Info */}
                <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Time Range</span>
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      {formatTime(selectedBlock.startTime)} - {formatTime(selectedBlock.endTime)}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</span>
                    <span className="text-white font-semibold">
                      {selectedBlock.duration} minutes
                    </span>
                  </div>
                </div>

                {/* Detailed Plan */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedBlock.type?.toLowerCase() === 'break' ? <Coffee className="w-5 h-5 text-blue-400" /> : <Zap className="w-5 h-5 text-yellow-400" />}
                    {selectedBlock.type?.toLowerCase() === 'break' ? 'Recovery Strategy' : 'Engineered Session Plan'}
                  </h4>
                  <div className={`p-5 rounded-xl leading-relaxed text-white/80 ${
                    selectedBlock.type?.toLowerCase() === 'break' 
                      ? 'bg-blue-600/10 border border-blue-500/30' 
                      : 'bg-violet-600/10 border border-violet-500/30'
                  }`}>
                    {selectedBlock.detailedPlan || (
                      selectedBlock.type?.toLowerCase() === 'break' 
                        ? "This is a functional rest period engineered to clear cognitive load. Move away from your screen, hydrate, and let your brain consolidate what you've just learned."
                        : "AI is finalizing the detailed plan for this session. Focus on the core concepts of this topic and attempt active recall practice."
                    )}
                  </div>
                </div>

                {/* Resources */}
                {selectedBlock.resources && selectedBlock.resources.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-indigo-400" />
                      Engineered Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedBlock.resources.map((res, i) => {
                        const isUrl = typeof res === 'string' && (res.startsWith('http') || res.includes('.com') || res.includes('.org'));
                        const cleanUrl = isUrl ? (res.startsWith('http') ? res : `https://${res}`) : null;
                        
                        let label = res;
                        if (isUrl) {
                          const lowerRes = res.toLowerCase();
                          if (lowerRes.includes('savemyexams')) label = 'SaveMyExams';
                          else if (lowerRes.includes('physicsandmathstutor') || lowerRes.includes('pmt')) label = 'PMT (Resources)';
                          else if (lowerRes.includes('khanacademy')) label = 'Khan Academy';
                          else if (lowerRes.includes('bitesize')) label = 'BBC Bitesize';
                          else label = 'External Resource';
                        }

                        return isUrl ? (
                          <motion.a
                            key={i}
                            href={cleanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold text-indigo-100">{label}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                          </motion.a>
                        ) : (
                          <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            {res}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-purple-500/30 bg-white/5 flex gap-4">
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex-1"
                >
                  Close
                </button>
                {selectedBlock.type?.toLowerCase() !== 'break' && (
                  <button
                    onClick={() => handleStartStudying(selectedBlock)}
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 flex-[2] group"
                  >
                    Start Studying Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
