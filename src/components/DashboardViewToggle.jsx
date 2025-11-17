import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function DashboardViewToggle() {
  const { showGamified, toggleDashboard } = useDashboard();

  return (
    <div className="inline-flex rounded-lg border border-white/20 backdrop-blur bg-white/5 p-1">
      <button
        onClick={toggleDashboard}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
          !showGamified
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white'
        }`}
      >
        Basic View
      </button>
      
      
      <button
        onClick={toggleDashboard}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
          showGamified
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
            : 'text-white/70 hover:text-white'
        }`}
      >
        Full View
      </button>
      
    </div>
  );
}
