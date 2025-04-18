import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import NavMenu from './components/NavMenu';
import { Toaster } from 'react-hot-toast';
import goalManager from './services/GoalManager';
import achievementManager from './services/AchievementManager';
import { GoalsProvider } from './contexts/GoalsContext';
import { TooltipProvider } from './components/ui/tooltip';

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

const MILESTONES = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000];

// Initialize with configurable number of weeks
const createInitialWeeks = (numberOfWeeks) => {
  return Array.from({ length: numberOfWeeks }, (_, i) => ({
  week: i + 1,
  profit: 0,
  cumulative: 0,
}));
};

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
  }, []);
  
  // Load active goal data
  const [activeGoal, setActiveGoal] = useState(null);
  
  useEffect(() => {
    const loadActiveGoal = () => {
      const goal = goalManager.getActiveGoal();
      setActiveGoal(goal);
    };
    
    loadActiveGoal();
    
    // Setup an event listener to check for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === goalManager.GOALS_STORAGE_KEY || e.key === goalManager.ACTIVE_GOAL_KEY) {
        loadActiveGoal();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Legacy state - mapped from active goal for backward compatibility
  const [goalName, setGoalName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(49);
  const [weeks, setWeeks] = useState([]);
  const [target, setTarget] = useState(0);
  
  // Sync state with active goal
  useEffect(() => {
    if (activeGoal) {
      setGoalName(activeGoal.name || 'Porsche GT3');
      setStartDate(activeGoal.startDate || new Date().toISOString().split('T')[0]);
      setWeeks(activeGoal.weeks || createInitialWeeks(totalWeeks));
      setTarget(activeGoal.target || 280000);
    }
  }, [activeGoal, totalWeeks]);
  
  // Other state
  const [visibleWeeks, setVisibleWeeks] = useState(() => {
    const savedVisibleWeeks = localStorage.getItem('savings-tracker-visible-weeks');
    return savedVisibleWeeks ? parseInt(savedVisibleWeeks) : 12;
  });
  
  const [showCumulative, setShowCumulative] = useState(() => {
    const savedShowCumulative = localStorage.getItem('savings-tracker-show-cumulative');
    return savedShowCumulative ? savedShowCumulative === 'true' : true;
  });
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(() => {
    return activeGoal?.lastMilestone || 0;
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
    if (activeGoal?.id) {
      goalManager.updateGoal(activeGoal.id, { 
        weeks,
        lastMilestone
      });
    }
  }, [weeks, lastMilestone, activeGoal?.id]);

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

  // Calculate streak information
  const streakInfo = useMemo(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Check if there's any week with profit
    const hasAnyProfit = weeks.some(week => week.profit > 0);
    
    // If no entries with profit, return zero streaks
    if (!hasAnyProfit) {
      return { currentStreak: 0, bestStreak: 0 };
    }
    
    // Calculate best streak across all weeks
    for (const week of weeks) {
      if (week.profit > 0) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate current streak (must be at the end)
    // Start from the end and count consecutive weeks with profit
    let foundProfit = false;
    
    for (let i = weeks.length - 1; i >= 0; i--) {
      // If we find a profitable week
      if (weeks[i].profit > 0) {
        foundProfit = true;
        currentStreak++;
      } 
      // Only break on zero profit if we've already found at least one profit entry
      // This prevents empty weeks at the end from breaking the streak
      else if (foundProfit) {
        break;
      }
    }
    
    return { currentStreak, bestStreak };
  }, [weeks]);

  // Show a toast notification
  const showToast = useCallback((message, emoji = null) => {
    setToast({ message, emoji });
  }, []);

  // Memoized profit change handler
  const handleProfitChange = (weekIndex, profit) => {
    const profitNum = parseFloat(profit) || 0;
    
    // Create a new weeks array with the updated profit
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex] = {
      ...updatedWeeks[weekIndex],
      profit: profitNum
    };
    
    // Recalculate the cumulative profits
    let cumulative = 0;
    for (let i = 0; i < updatedWeeks.length; i++) {
      cumulative += updatedWeeks[i].profit;
      updatedWeeks[i].cumulative = cumulative;
    }
    
    setWeeks(updatedWeeks);
    
    // Check for milestones
    if (profitNum > 0) {
      const totalProfit = updatedWeeks.reduce((sum, week) => sum + week.profit, 0);
      const newMilestone = MILESTONES.find(milestone => 
        totalProfit >= milestone && milestone > lastMilestone
      );
      
      if (newMilestone) {
        setLastMilestone(newMilestone);
        showToast(`🎉 Milestone reached: ${(newMilestone/1000)}k!`, '🏆');
        
        // Trigger confetti celebration
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Show toast for new profit
        showToast(`Added ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(profitNum)} for Week ${weekIndex + 1}`, '💰');
      }
    }
    
    // Save to goal manager
    if (activeGoal?.id) {
      goalManager.updateGoal(activeGoal.id, { 
        weeks: updatedWeeks,
        lastMilestone
      });
      
      // Check for achievements
      achievementManager.checkForAchievements({
        goals: goalManager.getGoals(),
        activeGoal: goalManager.getActiveGoal(),
        weeks: updatedWeeks
      });
    }
  };

  const handleTargetChange = (newTarget) => {
    setTarget(newTarget);
    if (activeGoal?.id) {
      goalManager.updateGoal(activeGoal.id, { target: newTarget });
    }
  };
  
  const handleGoalNameChange = (name) => {
    setGoalName(name);
    if (activeGoal?.id) {
      goalManager.updateGoal(activeGoal.id, { name });
    }
  };
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (activeGoal?.id) {
      goalManager.updateGoal(activeGoal.id, { startDate: date });
    }
  };

  const handleTotalWeeksChange = useCallback((e) => {
    const newTotalWeeks = parseInt(e.target.value) || 4;
    if (newTotalWeeks !== totalWeeks) {
      setTotalWeeks(newTotalWeeks);
      
      // Adjust weeks array
      if (newTotalWeeks > weeks.length) {
        // Add more weeks
        const additionalWeeks = Array.from(
          { length: newTotalWeeks - weeks.length }, 
          (_, i) => ({
            week: weeks.length + i + 1,
            profit: 0,
            cumulative: weeks.length > 0 ? weeks[weeks.length - 1].cumulative : 0
          })
        );
        setWeeks([...weeks, ...additionalWeeks]);
      } else if (newTotalWeeks < weeks.length) {
        // Remove weeks
        setWeeks(weeks.slice(0, newTotalWeeks));
        // Adjust visible weeks if needed
        if (visibleWeeks > newTotalWeeks) {
          setVisibleWeeks(newTotalWeeks);
        }
      }
    }
  }, [totalWeeks, weeks, visibleWeeks]);
  
  const handleVisibleWeeksChange = useCallback((e) => {
    setVisibleWeeks(Math.min(totalWeeks, Math.max(4, parseInt(e.target.value) || 4)));
  }, [totalWeeks]);
  
  const handleToggleCumulative = useCallback((value) => {
    setShowCumulative(value);
  }, []);

  const resetValues = (closeDialog) => {
    const activeGoal = goalManager.getActiveGoal();
    if (!activeGoal) {
      showToast('No active goal to reset', '⚠️');
      return;
    }
    
    const newWeeks = createInitialWeeks(totalWeeks);
    
    // Update goal with new empty weeks and reset milestone
    goalManager.updateGoal(activeGoal.id, { 
      weeks: newWeeks,
      lastMilestone: null
    });
    
    // Update local state for UI
    setWeeks(newWeeks);
    setLastMilestone(0);
    
    // Close the dialog if callback provided
    if (typeof closeDialog === 'function') {
      closeDialog(false);
    }
    
    showToast('All data has been reset successfully', '🔄');
  };
  
  // Debug check for resetValues
  console.log("App.js: resetValues function exists?", !!resetValues);
  console.log("App.js: resetValues type:", typeof resetValues);

  // Memoized calculations
  const totalProfit = useMemo(() => 
    weeks.length > 0 ? weeks[weeks.length - 1].cumulative : 0, 
    [weeks]
  );
  
  const remaining = useMemo(() => 
    Math.max(0, target - totalProfit), 
    [target, totalProfit]
  );
  
  const progressPercentage = useMemo(() => 
    Math.min(100, (totalProfit / target) * 100), 
    [totalProfit, target]
  );

  const displayedWeeks = useMemo(() => 
    weeks.slice(0, Math.min(visibleWeeks, weeks.length)), 
    [weeks, visibleWeeks]
  );
  
  // Current week, weeks remaining, and weekly target calculations
  const currentWeek = useMemo(() => 
    weeks.findIndex(week => week.profit > 0) + 1, 
    [weeks]
  );
  
  const weeksRemaining = useMemo(() => 
    totalWeeks - (currentWeek > 0 ? currentWeek : 0), 
    [totalWeeks, currentWeek]
  );
  
  const weeklyTargetAverage = useMemo(() => 
    weeksRemaining > 0 ? remaining / weeksRemaining : 0, 
    [remaining, weeksRemaining]
  );
  
  // Prediction calculation - when will goal be reached
  const prediction = useMemo(() => {
    // Calculate weeks with any profit data
    const weeksWithProfit = weeks.filter(week => week.profit > 0);
    
    // Return early with a different type of prediction if no profit data at all
    if (weeksWithProfit.length === 0) {
      return {
        insufficient: true,
        message: "No savings data yet",
        reason: "start_saving"
      };
    }
    
    // If only one week of data, we can still make a very rough estimate
    // but we'll flag it as very preliminary
    const avgWeeklyProfit = weeksWithProfit.reduce((sum, week) => sum + week.profit, 0) / weeksWithProfit.length;
    
    // If average profit is zero or negative, we can't make a prediction
    if (avgWeeklyProfit <= 0) {
      return {
        insufficient: true,
        message: "Unable to calculate",
        reason: "negative_profit",
        data: { avgWeeklyProfit }
      };
    }
    
    // Calculate how many more weeks needed
    const weeksNeeded = Math.ceil(remaining / avgWeeklyProfit);
    
    // Calculate target date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weeksNeeded * 7));
    
    const formattedDate = targetDate.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Return a prediction with confidence level
    return {
      weeksNeeded,
      targetDate: formattedDate,
      avgWeeklyProfit,
      confidence: weeksWithProfit.length === 1 ? "low" : 
                 weeksWithProfit.length < 4 ? "medium" : "high",
      dataPoints: weeksWithProfit.length
    };
  }, [weeks, remaining]);

  // Generate PDF report
  const generatePdfReport = useCallback(() => {
    import('html2pdf.js').then(html2pdf => {
      // Create a styled container for our report
      const reportContainer = document.createElement('div');
      reportContainer.style.fontFamily = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      reportContainer.style.maxWidth = '800px';
      reportContainer.style.margin = '0 auto';
      reportContainer.style.fontSize = '12px';
      reportContainer.style.lineHeight = '1.5';
      
      // Get the theme color for consistent branding
      const colorMap = {
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        purple: '#8b5cf6',
        orange: '#f97316'
      };
      
      const accentColor = colorMap[themeColor] || colorMap.blue;
      
      // Add report content
      const reportDate = new Date().toLocaleDateString();
      const totalSaved = weeks.reduce((sum, week) => sum + week.profit, 0);
      const remainingAmount = target - totalSaved;
      const percentComplete = (totalSaved / target) * 100;
      
      reportContainer.innerHTML = `
        <style>
          /* Reset and base styles */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          .report-container {
            padding: 40px;
            color: #333;
          }
          
          h1, h2, h3 {
            color: #222;
            font-weight: 600;
          }
          
          .report-header {
            position: relative;
            padding-bottom: 20px;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
          }
          
          .report-header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100px;
            height: 3px;
            background-color: ${accentColor};
          }
          
          .logo-area {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          
          .logo {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background-color: ${accentColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }
          
          .date {
            color: #666;
            font-size: 13px;
          }
          
          .stats-cards {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            flex: 1;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          }
          
          .stat-card h3 {
            font-size: 14px;
            font-weight: 500;
            color: #666;
            margin-bottom: 8px;
          }
          
          .stat-card p {
            font-size: 22px;
            font-weight: 700;
            color: #222;
          }
          
          .highlight {
            color: ${accentColor};
          }
          
          .progress-section {
            margin-bottom: 30px;
          }
          
          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 10px;
          }
          
          .progress-bar-container {
            height: 12px;
            background: #eee;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .progress-bar {
            height: 100%;
            background: ${accentColor};
            border-radius: 6px;
          }
          
          .data-section {
            margin-bottom: 30px;
          }
          
          .section-title {
            position: relative;
            font-size: 16px;
            padding-bottom: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 50px;
            height: 3px;
            background-color: ${accentColor};
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .data-table th {
            text-align: left;
            padding: 10px;
            background: #f5f5f5;
            font-weight: 600;
            font-size: 12px;
          }
          
          .data-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 12px;
          }
          
          .data-table tr:last-child td {
            border-bottom: none;
          }
          
          .weeks-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .weeks-table th {
            padding: 10px;
            text-align: left;
            background: #f5f5f5;
            font-weight: 600;
            font-size: 12px;
          }
          
          .weeks-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 12px;
          }
          
          .trend-indicator {
            display: inline-block;
            margin-left: 5px;
            font-size: 10px;
          }
          
          .positive {
            color: #10b981;
          }
          
          .negative {
            color: #ef4444;
          }
          
          .amount {
            font-family: monospace;
            font-size: 13px;
            text-align: right;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 11px;
          }
        </style>
        
        <div class="report-container">
          <div class="report-header">
            <div class="logo-area">
              <div class="logo">GT3</div>
              <div class="date">Generated on ${reportDate}</div>
            </div>
            <h1>${goalName} Savings Report</h1>
          </div>
          
          <div class="stats-cards">
            <div class="stat-card">
              <h3>Target Amount</h3>
              <p>${target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
            <div class="stat-card">
              <h3>Total Saved</h3>
              <p>${totalSaved.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
            <div class="stat-card">
              <h3>Remaining</h3>
              <p>${remainingAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <h2 class="section-title">Progress</h2>
              <span class="highlight" style="font-weight: 700; font-size: 16px;">${percentComplete.toFixed(1)}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${Math.min(100, percentComplete)}%;"></div>
            </div>
          </div>
          
          <div class="data-section">
            <h2 class="section-title">Savings Statistics</h2>
            <table class="data-table">
              <tr>
                <th>Statistic</th>
                <th style="text-align: right;">Value</th>
              </tr>
              <tr>
                <td>Weeks with Data</td>
                <td style="text-align: right;">${weeks.filter(w => w.profit > 0).length} of ${weeks.length}</td>
              </tr>
              <tr>
                <td>Average Weekly Saving</td>
                <td style="text-align: right; font-family: monospace;">
                  ${(weeks.filter(w => w.profit > 0).length > 0 
                    ? (totalSaved / weeks.filter(w => w.profit > 0).length) 
                    : 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
              </tr>
              <tr>
                <td>Current Streak</td>
                <td style="text-align: right;">${streakInfo.currentStreak} weeks</td>
              </tr>
              <tr>
                <td>Best Streak</td>
                <td style="text-align: right;">${streakInfo.bestStreak} weeks</td>
              </tr>
              <tr>
                <td>Weekly Target (Avg. to reach goal)</td>
                <td style="text-align: right; font-family: monospace;">${(target / totalWeeks).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
              </tr>
              <tr>
                <td>Start Date</td>
                <td style="text-align: right;">${startDate}</td>
              </tr>
            </table>
          </div>
          
          <div class="data-section">
            <h2 class="section-title">Recent Weekly Savings</h2>
            <table class="weeks-table">
              <tr>
                <th>Week</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: right;">Cumulative</th>
                <th style="text-align: right;">% of Target</th>
              </tr>
              ${weeks.slice(-10).map((week, i, arr) => {
                const prevWeek = i > 0 ? arr[i-1] : null;
                const isIncrease = prevWeek ? week.profit > prevWeek.profit : false;
                const percentOfTarget = (week.profit / (target / totalWeeks) * 100).toFixed(1);
                
                return `
                  <tr>
                    <td>Week ${week.week}</td>
                    <td class="amount">
                      ${week.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      ${prevWeek ? `<span class="trend-indicator ${isIncrease ? 'positive' : 'negative'}">
                        ${isIncrease ? '▲' : '▼'}
                      </span>` : ''}
                    </td>
                    <td class="amount">
                      ${week.cumulative.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td style="text-align: right;">
                      ${percentOfTarget}%
                    </td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
          
          <div class="footer">
            <p>This report was generated by the ${goalName} Savings Tracker</p>
            <p>All data is stored locally in your browser.</p>
          </div>
        </div>
      `;
      
      // Append to document temporarily (needed for html2pdf)
      document.body.appendChild(reportContainer);
      
      // Create PDF
      const element = reportContainer;
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${goalName.replace(/\s+/g, '-')}-savings-report.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      // Generate PDF and remove the temporary element when done
      html2pdf.default()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          document.body.removeChild(reportContainer);
          showToast('PDF report generated successfully', '📄');
        });
    }).catch(error => {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF report', '❌');
    });
  }, [weeks, target, goalName, startDate, streakInfo, themeColor, totalWeeks]);
  
  // Generate social media sharing image
  const generateSharingImage = useCallback(() => {
    import('html2canvas').then(html2canvasModule => {
      const html2canvas = html2canvasModule.default;
      
      // Create a styled container for our sharing image
      const shareContainer = document.createElement('div');
      shareContainer.style.padding = '30px';
      shareContainer.style.fontFamily = 'Arial, sans-serif';
      shareContainer.style.width = '1200px';
      shareContainer.style.height = '630px';
      shareContainer.style.position = 'fixed';
      shareContainer.style.top = '-9999px';
      shareContainer.style.left = '-9999px';
      shareContainer.style.background = theme === 'dark' ? '#1a202c' : 'white';
      shareContainer.style.color = theme === 'dark' ? 'white' : '#333';
      shareContainer.style.borderRadius = '15px';
      shareContainer.style.overflow = 'hidden';
      shareContainer.style.boxSizing = 'border-box';
      
      // Add content
      const totalSaved = weeks.reduce((sum, week) => sum + week.profit, 0);
      const remainingAmount = target - totalSaved;
      const percentComplete = (totalSaved / target) * 100;
      
      // Theme color map
      const colorMap = {
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        purple: '#8b5cf6',
        orange: '#f97316'
      };
      
      const accentColor = colorMap[themeColor] || colorMap.blue;
      
      shareContainer.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column; padding:40px; box-sizing:border-box; position:relative; overflow:hidden;">
          <div style="position:absolute; top:-100px; right:-100px; width:400px; height:400px; border-radius:50%; background:${accentColor}; opacity:0.1;"></div>
          <div style="position:absolute; bottom:-150px; left:-150px; width:350px; height:350px; border-radius:50%; background:${accentColor}; opacity:0.05;"></div>
          
          <div style="flex:0; margin-bottom:30px;">
            <h1 style="font-size:48px; margin:0; color:${accentColor};">My ${goalName} Journey</h1>
            <p style="font-size:24px; margin:10px 0 0; opacity:0.7;">Progress Update</p>
          </div>
          
          <div style="flex:1; display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <div style="text-align:center; flex:1;">
              <p style="font-size:24px; opacity:0.7; margin:0;">Target Amount</p>
              <h2 style="font-size:46px; margin:10px 0; font-weight:bold;">${target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h2>
            </div>
            <div style="text-align:center; flex:1;">
              <p style="font-size:24px; opacity:0.7; margin:0;">Progress</p>
              <h2 style="font-size:60px; margin:0; color:${accentColor}; font-weight:bold;">${percentComplete.toFixed(1)}%</h2>
            </div>
            <div style="text-align:center; flex:1;">
              <p style="font-size:24px; opacity:0.7; margin:0;">Total Saved</p>
              <h2 style="font-size:46px; margin:10px 0; font-weight:bold;">${totalSaved.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h2>
            </div>
          </div>
          
          <div style="flex:0; margin-bottom:40px;">
            <div style="background:${theme === 'dark' ? '#374151' : '#e5e7eb'}; height:40px; border-radius:20px; overflow:hidden; width:100%;">
              <div style="background:${accentColor}; width:${Math.min(100, percentComplete)}%; height:100%;"></div>
            </div>
      </div>

          <div style="flex:0; display:flex; justify-content:space-between;">
            <div style="flex:1; padding:20px; background:${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}; border-radius:15px; margin-right:15px;">
              <p style="font-size:20px; margin:0;">Current Streak</p>
              <h3 style="font-size:36px; margin:5px 0; color:${accentColor};">${streakInfo.currentStreak} weeks</h3>
            </div>
            <div style="flex:1; padding:20px; background:${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}; border-radius:15px; margin-right:15px;">
              <p style="font-size:20px; margin:0;">Weekly Average</p>
              <h3 style="font-size:36px; margin:5px 0; color:${accentColor};">${
                (weeks.filter(w => w.profit > 0).length > 0 
                  ? (totalSaved / weeks.filter(w => w.profit > 0).length) 
                  : 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
              }</h3>
            </div>
            <div style="flex:1; padding:20px; background:${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}; border-radius:15px;">
              <p style="font-size:20px; margin:0;">Remaining</p>
              <h3 style="font-size:36px; margin:5px 0; color:${accentColor};">${remainingAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h3>
            </div>
          </div>
          
          <div style="margin-top:auto; opacity:0.5; text-align:center; font-size:18px;">
            Generated with GT3 Savings Tracker
      </div>
    </div>
      `;
      
      // Append to document temporarily
      document.body.appendChild(shareContainer);
      
      // Convert to canvas
      html2canvas(shareContainer, {
        scale: 1,
        logging: false,
        useCORS: true
      }).then(canvas => {
        // Create sharing dialog
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.right = '0';
        dialog.style.bottom = '0';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        dialog.style.zIndex = '9999';
        dialog.style.display = 'flex';
        dialog.style.alignItems = 'center';
        dialog.style.justifyContent = 'center';
        dialog.style.padding = '20px';
        
        // Create dialog content
        const content = document.createElement('div');
        content.style.backgroundColor = theme === 'dark' ? '#1a202c' : 'white';
        content.style.borderRadius = '10px';
        content.style.padding = '20px';
        content.style.width = '90%';
        content.style.maxWidth = '800px';
        content.style.maxHeight = '90vh';
        content.style.overflow = 'auto';
        content.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Add dialog header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '20px';
        
        const title = document.createElement('h2');
        title.textContent = 'Share Your Progress';
        title.style.margin = '0';
        title.style.color = theme === 'dark' ? 'white' : '#333';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = theme === 'dark' ? 'white' : '#333';
        closeButton.onclick = () => document.body.removeChild(dialog);
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Add preview
        const preview = document.createElement('div');
        preview.style.textAlign = 'center';
        preview.style.marginBottom = '20px';
        
        // Resize canvas for preview
        const previewCanvas = document.createElement('canvas');
        const ctx = previewCanvas.getContext('2d');
        previewCanvas.width = 600;
        previewCanvas.height = 315;
        ctx.drawImage(canvas, 0, 0, 1200, 630, 0, 0, 600, 315);
        previewCanvas.style.width = '100%';
        previewCanvas.style.height = 'auto';
        previewCanvas.style.borderRadius = '8px';
        previewCanvas.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        
        preview.appendChild(previewCanvas);
        
        // Add action buttons
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.flexWrap = 'wrap';
        actions.style.gap = '10px';
        actions.style.justifyContent = 'center';
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Image';
        downloadBtn.style.padding = '10px 15px';
        downloadBtn.style.background = accentColor;
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.display = 'flex';
        downloadBtn.style.alignItems = 'center';
        downloadBtn.style.justifyContent = 'center';
        downloadBtn.style.gap = '8px';
        downloadBtn.style.fontSize = '14px';
        downloadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Image';
        
        downloadBtn.onclick = () => {
          const link = document.createElement('a');
          link.download = `${goalName.replace(/\s+/g, '-')}-progress.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.style.padding = '10px 15px';
        copyBtn.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        copyBtn.style.color = theme === 'dark' ? 'white' : '#333';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '5px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.display = 'flex';
        copyBtn.style.alignItems = 'center';
        copyBtn.style.justifyContent = 'center';
        copyBtn.style.gap = '8px';
        copyBtn.style.fontSize = '14px';
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy to Clipboard';
        
        copyBtn.onclick = () => {
          canvas.toBlob(blob => {
            try {
              // For modern browsers
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]).then(() => {
                copyBtn.textContent = '✓ Copied!';
                setTimeout(() => {
                  copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy to Clipboard';
                }, 2000);
              }).catch(e => {
                console.error('Failed to copy image to clipboard:', e);
                showToast('Failed to copy image to clipboard. Try the download option.', '❌');
              });
            } catch (e) {
              console.error('ClipboardItem not supported:', e);
              showToast('Copying images not supported in your browser. Try the download option.', '❌');
            }
          });
        };
        
        actions.appendChild(downloadBtn);
        actions.appendChild(copyBtn);
        
        // Assemble and show dialog
        content.appendChild(header);
        content.appendChild(preview);
        content.appendChild(actions);
        dialog.appendChild(content);
        
        document.body.appendChild(dialog);
        
        // Remove the temporary container
        document.body.removeChild(shareContainer);
      }).catch(error => {
        console.error('Error generating sharing image:', error);
        document.body.removeChild(shareContainer);
        showToast('Failed to generate sharing image', '❌');
      });
    }).catch(error => {
      console.error('Error loading html2canvas:', error);
      showToast('Failed to load sharing components', '❌');
    });
  }, [theme, themeColor, weeks, target, goalName, streakInfo, showToast]);

  // Export data as CSV
  const exportAsCSV = useCallback(() => {
    const currentGoal = goalManager.getActiveGoal();
    if (!currentGoal) return;
    
    const currentWeeks = currentGoal.weeks || [];
    const headers = ['Week', 'Weekly Profit', 'Cumulative'];
    const csvContent = [
      headers.join(','),
      ...currentWeeks.map(week => 
        [week.week, week.profit, week.cumulative].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentGoal.name.replace(/\s+/g, '-').toLowerCase()}-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported as CSV', '📤');
  }, []);
  
  // Export data as JSON for backup
  const exportAsJSON = useCallback(() => {
    const allGoals = goalManager.getGoals();
    const data = {
      version: 2,
      goals: allGoals,
      activeGoalId: goalManager.getActiveGoalId(),
      achievements: achievementManager.getEarnedAchievements(),
      lastModified: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gt3-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Backup created successfully', '💾');
  }, []);
  
  // Import data from JSON backup
  const importJSON = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Handle different versions of backup
      if (data.version === 2) {
        // New multi-goal format
        if (!data.goals || !Array.isArray(data.goals)) {
          throw new Error('Invalid backup format: goals data missing');
        }
        
        // Clear existing goals and add imported ones
        const existingGoals = goalManager.getGoals();
        if (existingGoals.length > 0) {
          if (!window.confirm("This will replace all your existing goals. Are you sure you want to continue?")) {
            return;
          }
        }
        
        // Save the imported goals
        localStorage.setItem(goalManager.GOALS_STORAGE_KEY, JSON.stringify(data.goals));
        
        // Set active goal if specified
        if (data.activeGoalId && data.goals.find(g => g.id === data.activeGoalId)) {
          localStorage.setItem(goalManager.ACTIVE_GOAL_KEY, data.activeGoalId);
        } else if (data.goals.length > 0) {
          localStorage.setItem(goalManager.ACTIVE_GOAL_KEY, data.goals[0].id);
        }
        
        // Import achievements if available
        if (data.achievements) {
          localStorage.setItem(achievementManager.STORAGE_KEY, JSON.stringify(data.achievements));
        }
        
        // Force reload of active goal
        window.location.reload();
      } else {
        // Old single-goal format - convert to new format
        if (!data.weeks || !Array.isArray(data.weeks)) {
          throw new Error('Invalid backup format: weeks data missing');
        }
        
        // Create a new goal with the imported data
        const newGoalId = goalManager.createGoal({
          name: data.goalName || 'Porsche GT3',
          target: data.target || 280000,
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          weeks: data.weeks,
          isCompleted: false
        });
        
        // Set as active goal
        goalManager.setActiveGoal(newGoalId);
        
        // Force reload to reflect changes
        window.location.reload();
      }
      
      showToast('Data imported successfully', '📥');
    } catch (error) {
      console.error('Error importing data:', error);
      showToast('Failed to import data. Invalid format.', '⚠️');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GoalsProvider>
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
                    className={`fixed top-4 right-4 py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 z-50 transform translate-x-0 transition-transform duration-300 ease-out ${
                      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    }`}
                  >
                    {toast.emoji && <span className="text-xl">{toast.emoji}</span>}
                    <p>{toast.message}</p>
                  </div>
                )}
                
                <main className="flex-grow">
                  <Routes>
                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/settings" element={
                        <Settings 
                          theme={theme}
                          target={target}
                          goalName={goalName}
                          totalWeeks={totalWeeks}
                          visibleWeeks={visibleWeeks}
                          showCumulative={showCumulative}
                          startDate={startDate}
                          onTargetChange={handleTargetChange}
                          onGoalNameChange={handleGoalNameChange}
                          onTotalWeeksChange={handleTotalWeeksChange}
                          onVisibleWeeksChange={handleVisibleWeeksChange}
                          onToggleCumulative={handleToggleCumulative}
                          onStartDateChange={handleStartDateChange}
                          showConfirmReset={showConfirmReset}
                          setShowConfirmReset={setShowConfirmReset}
                          resetValues={resetValues}
                          exportAsCSV={exportAsCSV}
                          exportAsJSON={exportAsJSON}
                          importJSON={importJSON}
                          themeColor={themeColor}
                          onThemeColorChange={changeThemeColor}
                          generatePdfReport={generatePdfReport}
                          generateSharingImage={generateSharingImage}
                          setTheme={setTheme}
                          customTarget={target}
                          setCustomTarget={setTarget}
                          weeklyTarget={weeklyTargetAverage}
                          setWeeklyTarget={() => {}}
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
                      <Route path="/" element={
                        <Home 
                          theme={theme}
                          toggleTheme={toggleTheme}
                          target={target}
                          goalName={goalName}
                          weeks={weeks}
                          visibleWeeks={visibleWeeks}
                          showCumulative={showCumulative}
                          totalProfit={totalProfit}
                          remaining={remaining}
                          progressPercentage={progressPercentage}
                          handleProfitChange={handleProfitChange}
                          prediction={prediction}
                          streakInfo={streakInfo}
                          weeklyTarget={weeklyTargetAverage}
                          startDate={startDate}
                          toast={toast}
                          themeColor={themeColor}
                          displayedWeeks={displayedWeeks}
                          weeklyTargetAverage={weeklyTargetAverage}
                          setToast={showToast}
                        />
                      } />
                      <Route path="/leaderboards" element={
                        <ComingSoonPage 
                          theme={theme}
                          title="Community Leaderboards"
                          description="Competition features are coming soon"
                        />
                      } />
                    </Route>
                  </Routes>
                </main>
              </div>
            </Router>
          </TooltipProvider>
        </GoalsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
