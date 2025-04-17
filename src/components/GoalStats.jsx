import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Calendar, Flame, Info, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, theme, accent = false, subtitle = null, status = null }) => (
  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm flex flex-col`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-2 rounded-md ${accent ? 'bg-primary text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}`}>
        <Icon size={16} className={accent ? '' : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')} />
      </div>
      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{title}</div>
    </div>
    <div className={`text-xl font-bold ${accent ? 'text-primary-color' : (theme === 'dark' ? 'text-white' : 'text-gray-800')}`}>
      {value}
    </div>
    {subtitle && (
      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
        {status === 'low' && <AlertCircle size={12} className="text-yellow-500" />}
        {status === 'medium' && <Info size={12} className="text-blue-500" />}
        {status === 'high' && <Info size={12} className="text-green-500" />}
        {subtitle}
      </div>
    )}
  </div>
);

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
  // Determine what to show for prediction
  const renderPrediction = () => {
    // Handle case when prediction is null or undefined
    if (!prediction) {
      return {
        value: 'Calculating...',
        subtitle: null,
        status: null
      };
    }

    // Handle insufficient data case
    if (prediction.insufficient) {
      return {
        value: prediction.message || 'Insufficient data',
        subtitle: prediction.reason === 'start_saving' 
          ? 'Add weekly savings to see a prediction' 
          : 'Need more savings entries',
        status: null
      };
    }

    // Handle valid prediction with confidence level
    return {
      value: prediction.targetDate,
      subtitle: `Based on ${prediction.dataPoints} weeks of data (${prediction.confidence} confidence)`,
      status: prediction.confidence
    };
  };

  const predictionData = renderPrediction();

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Progress Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <div className="flex justify-between mb-2">
            <div className={theme === 'dark' ? 'text-white' : ''}>Your progress</div>
            <div className="font-semibold text-primary-color">{progressPercentage.toFixed(2)}%</div>
          </div>
          <div className={`h-4 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-primary progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div>$0</div>
            <div>${target.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard 
            icon={Target} 
            title="Target" 
            value={`$${target.toLocaleString()}`} 
            theme={theme}
          />
          
          <StatCard 
            icon={TrendingUp} 
            title="Total Saved" 
            value={`$${totalProfit.toLocaleString()}`} 
            theme={theme}
            accent={true}
          />
          
          <StatCard 
            icon={Calendar} 
            title="Est. Completion" 
            value={predictionData.value} 
            subtitle={predictionData.subtitle}
            status={predictionData.status}
            theme={theme}
          />
          
          <StatCard 
            icon={Flame} 
            title="Current Streak" 
            value={`${streakInfo.currentStreak} weeks`} 
            theme={theme}
          />
        </div>
        
        <div className="mt-6 p-3 border border-dashed rounded-lg text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Weekly Target: <span className="font-semibold text-primary-color">${weeklyTargetAverage.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalStats; 