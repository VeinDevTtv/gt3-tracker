import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '../components/SettingsPanel';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Settings({
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
  generateSharingImage
}) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/')} 
            className="rounded-full"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
              Settings
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure your {goalName} tracker
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="md:max-w-3xl mx-auto">
          <SettingsPanel 
            theme={theme}
            target={target}
            goalName={goalName}
            totalWeeks={totalWeeks}
            visibleWeeks={visibleWeeks}
            showCumulative={showCumulative}
            startDate={startDate}
            onTargetChange={onTargetChange}
            onGoalNameChange={onGoalNameChange}
            onTotalWeeksChange={onTotalWeeksChange}
            onVisibleWeeksChange={onVisibleWeeksChange}
            onToggleCumulative={onToggleCumulative}
            onStartDateChange={onStartDateChange}
            showConfirmReset={showConfirmReset}
            setShowConfirmReset={setShowConfirmReset}
            resetValues={resetValues}
            exportAsCSV={exportAsCSV}
            exportAsJSON={exportAsJSON}
            importJSON={importJSON}
            themeColor={themeColor}
            onThemeColorChange={onThemeColorChange}
            generatePdfReport={generatePdfReport}
            generateSharingImage={generateSharingImage}
          />
        </div>
      </main>
      
      <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>{goalName} Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 