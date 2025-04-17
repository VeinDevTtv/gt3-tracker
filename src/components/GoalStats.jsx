import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from 'lucide-react';
import ProgressBar from './ProgressBar';

const GoalStats = ({ 
  target, 
  totalProfit, 
  remaining, 
  progressPercentage, 
  weeklyTargetAverage, 
  prediction, 
  streakInfo, 
  theme 
}) => {
  return (
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

        <ProgressBar percentage={progressPercentage} theme={theme} />
        
        <div className="space-y-3">
          {streakInfo && streakInfo.currentStreak > 0 && (
            <div className={`p-3 rounded-md text-sm mb-2 flex items-start gap-2 ${
              theme === 'dark' ? 'bg-green-900 border border-green-700 text-green-100' : 'bg-green-50 border border-green-200'
            }`}>
              <Info size={16} className="mt-0.5" />
              <div>
                <strong>🔥 {streakInfo.currentStreak} week streak!</strong> You've consistently added money {streakInfo.currentStreak} weeks in a row. Best streak: {streakInfo.bestStreak} weeks.
              </div>
            </div>
          )}
          
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
  );
};

export default GoalStats; 