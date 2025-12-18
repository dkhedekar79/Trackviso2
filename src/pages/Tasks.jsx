import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { 
  Pencil, 
  Trash2, 
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Flag,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  X,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Edit,
  Calendar as CalendarIcon,
  BookOpen,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import { motion, AnimatePresence } from "framer-motion";

const priorities = [
  { label: "Low", color: "border-blue-500", bgColor: "bg-blue-500/20", textColor: "text-blue-400", icon: Flag },
  { label: "Medium", color: "border-yellow-500", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400", icon: Flag },
  { label: "High", color: "border-red-500", bgColor: "bg-red-500/20", textColor: "text-red-400", icon: Flag },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const { updateQuestProgress } = useGamification();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("todo");
  const [popTaskId, setPopTaskId] = useState(null);
  const [sortBy, setSortBy] = useState("subject");
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredTask, setHoveredTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mouse tracking for dynamic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Load subjects from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    } else {
      const defaultSubjects = [
        { id: 1, name: "Math", color: "#6C5DD3", goalHours: 5 },
        { id: 2, name: "English", color: "#B6E4CF", goalHours: 4 },
        { id: 3, name: "Biology", color: "#FEC260", goalHours: 6 },
        { id: 4, name: "History", color: "#FF6B6B", goalHours: 3 }
      ];
      setSubjects(defaultSubjects);
      localStorage.setItem("subjects", JSON.stringify(defaultSubjects));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.time.trim()) {
      setFormError("Please enter a task name, subject, and duration.");
      return;
    }
    if (editId) {
      setTasks(tasks.map(t => t.id === editId ? { ...t, ...form } : t));
    } else {
      setTasks([...tasks, { ...form, id: Date.now(), done: false }]);
    }
    setForm({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
    setFormError("");
    setShowModal(false);
    setEditId(null);
  };

  const toggleDone = (id) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? t.done
          ? { ...t, done: false, doneAt: undefined }
          : { ...t, done: true, doneAt: Date.now() }
        : t
    );
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
    updateQuestProgress("tasks");

    setPopTaskId(id);
    setTimeout(() => setPopTaskId(null), 350);
  };

  const priorityColor = (priority) => {
    return priorities.find((p) => p.label === priority) || priorities[0];
  };

  // Helper to get scheduling status
  const getScheduleStatus = (scheduledDate) => {
    if (!scheduledDate) return null;
    const today = new Date();
    const sched = new Date(scheduledDate);
    const isToday = sched.toDateString() === today.toDateString();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const isTomorrow = sched.toDateString() === tomorrow.toDateString();
    if (isToday) return { text: "Today", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    if (isTomorrow) return { text: "Tomorrow", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (sched < today.setHours(0,0,0,0)) return { text: "Overdue", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    return { text: sched.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
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

  // Filter tasks
  const getFilteredTasks = (tasksArr) => {
    let filtered = tasksArr;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Subject filter
    if (selectedSubject !== "All") {
      filtered = filtered.filter(t => t.subject === selectedSubject);
    }
    
    // Priority filter
    if (selectedPriority !== "All") {
      filtered = filtered.filter(t => t.priority === selectedPriority);
    }
    
    return filtered;
  };

  // Calculate summary stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const toDoTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const overdueTasks = toDoTasks.filter(t => {
    if (!t.scheduledDate) return false;
    return new Date(t.scheduledDate) < startOfToday;
  });
  const todayTasks = toDoTasks.filter(t => {
    if (!t.scheduledDate) return false;
    const taskDate = new Date(t.scheduledDate);
    return taskDate.toDateString() === startOfToday.toDateString();
  });

  // Auto-delete done tasks after 7 days
  React.useEffect(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const filtered = tasks.filter(
      (t) => !t.done || !t.doneAt || now - t.doneAt < sevenDays
    );
    if (filtered.length !== tasks.length) setTasks(filtered);
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

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getSubjectColor = (subjectName) => {
    const subject = subjects.find(s => s.name === subjectName);
    return subject?.color || "#8b5cf6";
  };

  const displayTasks = tab === "todo" ? toDoTasks : doneTasks;
  const filteredDisplayTasks = getFilteredTasks(displayTasks);
  const sortedDisplayTasks = getSortedTasks(filteredDisplayTasks);

  return (
    <div className="min-h-screen mt-20 flex bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)`,
            left: `${(mousePosition.x / window.innerWidth) * 100}%`,
            top: `${(mousePosition.y / window.innerHeight) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <Sidebar />
      
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64 relative z-10">
        <div className="p-8">
          {/* Header Section */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-3"
                >
                  Your Tasks
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-purple-200/80"
                >
                  Organize, track, and complete your study tasks efficiently
                </motion.p>
              </div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setForm({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
                  setEditId(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </motion.button>
            </div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              {[
                { label: "To Do", value: toDoTasks.length, icon: Circle, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/20" },
                { label: "Completed", value: doneTasks.length, icon: CheckCircle2, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/20" },
                { label: "Due Today", value: todayTasks.length, icon: Calendar, color: "from-orange-500 to-amber-500", bgColor: "bg-orange-500/20" },
                { label: "Overdue", value: overdueTasks.length, icon: AlertCircle, color: "from-red-500 to-rose-500", bgColor: "bg-red-500/20" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30 ${stat.bgColor} hover:border-purple-500/50 transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-purple-300/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-xl backdrop-blur-md border transition-all flex items-center gap-2 ${
                  showFilters || selectedSubject !== "All" || selectedPriority !== "All"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500/50"
                    : "bg-purple-900/40 text-purple-300 border-purple-700/30 hover:border-purple-500/50"
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {(selectedSubject !== "All" || selectedPriority !== "All") && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {[selectedSubject !== "All" ? 1 : 0, selectedPriority !== "All" ? 1 : 0].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </motion.button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="subject">Sort by Subject</option>
                <option value="difficulty">Sort by Priority</option>
                <option value="schedule">Sort by Date</option>
              </select>
              </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 block">
                      Subject
                    </label>
                  <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="All">All Subjects</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 block">
                      Priority
                    </label>
                  <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="All">All Priorities</option>
                    {priorities.map((p) => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                  </div>
                </motion.div>
            )}
            </AnimatePresence>
          </motion.div>

            {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 p-1">
              <motion.button
                  onClick={() => setTab("todo")}
                className={`relative px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === "todo"
                    ? "text-white"
                    : "text-purple-300/70 hover:text-purple-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === "todo" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  To Do ({toDoTasks.length})
                </span>
              </motion.button>
              <motion.button
                  onClick={() => setTab("done")}
                className={`relative px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === "done"
                    ? "text-white"
                    : "text-purple-300/70 hover:text-purple-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === "done" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Done ({doneTasks.length})
                </span>
              </motion.button>
              </div>
            </motion.div>

          {/* Tasks Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {sortedDisplayTasks.map((task, index) => {
                const priority = priorityColor(task.priority);
                const scheduleStatus = getScheduleStatus(task.scheduledDate);
                const subjectColor = getSubjectColor(task.subject);
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`group relative rounded-2xl p-5 bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border-l-4 ${priority.color} border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 overflow-hidden ${
                      task.done ? "opacity-60" : ""
                    }`}
                  >
                    {/* Gradient overlay on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${priority.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subjectColor }}
                            />
                            <span className="text-xs font-semibold text-purple-300/70 uppercase">
                              {task.subject}
                            </span>
                          </div>
                          <h3 className={`text-lg font-bold text-white mb-1 ${task.done ? "line-through" : ""}`}>
                            {task.name}
                          </h3>
                        </div>
                        <motion.button
                          onClick={() => toggleDone(task.id)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-shrink-0"
                        >
                          {task.done ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-purple-400" />
                          )}
                        </motion.button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {task.time && (
                          <div className="flex items-center gap-2 text-sm text-purple-300/70">
                            <Clock className="w-4 h-4" />
                            <span>{task.time} minutes</span>
                          </div>
                        )}
                        
                        {scheduleStatus && (
                          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg border ${scheduleStatus.color} inline-flex`}>
                            <CalendarIcon className="w-3 h-3" />
                            <span>{scheduleStatus.text}</span>
                    </div>
                      )}
                    </div>

                      {/* Priority Badge */}
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${priority.bgColor} border ${priority.color} mb-4`}>
                        <priority.icon className={`w-3 h-3 ${priority.textColor}`} />
                        <span className={`text-xs font-semibold ${priority.textColor}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: hoveredTask === task.id ? 1 : 0, y: hoveredTask === task.id ? 0 : 10 }}
                        className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-700/30"
                      >
                        <motion.button
                          onClick={() => handleEdit(task)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-1 px-3 py-2 rounded-lg bg-purple-800/40 hover:bg-purple-700/60 border border-purple-700/30 text-purple-300 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(task.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {sortedDisplayTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/40 mb-6">
                {tab === "todo" ? (
                  <Target className="w-10 h-10 text-purple-400" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-green-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {tab === "todo" ? "No tasks to do!" : "No completed tasks yet!"}
              </h3>
              <p className="text-purple-300/70 mb-6">
                {tab === "todo" 
                  ? "Create your first task to get started" 
                  : "Complete some tasks to see them here"}
              </p>
              {tab === "todo" && (
                <motion.button
                  onClick={() => {
                    setForm({ name: "", subject: "", time: "", priority: "Low", scheduledDate: "" });
                    setEditId(null);
                    setShowModal(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Your First Task
                </motion.button>
                )}
              </motion.div>
            )}
        </div>

        {/* Add/Edit Task Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => {
                setShowModal(false);
                setFormError("");
                setEditId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-purple-700/30 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editId ? "Edit Task" : "Add New Task"}
                  </h2>
                  <motion.button
                    onClick={() => {
                      setShowModal(false);
                      setFormError("");
                      setEditId(null);
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-purple-800/40 hover:bg-purple-800/60 text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                    </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                  >
                    {formError}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">
                      Task Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/30 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter task name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">
                      Subject
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-purple-300 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/30 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value.replace(/[^0-9]/g, "") })}
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-purple-300 mb-2">
                        Priority
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      >
                        {priorities.map((p) => (
                          <option key={p.label} value={p.label}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">
                      Scheduled Date (optional)
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-700/30 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      value={form.scheduledDate}
                      onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    />
                  </div>

                  <motion.button
                    onClick={addTask}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                  >
                    {editId ? "Update Task" : "Create Task"}
                  </motion.button>
                </div>
              </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
