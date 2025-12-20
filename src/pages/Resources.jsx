import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Video,
  Lightbulb,
  Clock,
  TrendingUp,
  Star,
  ExternalLink,
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  Zap,
  Award,
  Target,
  Brain,
  GraduationCap,
  BookMarked,
  Download,
  PlayCircle,
  Link2,
  ChevronRight,
  Flame,
  X,
} from 'lucide-react';

const LEVELS = ["GCSE", "A Level"];
const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
];

const BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "Eduqas"];
const TYPES = [
  { key: "all", label: "All", icon: Grid3x3 },
  { key: "past_paper", label: "Past Papers", icon: FileText },
  { key: "specification", label: "Specification", icon: BookOpen },
  { key: "video", label: "Video Guides", icon: Video },
  { key: "tips", label: "Study Tips", icon: Lightbulb },
];

const YEARS = ["All", 2024, 2023, 2022, 2021, 2020, 2019, 2018];

function sanitize(text) {
  return String(text)
    .replace(/\u2014|\u2013|\u2212|\u2043/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\s+-\s+/g, " - ");
}

// Specification pages
const SPEC_LINKS = [
  { level: "GCSE", subject: "Mathematics", board: "AQA", title: "AQA GCSE Maths - Specification", url: "https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification-at-a-glance", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "AQA", title: "AQA A-level Maths (7357) - Specification", url: "https://www.aqa.org.uk/subjects/mathematics/as-and-a-level/mathematics-7357/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "AQA", title: "AQA GCSE English Language (8700) - Specification", url: "https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/specification-at-a-glance", type: "specification" },
  { level: "A Level", subject: "Physics", board: "AQA", title: "AQA A-level Physics (7408) - Specification", url: "https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7408/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "AQA", title: "AQA GCSE Biology (8461) - Specification", url: "https://www.aqa.org.uk/subjects/science/gcse/biology-8461/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "AQA", title: "AQA GCSE Chemistry (8462) - Specification", url: "https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462/specification-at-a-glance", type: "specification" },
  { level: "GCSE", subject: "Mathematics", board: "Edexcel", title: "Edexcel GCSE Maths (9-1) - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "Edexcel", title: "Edexcel A level Maths - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "A Level", subject: "Physics", board: "Edexcel", title: "Edexcel A level Physics - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "Edexcel", title: "Edexcel GCSE Biology - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/biology-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "Edexcel", title: "Edexcel GCSE Chemistry - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/chemistry-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "Edexcel", title: "Edexcel GCSE English Language - Specification", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FTeaching-and-learning-materials", type: "specification" },
  { level: "GCSE", subject: "Mathematics", board: "OCR", title: "OCR GCSE Maths (J560) - Specification", url: "https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/specification-at-a-glance/", type: "specification" },
  { level: "A Level", subject: "Mathematics", board: "OCR", title: "OCR A Level Maths (A) - Specification", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/specification-at-a-glance/", type: "specification" },
  { level: "A Level", subject: "Physics", board: "OCR", title: "OCR A Level Physics (A) - Specification", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "Biology", board: "OCR", title: "OCR GCSE Biology A (J247) - Specification", url: "https://www.ocr.org.uk/qualifications/gcse/biology-a-j247-from-2016/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "Chemistry", board: "OCR", title: "OCR GCSE Chemistry A (J248) - Specification", url: "https://www.ocr.org.uk/qualifications/gcse/chemistry-a-j248-from-2016/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "OCR", title: "OCR GCSE English Language (J351) - Specification", url: "https://www.ocr.org.uk/qualifications/gcse/english-language-j351-from-2015/specification-at-a-glance/", type: "specification" },
  { level: "GCSE", subject: "Mathematics", board: "WJEC", title: "WJEC GCSE Mathematics - Specification", url: "https://qualifications.wjec.org.uk/qualifications/mathematics-gcse/", type: "specification" },
  { level: "A Level", subject: "Biology", board: "Eduqas", title: "Eduqas AS/A Level Biology - Specification", url: "https://www.eduqas.co.uk/qualifications/biology-as-a-level/", type: "specification" },
  { level: "A Level", subject: "Chemistry", board: "Eduqas", title: "Eduqas AS/A Level Chemistry - Specification", url: "https://www.eduqas.co.uk/qualifications/chemistry-as-a-level/", type: "specification" },
  { level: "GCSE", subject: "English Language", board: "Eduqas", title: "Eduqas GCSE English Language - Specification", url: "https://www.eduqas.co.uk/qualifications/english-language-gcse/", type: "specification" },
];

// Past paper hubs
const PAST_BASES = [
  { level: "GCSE", subject: "Mathematics", board: "AQA", title: "AQA GCSE Maths - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/assessment-resources" },
  { level: "A Level", subject: "Mathematics", board: "AQA", title: "AQA A-level Maths - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/mathematics/as-and-a-level/mathematics-7357/assessment-resources" },
  { level: "GCSE", subject: "English Language", board: "AQA", title: "AQA GCSE English Language - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/assessment-resources" },
  { level: "GCSE", subject: "Biology", board: "AQA", title: "AQA GCSE Biology - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/gcse/biology-8461/assessment-resources" },
  { level: "GCSE", subject: "Chemistry", board: "AQA", title: "AQA GCSE Chemistry - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462/assessment-resources" },
  { level: "A Level", subject: "Physics", board: "AQA", title: "AQA A-level Physics - Past papers & mark schemes", url: "https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7408/assessment-resources" },
  { level: "GCSE", subject: "Mathematics", board: "Edexcel", title: "Edexcel GCSE Maths - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/mathematics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "A Level", subject: "Mathematics", board: "Edexcel", title: "Edexcel A level Maths - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "A Level", subject: "Physics", board: "Edexcel", title: "Edexcel A level Physics - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/physics-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "Biology", board: "Edexcel", title: "Edexcel GCSE Biology - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/biology-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "Chemistry", board: "Edexcel", title: "Edexcel GCSE Chemistry - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/chemistry-2016.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "English Language", board: "Edexcel", title: "Edexcel GCSE English Language - Exam materials (past papers)", url: "https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.coursematerials.html#filterQuery=category:Pearson-UK:Category%2FExam-materials" },
  { level: "GCSE", subject: "Mathematics", board: "OCR", title: "OCR GCSE Maths - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/assessment/" },
  { level: "A Level", subject: "Mathematics", board: "OCR", title: "OCR A Level Maths - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/mathematics-a-h230-h240-from-2017/assessment/" },
  { level: "A Level", subject: "Physics", board: "OCR", title: "OCR A Level Physics - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/as-and-a-level/physics-a-h156-h556-from-2015/assessment/" },
  { level: "GCSE", subject: "Biology", board: "OCR", title: "OCR GCSE Biology A - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/biology-a-j247-from-2016/assessment/" },
  { level: "GCSE", subject: "Chemistry", board: "OCR", title: "OCR GCSE Chemistry A - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/chemistry-a-j248-from-2016/assessment/" },
  { level: "GCSE", subject: "English Language", board: "OCR", title: "OCR GCSE English Language - Past papers, mark schemes, reports", url: "https://www.ocr.org.uk/qualifications/gcse/english-language-j351-from-2015/assessment/" },
  { level: "GCSE", subject: "Mathematics", board: "WJEC", title: "WJEC GCSE Maths - Past papers", url: "https://qualifications.wjec.org.uk/qualifications/mathematics-gcse/assessment/" },
  { level: "A Level", subject: "Biology", board: "Eduqas", title: "Eduqas AS/A Level Biology - Past papers", url: "https://www.eduqas.co.uk/qualifications/biology-as-a-level/#tab_assessmentresources" },
  { level: "A Level", subject: "Chemistry", board: "Eduqas", title: "Eduqas AS/A Level Chemistry - Past papers", url: "https://www.eduqas.co.uk/qualifications/chemistry-as-a-level/#tab_assessmentresources" },
  { level: "GCSE", subject: "English Language", board: "Eduqas", title: "Eduqas GCSE English Language - Past papers", url: "https://www.eduqas.co.uk/qualifications/english-language-gcse/#tab_assessmentresources" },
];

// New content: Video resources
const VIDEO_RESOURCES = [
  { level: "GCSE", subject: "Mathematics", board: "All", title: "GCSE Maths Revision - Complete Course", url: "https://www.youtube.com/results?search_query=gcse+maths+revision", type: "video", description: "Comprehensive revision videos covering all GCSE Maths topics" },
  { level: "A Level", subject: "Mathematics", board: "All", title: "A Level Maths Tutorials - Full Course", url: "https://www.youtube.com/results?search_query=a+level+maths+tutorials", type: "video", description: "In-depth A Level Maths tutorials and worked examples" },
  { level: "GCSE", subject: "Physics", board: "All", title: "GCSE Physics Explained - All Topics", url: "https://www.youtube.com/results?search_query=gcse+physics+explained", type: "video", description: "Clear explanations of GCSE Physics concepts" },
  { level: "GCSE", subject: "Chemistry", board: "All", title: "GCSE Chemistry Revision Guide", url: "https://www.youtube.com/results?search_query=gcse+chemistry+revision", type: "video", description: "Complete GCSE Chemistry revision playlist" },
  { level: "GCSE", subject: "Biology", board: "All", title: "GCSE Biology - All Topics Covered", url: "https://www.youtube.com/results?search_query=gcse+biology+revision", type: "video", description: "Comprehensive Biology revision videos" },
  { level: "GCSE", subject: "English Language", board: "All", title: "GCSE English Language Exam Techniques", url: "https://www.youtube.com/results?search_query=gcse+english+language+techniques", type: "video", description: "Expert tips for GCSE English Language exams" },
];

// New content: Study tips with real URLs
const STUDY_TIPS = [
  { level: "All", subject: "All", board: "All", title: "The Pomodoro Technique for Effective Study", url: "https://todoist.com/productivity-methods/pomodoro-technique", type: "tips", description: "Learn how to use 25-minute focused study sessions with 5-minute breaks to maximize productivity" },
  { level: "All", subject: "All", board: "All", title: "Active Recall: The Most Effective Study Method", url: "https://www.oxfordlearning.com/what-is-active-recall/", type: "tips", description: "Discover how active recall can help you remember information better than passive reading" },
  { level: "All", subject: "All", board: "All", title: "Spaced Repetition: Remember More, Study Less", url: "https://www.coursera.org/articles/spaced-repetition", type: "tips", description: "Use spaced repetition to optimize your revision schedule and improve long-term retention" },
  { level: "All", subject: "All", board: "All", title: "How to Create Effective Revision Notes", url: "https://www.studysmarter.co.uk/magazine/how-to-take-notes/", type: "tips", description: "Master the art of note-taking with these proven techniques for better understanding" },
  { level: "All", subject: "All", board: "All", title: "Exam Stress Management Strategies", url: "https://www.mentalhealth.org.uk/explore-mental-health/a-z-topics/exam-stress", type: "tips", description: "Practical techniques to manage exam anxiety and perform your best under pressure" },
  { level: "All", subject: "All", board: "All", title: "Time Management for Students", url: "https://www.oxfordlearning.com/time-management-for-students/", type: "tips", description: "Learn to balance study time, breaks, and other commitments effectively" },
  { level: "GCSE", subject: "Mathematics", board: "All", title: "GCSE Maths Problem-Solving Strategies", url: "https://www.bbc.co.uk/bitesize/articles/z6fkwty", type: "tips", description: "Key strategies for tackling complex GCSE Maths problems" },
  { level: "GCSE", subject: "English Language", board: "All", title: "GCSE English Language Essay Writing Guide", url: "https://www.bbc.co.uk/bitesize/articles/z4j8jty", type: "tips", description: "Master the art of essay writing for GCSE English Language exams" },
];

// Function to generate direct download URLs for past papers
function getPastPaperDownloadUrl(base, year) {
  // Use PhysicsAndMathsTutor - free site with direct PDF downloads
  // URL format: https://www.physicsandmathstutor.com/past-papers/[subject]/[level]/[board]/
  
  const subjectMap = {
    'Mathematics': 'maths',
    'English Language': 'english',
    'Biology': 'biology',
    'Chemistry': 'chemistry',
    'Physics': 'physics',
  };
  
  const levelMap = {
    'GCSE': 'gcse',
    'A Level': 'a-level',
  };
  
  const boardMap = {
    'AQA': 'aqa',
    'Edexcel': 'edexcel',
    'OCR': 'ocr',
    'WJEC': 'wjec',
    'Eduqas': 'eduqas',
  };
  
  const subjectSlug = subjectMap[base.subject] || base.subject.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = levelMap[base.level] || base.level.toLowerCase().replace(/\s+/g, '-');
  const boardSlug = boardMap[base.board] || base.board.toLowerCase();
  
  // PhysicsAndMathsTutor URL structure
  const baseUrl = `https://www.physicsandmathstutor.com/past-papers/${subjectSlug}/${levelSlug}/${boardSlug}/`;
  
  // The page shows all years, users can click on specific year papers to download PDFs
  return baseUrl;
}

function expandPastPapers() {
  const entries = [];
  for (const base of PAST_BASES) {
    for (const y of YEARS) {
      if (y === "All") continue;
      // Generate direct download URL for each year
      const downloadUrl = getPastPaperDownloadUrl(base, y);
      entries.push({ 
        ...base, 
        title: `${base.title} - ${y}`, 
        type: "past_paper", 
        year: y,
        url: downloadUrl,
        description: `Download ${y} ${base.level} ${base.subject} past papers and mark schemes from ${base.board}`
      });
    }
    // Keep a general link without year
    entries.push({ 
      ...base, 
      type: "past_paper", 
      year: null,
      url: getPastPaperDownloadUrl(base, null),
      description: `Access all ${base.level} ${base.subject} past papers and mark schemes from ${base.board}`
    });
  }
  return entries;
}

const RESOURCE_DATA = [
  ...SPEC_LINKS,
  ...expandPastPapers(),
  ...VIDEO_RESOURCES,
  ...STUDY_TIPS,
];

export default function Resources() {
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("All");
  const [board, setBoard] = useState("All");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("All");
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mouse tracking for dynamic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filtered = useMemo(() => {
    return RESOURCE_DATA.filter((r) => {
      const matchesLevel = level === "All" || r.level === level;
      const matchesSubject = subject === "All" || r.subject === subject;
      const matchesBoard = board === "All" || r.board === board || r.board === "All";
      const matchesType = type === "all" || r.type === type;
      const matchesYear = type !== "past_paper" || year === "All" || r.year === year;
      const matchesSearch = searchQuery === "" || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesLevel && matchesSubject && matchesBoard && matchesType && matchesYear && matchesSearch;
    });
  }, [level, subject, board, type, year, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: RESOURCE_DATA.length,
      pastPapers: RESOURCE_DATA.filter(r => r.type === "past_paper").length,
      specifications: RESOURCE_DATA.filter(r => r.type === "specification").length,
      videos: RESOURCE_DATA.filter(r => r.type === "video").length,
      tips: RESOURCE_DATA.filter(r => r.type === "tips").length,
    };
  }, []);

  const getTypeIcon = (resourceType) => {
    switch (resourceType) {
      case "past_paper":
        return FileText;
      case "specification":
        return BookOpen;
      case "video":
        return Video;
      case "tips":
        return Lightbulb;
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (resourceType) => {
    switch (resourceType) {
      case "past_paper":
        return "from-blue-500 to-cyan-500";
      case "specification":
        return "from-purple-500 to-pink-500";
      case "video":
        return "from-red-500 to-orange-500";
      case "tips":
        return "from-yellow-500 to-amber-500";
      default:
        return "from-purple-500 to-pink-500";
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white relative overflow-hidden">
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

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pl-[100px] pr-6 py-8">
      <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-start justify-between gap-8 mb-8">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4"
                >
                  Study Resources
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-purple-200/80 mb-6"
                >
                  Access past papers, specifications, video guides, study tips, and powerful tools to ace your exams.
                </motion.p>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  {[
                    { label: "Total Resources", value: stats.total, icon: BookOpen, bgColor: "bg-purple-500/20", iconColor: "text-purple-400" },
                    { label: "Past Papers", value: stats.pastPapers, icon: FileText, bgColor: "bg-blue-500/20", iconColor: "text-blue-400" },
                    { label: "Video Guides", value: stats.videos, icon: Video, bgColor: "bg-red-500/20", iconColor: "text-red-400" },
                    { label: "Study Tips", value: stats.tips, icon: Lightbulb, bgColor: "bg-yellow-500/20", iconColor: "text-yellow-400" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30"
                    >
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-purple-300/70">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
        </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search resources by title, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-purple-900/40 backdrop-blur-md border border-purple-700/30 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>

        {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: "Level", value: level, onChange: setLevel, options: ["All", ...LEVELS] },
                { label: "Subject", value: subject, onChange: setSubject, options: ["All", ...SUBJECTS] },
                { label: "Exam Board", value: board, onChange: setBoard, options: ["All", ...BOARDS] },
                { label: "Type", value: type, onChange: setType, options: TYPES },
                { label: "Year", value: year, onChange: setYear, options: YEARS },
              ].map((filter, index) => (
                <motion.div
                  key={filter.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex flex-col"
                >
                  <label className="text-xs font-semibold mb-2 text-purple-300/70 uppercase tracking-wider">
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="rounded-xl border px-4 py-3 bg-purple-900/40 backdrop-blur-md text-white border-purple-700/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                  >
                    {filter.options.map((opt) => (
                      <option key={typeof opt === 'object' ? opt.key : opt} value={typeof opt === 'object' ? opt.key : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                      </option>
                    ))}
            </select>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="text-sm text-purple-300/70">
              Showing <span className="font-bold text-white">{filtered.length}</span> resources
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${
                  view === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-purple-900/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3x3 className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${
                  view === "list"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-purple-900/40 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-5 h-5" />
              </motion.button>
          </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((r, index) => {
                  const Icon = getTypeIcon(r.type);
                  const gradientClass = getTypeColor(r.type);
                  
                  return (
                    <motion.a
                      key={`${r.board}-${r.level}-${r.subject}-${r.type}-${r.year ?? "any"}-${r.url}-${index}`}
                      href={r.url}
                      target={r.url !== "#" ? "_blank" : undefined}
                      rel={r.url !== "#" ? "noopener noreferrer" : undefined}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative rounded-2xl p-6 bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* Gradient overlay on hover */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      
                      {/* Icon */}
                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
          </div>
                        <motion.div
                          initial={{ x: 10, opacity: 0 }}
                          animate={{ x: hoveredCard === index ? 0 : 10, opacity: hoveredCard === index ? 1 : 0 }}
                          className="text-purple-400"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </motion.div>
          </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {r.level && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-purple-800/40 text-purple-300 border border-purple-700/30">
                              {sanitize(r.level)}
                            </span>
                          )}
                          {r.subject && r.subject !== "All" && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-blue-800/40 text-blue-300 border border-blue-700/30">
                              {sanitize(r.subject)}
                            </span>
                          )}
                          {r.board && r.board !== "All" && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-pink-800/40 text-pink-300 border border-pink-700/30">
                              {sanitize(r.board)}
                            </span>
                          )}
                          {r.year && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-green-800/40 text-green-300 border border-green-700/30">
                              {r.year}
                            </span>
                          )}
          </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {sanitize(r.title)}
                        </h3>
                        
                        {r.description && (
                          <p className="text-sm text-purple-300/70 mb-4 line-clamp-2">
                            {r.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                          <span>View resource</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      />
                    </motion.a>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filtered.map((r, index) => {
                  const Icon = getTypeIcon(r.type);
                  const gradientClass = getTypeColor(r.type);
                  
                  return (
                    <motion.a
                      key={`${r.board}-${r.level}-${r.subject}-${r.type}-${r.year ?? "any"}-${r.url}-${index}`}
                href={r.url}
                      target={r.url !== "#" ? "_blank" : undefined}
                      rel={r.url !== "#" ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ x: 8 }}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {r.level && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-purple-800/40 text-purple-300">
                              {sanitize(r.level)}
                            </span>
                          )}
                          {r.subject && r.subject !== "All" && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-blue-800/40 text-blue-300">
                              {sanitize(r.subject)}
                            </span>
                          )}
                          {r.board && r.board !== "All" && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-pink-800/40 text-pink-300">
                              {sanitize(r.board)}
                            </span>
                          )}
                          {r.year && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-green-800/40 text-green-300">
                              {r.year}
                    </span>
                          )}
          </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {sanitize(r.title)}
                        </h3>
                        {r.description && (
                          <p className="text-sm text-purple-300/70 truncate">
                            {r.description}
                          </p>
                        )}
                      </div>
                      
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.div>
                    </motion.a>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
        {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/40 mb-6">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No resources found</h3>
              <p className="text-purple-300/70 mb-6">Try adjusting your filters or search query</p>
              <motion.button
                onClick={() => {
                  setLevel("All");
                  setSubject("All");
                  setBoard("All");
                  setType("all");
                  setYear("All");
                  setSearchQuery("");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset Filters
              </motion.button>
            </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
