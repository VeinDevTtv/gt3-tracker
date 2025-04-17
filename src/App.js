import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import confetti from 'canvas-confetti';
import { Download, Moon, Sun, Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const MILESTONES = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000];

// Initialize with 49 weeks, but this will be adjustable
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
    const savedTheme = localStorage.getItem('gt3-tracker-theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  // Local storage loading
  const [totalWeeks, setTotalWeeks] = useState(() => {
    const savedTotalWeeks = localStorage.getItem('gt3-tracker-total-weeks');
    return savedTotalWeeks ? parseInt(savedTotalWeeks) : 49;
  });
  
  const [weeks, setWeeks] = useState(() => {
    const savedWeeks = localStorage.getItem('gt3-tracker-weeks');
    return savedWeeks ? JSON.parse(savedWeeks) : createInitialWeeks(totalWeeks);
  });
  
  const [target, setTarget] = useState(() => {
    const savedTarget = localStorage.getItem('gt3-tracker-target');
    return savedTarget ? parseFloat(savedTarget) : 280000;
  });
  
  const [visibleWeeks, setVisibleWeeks] = useState(() => {
    const savedVisibleWeeks = localStorage.getItem('gt3-tracker-visible-weeks');
    return savedVisibleWeeks ? parseInt(savedVisibleWeeks) : 12;
  });
  
  const [showCumulative, setShowCumulative] = useState(() => {
    const savedShowCumulative = localStorage.getItem('gt3-tracker-show-cumulative');
    return savedShowCumulative ? savedShowCumulative === 'true' : true;
  });
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('gt3-tracker-weeks', JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    localStorage.setItem('gt3-tracker-target', target.toString());
  }, [target]);

  useEffect(() => {
    localStorage.setItem('gt3-tracker-visible-weeks', visibleWeeks.toString());
  }, [visibleWeeks]);
  
  useEffect(() => {
    localStorage.setItem('gt3-tracker-total-weeks', totalWeeks.toString());
  }, [totalWeeks]);
  
  useEffect(() => {
    localStorage.setItem('gt3-tracker-show-cumulative', showCumulative.toString());
  }, [showCumulative]);
  
  useEffect(() => {
    localStorage.setItem('gt3-tracker-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Memoized profit change handler
  const handleProfitChange = useCallback((weekIndex, value) => {
    const updatedWeeks = [...weeks];
    const newProfit = parseFloat(value) || 0;
    updatedWeeks[weekIndex].profit = newProfit;
    
    // Recalculate cumulative only from this week forward
    let cumulative = weekIndex > 0 ? updatedWeeks[weekIndex - 1].cumulative : 0;
    for (let i = weekIndex; i < updatedWeeks.length; i++) {
      cumulative += updatedWeeks[i].profit;
      updatedWeeks[i].cumulative = cumulative;
    }
    
    setWeeks(updatedWeeks);
    
    // Check if we've hit any new milestones
    const currentCumulative = updatedWeeks[weekIndex].cumulative;
    if (currentCumulative > lastMilestone) {
      // Find the highest milestone we've passed
      for (let i = MILESTONES.length - 1; i >= 0; i--) {
        if (currentCumulative >= MILESTONES[i] && MILESTONES[i] > lastMilestone) {
          setLastMilestone(MILESTONES[i]);
          celebrateMilestone();
          break;
        }
      }
    }
  }, [weeks, lastMilestone]);

  const handleTargetChange = useCallback((e) => {
    setTarget(parseFloat(e.target.value) || 0);
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

  const resetValues = useCallback(() => {
    setWeeks(createInitialWeeks(totalWeeks));
    setLastMilestone(0);
    setShowConfirmReset(false);
  }, [totalWeeks]);

  // Celebration animation for reaching milestones
  const celebrateMilestone = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Play celebration sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Export data as CSV
  const exportAsCSV = () => {
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
    link.setAttribute('download', `gt3-tracker-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
            Porsche GT3 Tracker
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your progress towards your Porsche GT3 goal
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <img 
            src="https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png" 
            alt="Porsche GT3" 
            className="h-24 w-auto"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-4">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Target Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Target Amount ($)
                    </Label>
                    <Input 
                      type="number" 
                      value={target} 
                      onChange={handleTargetChange} 
                      className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Total Weeks
                    </Label>
                    <Input
                      type="number"
                      min="4"
                      max="260"
                      value={totalWeeks}
                      onChange={handleTotalWeeksChange}
                      className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Set the total number of weeks in your tracking period
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Visible Weeks
                    </Label>
                    <Input
                      type="number"
                      min="4"
                      max={totalWeeks}
                      value={visibleWeeks}
                      onChange={(e) => setVisibleWeeks(Math.min(totalWeeks, Math.max(4, parseInt(e.target.value) || 4)))}
                      className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Chart Display
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showCumulative ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCumulative(true)}
                        className="flex-1"
                      >
                        Cumulative
                      </Button>
                      <Button
                        variant={!showCumulative ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCumulative(false)}
                        className="flex-1"
                      >
                        Weekly
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          Reset Values
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
                        <DialogHeader>
                          <DialogTitle>Confirm Reset</DialogTitle>
                          <DialogDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                            Are you sure you want to reset all your progress data? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={resetValues}>
                            Yes, Reset All Data
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="flex-1" onClick={exportAsCSV}>
                      <Download size={16} className="mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-8">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Target Amount</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : ''}`}>${target.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Remaining</p>
                    <p className="text-2xl font-bold text-porsche-red">${remaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-porsche-red transition-all duration-1000 ease-out rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>{progressPercentage.toFixed(1)}% of target</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {weeklyTargetAverage > 0 && (
                    <div className={`p-3 rounded-md text-sm mb-2 flex items-start gap-2 ${
                      theme === 'dark' ? 'bg-yellow-900 border border-yellow-700 text-yellow-100' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <Info size={16} className="mt-0.5" />
                      <div>
                        You need to earn <strong>${weeklyTargetAverage.toLocaleString(undefined, {maximumFractionDigits: 2})}</strong> weekly to reach your target.
                      </div>
                    </div>
                  )}
                  
                  {prediction && (
                    <div className={`p-3 rounded-md text-sm mb-2 flex items-start gap-2 ${
                      theme === 'dark' ? 'bg-blue-900 border border-blue-700 text-blue-100' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <Info size={16} className="mt-0.5" />
                      <div>
                        At your current pace (${prediction.avgWeeklyProfit.toLocaleString(undefined, {maximumFractionDigits: 2})} weekly), 
                        you'll reach your goal in approximately <strong>{prediction.weeksNeeded} weeks</strong> by <strong>{prediction.targetDate}</strong>.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
                  {showCumulative ? "Cumulative Progress" : "Weekly Progress"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedWeeks}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="week" 
                        stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, null]}
                        labelFormatter={(label) => `Week ${label}`}
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                          color: theme === 'dark' ? '#f9fafb' : 'inherit'
                        }}
                      />
                      <Legend />
                      {!showCumulative && (
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          name="Weekly Profit" 
                          stroke="#D5001C" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6, fill: theme === 'dark' ? '#f87171' : '#D5001C' }}
                        />
                      )}
                      {showCumulative && (
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          name="Cumulative Progress" 
                          stroke={theme === 'dark' ? '#CFB87C' : '#191F22'} 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-12">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Weekly Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedWeeks.map((week, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : ''}`}
                    >
                      <div className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Week {week.week}</div>
                      <div className="flex flex-col space-y-2">
                        <div className="relative">
                          <Input
                            type="number"
                            value={week.profit || ""}
                            onChange={(e) => handleProfitChange(index, e.target.value)}
                            placeholder="0"
                            className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                          />
                          {weeklyTargetAverage > 0 && (
                            <Tooltip content={`Target: $${weeklyTargetAverage.toLocaleString(undefined, {maximumFractionDigits: 0})}`}>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Info size={16} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Cumulative: ${week.cumulative.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>Porsche GT3 Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
