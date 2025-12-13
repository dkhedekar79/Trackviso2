import React from "react";
import { Link } from "react-router-dom";
import {
  FlameIcon, BookIcon, CalendarIcon, ListChecksIcon, BrainIcon,
  BarChart2Icon, Settings2Icon, LayoutDashboardIcon, BarChart3, GraduationCap, BookOpen
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 hover:w-64 group flex flex-col z-40 shadow-lg transition-all duration-300 ease-in-out" style={{ backgroundColor: "var(--sidebar-bg)" }}>
      {/* Always-visible overlay icons, disappear on hover */}
      <div className="absolute left-0 w-16 z-50 pointer-events-none">
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '96px' }}>
          <LayoutDashboardIcon className="w-5 h-5 text-white" />
        </div>
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '152px' }}>
          <BrainIcon className="w-5 h-5 text-white" />
        </div>
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '208px' }}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '264px' }}>
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '320px' }}>
          <BookIcon className="w-5 h-5 text-white" />
        </div>
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '376px' }}>
          <ListChecksIcon className="w-5 h-5 text-white" />
        </div>
        {/* <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '432px' }}>
          <CalendarIcon className="w-5 h-5 text-white" />
        </div> */}
        <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '432px' }}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {/* <div className="absolute w-16 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0" style={{ top: '488px' }}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div> */}
      </div>
      <div className="flex flex-col gap-2 w-full pt-24 pb-4">
        <Link to="/dashboard" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Dashboard">
          <LayoutDashboardIcon className="w-5 h-5 text-white opacity-1000" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
        </Link>
        <Link to="/study" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Study">
          <BrainIcon className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Study</span>
        </Link>
        <Link
          to="/mastery"
          className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10"
          title="Mastery"
        >
          <BookOpen className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Mastery</span>
        </Link>
        <Link to="/insights" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Insights">
          <BarChart3 className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Insights</span>
        </Link>
        <Link to="/subjects" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Subjects">
          <BookIcon className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Subjects</span>
        </Link>
        <Link to="/tasks" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Tasks">
          <ListChecksIcon className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Tasks</span>
        </Link>
        {/* <Link to="/schedule" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Study Planner">
          <CalendarIcon className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Schedule</span>
        </Link> */}
        <Link to="/resources" className="flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Resources">
          <GraduationCap className="w-5 h-5 text-white" />
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Resources</span>
        </Link>
      </div>
      <Link to="/settings" className="mt-auto flex items-center gap-3 px-6 py-3 focus:outline-none transition theme-hover-primary-10" title="Settings">
        <Settings2Icon className="w-5 h-5 text-white" />
        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Settings</span>
      </Link>
    </aside>
  );
}
