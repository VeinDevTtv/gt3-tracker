import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '../components/SettingsPanel';
import { Button } from '../components/ui/button';
import { ArrowLeft, Car } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getCarImageUrl } from '../utils/carImages';

export default function Settings({
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
  const navigate = useNavigate();
  const [showCarGallery, setShowCarGallery] = useState(false);
  
  // List of popular car models with their categories
  const carModels = [
    { category: 'Porsche', models: ['Porsche GT3', 'Porsche 911', 'GT2 RS', 'Taycan', 'Cayman'] },
    { category: 'Lamborghini', models: ['Lamborghini Huracan', 'Aventador', 'Urus'] },
    { category: 'Ferrari', models: ['Ferrari 458', 'F8 Tributo', 'SF90'] },
    { category: 'Tesla', models: ['Tesla Model S', 'Model 3', 'Model X', 'Roadster'] },
    { category: 'BMW', models: ['BMW M4', 'M3', 'i8'] },
    { category: 'Mercedes', models: ['Mercedes AMG GT', 'C63'] },
    { category: 'Other', models: ['Audi R8', 'McLaren 720S', 'Bugatti Chiron'] },
  ];
  
  // Handle selecting a car model
  const handleSelectCar = (carName) => {
    // Use the onGoalNameChange function with a synthetic event
    onGoalNameChange({ target: { value: carName } });
    setShowCarGallery(false);
  };

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
        
        <Button
          variant="outline"
          onClick={() => setShowCarGallery(true)}
          className="flex items-center gap-2"
        >
          <Car size={16} />
          <span>Browse Cars</span>
        </Button>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="md:max-w-3xl mx-auto">
          <SettingsPanel 
            theme={theme}
            target={target}
            goalName={goalName}
            carImageUrl={carImageUrl}
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
          />
        </div>
      </main>
      
      <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>{goalName} Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
      
      {/* Car Gallery Dialog */}
      <Dialog open={showCarGallery} onOpenChange={setShowCarGallery}>
        <DialogContent className={`${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''} max-w-4xl max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>Choose Your Dream Car</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-6">
            {carModels.map((category) => (
              <div key={category.category}>
                <h3 className="font-bold text-lg mb-2">{category.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {category.models.map((model) => {
                    const imageUrl = getCarImageUrl(model);
                    return (
                      <div 
                        key={model}
                        onClick={() => handleSelectCar(model)}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        } flex flex-col items-center`}
                      >
                        <img 
                          src={imageUrl} 
                          alt={model}
                          className="h-24 object-contain mb-2"
                        />
                        <span className="text-center">{model}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 