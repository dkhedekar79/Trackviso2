import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Schedule() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todaysTasks = tasks.filter((t) => t.scheduledDate === todayStr);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearRange = Array.from({length: 11}, (_, i) => today.getFullYear() - 5 + i);

  // Handle month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // For drag-and-drop scheduling
  const [dragTaskId, setDragTaskId] = useState(null);
  const unscheduledTasks = tasks.filter((t) => !t.scheduledDate);

  // Handle drop on calendar day
  const handleDayDrop = (dateStr) => {
    if (!dragTaskId) return;
    const updated = tasks.map((t) =>
      t.id === dragTaskId ? { ...t, scheduledDate: dateStr } : t
    );
    setTasks(updated);
    setDragTaskId(null);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  // Helper to get color for priority
  const priorityDot = (priority) => {
    if (priority === "High") return "bg-red-500";
    if (priority === "Medium") return "bg-yellow-400";
    if (priority === "Low") return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] mt-20 flex">
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="p-8">
          <div className="mb-8">
            <div className="bg-[#23234a] rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-white mb-2">Today's Scheduled Tasks</h2>
              {todaysTasks.length === 0 ? (
                <div className="text-gray-400">No tasks scheduled for today.</div>
              ) : (
                <ul className="space-y-2">
                  {todaysTasks.map((task) => (
                    <li key={task.id} className="text-white flex flex-col md:flex-row md:items-center md:gap-4">
                      <span className="font-semibold">{task.name}</span>
                      <span className="text-sm text-gray-400">{task.subject}{task.time ? ` | ${task.time} min` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            {/* Minimalistic Calendar */}
            <div className="bg-[#23234a] rounded-xl p-3 shadow-md mb-6 w-2/3 h-[calc(100vh-5rem-4rem)] flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <button onClick={handlePrevMonth} className="text-white px-1 py-0.5 rounded hover:bg-[#35357a] transition text-base">&#8592;</button>
                <span className="text-base font-bold text-white select-none">{monthNames[calendarMonth]} {calendarYear}</span>
                <button onClick={handleNextMonth} className="text-white px-1 py-0.5 rounded hover:bg-[#35357a] transition text-base">&#8594;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-white/80 h-full w-full items-stretch">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="font-semibold text-[10px] pb-0.5">{d}</div>
                ))}
                {calendarDays.map((d, i) => {
                  const dateStr = d ? `${calendarYear}-${String(calendarMonth+1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
                  const dayTasks = d ? tasks.filter(t => t.scheduledDate === dateStr) : [];
                  return (
                    <div
                      key={i}
                      className={`w-full h-full min-h-[2.2rem] flex flex-col items-center justify-start rounded text-xs pt-1 transition-transform duration-200
                        ${calendarYear === today.getFullYear() && calendarMonth === today.getMonth() && d === today.getDate() ? "bg-[#6C5DD3] text-white font-bold" : d ? "hover:bg-[#35357a] hover:scale-110 transition" : ""}
                        ${d ? "cursor-pointer" : ""}`}
                      onDragOver={e => d && e.preventDefault()}
                      onDrop={d ? () => handleDayDrop(dateStr) : undefined}
                    >
                      <div>{d || ""}</div>
                      <div className="flex flex-col gap-0.5 mt-0.5 w-full items-start">
                        {dayTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-0.5 w-full truncate">
                            <span className={`inline-block w-2 h-2 rounded-full ${priorityDot(task.priority)} border border-white flex-shrink-0`}></span>
                            <span className="text-[10px] text-white truncate font-semibold max-w-[4.5rem]">{task.name}</span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[4.5rem]">{task.subject}{task.time ? ` | ${task.time} min` : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Schedule Tasks Card */}
            <div className="bg-[#23234a] rounded-xl p-4 shadow-md mb-6 w-1/3 h-[calc(100vh-5rem-4rem)] flex flex-col">
              <h2 className="text-lg font-bold text-white mb-4">Schedule Tasks</h2>
              {unscheduledTasks.length === 0 ? (
                <div className="text-gray-400">No unscheduled tasks.</div>
              ) : (
                <ul className="space-y-2 flex-1 overflow-y-auto">
                  {unscheduledTasks.map(task => (
                    <li
                      key={task.id}
                      className="bg-[#1a1a2e] rounded px-3 py-2 text-white flex items-center justify-between cursor-grab hover:bg-[#35357a] transition"
                      draggable
                      onDragStart={() => setDragTaskId(task.id)}
                      onDragEnd={() => setDragTaskId(null)}
                    >
                      <span className="font-semibold">{task.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{task.subject}{task.time ? ` | ${task.time} min` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-xs text-gray-400 mt-2">Drag a task onto a calendar day to schedule it.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 