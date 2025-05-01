import React, { useMemo } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  BarChart, 
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Line, 
  Bar 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

// Helper to format currency
const formatCurrency = (value) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the full data point
    return (
      <div className="bg-background border border-border p-2 rounded shadow-md text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
        {/* Optionally add more data from the payload if needed */}
        {/* <p>Cumulative: {formatCurrency(data.cumulative)}</p> */}
      </div>
    );
  }
  return null;
};

// Define colors for the Pie Chart segments
const PIE_COLORS = {
  negative: 'hsl(var(--destructive))', // Red for negative
  zero_to_50: 'hsl(var(--warning))' , // Orange for low positive
  fifty_to_100: 'hsl(var(--info))', // Blue for medium positive
  over_100: 'hsl(var(--success))', // Green for high positive
};

// Define profit range categories
const getProfitCategory = (profit) => {
  if (profit < 0) return 'negative';
  if (profit >= 0 && profit < 50) return 'zero_to_50';
  if (profit >= 50 && profit < 100) return 'fifty_to_100';
  return 'over_100'; // profit >= 100
};

const categoryLabels = {
  negative: 'Loss (< $0)',
  zero_to_50: '$0 - $49.99',
  fifty_to_100: '$50 - $99.99',
  over_100: '$100+',
};

const Charts = () => {
  const { currentGoal, isLoading, error } = useGoals();

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!currentGoal?.weeks || currentGoal.weeks.length === 0) {
      return [];
    }
    // Sort weeks just in case and add a label for the axis
    return [...currentGoal.weeks]
      .sort((a, b) => a.week - b.week) 
      .map(week => ({
        name: `Week ${week.week}`, // Label for XAxis
        week: week.week,
        profit: week.profit || 0,
        cumulative: week.cumulative || 0,
      }));
  }, [currentGoal]);

  // --- Calculate Weekly Target Average --- 
  const weeklyTargetAverage = useMemo(() => {
    if (!currentGoal || !currentGoal.target || !currentGoal.totalWeeks || currentGoal.totalWeeks <= 0) {
      return null; // Not enough info to calculate
    }
    return currentGoal.target / currentGoal.totalWeeks;
  }, [currentGoal]);

  // --- Prepare data for Weekly Profit vs Target Chart --- 
  const weeklyVsTargetData = useMemo(() => {
    return chartData.map(week => ({
      ...week,
      averageTarget: weeklyTargetAverage,
    }));
  }, [chartData, weeklyTargetAverage]);

  // --- Prepare data for Profit Distribution Pie Chart --- 
  const profitDistributionData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const distribution = chartData.reduce((acc, week) => {
      const category = getProfitCategory(week.profit);
      acc[category] = (acc[category] || 0) + 1; // Count occurrences
      return acc;
    }, {});

    return Object.entries(distribution)
      .map(([category, count]) => ({
        name: categoryLabels[category], // Use readable labels
        value: count,
        color: PIE_COLORS[category],
      }))
      .filter(entry => entry.value > 0); // Only show categories with data
  }, [chartData]);

  // --- Calculate 4-Week Moving Average --- 
  const movingAverageData = useMemo(() => {
    if (!chartData || chartData.length < 4) return []; // Need at least 4 weeks
    
    const movingAvg = [];
    for (let i = 3; i < chartData.length; i++) {
      const sum = chartData.slice(i - 3, i + 1).reduce((acc, week) => acc + week.profit, 0);
      movingAvg.push({
        name: chartData[i].name, // Use the week name (e.g., "Week 4")
        movingAverage: sum / 4,
      });
    }
    return movingAvg;
  }, [chartData]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading chart data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">Error loading data: {error}</div>;
  }

  if (!currentGoal) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
         <AlertCircle className="w-12 h-12 mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No Goal Selected</h2>
        <p className="text-muted-foreground">
          Please select or create a goal first to view charts.
        </p>
      </div>
    );
  }
  
  if (chartData.length === 0) {
     return (
       <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
          <AlertCircle className="w-12 h-12 mb-4 text-muted-foreground" />
         <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
         <p className="text-muted-foreground">
           Start adding weekly profits on the main page to see your progress visualized here.
         </p>
       </div>
     );
   }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        Charts & Analytics: {currentGoal.name || 'Current Goal'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Weekly Profit Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickFormatter={formatCurrency}
                  domain={['auto', 'auto']} // Auto-adjust domain
                  allowDataOverflow={true} // Allow negative values to be fully shown
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--muted), 0.3)' }}/>
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cumulative Profit Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickFormatter={formatCurrency}
                  domain={[0, 'auto']} // Start Y-axis at 0 for cumulative
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--muted), 0.3)' }}/>
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Total Saved" 
                  stroke="hsl(var(--accent-foreground))" // Use a different color
                  strokeWidth={2} 
                  dot={{ r: 4, fill: 'hsl(var(--accent-foreground))' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Weekly Profit vs Average Target */}
        {weeklyTargetAverage !== null && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly vs. Avg Target ({formatCurrency(weeklyTargetAverage)}/wk)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weeklyVsTargetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickFormatter={formatCurrency}
                    domain={['auto', 'auto']} 
                    allowDataOverflow={true}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--muted), 0.3)' }}/>
                  <Legend />
                  <Bar dataKey="profit" name="Weekly Profit" fill="hsl(var(--primary))" />
                  <Line 
                    type="monotone" 
                    dataKey="averageTarget" 
                    name="Avg Target" 
                    stroke="hsl(var(--destructive))" // Contrasting color
                    strokeWidth={2} 
                    strokeDasharray="5 5" // Dashed line
                    dot={false} // No dots on the target line
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Profit Distribution Pie Chart */}
        {profitDistributionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Profit Distribution (Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profitDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80} // Adjust size as needed
                    fill="#8884d8" // Default fill, overridden by Cell
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                       const radius = innerRadius + (outerRadius - innerRadius) * 1.2; // Position label outside
                       const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                       const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                       return (
                         <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                           {`${profitDistributionData[index].name} (${(percent * 100).toFixed(0)}%)`}
                         </text>
                       );
                     }}
                  >
                    {profitDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} weeks`, name]}/>
                  {/* <Legend /> Optional: Legend might be redundant with labels */}
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 4-Week Moving Average Chart */}
        {movingAverageData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>4-Week Moving Average Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={movingAverageData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickFormatter={formatCurrency}
                    domain={['auto', 'auto']}
                    allowDataOverflow={true}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--muted), 0.3)' }}/>
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage" 
                    name="4-Week Avg Profit" 
                    stroke="hsl(var(--info))" // Different color
                    strokeWidth={2} 
                    dot={false} // Smoother line without dots
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Charts; 