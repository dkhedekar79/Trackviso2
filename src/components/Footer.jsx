import React from "react";
import { Link } from "react-router-dom";
import { APP_VERSION } from "../version";

const Footer = ({ withSidebar = false }) => {
  return (
    <footer className={`text-sm px-6 py-8 border-t ${withSidebar ? "ml-16" : ""}`} style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-text)", borderColor: "var(--footer-border)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-3 text-[var(--text-on-surface)]">Trackviso</h3>
          <p className="opacity-80">Level up your study game.</p>
          <p className="mt-3 opacity-60">Version {APP_VERSION}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--text-on-surface)]">App</h4>
          <ul className="space-y-2">
            <li><Link className="hover:text-[var(--on-primary)]" to="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/study">Study</Link></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/subjects">Subjects</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--text-on-surface)]">Productivity</h4>
          <ul className="space-y-2">
            <li><Link className="hover:text-[var(--on-primary)]" to="/tasks">Tasks</Link></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/schedule">Schedule</Link></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/insights">Insights</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--text-on-surface)]">Company</h4>
          <ul className="space-y-2">
            <li><a className="hover:text-[var(--on-primary)]" href="mailto:dskhedekar7@gmail.com">Contact</a></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-[var(--on-primary)]" to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "var(--footer-border)" }}>
        <span className="opacity-60">© {new Date().getFullYear()} Trackviso</span>
        <div className="space-x-4">
          <Link className="hover:text-[var(--on-primary)]" to="/privacy#contact">Support</Link>
          <a className="hover:text-[var(--on-primary)]" href="mailto:dskhedekar7@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
