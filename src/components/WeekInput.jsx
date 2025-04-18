import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Info, Flame } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const getEmojiForProfit = (profit, previousProfit = 0) => {
  if (profit === 0) return '⚖️';
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
          Weekly Input
        </CardTitle>
        {currentStreak > 0 && (
          <div className={`flex items-center gap-2 text-primary-color px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Flame className="h-4 w-4 text-primary-color" />
            <span className="font-bold">{currentStreak}</span>
            <span className="text-sm font-medium">week streak</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {currentStreak > 0 && (
          <div className="mb-4 text-center">
            <div className={`py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <p className="text-sm">
                <span className="text-primary-color font-medium">Keep it up!</span> You've been saving consistently for {currentStreak} {currentStreak === 1 ? 'week' : 'weeks'}.
              </p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weeks.map((week, index) => {
            const previousWeek = index > 0 ? weeks[index - 1] : null;
            const emoji = getEmojiForProfit(week.profit, previousWeek?.profit);
            const colorClass = getColorClass(week.profit, theme);
            const isPartOfCurrentStreak = currentStreak > 0 && 
                                       index >= weeks.length - currentStreak && 
                                       week.profit > 0;
            
            return (
              <div 
                key={index} 
                className={`p-3 border rounded-lg transition-all 
                  ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : ''} 
                  ${colorClass} 
                  ${isPartOfCurrentStreak ? 'border-primary-color' : ''}`}
              >
                <div className={`font-medium mb-2 flex justify-between ${theme === 'dark' ? 'text-white' : ''}`}>
                  <span>Week {week.week}</span>
                  <div className="flex items-center">
                    {isPartOfCurrentStreak && <Flame size={14} className="mr-1 text-primary-color" />}
                    {emoji && <span>{emoji}</span>}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="relative">
                    <Input
                      type="number"
                      value={week.profit === 0 ? "0" : week.profit || ""}
                      onChange={(e) => onProfitChange(index, e.target.value)}
                      placeholder="0"
                      className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    {weeklyTargetAverage > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                            <Info size={16} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Target: ${weeklyTargetAverage.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                        </TooltipContent>
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