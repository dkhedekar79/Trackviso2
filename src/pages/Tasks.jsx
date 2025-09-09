import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const priorities = [
  { label: "Low", color: "border-blue-500" },
  { label: "Medium", color: "border-yellow-500" },
  { label: "High", color: "border-red-500" },
];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("todo");
  const [popTaskId, setPopTaskId] = useState(null);
  const [sortBy, setSortBy] = useState("subject");
  const [editId, setEditId] = useState(null);

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const mappedTasks = (data || []).map(t => ({
          id: t.id,
          name: t.name,
          subject: t.subject,
          time: t.duration_minutes?.toString() || '',
          priority: t.priority || 'Low',
          scheduledDate: t.scheduled_date || '',
          done: t.completed || false,
          doneAt: t.done_at ? new Date(t.done_at).getTime() : undefined,
        }));
        
        setTasks(mappedTasks);
      } catch (e) {
        console.error('Failed loading tasks:', e);
        // Fallback to localStorage
        const saved = localStorage.getItem("tasks");
        if (saved) setTasks(JSON.parse(saved));
      }
    };

    loadTasks();
  }, [user?.id]);

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
        const savedSubjects = localStorage.getItem("subjects");
        if (savedSubjects) {
          setSubjects(JSON.parse(savedSubjects));
        } else {
          // If no subjects exist, set default subjects
          const defaultSubjects = [
            { id: 1, name: "Math", color: "#6C5DD3", goalHours: 5 },
            { id: 2, name: "English", color: "#B6E4CF", goalHours: 4 },
            { id: 3, name: "Biology", color: "#FEC260", goalHours: 6 },
            { id: 4, name: "History", color: "#FF6B6B", goalHours: 3 }
          ];
          setSubjects(defaultSubjects);
          localStorage.setItem("subjects", JSON.stringify(defaultSubjects));
        }
      }
    };

    loadSubjects();
  }, [user?.id]);

  // Save tasks to localStorage as backup
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.time.trim()) {
      setFormError("Please enter a task name, subject, and duration.");
      return;
    }
    if (!user?.id) return;
    
    try {
      if (editId) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            name: form.name.trim(),
            subject: form.subject,
            duration_minutes: parseInt(form.time) || 0,
            priority: form.priority,
            scheduled_date: form.scheduledDate || null,
          })
          .eq('id', editId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setTasks(tasks.map(t => t.id === editId ? { ...t, ...form } : t));
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            name: form.name.trim(),
            subject: form.subject,
            duration_minutes: parseInt(form.time) || 0,
            priority: form.priority,
            scheduled_date: form.scheduledDate || null,
            completed: false,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const newTask = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          time: data.duration_minutes?.toString() || '',
          priority: data.priority || 'Low',
          scheduledDate: data.scheduled_date || '',
          done: false,
        };
        
        setTasks(prev => [newTask, ...prev]);
      }
      
      setForm({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
      setFormError("");
      setShowModal(false);
      setEditId(null);
    } catch (e) {
      console.error('Failed saving task:', e);
      // Fallback to localStorage
      if (editId) {
        setTasks(tasks.map(t => t.id === editId ? { ...t, ...form } : t));
      } else {
        setTasks([...tasks, { ...form, id: Date.now(), done: false }]);
      }
      setForm({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
      setFormError("");
      setShowModal(false);
      setEditId(null);
    }
  };

  const toggleDone = async (id) => {
    if (!user?.id) return;
    
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newDone = !task.done;
    const newDoneAt = newDone ? new Date().toISOString() : null;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: newDone,
          done_at: newDoneAt,
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTasks(
        tasks.map((t) =>
          t.id === id
            ? { ...t, done: newDone, doneAt: newDoneAt ? new Date(newDoneAt).getTime() : undefined }
            : t
        )
      );
      setPopTaskId(id);
      setTimeout(() => setPopTaskId(null), 350);
    } catch (e) {
      console.error('Failed updating task:', e);
      // Fallback to localStorage
      setTasks(
        tasks.map((t) =>
          t.id === id
            ? t.done
              ? { ...t, done: false, doneAt: undefined }
              : { ...t, done: true, doneAt: Date.now() }
            : t
        )
      );
      setPopTaskId(id);
      setTimeout(() => setPopTaskId(null), 350);
    }
  };

  const priorityColor = (priority) => {
    return priorities.find((p) => p.label === priority)?.color || "border-gray-300";
  };

  // Helper to get scheduling status
  const getScheduleStatus = (scheduledDate) => {
    if (!scheduledDate) return null;
    const today = new Date();
    const sched = new Date(scheduledDate);
    const isToday = sched.toDateString() === today.toDateString();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const isTomorrow = sched.toDateString() === tomorrow.toDateString();
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    if (sched < today.setHours(0,0,0,0)) return "Overdue";
    return sched.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Sorting logic
  const getSortedTasks = (tasksArr) => {
    let sorted = [...tasksArr];
    if (sortBy === "subject") {
      sorted.sort((a, b) => (a.subject || "").localeCompare(b.subject || ""));
    } else if (sortBy === "difficulty") {
      const priorityOrder = { "High": 0, "Medium": 1, "Low": 2 };
      sorted.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));
    } else if (sortBy === "schedule") {
      sorted.sort((a, b) => {
        if (!a.scheduledDate && !b.scheduledDate) return 0;
        if (!a.scheduledDate) return 1;
        if (!b.scheduledDate) return -1;
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      });
    }
    return sorted;
  };

  // Calculate summary stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const toDoCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;
  const scheduledTodayCount = tasks.filter((t) => {
    if (!t.time) return false;
    const taskDate = new Date(`${now.toISOString().slice(0,10)}T${t.time}`);
    return taskDate >= startOfToday && taskDate < new Date(startOfToday.getTime() + 24*60*60*1000);
  }).length;

  // Auto-delete done tasks after 7 days
  React.useEffect(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const filtered = tasks.filter(
      (t) => !t.done || !t.doneAt || now - t.doneAt < sevenDays
    );
    if (filtered.length !== tasks.length) setTasks(filtered);
    // eslint-disable-next-line
  }, [tasks]);

  const handleEdit = (task) => {
    setForm({
      name: task.name,
      subject: task.subject,
      time: task.time,
      priority: task.priority,
      scheduledDate: task.scheduledDate || ""
    });
    setEditId(task.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) {
      console.error('Failed deleting task:', e);
      // Fallback to localStorage
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] mt-20 flex">
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="p-8">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Your Tasks</h1>
              <div className="flex gap-2">
                <button
                  className="rounded-2xl bg-[#6C5DD3] text-white px-4 py-2 font-semibold shadow hover:bg-[#7A6AD9] transition"
                  onClick={() => setShowModal(true)}
                >
                  + Add Task
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-white font-semibold">Sort by:</label>
              <select
                className="rounded bg-[#23234a] text-white px-3 py-1 border border-[#6C5DD3]"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="subject">Subject</option>
                <option value="difficulty">Hardest</option>
                <option value="schedule">Earliest Due</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="bg-[#23234a] rounded-xl px-4 py-2 text-white text-sm font-semibold shadow">
                To Do: <span className="text-[#FEC260] font-bold">{toDoCount}</span>
              </div>
              <div className="bg-[#23234a] rounded-xl px-4 py-2 text-white text-sm font-semibold shadow">
                Done: <span className="text-[#B6E4CF] font-bold">{doneCount}</span>
              </div>
              <div className="bg-[#23234a] rounded-xl px-4 py-2 text-white text-sm font-semibold shadow">
                Scheduled Today: <span className="text-[#6C5DD3] font-bold">{scheduledTodayCount}</span>
              </div>
            </div>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-[#23234a] p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white">Add Task</span>
                    <button className="text-white text-xl" onClick={() => { setShowModal(false); setFormError(""); }}>&times;</button>
                  </div>
                  {formError && (
                    <div className="bg-red-500/80 text-white text-sm rounded px-3 py-2 mb-2">{formError}</div>
                  )}
                  <label className="block text-white mb-1">Task Name</label>
                  <input
                    className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] mb-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <label className="block text-white mb-1">Subject</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] mb-2"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                  <label className="block text-white mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] mb-2"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value.replace(/[^0-9]/g, "") })}
                    placeholder="e.g. 25"
                  />
                  <label className="block text-white mb-1">Importance</label>
                  <select
                    className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] mb-4"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {priorities.map((p) => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                  <label className="block text-white mb-1">Scheduled Date (optional)</label>
                  <input
                    type="date"
                    className="w-full p-2 rounded bg-[#1a1a2e] text-white border border-[#6C5DD3] mb-4"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  />
                  <button
                    className="w-full rounded-2xl bg-[#6C5DD3] text-white px-4 py-2 font-semibold shadow hover:bg-[#7A6AD9] transition"
                    onClick={addTask}
                  >
                    Save Task
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-4">
              <div className="grid grid-cols-2 w-1/2 mx-auto bg-[#23234a] rounded-xl overflow-hidden">
                <button
                  className={`py-2 font-semibold transition ${tab === "todo" ? "bg-[#6C5DD3] text-white" : "text-white/70"}`}
                  onClick={() => setTab("todo")}
                >
                  To Do
                </button>
                <button
                  className={`py-2 font-semibold transition ${tab === "done" ? "bg-[#6C5DD3] text-white" : "text-white/70"}`}
                  onClick={() => setTab("done")}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {tab === "todo" && (
              <div className="space-y-4">
                {getSortedTasks(tasks.filter((t) => !t.done)).map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl bg-[#23234a] border-l-8 ${priorityColor(task.priority)} transition-transform duration-200 hover:scale-105 ${popTaskId === task.id ? 'animate-pop' : ''}`}>
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg text-white">{task.name}</h2>
                      <p className="text-sm text-gray-400">{task.subject}{task.time ? ` | ${task.time} min` : ""}</p>
                    </div>
                    <div className="flex flex-col items-center mx-4">
                      {task.scheduledDate ? (() => {
                        const status = getScheduleStatus(task.scheduledDate);
                        let color = "bg-[#23234a] text-white/80";
                        if (status === "Overdue") color = "bg-red-600 text-white border border-red-600";
                        else if (status === "Today") color = "bg-orange-500 text-white border border-orange-500";
                        else if (status === "Tomorrow") color = "bg-green-500 text-white border border-green-500";
                        return (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>
                            {status}
                          </span>
                        );
                      })() : (
                        <a href="/schedule" className="inline-block text-xs font-semibold px-2 py-1 rounded bg-[#6C5DD3] text-white hover:bg-[#7A6AD9] transition">Schedule</a>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 mx-2">
                      <button onClick={() => handleEdit(task)} className="p-1 rounded hover:bg-[#6C5DD3] transition" title="Edit"><Pencil className="w-4 h-4 text-white" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-red-600 transition" title="Delete"><Trash2 className="w-4 h-4 text-white" /></button>
                    </div>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(task.id)}
                      className="w-5 h-5 accent-[#6C5DD3]"
                    />
                  </div>
                ))}
                {tasks.filter((t) => !t.done).length === 0 && (
                  <div className="text-center text-gray-400">No tasks to do!</div>
                )}
              </div>
            )}
            {tab === "done" && (
              <div className="space-y-4">
                {getSortedTasks(tasks.filter((t) => t.done)).map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl bg-[#23234a] border-l-8 ${priorityColor(task.priority)} opacity-60 transition-transform duration-200 hover:scale-105`}>
                    <div className="flex-1">
                      <h2 className="line-through font-medium text-white">{task.name}</h2>
                      <p className="text-sm text-gray-400">{task.subject}{task.time ? ` | ${task.time} min` : ""}</p>
                    </div>
                    <div className="flex flex-col items-center mx-4">
                      {task.scheduledDate ? (() => {
                        const status = getScheduleStatus(task.scheduledDate);
                        let color = "bg-[#23234a] text-white/80";
                        if (status === "Overdue") color = "bg-red-600 text-white border border-red-600";
                        else if (status === "Today") color = "bg-orange-500 text-white border border-orange-500";
                        else if (status === "Tomorrow") color = "bg-green-500 text-white border border-green-500";
                        return (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>
                            {status}
                          </span>
                        );
                      })() : (
                        <a href="/schedule" className="inline-block text-xs font-semibold px-2 py-1 rounded bg-[#6C5DD3] text-white hover:bg-[#7A6AD9] transition">Schedule</a>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 mx-2">
                      <button onClick={() => handleEdit(task)} className="p-1 rounded hover:bg-[#6C5DD3] transition" title="Edit"><Pencil className="w-4 h-4 text-white" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-red-600 transition" title="Delete"><Trash2 className="w-4 h-4 text-white" /></button>
                    </div>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(task.id)}
                      className="w-5 h-5 accent-[#6C5DD3]"
                    />
                  </div>
                ))}
                {tasks.filter((t) => t.done).length === 0 && (
                  <div className="text-center text-gray-400">No completed tasks yet!</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 