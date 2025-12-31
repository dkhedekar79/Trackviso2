import React, { createContext, useState, useContext } from 'react';

// Provide default value to prevent initialization errors
const defaultDashboardContext = {
  showGamified: true,
  toggleDashboard: () => {},
};

const DashboardContext = createContext(defaultDashboardContext);

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
  // Return context even if provider isn't ready (defensive)
  return context || defaultDashboardContext;
};
