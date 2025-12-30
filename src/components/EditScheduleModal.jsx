import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, Loader2 } from 'lucide-react';
import { generateAISchedule } from '../utils/scheduleGeneratorApi';

export default function EditScheduleModal({ 
  isOpen, 
  onClose, 
  schedule, 
  onScheduleUpdated 
}) {
  const [instructions, setInstructions] = useState(schedule?.setupData?.instructions || '');
  const [busyTimes, setBusyTimes] = useState(schedule?.setupData?.busyTimes || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  if (!schedule || !schedule.setupData) {
    return null;
  }

  const handleRegenerate = async () => {
    if (!instructions.trim() && !busyTimes.trim()) {
      setError('Please provide at least some instructions or busy times to regenerate the schedule.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Get the original setup data
      const originalSetupData = schedule.setupData;
      
      // Create updated schedule data with new instructions
      const updatedScheduleData = {
        ...originalSetupData,
        instructions: instructions.trim() || originalSetupData.instructions,
        busyTimes: busyTimes.trim() || originalSetupData.busyTimes,
      };

      // Generate new schedule with updated instructions
      const generatedSchedule = await generateAISchedule(updatedSetupData);
      
      // Convert AI schedule to blocks format (same as in AIScheduleSetup)
      const blocks = [];
      generatedSchedule.schedule.forEach(day => {
        day.sessions.forEach((session, sessionIndex) => {
          const [hours, minutes] = session.startTime.split(':').map(Number);
          let category = '';
          if (hours >= 0 && hours < 12) {
            category = 'Morning';
          } else if (hours >= 12 && hours < 17) {
            category = 'Afternoon';
          } else {
            category = 'Evening';
          }

          blocks.push({
            id: `block-${Date.now()}-${Math.random()}-${sessionIndex}`,
            day: day.date,
            category,
            type: session.type === 'break' ? 'Break' : 'Study',
            name: `${session.subject} - ${session.topic}`,
            description: `AI-generated session: ${session.type}`,
            subject: session.subject,
            topic: session.topic,
            topicId: session.topicId,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            priority: session.priority,
            detailedPlan: session.detailedPlan,
            resources: session.resources || [],
            color: session.type === 'break' ? 'grey' : 'green',
            recurrence: 'None',
            completed: false,
          });
        });
      });

      // Update the schedule
      const updatedSchedule = {
        ...schedule,
        blocks,
        setupData: updatedScheduleData,
        aiSummary: generatedSchedule.summary,
        updatedAt: new Date().toISOString(),
      };

      // Call the callback to update the schedule
      onScheduleUpdated(updatedSchedule);
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error regenerating schedule:', err);
      setError(err.message || 'Failed to regenerate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[120] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/30 w-full max-w-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/30">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Edit & Regenerate Schedule</h3>
                  <p className="text-white/60 text-sm mt-1">Update your instructions to modify the timetable</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Busy Times
                </label>
                <textarea
                  rows="4"
                  className="w-full bg-slate-800/50 border border-purple-500/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="e.g., Mondays 2pm-4pm (sports), Fridays 6pm-8pm (dinner with family), Weekends 10am-12pm (gym)"
                  value={busyTimes}
                  onChange={(e) => setBusyTimes(e.target.value)}
                  disabled={isGenerating}
                />
                <p className="text-white/50 text-xs mt-1">Describe when you're typically unavailable for studying</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Additional Instructions
                </label>
                <div className="relative">
                  <textarea
                    rows="6"
                    className="w-full bg-slate-800/50 border-2 border-purple-500/40 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/60 resize-none shadow-lg shadow-purple-500/20 transition-all relative z-10"
                    placeholder="e.g., I want more morning sessions, reduce break times, focus more on Math, add more review sessions..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={isGenerating}
                    style={{
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(139, 92, 246, 0.05)'
                    }}
                  />
                </div>
                <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 text-xs font-medium">
                    <strong>💡 Important:</strong> Describe what changes you want to make to your schedule. 
                    The AI will regenerate the entire timetable based on your new instructions. 
                    You can request major changes (e.g., "completely restructure my schedule") or minor tweaks (e.g., "add 15 more minutes to Math sessions").
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-purple-500/30 bg-white/5 flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || (!instructions.trim() && !busyTimes.trim())}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Regenerate Schedule
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

