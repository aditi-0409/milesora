import React, { createContext, useContext, useState, useEffect } from 'react';
import { isDemoMode, setDemoMode as saveDemoMode } from '../services/modeConfig';
import { mockAdapter } from '../services/mockAdapter';

const DemoModeContext = createContext(null);

export function DemoModeProvider({ children }) {
  const [isDemo, setIsDemo] = useState(isDemoMode());

  useEffect(() => {
    const handleModeChange = (e) => {
      setIsDemo(e.detail.demoMode);
    };
    window.addEventListener('taskora:mode-change', handleModeChange);
    return () => window.removeEventListener('taskora:mode-change', handleModeChange);
  }, []);

  const toggleDemoMode = () => {
    const next = !isDemo;
    setIsDemo(next);
    saveDemoMode(next);
  };

  const resetMockData = () => {
    mockAdapter.initDatabase(true);
    window.location.reload();
  };

  return (
    <DemoModeContext.Provider value={{ isDemo, toggleDemoMode, resetMockData }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
