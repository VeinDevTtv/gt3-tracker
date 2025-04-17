import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, ComposedChart, Scatter 
} from 'recharts';
import { BarChart2, LineChart as LineChartIcon, TrendingUp, GitBranch, ArrowUpDown } from 'lucide-react';

const ProfitGraph = ({ data, showCumulative, theme }) => {
  // Get theme color from CSS variable
  const [themeColor, setThemeColor] = useState('#3b82f6'); // default blue
  
  // Chart type state: 'line', 'bar', 'area', 'composed'
  const [chartType, setChartType] = useState(() => {
    const savedChartType = localStorage.getItem('savings-tracker-chart-type');
    return savedChartType || 'line';
  });
  
  // Show moving average
  const [showMovingAverage, setShowMovingAverage] = useState(() => {
    const savedShowMovingAvg = localStorage.getItem('savings-tracker-show-moving-avg');
    return savedShowMovingAvg === 'true';
  });
  
  // Calculate moving average
  const dataWithMovingAverage = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((week, index) => {
      // Calculate 4-week moving average
      let movingAvg = null;
      if (index >= 3) { // Need at least 4 weeks for a 4-week moving average
        const lastFourWeeks = data.slice(index - 3, index + 1);
        const sum = lastFourWeeks.reduce((acc, w) => acc + w.profit, 0);
        movingAvg = sum / 4;
      }
      
      // For cumulative view, calculate trend line
      let trendValue = null;
      if (showCumulative && index > 0) {
        const averageGrowth = week.cumulative / index;
        trendValue = averageGrowth * index;
      }
      
      return {
        ...week,
        movingAverage: movingAvg,
        trend: trendValue
      };
    });
  }, [data, showCumulative]);
  
  useEffect(() => {
    // Get the current theme color from CSS variables
    const color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    if (color) {
      setThemeColor(color);
    }
  }, []);
  
  // Save chart preferences
  useEffect(() => {
    localStorage.setItem('savings-tracker-chart-type', chartType);
  }, [chartType]);
  
  useEffect(() => {
    localStorage.setItem('savings-tracker-show-moving-avg', showMovingAverage.toString());
  }, [showMovingAverage]);
  
  // Helper function to get secondary color with transparency
  const getSecondaryColor = () => {
    return themeColor + '80'; // 50% transparency
  };
  
  // Helper function to get tertiary color with more transparency
  const getTertiaryColor = () => {
    return themeColor + '40'; // 25% transparency
  };
  
  // Render the chart based on the selected type
  const renderChart = () => {
    switch(chartType) {
      case 'bar':
        return (
          <BarChart data={dataWithMovingAverage}>
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
              <>
                <Bar 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  fill={themeColor} 
                  radius={[4, 4, 0, 0]}
                />
                {showMovingAverage && (
                  <Bar 
                    dataKey="movingAverage" 
                    name="4-Week Average" 
                    fill={getSecondaryColor()} 
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </>
            )}
            {showCumulative && (
              <Bar 
                dataKey="cumulative" 
                name="Cumulative Progress" 
                fill={themeColor} 
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        );
        
      case 'area':
        return (
          <AreaChart data={dataWithMovingAverage}>
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
              <>
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  stroke={themeColor} 
                  fill={getTertiaryColor()} 
                  strokeWidth={2}
                />
                {showMovingAverage && (
                  <Area 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="4-Week Average" 
                    stroke={getSecondaryColor()} 
                    fill="transparent" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
              </>
            )}
            {showCumulative && (
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                name="Cumulative Progress" 
                stroke={themeColor} 
                fill={getTertiaryColor()} 
                strokeWidth={2}
              />
            )}
          </AreaChart>
        );
        
      case 'composed':
        return (
          <ComposedChart data={dataWithMovingAverage}>
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
              <>
                <Bar 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  fill={getTertiaryColor()} 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Weekly Line" 
                  stroke={themeColor} 
                  dot={{ r: 3, fill: themeColor }}
                  activeDot={{ r: 5, fill: themeColor }}
                  strokeWidth={2}
                />
                {showMovingAverage && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="4-Week Average" 
                    stroke={getSecondaryColor()} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 2, fill: getSecondaryColor() }}
                  />
                )}
              </>
            )}
            {showCumulative && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Cumulative Progress" 
                  stroke={themeColor} 
                  fill={getTertiaryColor()} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  name="Linear Trend" 
                  stroke={getSecondaryColor()} 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={dataWithMovingAverage}>
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
              <>
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  stroke={themeColor} 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: themeColor }} 
                  activeDot={{ r: 6, fill: themeColor }}
                />
                {showMovingAverage && (
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="4-Week Average" 
                    stroke={getSecondaryColor()} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: getSecondaryColor() }}
                  />
                )}
              </>
            )}
            {showCumulative && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Cumulative Progress" 
                  stroke={themeColor} 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: themeColor }} 
                  activeDot={{ r: 6, fill: themeColor }}
                />
                {showMovingAverage && (
                  <Line 
                    type="monotone" 
                    dataKey="trend" 
                    name="Linear Trend" 
                    stroke={getSecondaryColor()} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </>
            )}
          </LineChart>
        );
    }
  };
  
  return (
    <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'} shadow`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : ''}`}>
            {showCumulative ? "Cumulative Progress" : "Weekly Progress"}
          </h3>
          <div className="flex gap-2">
            <button 
              className={`p-1.5 h-8 rounded-md ${chartType === 'line' 
                ? 'bg-primary-color text-white' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
            <button 
              className={`p-1.5 h-8 rounded-md ${chartType === 'bar' 
                ? 'bg-primary-color text-white' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
            <button 
              className={`p-1.5 h-8 rounded-md ${chartType === 'area' 
                ? 'bg-primary-color text-white' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button 
              className={`p-1.5 h-8 rounded-md ${chartType === 'composed' 
                ? 'bg-primary-color text-white' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setChartType('composed')}
              title="Combined Chart"
            >
              <GitBranch className="h-4 w-4" />
            </button>
            <button 
              className={`p-1.5 h-8 rounded-md ml-2 ${showMovingAverage 
                ? 'bg-primary-color text-white' 
                : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              title={showMovingAverage ? "Hide Average" : "Show Average"}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfitGraph; 