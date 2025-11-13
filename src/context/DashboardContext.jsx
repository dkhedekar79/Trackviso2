import React, { createContext, useState, useContext } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [showGamified, setShowGamified] = useState(true);

  const toggleDashboard = () => {
    setShowGamified(prev => !prev);
  };

  return (
    <DashboardContext.Provider value={{ showGamified, toggleDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
