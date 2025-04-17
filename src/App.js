import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const initialWeeks = Array.from({ length: 49 }, (_, i) => ({
  week: i + 1,
  profit: 0,
  cumulative: 0,
}));

export default function GT3Tracker() {
  const [weeks, setWeeks] = useState(initialWeeks);
  const [target, setTarget] = useState(280000);
  const [visibleWeeks, setVisibleWeeks] = useState(12);

  const handleProfitChange = (weekIndex, value) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].profit = parseFloat(value) || 0;
    let cumulative = 0;
    for (let i = 0; i < updatedWeeks.length; i++) {
      cumulative += updatedWeeks[i].profit;
      updatedWeeks[i].cumulative = cumulative;
    }
    setWeeks(updatedWeeks);
  };

  const handleTargetChange = (e) => {
    setTarget(parseFloat(e.target.value) || 0);
  };

  const resetValues = () => {
    setWeeks(initialWeeks);
  };

  const totalProfit = weeks[weeks.length - 1].cumulative;
  const remaining = Math.max(0, target - totalProfit);
  const progressPercentage = Math.min(100, (totalProfit / target) * 100);

  const displayedWeeks = weeks.slice(0, visibleWeeks);
  
  // Calculate weekly average needed to reach target
  const currentWeek = weeks.findIndex(week => week.profit > 0) + 1;
  const weeksRemaining = 49 - (currentWeek > 0 ? currentWeek : 0);
  const weeklyTargetAverage = weeksRemaining > 0 ? remaining / weeksRemaining : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-8 flex items-center">
        <div>
          <h1 className="text-4xl font-bold text-porsche-black">Porsche GT3 Tracker</h1>
          <p className="text-gray-500">Track your progress towards your Porsche GT3 goal</p>
        </div>
        <img 
          src="https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png" 
          alt="Porsche GT3" 
          className="ml-auto h-24 w-auto"
        />
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Target Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Amount ($)</label>
                    <Input 
                      type="number" 
                      value={target} 
                      onChange={handleTargetChange} 
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visible Weeks</label>
                    <Input
                      type="number"
                      min="4"
                      max="49"
                      value={visibleWeeks}
                      onChange={(e) => setVisibleWeeks(Math.min(49, Math.max(4, parseInt(e.target.value) || 4)))}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={resetValues} variant="outline" className="w-full">
                    Reset Values
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <p className="text-sm text-gray-500">Target Amount</p>
                    <p className="text-2xl font-bold">${target.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <p className="text-sm text-gray-500">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="text-2xl font-bold text-porsche-red">${remaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-porsche-red rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>{progressPercentage.toFixed(1)}% of target</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {weeklyTargetAverage > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm mb-4">
                    You need to earn ${weeklyTargetAverage.toLocaleString(undefined, {maximumFractionDigits: 2})} weekly to reach your target.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedWeeks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, null]}
                        labelFormatter={(label) => `Week ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        name="Weekly Profit" 
                        stroke="#D5001C" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulative" 
                        name="Cumulative" 
                        stroke="#191F22" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedWeeks.map((week, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium mb-2">Week {week.week}</div>
                      <div className="flex flex-col space-y-2">
                        <Input
                          type="number"
                          value={week.profit || ""}
                          onChange={(e) => handleProfitChange(index, e.target.value)}
                          placeholder="0"
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500">
                          Cumulative: ${week.cumulative.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Porsche GT3 Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
