import React, { useState, useCallback } from 'react';
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
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmError, setConfirmError] = useState(false);
  
  const handleResetAll = useCallback(() => {
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
  }, [confirmText, onResetAllData]);

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="pt-4 space-y-2 border-t border-dashed border-destructive/50 mt-6">
          <Label className={`font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            Reset Application Data
          </Label>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            This action will permanently delete all goals, achievements, and weekly progress. 
            It cannot be undone. It is recommended to export a JSON backup first (available on the main dashboard).
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
                    autoComplete="off"
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