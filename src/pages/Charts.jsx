import React, { useMemo } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  BarChart, 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        
        {/* Add more charts here if needed, e.g., Bar chart for weekly vs target */}
        
      </div>
    </div>
  );
};

export default Charts; 