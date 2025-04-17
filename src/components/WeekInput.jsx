import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

const getEmojiForProfit = (profit, previousProfit = 0) => {
  if (profit === 0) return '';
  if (profit < 0) return '😢';
  if (profit > previousProfit && previousProfit > 0) return '💰';
  if (profit >= 1000) return '🤑';
  return '💸';
};

const getColorClass = (profit, theme) => {
  if (profit === 0) return '';
  const baseClass = theme === 'dark' ? 'bg-opacity-20' : 'bg-opacity-10';
  return profit > 0 
    ? `${baseClass} ${theme === 'dark' ? 'bg-green-500' : 'bg-green-200'}`
    : `${baseClass} ${theme === 'dark' ? 'bg-red-500' : 'bg-red-200'}`; 
};

const WeekInput = ({ 
  weeks, 
  onProfitChange, 
  weeklyTargetAverage, 
  theme, 
  currentStreak = 0 
}) => {
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
          Weekly Input {currentStreak > 0 && <span className="text-sm">🔥 {currentStreak} week streak</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weeks.map((week, index) => {
            const previousWeek = index > 0 ? weeks[index - 1] : null;
            const emoji = getEmojiForProfit(week.profit, previousWeek?.profit);
            const colorClass = getColorClass(week.profit, theme);
            
            return (
              <div 
                key={index} 
                className={`p-3 border rounded-lg transition-all ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : ''} ${colorClass}`}
              >
                <div className={`font-medium mb-2 flex justify-between ${theme === 'dark' ? 'text-white' : ''}`}>
                  <span>Week {week.week}</span>
                  {emoji && <span>{emoji}</span>}
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="relative">
                    <Input
                      type="number"
                      value={week.profit || ""}
                      onChange={(e) => onProfitChange(index, e.target.value)}
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekInput; 