import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const ProfitGraph = ({ data, showCumulative, theme }) => {
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
          {showCumulative ? "Cumulative Progress" : "Weekly Progress"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="Weekly Profit" 
                  stroke="#D5001C" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6, fill: theme === 'dark' ? '#f87171' : '#D5001C' }}
                />
              )}
              {showCumulative && (
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Cumulative Progress" 
                  stroke={theme === 'dark' ? '#CFB87C' : '#191F22'} 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitGraph; 