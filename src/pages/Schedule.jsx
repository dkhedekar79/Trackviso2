import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSun, FaCloudSun, FaMoon } from 'react-icons/fa';

export default function Schedule() {
  const [tasks, setTasks] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(today.setDate(diff));
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [scheduledBlocks, setScheduledBlocks] = useState([]); // New state for scheduled blocks
  const [selectedBlockType, setSelectedBlockType] = useState('Study'); // New state for selected block type in modal
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrence, setRecurrence] = useState('None');
  const [blockName, setBlockName] = useState('');
  const [blockDescription, setBlockDescription] = useState('');
  const [blockSubject, setBlockSubject] = useState('');
  const [blockEventName, setBlockEventName] = useState('');
  const [editingBlock, setEditingBlock] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));

    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      setAvailableSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i); // 0-23 for hours

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthDay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const weekDays = getWeekDays(currentWeekStart);

  const handleHourClick = (day, category) => {
    setSelectedTimeSlot({ day, category });
    setIsModalOpen(true);
    setEditingBlock(null); // Ensure we are adding, not editing
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    if (selectedTimeSlot && startTime && endTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      let category = '';
      if (hours >= 0 && hours < 12) {
        category = 'Morning';
      } else if (hours >= 12 && hours < 17) {
        category = 'Afternoon';
      } else {
        category = 'Evening';
      }

      const baseBlock = {
        id: Date.now(), // Unique ID for the block
        day: selectedTimeSlot.day.toISOString().split('T')[0], // Store date as YYYY-MM-DD
        category: category,
        type: selectedBlockType,
        name: blockName || `${selectedBlockType} Block`, // Use blockName, fallback to default
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
        for (let i = 0; i < 30; i++) {
          const newDay = new Date(selectedTimeSlot.day);
          newDay.setDate(selectedTimeSlot.day.getDate() + i);
          blocksToAdd.push({
            ...baseBlock,
            id: Date.now() + i,
            day: newDay.toISOString().split('T')[0],
          });
        }
      } else if (recurrence === 'Weekly') {
        for (let i = 0; i < 4; i++) {
          const newDay = new Date(selectedTimeSlot.day);
          newDay.setDate(selectedTimeSlot.day.getDate() + (i * 7));
          blocksToAdd.push({
            ...baseBlock,
            id: Date.now() + i,
            day: newDay.toISOString().split('T')[0],
          });
        }
      }

      setScheduledBlocks((prevBlocks) => [...prevBlocks, ...blocksToAdd]);
      console.log(`Adding ${blocksToAdd.length} ${selectedBlockType} block(s) for ${selectedTimeSlot.day.toDateString()} in ${category} section with ${recurrence} recurrence`);
    }
    setStartTime('');
    setEndTime('');
    setRecurrence('None');
    handleCloseModal();
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
    setIsModalOpen(true);
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
      handleCloseModal();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 min-h-screen mt-20 pl-[100px] pr-6 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4" variants={itemVariants}>
      Study Schedule
      </motion.h1>
      <motion.p className="text-white" variants={itemVariants}>
      Plan your week, one block at a time.
      </motion.p>

      <motion.div className="flex justify-center items-center mb-8 space-x-2" variants={itemVariants}>
        <motion.button
          onClick={handlePrevWeek}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaChevronLeft />
        </motion.button>
        <motion.span className="text-lg font-semibold">
          {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' '}{currentWeekStart.getFullYear()}
        </motion.span>
        <motion.button
          onClick={handleNextWeek}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaChevronRight />
        </motion.button>
      </motion.div>

      <motion.div className="grid grid-cols-7 gap-4 mb-8" variants={containerVariants}>
        {weekDays.map((day, index) => (
          <motion.div key={index} className="text-center" variants={itemVariants}>
            <div className="font-bold text-xl text-blue-200">{getDayName(day)}</div>
            <div className="text-sm text-gray-400">{getMonthDay(day)}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Time Categories */}
      {['Morning (12 am-12 pm)', 'Afternoon (12 pm-5 pm)', 'Evening (5 pm-12 am)'].map((category, catIndex) => (
        <motion.div key={catIndex} className="mb-8" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 text-purple-300 flex items-center">
            {category.includes('Morning') && <FaSun className="mr-2 text-yellow-400" />}
            {category.includes('Afternoon') && <FaCloudSun className="mr-2 text-blue-400" />}
            {category.includes('Evening') && <FaMoon className="mr-2 text-purple-400" />}
            {category}
          </h2>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, dayIndex) => {
              const categoryName = category.split(' ')[0]; // Extract "Morning", "Afternoon", "Evening"
              const blocksForThisSlot = scheduledBlocks.filter(
                (b) =>
                  b.day === day.toISOString().split('T')[0] && b.category === categoryName
              );

              return (
                <div key={dayIndex} className="border border-gray-700 rounded-lg p-1 h-28 flex items-center justify-center">
                  {blocksForThisSlot.length > 0 ? (
                    <div className="flex flex-col h-full w-full overflow-y-auto">
                      {blocksForThisSlot.map((block) => (
                        <motion.div
                          key={block.id}
                          className={`relative flex flex-col items-center justify-center h-full w-full rounded-lg cursor-pointer transition-colors p-2 text-sm mb-1 shadow-md
                            ${block.type === 'Study' ? 'bg-green-700 border border-green-600' : block.type === 'Break' ? 'bg-gray-700 border border-gray-600' : 'bg-red-700 border border-red-600'}`}
                          whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.3)" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleEditBlock(block)}
                        >
                          <span className="text-white font-semibold text-lg">{block.name}</span>
                          <span className="text-white text-xs">{categoryName}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="relative flex flex-col items-center justify-center h-full w-full border border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors group p-1"
                      onClick={() => handleHourClick(day, categoryName)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-gray-500 group-hover:text-white text-xs">
                        {categoryName}
                      </span>
                      <span className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Add Block
                      </span>
                      <span className="absolute text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                        +
                      </span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-auto mt-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-3xl font-bold mb-2 text-center text-purple-400">Add Study Block</h3>
            <p className="text-gray-400 text-center mb-6">Create a new study session for your weekly schedule.</p>

            {/* Selection Pane for Study, Break, Event */}
            <div className="flex justify-center space-x-4 mb-6">
              <motion.button
                className="py-2 px-4 rounded-md text-lg font-semibold transition-colors"
                style={{ backgroundColor: selectedBlockType === 'Study' ? '#8B5CF6' : '#4B5563' }}
                onClick={() => setSelectedBlockType('Study')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Study
              </motion.button>
              <motion.button
                className="py-2 px-4 rounded-md text-lg font-semibold transition-colors"
                style={{ backgroundColor: selectedBlockType === 'Break' ? '#F59E0B' : '#4B5563' }}
                onClick={() => setSelectedBlockType('Break')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Break
              </motion.button>
              <motion.button
                className="py-2 px-4 rounded-md text-lg font-semibold transition-colors"
                style={{ backgroundColor: selectedBlockType === 'Event' ? '#3B82F6' : '#4B5563' }}
                onClick={() => setSelectedBlockType('Event')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Event
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Block Name Input */}
              <div className="mb-4">
                <label htmlFor="blockName" className="block text-gray-300 text-sm font-bold mb-2">Block Name</label>
                <input
                  type="text"
                  id="blockName"
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                  placeholder="Enter block name"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                />
              </div>

              {/* Subject Selection (only for Study) */}
              {selectedBlockType === 'Study' && (
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-gray-300 text-sm font-bold mb-2">Subject</label>
                  <select
                    id="subject"
                    className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                    value={blockSubject}
                    onChange={(e) => setBlockSubject(e.target.value)}
                  >
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Event Name Input (only for Event) */}
              {selectedBlockType === 'Event' && (
                <div className="mb-4">
                  <label htmlFor="eventName" className="block text-gray-300 text-sm font-bold mb-2">Event Name</label>
                  <input
                    type="text"
                    id="eventName"
                    className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                    placeholder="Enter event name"
                    value={blockEventName}
                    onChange={(e) => setBlockEventName(e.target.value)}
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                  placeholder="Add a description for your block..."
                  value={blockDescription}
                  onChange={(e) => setBlockDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Start Time and End Time */}
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="startTime" className="block text-gray-300 text-sm font-bold mb-2">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="endTime" className="block text-gray-300 text-sm font-bold mb-2">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Recurrence Dropdown */}
              <div>
                <label htmlFor="recurrence" className="block text-gray-300 text-sm font-bold mb-2">Recurrence</label>
                <select
                  id="recurrence"
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white leading-tight focus:outline-none focus:bg-gray-600"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  <option>None</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <motion.button
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md text-lg font-semibold transition-colors"
                onClick={handleCloseModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-semibold transition-colors"
                onClick={editingBlock ? handleUpdateBlock : handleAddBlock}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editingBlock ? 'Update Block' : 'Save Block'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};