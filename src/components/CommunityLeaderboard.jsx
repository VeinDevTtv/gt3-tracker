import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, Trophy, Users, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <>
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className={`h-5 w-5 ${theme === 'dark' ? 'text-primary-color' : 'text-primary-color'}`} />
              <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
                Community Leaderboard
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Lock className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>100% Secure</span>
            </div>
          </div>
          <CardDescription className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Shield className="h-4 w-4" /> 
            <span>Compare your progress anonymously with other savers</span>
          </CardDescription>
          <div className="flex items-center justify-between pt-2">
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Opt in to leaderboard
            </span>
            <Switch 
              checked={optedIn} 
              onCheckedChange={handleOptInToggle} 
            />
          </div>
        </CardHeader>
        <CardContent>
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
                      <Badge variant="themed" className="px-3 py-1">
                        #{userRank} of {leaderboardData.length}
                      </Badge>
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
                                    <Badge variant="outline" className="ml-2 text-xs">You</Badge>
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
              <Button variant="themed" onClick={() => setShowConfirmDialog(true)}>
                Join Leaderboard Anonymously
              </Button>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Your data is completely anonymous and secure. No personal information is shared.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-color" />
              Join Community Leaderboard
            </DialogTitle>
            <DialogDescription className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Your privacy and security are our top priorities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
          
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="themed" onClick={handleConfirmOptIn}>
              Join Leaderboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityLeaderboard; 