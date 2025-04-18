import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Share2, Palette, AlertTriangle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const SettingsPanel = ({ 
  theme,
  target,
  goalName,
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
  importJSON,
  themeColor,
  onThemeColorChange,
  generatePdfReport,
  generateSharingImage,
  customTarget,
  setCustomTarget,
  weeklyTarget,
  setWeeklyTarget,
}) => {
  const fileInputRef = React.useRef(null);
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState(false);
  
  // Debug the resetValues function
  useEffect(() => {
    console.log("SettingsPanel: resetValues function exists?", !!resetValues);
    console.log("SettingsPanel: resetValues type:", typeof resetValues);
  }, [resetValues]);
  
  // Debug check
  console.log("resetValues function available:", !!resetValues);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importJSON(event.target.result);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file. Please upload a valid JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset the input
  };

  const handleReset = () => {
    console.log("handleReset called with confirmText:", confirmText);
    console.log("resetValues function exists?", !!resetValues);
    
    if (confirmText.trim() === 'CONFIRM') {
      console.log("Calling resetValues function");
      resetValues(setShowConfirmReset);
      setConfirmText('');
      setConfirmError(false);
      console.log("Reset completed");
    } else {
      console.log("Confirmation failed, setting error");
      setConfirmError(true);
    }
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Goal Name
            </Label>
            <Input 
              type="text" 
              value={goalName} 
              onChange={onGoalNameChange} 
              placeholder="Porsche GT3"
              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
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
          
          <div className="space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Theme Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {['blue', 'green', 'red', 'purple', 'orange'].map(color => (
                <button
                  key={color}
                  onClick={() => onThemeColorChange(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    themeColor === color ? 'ring-2 ring-offset-2 ring-opacity-50' : ''
                  } ${theme === 'dark' ? 'ring-white ring-offset-gray-800' : 'ring-gray-800 ring-offset-white'}`}
                  style={{ 
                    background: 
                      color === 'blue' ? '#3b82f6' : 
                      color === 'green' ? '#10b981' : 
                      color === 'red' ? '#ef4444' : 
                      color === 'purple' ? '#8b5cf6' : 
                      '#f97316',
                    transform: themeColor === color ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title={`${color.charAt(0).toUpperCase() + color.slice(1)} theme`}
                />
              ))}
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Customize the app's accent color
            </p>
          </div>
          
          <div className="pt-2 space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Data Management
            </Label>
            <div className="flex flex-wrap gap-2">
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Reports & Sharing
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={generatePdfReport}
              >
                <FileText size={16} className="mr-2" />
                PDF Report
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={generateSharingImage}
              >
                <Share2 size={16} className="mr-2" />
                Share Progress
              </Button>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate reports or share your progress on social media
            </p>
          </div>
          
          <div className={`pt-2 space-y-2 border-t border-dashed border-gray-200 dark:border-gray-700 mt-4`}>
            <div className={`p-4 rounded-md border-2 border-red-500 ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <Label className={`text-lg ${theme === 'dark' ? 'text-red-300' : 'text-red-600'} flex items-center gap-2`}>
                <AlertTriangle size={20} />
                Danger Zone
              </Label>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} my-3`}>
                These actions are destructive and cannot be undone. Be careful!
              </p>
              
              <Button 
                variant="destructive" 
                size="lg"
                className="w-full text-base py-6 font-bold"
                onClick={() => setShowConfirmReset(true)}
              >
                <AlertTriangle className="mr-2" size={20} />
                Delete All Savings Data
              </Button>
            </div>
            
            <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
              <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
                <DialogHeader>
                  <DialogTitle className="text-red-500 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Warning: Data Deletion
                  </DialogTitle>
                  <DialogDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                    <div className="py-3">
                      <p>You are about to delete <strong>ALL</strong> of your savings data. This action <strong>cannot</strong> be undone.</p>
                      <div className={`mt-4 p-3 border border-red-200 rounded-md ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <p className="text-sm font-medium mb-2">To confirm deletion, type "CONFIRM" below:</p>
                        <Input
                          type="text"
                          value={confirmText}
                          onChange={(e) => {
                            setConfirmText(e.target.value);
                            setConfirmError(false);
                          }}
                          placeholder="Type CONFIRM here"
                          className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''} ${confirmError ? 'border-red-500' : ''}`}
                        />
                        {confirmError && (
                          <p className="text-xs text-red-500 mt-1">Please type CONFIRM exactly as shown</p>
                        )}
                      </div>
                      <p className="text-xs mt-4">
                        <strong>Pro tip:</strong> Consider exporting a backup of your data before resetting.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowConfirmReset(false);
                    setConfirmText('');
                    setConfirmError(false);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReset}
                    disabled={confirmText !== 'CONFIRM'}
                  >
                    Delete All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel; 