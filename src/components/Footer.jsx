import React from "react";
import { Link } from "react-router-dom";
import { APP_VERSION } from "../version";

const Footer = ({ withSidebar = false }) => {
  return (
    <footer className={`bg-[#0f172a] text-gray-300 text-sm px-6 py-8 border-t border-gray-800 ${withSidebar ? "ml-16" : ""}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-3">Trackviso</h3>
          <p className="text-gray-400">Level up your study game.</p>
          <p className="mt-3 text-gray-500">Version {APP_VERSION}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">App</h4>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" to="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white" to="/study">Study</Link></li>
            <li><Link className="hover:text-white" to="/subjects">Subjects</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Productivity</h4>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" to="/tasks">Tasks</Link></li>
            <li><Link className="hover:text-white" to="/schedule">Schedule</Link></li>
            <li><Link className="hover:text-white" to="/insights">Insights</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2">
            <li><a className="hover:text-white" href="mailto:dskhedekar7@gmail.com">Contact</a></li>
            <li><Link className="hover:text-white" to="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-white" to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-gray-500">© {new Date().getFullYear()} Trackviso</span>
        <div className="space-x-4">
          <Link className="hover:text-white" to="/privacy#contact">Support</Link>
          <a className="hover:text-white" href="mailto:dskhedekar7@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
