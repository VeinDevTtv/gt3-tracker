import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ComingSoonPage from './pages/ComingSoonPage';
import Charts from './pages/Charts';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import NavMenu from './components/NavMenu';
import { Toaster } from 'react-hot-toast';
import goalManager from './services/GoalManager';
import achievementManager from './services/AchievementManager';
import { GoalsProvider } from './contexts/GoalsContext';
import { TooltipProvider } from './components/ui/tooltip';
import { AIProvider } from './contexts/AIContext';

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#e11d48' }}>Something went wrong</h1>
          <pre style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto' 
          }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <p>Check the console for more details.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function GT3Tracker() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('savings-tracker-theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  // Theme color scheme
  const [themeColor, setThemeColor] = useState(() => {
    const savedThemeColor = localStorage.getItem('savings-tracker-theme-color');
    return savedThemeColor || 'blue';
  });
  
  // Toast notifications
  const [toast, setToast] = useState(null);
  
  // Initialize services
  useEffect(() => {
    goalManager.initialize();
    achievementManager.initialize();
    achievementManager.checkTimeBasedAchievements();
  }, []);
  
  // Other state
  const [visibleWeeks, setVisibleWeeks] = useState(() => {
    const savedVisibleWeeks = localStorage.getItem('savings-tracker-visible-weeks');
    return savedVisibleWeeks ? parseInt(savedVisibleWeeks) : 12;
  });
  
  const [showCumulative, setShowCumulative] = useState(() => {
    const savedShowCumulative = localStorage.getItem('savings-tracker-show-cumulative');
    return savedShowCumulative ? savedShowCumulative === 'true' : true;
  });
  
  // AI Assistant settings
  const [openAIKey, setOpenAIKey] = useState(() => localStorage.getItem('openai-api-key') || '');
  const [poeKey, setPoeKey] = useState(() => localStorage.getItem('poe-api-key') || '');
  const [replicateKey, setReplicateKey] = useState(() => localStorage.getItem('replicate-api-key') || '');
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('ollama-url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('ollama-model') || 'llama3');
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('ai-provider') || 'openai');

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savings-tracker-visible-weeks', visibleWeeks.toString());
  }, [visibleWeeks]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-show-cumulative', showCumulative.toString());
  }, [showCumulative]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-theme-color', themeColor);
    
    // Remove all other theme color classes
    document.documentElement.classList.remove(
      'theme-blue', 
      'theme-green', 
      'theme-red', 
      'theme-purple', 
      'theme-orange'
    );
    
    // Add the current theme color class
    document.documentElement.classList.add(`theme-${themeColor}`);
  }, [themeColor]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Handle theme color change
  const changeThemeColor = (color) => {
    setThemeColor(color);
  };

  // Handle visible weeks change
  const handleVisibleWeeksChange = useCallback((e) => {
    setVisibleWeeks(Math.max(4, parseInt(e.target.value) || 4));
  }, []);

  // Handle toggle cumulative
  const handleToggleCumulative = useCallback((value) => {
    setShowCumulative(value);
  }, []);

  // Stubbed functions needing context/refactoring
  const showToast = useCallback((message, emoji = null) => {
    // Keep toast logic
    const toastId = Date.now(); // Simple unique ID
    setToast({ id: toastId, message, emoji });
    // Auto-dismiss after a few seconds
    setTimeout(() => {
        setToast(current => (current?.id === toastId ? null : current));
    }, 4000); 
  }, []);
  
  const resetValues = () => { showToast('Reset function needs refactoring (Context access required).', '⚠️'); };
  const exportAsCSV = () => { showToast('Export CSV function needs refactoring (Context access required).', '⚠️'); };
  const exportAsJSON = () => { showToast('Export JSON function needs refactoring (Context access required).', '⚠️'); };
  const importJSON = () => { showToast('Import JSON function needs refactoring (Context access required).', '⚠️'); };
  const generatePdfReport = () => { showToast('PDF Report function needs refactoring (Context access required).', '⚠️'); };
  const generateSharingImage = () => { showToast('Sharing Image function needs refactoring (Context access required).', '⚠️'); };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoalsProvider>
          <AIProvider>
            <TooltipProvider>
              <Router>
                <div className={`${theme} min-h-screen flex flex-col`}>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: theme === 'dark' ? '#1F2937' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#1F2937',
                      },
                    }}
                  />
                  
                  <NavMenu theme={theme} toggleTheme={toggleTheme} />
                  
                  {toast && (
                    <div 
                       key={toast.id} // Use key for animation/transition group later if needed
                       className={`fixed top-4 right-4 py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 z-50 transform transition-all duration-300 ease-out animate-slide-in ${ 
                        theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800' 
                      }`}
                       style={{ animation: 'slideInRight 0.5s ease-out forwards' }} // Basic slide-in animation
                    >
                      {toast.emoji && <span className="text-xl">{toast.emoji}</span>}
                      <p>{toast.message}</p>
                      <button onClick={() => setToast(null)} className="ml-2 text-lg font-bold">&times;</button> 
                    </div>
                   )}
                   <style>{`
                     @keyframes slideInRight {
                       from { transform: translateX(100%); opacity: 0; }
                       to { transform: translateX(0); opacity: 1; }
                     }
                     .animate-slide-in { animation: slideInRight 0.5s ease-out forwards; }
                   `}</style>
                  
                  <main className="flex-grow">
                    <Routes>
                      {/* Auth routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      
                      {/* Protected routes */}
                      <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Home theme={theme} toast={toast} setToast={setToast} />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/goals" element={
                          <ComingSoonPage 
                            theme={theme}
                            title="Goal & Achievement Management"
                            description="This section is under construction. Manage goals and view achievements here soon!"
                          />
                        } />
                        <Route path="/charts" element={<Charts />} />
                        <Route path="/settings" element={
                          <Settings 
                            theme={theme}
                            visibleWeeks={visibleWeeks}
                            showCumulative={showCumulative}
                            onVisibleWeeksChange={handleVisibleWeeksChange}
                            onToggleCumulative={handleToggleCumulative}
                            themeColor={themeColor}
                            onThemeColorChange={changeThemeColor}
                            setTheme={setTheme}
                            openAIKey={openAIKey}
                            setOpenAIKey={setOpenAIKey}
                            poeKey={poeKey}
                            setPoeKey={setPoeKey}
                            replicateKey={replicateKey}
                            setReplicateKey={setReplicateKey}
                            ollamaUrl={ollamaUrl}
                            setOllamaUrl={setOllamaUrl}
                            ollamaModel={ollamaModel}
                            setOllamaModel={setOllamaModel}
                            aiProvider={aiProvider}
                            setAiProvider={setAiProvider}
                          />
                        } />
                      </Route>
                    </Routes>
                  </main>
                </div>
              </Router>
            </TooltipProvider>
          </AIProvider>
        </GoalsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
