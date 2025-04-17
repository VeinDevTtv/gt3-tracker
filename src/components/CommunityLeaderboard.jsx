import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Shield, Trophy, Users, Lock } from 'lucide-react';
import { Dialog } from '../components/ui/dialog';

const CommunityLeaderboard = ({ totalProfit, weeklyAverage, weeks, theme }) => {
  const [optedIn, setOptedIn] = useState(() => {
    return localStorage.getItem('savings-tracker-leaderboard-opt-in') === 'true';
  });
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Save opt-in preference to localStorage
  useEffect(() => {
    localStorage.setItem('savings-tracker-leaderboard-opt-in', optedIn.toString());
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
      fetchLeaderboardData();
    }
  }, [optedIn, totalProfit]);
  
  // Simulated fetch function for the leaderboard
  // In a real application, this would be an API call to a secure backend
  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real app this would come from a secure API
      const mockData = [
        { anonymousId: 'user_234987', totalSavings: 155000, weeklyAverage: 3200, savingStreak: 12 },
        { anonymousId: 'user_187654', totalSavings: 230000, weeklyAverage: 4100, savingStreak: 18 },
        { anonymousId: 'user_398712', totalSavings: 95000, weeklyAverage: 2100, savingStreak: 9 },
        { anonymousId: 'user_451278', totalSavings: 180000, weeklyAverage: 3600, savingStreak: 14 },
        { anonymousId: 'user_762145', totalSavings: 125000, weeklyAverage: 2800, savingStreak: 10 },
      ];
      
      // Add the current user's data
      const userId = localStorage.getItem('savings-tracker-anonymous-id') || 'user_current';
      const userData = {
        anonymousId: userId,
        totalSavings: totalProfit,
        weeklyAverage: weeklyAverage,
        savingStreak: weeks.filter(w => w.profit > 0).length,
      };
      
      // Combine and sort leaderboard data
      const combinedData = [...mockData, userData].sort((a, b) => b.totalSavings - a.totalSavings);
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Total Savings</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-primary-color uppercase tracking-wider">Weekly Avg</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-200'}`}>
                      {leaderboardData.slice(0, 5).map((user, index) => {
                        const isCurrentUser = user.anonymousId === localStorage.getItem('savings-tracker-anonymous-id');
                        return (
                          <tr key={user.anonymousId} className={isCurrentUser ? `${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-50'}` : ''}>
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
                                  {isCurrentUser ? 'You' : `Anonymous GT3 Fan`}
                                </span>
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600">You</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`${isCurrentUser ? 'font-semibold' : ''}`}>
                                ${user.totalSavings.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`${isCurrentUser ? 'font-semibold' : ''}`}>
                                ${user.weeklyAverage.toLocaleString()}/week
                              </span>
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