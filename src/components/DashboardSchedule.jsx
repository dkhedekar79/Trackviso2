import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, Coffee, Zap, ChevronRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function DashboardSchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSchedule, setActiveSchedule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Load active schedule
    const savedSchedules = localStorage.getItem("aiSchedules");
    if (savedSchedules) {
      const schedules = JSON.parse(savedSchedules);
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Find a schedule that covers today
      const current = schedules.find(s => 
        todayStr >= s.startDate && todayStr <= s.endDate && s.isAIGenerated
      ) || schedules[0]; // Fallback to most recent if none cover today perfectly
      
      setActiveSchedule(current);
    }

    return () => clearInterval(interval);
  }, []);

  const relevantBlocks = useMemo(() => {
    if (!activeSchedule?.blocks) return [];

    const todayStr = currentTime.toISOString().split('T')[0];
    const currentHour = currentTime.getHours();
    
    // Get blocks for today
    const todaysBlocks = activeSchedule.blocks.filter(b => b.day === todayStr);
    
    // Define the 3-hour window
    const startHour = currentHour - 1;
    const endHour = currentHour + 1;

    // Filter and sort blocks that overlap with [currentHour - 1, currentHour + 1]
    return todaysBlocks.filter(block => {
      const blockStartMin = timeToMinutes(block.startTime);
      const blockEndMin = timeToMinutes(block.endTime);
      
      const windowStartMin = (currentHour - 1) * 60;
      const windowEndMin = (currentHour + 2) * 60; // Show anything that touches the window from hour-1 to hour+1
      
      return (blockStartMin < windowEndMin && blockEndMin > windowStartMin);
    }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [activeSchedule, currentTime]);

  const handleBlockClick = (block) => {
    if (block.type?.toLowerCase() === 'break') return;
    navigate('/study', {
      state: {
        duration: block.duration,
        subject: block.subject,
        topic: block.topic,
        isFromSchedule: true
      }
    });
  };

  if (!activeSchedule) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-700/30 rounded-2xl p-5 backdrop-blur-md shadow-xl h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Live Schedule</h2>
        </div>
        <div className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="flex-1 space-y-2 relative overflow-hidden">
        {relevantBlocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-2">
            <Brain className="w-8 h-8 text-slate-600 mb-1 opacity-50" />
            <p className="text-slate-400 text-[10px] italic">No active schedule.</p>
          </div>
        ) : (
          relevantBlocks.slice(0, 2).map((block, index) => {
            const isBreak = block.type?.toLowerCase() === 'break';
            const blockStartMin = timeToMinutes(block.startTime);
            const blockEndMin = timeToMinutes(block.endTime);
            const currentTotalMin = currentTime.getHours() * 60 + currentTime.getMinutes();
            const isCurrent = currentTotalMin >= blockStartMin && currentTotalMin < blockEndMin;
            
            const isTopicIdLeaked = block.topic?.startsWith('topic-');
            const displayName = isTopicIdLeaked ? block.name?.split(' - ')[1] || block.name : block.topic || block.name;
            
            return (
              <motion.div
                key={block.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isBreak && handleBlockClick(block)}
                className={`relative group p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                    : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isBreak ? 'bg-slate-700/50 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {isBreak ? <Coffee className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs truncate max-w-[100px] ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {displayName}
                        </span>
                        {isCurrent && (
                          <span className="flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate">
                        {isBreak ? 'Recovery' : block.subject}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] font-bold text-white/80">
                      {formatTime(block.startTime)}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {block.duration}m
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      
      <div className="mt-2 flex justify-center">
        <button 
          onClick={() => navigate('/schedule')}
          className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
        >
          Schedule hub
        </button>
      </div>
    </motion.div>
  );
}

