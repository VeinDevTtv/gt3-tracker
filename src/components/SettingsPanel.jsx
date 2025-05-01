import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Share2, AlertTriangle } from 'lucide-react';
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
  onResetAllData,
}) => {
  const fileInputRef = React.useRef(null);
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  
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

  const handleResetAll = () => {
    if (confirmText.trim().toUpperCase() === 'RESET ALL') {
      console.log("Calling onResetAllData function");
      onResetAllData();
      setConfirmText('');
      setConfirmError(false);
      setShowResetConfirmDialog(false);
    } else {
      console.log("Confirmation failed, setting error");
      setConfirmError(true);
    }
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Goal Settings</CardTitle>
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
                Share Image
              </Button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Label className={theme === 'dark' ? 'text-gray-300' : ''}>
              Reset Data
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setShowConfirmReset(true)}
              >
                <AlertTriangle size={16} className="mr-2" />
                Reset All Data
              </Button>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
              Warning: This will delete all your saved data and cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t border-dashed border-destructive/50 mt-6">
          <Label className={`font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            Reset Application Data
          </Label>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            This action will permanently delete all goals, achievements, and weekly progress. 
            It cannot be undone. It is recommended to export a JSON backup first.
          </p>
          <Dialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <AlertTriangle size={16} className="mr-2" />
                Reset All Application Data...
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-destructive">Confirm Full Reset</DialogTitle>
                <DialogDescription>
                   This action is irreversible. To proceed, please type <strong className="text-foreground">RESET ALL</strong> in the box below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirm-reset" className="text-right">
                    Confirm
                  </Label>
                  <Input
                    id="confirm-reset"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      if (confirmError) setConfirmError(false);
                    }}
                    placeholder="Type RESET ALL"
                    className={`col-span-3 font-mono uppercase ${confirmError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {confirmError && (
                   <p className="col-span-4 text-center text-sm text-red-500">Confirmation text does not match.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetConfirmDialog(false)}>Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleResetAll}
                  disabled={confirmText.trim().toUpperCase() !== 'RESET ALL'}
                >
                  Confirm Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel; 