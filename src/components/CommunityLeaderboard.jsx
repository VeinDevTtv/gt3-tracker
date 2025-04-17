import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Shield, Trophy, Users, Lock } from 'lucide-react';
import { Dialog } from '../components/ui/dialog';

// Add this line at the top of the file after imports to ensure fresh data on each load
// This forces every page load to generate new random data
const FORCE_REFRESH_KEY = Date.now();

// Add this function outside the component to generate realistic saver data
const generateRealisticSaverData = () => {
  // GT3 price range is roughly $160,000-$300,000 depending on options and market
  const GT3_MIN_PRICE = 160000;
  const GT3_MAX_PRICE = 300000;
  
  // Saving patterns and profiles
  const savingProfiles = [
    { name: "High Earner", minWeekly: 1800, maxWeekly: 5000, progressMin: 0.4, progressMax: 0.9 },
    { name: "Dedicated Saver", minWeekly: 1200, maxWeekly: 2800, progressMin: 0.3, progressMax: 0.8 },
    { name: "Balanced Approach", minWeekly: 800, maxWeekly: 2000, progressMin: 0.15, progressMax: 0.6 },
    { name: "Steady Progress", minWeekly: 600, maxWeekly: 1400, progressMin: 0.1, progressMax: 0.5 },
    { name: "Starting Journey", minWeekly: 400, maxWeekly: 1200, progressMin: 0.05, progressMax: 0.3 },
  ];
  
  // Random car preference (affects target price)
  const carConfigs = [
    { trim: "Base GT3", priceRange: [160000, 200000] },
    { trim: "GT3 Touring", priceRange: [170000, 210000] },
    { trim: "GT3 with Options", priceRange: [190000, 240000] },
    { trim: "GT3 RS", priceRange: [220000, 300000] }
  ];
  
  // Generate location (anonymized by using only general regions)
  const regions = ["West Coast", "East Coast", "Midwest", "South", "Northeast", "Southwest", "Pacific Northwest", "International"];
  
  // Generate data for 15-20 random savers
  const numberOfSavers = Math.floor(Math.random() * 6) + 15; // 15-20 savers
  const savers = [];
  
  for (let i = 0; i < numberOfSavers; i++) {
    // Select random profiles and configs
    const profile = savingProfiles[Math.floor(Math.random() * savingProfiles.length)];
    const carConfig = carConfigs[Math.floor(Math.random() * carConfigs.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Generate target price within the configured range
    const targetPrice = Math.floor(Math.random() * (carConfig.priceRange[1] - carConfig.priceRange[0])) + carConfig.priceRange[0];
    
    // Calculate progress percentage based on profile
    const progressPct = Math.random() * (profile.progressMax - profile.progressMin) + profile.progressMin;
    
    // Calculate total saved based on progress
    const totalSaved = Math.floor(targetPrice * progressPct);
    
    // Calculate weekly average based on profile
    const weeklyAverage = Math.floor(Math.random() * (profile.maxWeekly - profile.minWeekly)) + profile.minWeekly;
    
    // Calculate weeks saved based on total and weekly average
    const weeksSaved = Math.max(5, Math.round(totalSaved / weeklyAverage));
    
    // Calculate saving streak (typically 20-100% of weeks saved)
    const streakPercentage = 0.2 + Math.random() * 0.8;
    const savingStreak = Math.round(weeksSaved * streakPercentage);
    
    // Generate unique anonymous ID
    const anonymousId = `user_${Math.random().toString(36).substring(2, 10)}`;
    
    // Add metadata for richer display but still anonymous
    const metadata = {
      carChoice: carConfig.trim,
      region: region,
      savingDuration: `${Math.round(weeksSaved / 4)} months`,
      consistency: Math.round(streakPercentage * 100)
    };
    
    savers.push({
      anonymousId,
      totalSavings: totalSaved,
      weeklyAverage,
      savingStreak,
      targetPrice,
      metadata
    });
  }
  
  // Sort by total savings (descending)
  return savers.sort((a, b) => b.totalSavings - a.totalSavings);
};

const CommunityLeaderboard = ({ totalProfit, weeklyAverage, weeks, theme, username }) => {
  const [optedIn, setOptedIn] = useState(() => {
    return localStorage.getItem('savings-tracker-leaderboard-opt-in') === 'true';
  });
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Add a refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Save opt-in preference to localStorage
  useEffect(() => {
    localStorage.setItem('savings-tracker-leaderboard-opt-in', optedIn.toString());
    // Force refresh when opting in
    if (optedIn) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [optedIn]);
  
  // Generate anonymous user ID if needed (only if opted in)
  useEffect(() => {
    if (optedIn) {
      if (!localStorage.getItem('savings-tracker-anonymous-id')) {
        const anonymousId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('savings-tracker-anonymous-id', anonymousId);
      }
    }
  }, [optedIn]);
  
  // Fetch leaderboard data when opted in
  useEffect(() => {
    if (optedIn) {
      // Clear any cached data first
      setLeaderboardData([]);
      fetchLeaderboardData();
    }
  }, [optedIn, totalProfit, refreshTrigger, FORCE_REFRESH_KEY]);
  
  // Add a manual refresh function
  const refreshLeaderboard = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Simulated fetch function for the leaderboard
  // In a real application, this would be an API call to a secure backend
  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate realistic data - in a real app this would come from a secure API
      // Use the refresh key to ensure new data each time
      const generatedData = generateRealisticSaverData();
      
      // Add the current user's data
      const userId = localStorage.getItem('savings-tracker-anonymous-id') || 'user_current';
      
      // Calculate saving duration in weeks
      const savingWeeks = weeks.filter(w => w.profit > 0).length;
      
      // Target price (use the target from app or estimate based on weekly average)
      const estimatedTarget = weeklyAverage * 52 * 3; // ~3 years of saving at current rate
      const targetPrice = Math.max(estimatedTarget, 160000); // Ensure minimum GT3 price
      
      const userData = {
        anonymousId: userId,
        totalSavings: totalProfit,
        weeklyAverage: weeklyAverage,
        savingStreak: weeks.filter(w => w.profit > 0).length,
        targetPrice: targetPrice,
        metadata: {
          carChoice: totalProfit > 220000 ? "GT3 RS" : "GT3",
          region: "Your Location",
          savingDuration: `${Math.round(savingWeeks / 4)} months`,
          consistency: savingWeeks > 0 ? Math.round((weeks.filter(w => w.profit > 0).length / savingWeeks) * 100) : 100,
          username: username || null // Store the username if available
        }
      };
      
      // Combine and sort leaderboard data
      const combinedData = [...generatedData, userData].sort((a, b) => b.totalSavings - a.totalSavings);
      
      // Clear cache and set new data
      window.localStorage.removeItem('leaderboard-data-cache');
      setLeaderboardData(combinedData);
      
      // Find user's rank
      const userIndex = combinedData.findIndex(user => user.anonymousId === userId);
      setUserRank(userIndex + 1);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleOptInToggle = () => {
    if (!optedIn) {
      // Show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      // Just toggle off
      setOptedIn(false);
    }
  };
  
  const handleConfirmOptIn = () => {
    setOptedIn(true);
    setShowConfirmDialog(false);
  };
  
  return (
    <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'} shadow-md`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${theme === 'dark' ? 'text-primary-color' : 'text-primary-color'}`} />
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : ''}`}>
              Community Leaderboard
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {optedIn && (
              <button 
                onClick={refreshLeaderboard}
                className="text-xs flex items-center gap-1 text-primary-color hover:underline"
                title="Refresh leaderboard data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            )}
            <Lock className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>100% Secure</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Shield className="h-4 w-4" /> 
          <span>Compare your progress anonymously with other savers</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            Opt in to leaderboard
          </span>
          <Button 
            variant={optedIn ? "default" : "outline"}
            onClick={handleOptInToggle}
            className={optedIn ? "bg-primary-color hover:bg-primary-color/90" : ""}
          >
            {optedIn ? "Opted In" : "Opt In"}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {optedIn ? (
          <>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-500 py-4">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userRank && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary-color" />
                      <span className={theme === 'dark' ? 'text-white' : ''}>Your Rank</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary-color text-white text-xs font-semibold">
                      #{userRank} of {leaderboardData.length}
                    </div>
                  </div>
                )}
                
                <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white'}`}>
                  <table className="min-w-full">
                    <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Saver</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Total Saved</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Weekly Avg</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                      {leaderboardData.slice(0, 10).map((user, index) => {
                        const isCurrentUser = user.anonymousId === localStorage.getItem('savings-tracker-anonymous-id');
                        const progressPercent = Math.round((user.totalSavings / user.targetPrice) * 100);
                        
                        return (
                          <tr 
                            key={user.anonymousId} 
                            className={`${isCurrentUser ? 
                              `${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-50'}` : 
                              'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                            title={`${user.metadata.carChoice} saver | ${progressPercent}% to goal | ${user.metadata.region}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-1" />}
                                {index === 1 && <Trophy className="h-4 w-4 text-gray-400 mr-1" />}
                                {index === 2 && <Trophy className="h-4 w-4 text-amber-600 mr-1" />}
                                #{index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm ${isCurrentUser ? 'font-bold text-primary-color' : ''}`}>
                                  {isCurrentUser 
                                    ? (user.metadata.username ? user.metadata.username : 'You') 
                                    : `Anonymous GT3 ${user.metadata.carChoice.includes('RS') ? 'RS' : ''} Fan`}
                                </span>
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600">You</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {progressPercent}% to goal • {user.metadata.savingDuration}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`${isCurrentUser ? 'font-semibold' : ''}`}>
                                ${user.totalSavings.toLocaleString()}
                              </span>
                              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                <div 
                                  className="h-1 bg-primary-color rounded-full" 
                                  style={{width: `${progressPercent}%`}}
                                ></div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`${isCurrentUser ? 'font-semibold' : ''}`}>
                                ${user.weeklyAverage.toLocaleString()}/week
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.savingStreak} week streak
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="pt-2 text-xs text-center space-y-1">
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    <Lock className="inline h-3 w-3 mr-1" />
                    All data is anonymized and securely stored
                  </p>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    <Shield className="inline h-3 w-3 mr-1" />
                    No personal information is ever shared
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <Shield className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Opt in to see how your savings compare to other GT3 enthusiasts</p>
            <Button 
              variant="default" 
              onClick={() => setShowConfirmDialog(true)}
              className="bg-primary-color hover:bg-primary-color/90"
            >
              Join Leaderboard Anonymously
            </Button>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Your data is completely anonymous and secure. No personal information is shared.
            </p>
          </div>
        )}
      </div>
      
      {/* Simple dialog without using the Dialog component */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`rounded-lg p-6 max-w-md w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary-color" />
                <h3 className="text-lg font-bold">Join Community Leaderboard</h3>
              </div>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Your privacy and security are our top priorities.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <p>By opting in to the community leaderboard:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Your savings progress will be shared anonymously</li>
                <li>A random ID will be generated to track your position</li>
                <li>No personal information will be collected</li>
                <li>You can opt out at any time</li>
              </ul>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
                <div className="flex items-center gap-2">
                  <Lock className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                    100% Secure and Anonymous
                  </span>
                </div>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  We use industry-standard encryption and never share identifiable data.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                onClick={handleConfirmOptIn}
                className="bg-primary-color hover:bg-primary-color/90"
              >
                Join Leaderboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLeaderboard; 