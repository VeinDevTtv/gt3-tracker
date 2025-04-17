import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { 
  RefreshCcw, 
  Download, 
  Upload,
  Calendar
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

export default function SettingsPanel({
  theme,
  target,
  goalName,
  carImageUrl,
  totalWeeks,
  visibleWeeks,
  showCumulative,
  startDate,
  onTargetChange,
  onGoalNameChange,
  onTotalWeeksChange,
  onVisibleWeeksChange,
  onToggleCumulative,
  onStartDateChange,
  showConfirmReset,
  setShowConfirmReset,
  resetValues,
  exportAsCSV,
  exportAsJSON,
  importJSON
}) {
  // References and state
  const fileInputRef = useRef(null);
  
  // Handle file import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonData = event.target.result;
      importJSON(jsonData);
    };
    reader.readAsText(file);
    e.target.value = null; // Reset the input
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : ''}`}>
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle>Goal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goalName" className="mb-2 block">
              Goal Name
            </Label>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Input 
                  type="text" 
                  id="goalName" 
                  value={goalName} 
                  onChange={onGoalNameChange}
                  className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
                <p className="text-xs mt-1 text-gray-500">
                  The name will update the car image automatically if recognized
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={carImageUrl} 
                  alt={goalName} 
                  className="h-20 w-auto object-contain" 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Target Amount ($)
            </Label>
            <Input 
              type="number" 
              value={target} 
              onChange={onTargetChange} 
              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Start Date
            </Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={onStartDateChange} 
              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Total Weeks
            </Label>
            <Input
              type="number"
              min="4"
              max="260"
              value={totalWeeks}
              onChange={onTotalWeeksChange}
              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Set the total number of weeks in your tracking period
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Visible Weeks
            </Label>
            <Input
              type="number"
              min="4"
              max={totalWeeks}
              value={visibleWeeks}
              onChange={onVisibleWeeksChange}
              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Chart Display
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant={showCumulative ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleCumulative(true)}
                className="flex-1"
              >
                Cumulative
              </Button>
              <Button
                variant={!showCumulative ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleCumulative(false)}
                className="flex-1"
              >
                Weekly
              </Button>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Data Management
            </Label>
            <div className="flex flex-wrap gap-2">
              <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    Reset Values
                  </Button>
                </DialogTrigger>
                <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
                  <DialogHeader>
                    <DialogTitle>Confirm Reset</DialogTitle>
                    <DialogDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Are you sure you want to reset all your progress data? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowConfirmReset(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={resetValues}>
                      Yes, Reset All Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" className="flex-1" onClick={exportAsCSV}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              
              <Button variant="outline" size="sm" className="flex-1" onClick={exportAsJSON}>
                <Download size={16} className="mr-2" />
                Export JSON
              </Button>
              
              <Button variant="outline" size="sm" className="flex-1" onClick={handleImportClick}>
                Import JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </div>
  );
} 