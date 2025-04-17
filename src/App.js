import { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Home from './pages/Home';
import Settings from './pages/Settings';

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
  
  // Toast notifications
  const [toast, setToast] = useState(null);
  
  // Local storage loading with custom goal settings
  const [goalName, setGoalName] = useState(() => {
    const savedGoalName = localStorage.getItem('savings-tracker-goal-name');
    return savedGoalName || "Porsche GT3";
  });
  
  const [startDate, setStartDate] = useState(() => {
    const savedStartDate = localStorage.getItem('savings-tracker-start-date');
    return savedStartDate || new Date().toISOString().split('T')[0];
  });
  
  const [totalWeeks, setTotalWeeks] = useState(() => {
    const savedTotalWeeks = localStorage.getItem('savings-tracker-total-weeks');
    return savedTotalWeeks ? parseInt(savedTotalWeeks) : 49;
  });
  
  const [weeks, setWeeks] = useState(() => {
    const savedWeeks = localStorage.getItem('savings-tracker-weeks');
    return savedWeeks ? JSON.parse(savedWeeks) : createInitialWeeks(totalWeeks);
  });
  
  const [target, setTarget] = useState(() => {
    const savedTarget = localStorage.getItem('savings-tracker-target');
    return savedTarget ? parseFloat(savedTarget) : 280000;
  });
  
  const [visibleWeeks, setVisibleWeeks] = useState(() => {
    const savedVisibleWeeks = localStorage.getItem('savings-tracker-visible-weeks');
    return savedVisibleWeeks ? parseInt(savedVisibleWeeks) : 12;
  });
  
  const [showCumulative, setShowCumulative] = useState(() => {
    const savedShowCumulative = localStorage.getItem('savings-tracker-show-cumulative');
    return savedShowCumulative ? savedShowCumulative === 'true' : true;
  });
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savings-tracker-weeks', JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem('savings-tracker-target', target.toString());
  }, [target]);

  useEffect(() => {
    localStorage.setItem('savings-tracker-visible-weeks', visibleWeeks.toString());
  }, [visibleWeeks]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-total-weeks', totalWeeks.toString());
  }, [totalWeeks]);
  
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
    localStorage.setItem('savings-tracker-goal-name', goalName);
  }, [goalName]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-start-date', startDate);
  }, [startDate]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Calculate streak information
  const streakInfo = useMemo(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
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
    for (let i = weeks.length - 1; i >= 0; i--) {
      if (weeks[i].profit > 0) {
        currentStreak++;
      } else {
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
  const handleProfitChange = useCallback((weekIndex, value) => {
    const updatedWeeks = [...weeks];
    const newProfit = parseFloat(value) || 0;
    const oldProfit = updatedWeeks[weekIndex].profit;
    updatedWeeks[weekIndex].profit = newProfit;
    
    // Recalculate cumulative only from this week forward
    let cumulative = weekIndex > 0 ? updatedWeeks[weekIndex - 1].cumulative : 0;
    for (let i = weekIndex; i < updatedWeeks.length; i++) {
      cumulative += updatedWeeks[i].profit;
      updatedWeeks[i].cumulative = cumulative;
    }
    
    setWeeks(updatedWeeks);
    
    // Show toast for new profit
    if (newProfit > 0 && newProfit !== oldProfit) {
      let emoji = '💰';
      if (newProfit >= 5000) emoji = '🤑';
      else if (newProfit >= 1000) emoji = '💸';
      
      showToast(`Added $${newProfit.toLocaleString()} for Week ${updatedWeeks[weekIndex].week}`, emoji);
    }
    
    // Check if we've hit any new milestones
    const currentCumulative = updatedWeeks[weekIndex].cumulative;
    if (currentCumulative > lastMilestone) {
      // Find the highest milestone we've passed
      for (let i = MILESTONES.length - 1; i >= 0; i--) {
        if (currentCumulative >= MILESTONES[i] && MILESTONES[i] > lastMilestone) {
          setLastMilestone(MILESTONES[i]);
          celebrateMilestone(MILESTONES[i]);
          break;
        }
      }
    }
  }, [weeks, lastMilestone, showToast]);

  const handleTargetChange = useCallback((e) => {
    setTarget(parseFloat(e.target.value) || 0);
  }, []);
  
  const handleGoalNameChange = useCallback((e) => {
    setGoalName(e.target.value);
  }, []);
  
  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value);
  }, []);

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

  const resetValues = useCallback(() => {
    setWeeks(createInitialWeeks(totalWeeks));
    setLastMilestone(0);
    setShowConfirmReset(false);
    showToast('All data has been reset', '🔄');
  }, [totalWeeks, showToast]);

  // Celebration animation for reaching milestones
  const celebrateMilestone = useCallback((milestone) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play celebration sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    // Show milestone toast
    showToast(`🎉 Congratulations! You've reached $${milestone.toLocaleString()} in savings!`, '🏆');
  }, [showToast]);

  // Export data as CSV
  const exportAsCSV = useCallback(() => {
    const headers = ['Week', 'Weekly Profit', 'Cumulative'];
    const csvContent = [
      headers.join(','),
      ...weeks.map(week => 
        [week.week, week.profit, week.cumulative].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${goalName.replace(/\s+/g, '-').toLowerCase()}-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported as CSV', '📤');
  }, [weeks, goalName, showToast]);
  
  // Export data as JSON for backup
  const exportAsJSON = useCallback(() => {
    const data = {
      goalName,
      target,
      startDate,
      totalWeeks,
      visibleWeeks,
      weeks,
      lastModified: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${goalName.replace(/\s+/g, '-').toLowerCase()}-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Backup created successfully', '💾');
  }, [goalName, target, startDate, totalWeeks, visibleWeeks, weeks, showToast]);
  
  // Import data from JSON backup
  const importJSON = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.weeks || !Array.isArray(data.weeks)) {
        throw new Error('Invalid backup format: weeks data missing');
      }
      
      setGoalName(data.goalName || 'Porsche GT3');
      setTarget(data.target || 280000);
      setStartDate(data.startDate || new Date().toISOString().split('T')[0]);
      setTotalWeeks(data.totalWeeks || 49);
      setVisibleWeeks(Math.min(data.visibleWeeks || 12, data.totalWeeks || 49));
      setWeeks(data.weeks);
      
      showToast('Data imported successfully', '📥');
    } catch (error) {
      console.error('Error importing data:', error);
      showToast('Failed to import data. Invalid format.', '⚠️');
    }
  }, [showToast]);

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
    if (totalProfit === 0 || currentWeek <= 1) return null;
    
    // Calculate average weekly profit from weeks with data
    const weeksWithProfit = weeks.filter(week => week.profit > 0);
    if (weeksWithProfit.length < 2) return null;
    
    const avgWeeklyProfit = weeksWithProfit.reduce((sum, week) => sum + week.profit, 0) / weeksWithProfit.length;
    if (avgWeeklyProfit <= 0) return null;
    
    // Calculate how many more weeks needed
    const weeksNeeded = Math.ceil(remaining / avgWeeklyProfit);
    
    // Calculate target date
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weeksNeeded * 7));
    
    return {
      weeksNeeded,
      targetDate: targetDate.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      avgWeeklyProfit
    };
  }, [weeks, remaining, totalProfit, currentWeek]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              theme={theme}
              toggleTheme={toggleTheme}
              goalName={goalName}
              target={target}
              totalProfit={totalProfit}
              remaining={remaining}
              progressPercentage={progressPercentage}
              displayedWeeks={displayedWeeks}
              weeklyTargetAverage={weeklyTargetAverage}
              prediction={prediction}
              showCumulative={showCumulative}
              weeks={weeks}
              streakInfo={streakInfo}
              visibleWeeks={visibleWeeks}
              handleProfitChange={handleProfitChange}
              toast={toast}
              setToast={setToast}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
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
            />
          } 
        />
      </Routes>
    </Router>
  );
}
