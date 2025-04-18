import React from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '../components/SettingsPanel';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import ThemeSettings from '../components/ThemeSettings';
import ComingSoon from '../components/ComingSoon';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../contexts/AuthContext';

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
  generateSharingImage,
  setTheme,
  customTarget,
  setCustomTarget,
  weeklyTarget,
  setWeeklyTarget,
  openAIKey,
  setOpenAIKey,
  poeKey,
  setPoeKey,
  replicateKey,
  setReplicateKey,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  aiProvider,
  setAiProvider,
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <>
      <Helmet>
        <title>Settings | GT3 Savings Tracker</title>
      </Helmet>

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

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-end mb-4">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmReset(true)}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle size={16} />
                  Reset Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Back
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {currentUser && (
                <div className="lg:col-span-2">
                  <ProfilePanel />
                </div>
              )}
              
              <div className="order-1">
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
                  customTarget={customTarget}
                  setCustomTarget={setCustomTarget}
                  weeklyTarget={weeklyTarget}
                  setWeeklyTarget={setWeeklyTarget}
                />
              </div>
              
              <div className="space-y-6 order-2">
                <ThemeSettings 
                  theme={theme} 
                  setTheme={setTheme}
                  themeColor={themeColor}
                  onThemeColorChange={onThemeColorChange}
                />
                
                <ComingSoon
                  title="AI Assistant Settings"
                  description="Configure your AI assistant provider"
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </main>
        
        <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>{goalName} Savings Tracker © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
} 