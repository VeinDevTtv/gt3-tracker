import React, { useState, useEffect, useRef } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, FileEdit, Save, Check, X, ChevronDown } from 'lucide-react';

// UI Components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Card } from '../components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const Performance = () => {
  const navigate = useNavigate();
  const { activeGoal, goals } = useGoals();
  const pdfContainerRef = useRef(null);
  
  const [weeklyTable, setWeeklyTable] = useState([]);
  const [weeklyTarget, setWeeklyTarget] = useState(() => {
    return localStorage.getItem('gt3-weekly-target') || '1400';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportRange, setExportRange] = useState('all');
  const [exportIncludeNotes, setExportIncludeNotes] = useState(true);
  const [selectedWeeks, setSelectedWeeks] = useState({ start: 1, end: 999 });

  // When the active goal changes, update the weekly table
  useEffect(() => {
    if (activeGoal && activeGoal.weeks) {
      // Get weekly data and notes from localStorage or create empty ones
      const storedNotes = JSON.parse(localStorage.getItem(`goal-${activeGoal.id}-weekly-notes`) || '{}');
      const storedGoalsMet = JSON.parse(localStorage.getItem(`goal-${activeGoal.id}-goals-met`) || '{}');
      
      // Create the table data
      const tableData = activeGoal.weeks.map((week, index) => {
        const weekNumber = week.week;
        const profit = week.profit || 0;
        const startDate = calculateWeekDateRange(weekNumber, activeGoal.startDate).start;
        const endDate = calculateWeekDateRange(weekNumber, activeGoal.startDate).end;
        const dateRange = `${format(startDate, 'MMM d')}–${format(endDate, 'MMM d, yyyy')}`;
        const goalMet = storedGoalsMet[weekNumber] !== undefined 
          ? storedGoalsMet[weekNumber] 
          : profit >= parseFloat(weeklyTarget);
        
        return {
          weekNumber,
          dateRange,
          profit,
          goalMet,
          notes: storedNotes[weekNumber] || ''
        };
      });
      
      setWeeklyTable(tableData);
    }
  }, [activeGoal, weeklyTarget]);

  // Handle changing the weekly target
  const handleWeeklyTargetChange = (e) => {
    const newTarget = e.target.value;
    setWeeklyTarget(newTarget);
    localStorage.setItem('gt3-weekly-target', newTarget);
  };

  // Handle toggling goal met status
  const handleGoalMetChange = (weekNumber, newStatus) => {
    setWeeklyTable(prev => 
      prev.map(row => 
        row.weekNumber === weekNumber 
          ? { ...row, goalMet: newStatus } 
          : row
      )
    );
    
    // Save to localStorage
    if (activeGoal) {
      const storedGoalsMet = JSON.parse(localStorage.getItem(`goal-${activeGoal.id}-goals-met`) || '{}');
      storedGoalsMet[weekNumber] = newStatus;
      localStorage.setItem(`goal-${activeGoal.id}-goals-met`, JSON.stringify(storedGoalsMet));
    }
  };

  // Handle updating notes
  const handleNotesChange = (weekNumber, notes) => {
    setWeeklyTable(prev => 
      prev.map(row => 
        row.weekNumber === weekNumber 
          ? { ...row, notes } 
          : row
      )
    );
  };

  // Save all notes at once
  const saveAllNotes = () => {
    if (activeGoal) {
      const notesObject = {};
      weeklyTable.forEach(row => {
        if (row.notes) {
          notesObject[row.weekNumber] = row.notes;
        }
      });
      
      localStorage.setItem(`goal-${activeGoal.id}-weekly-notes`, JSON.stringify(notesObject));
      setIsEditing(false);
      toast.success('Notes saved successfully');
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return null;
    
    const filteredData = exportRange === 'all' 
      ? data 
      : data.filter(row => row.weekNumber >= selectedWeeks.start && row.weekNumber <= selectedWeeks.end);
    
    const totalProfit = filteredData.reduce((sum, row) => sum + row.profit, 0);
    const avgProfit = filteredData.length > 0 ? totalProfit / filteredData.length : 0;
    const goalsMetCount = filteredData.filter(row => row.goalMet).length;
    const targetMet = goalsMetCount / filteredData.length;
    
    return {
      totalWeeks: filteredData.length,
      totalProfit,
      avgProfit,
      goalsMetCount,
      targetMet,
      firstWeek: filteredData[0]?.weekNumber || 1,
      lastWeek: filteredData[filteredData.length - 1]?.weekNumber || 1,
      firstWeekDate: filteredData[0]?.dateRange || '',
      lastWeekDate: filteredData[filteredData.length - 1]?.dateRange || ''
    };
  };

  // Download the table as PDF
  const downloadAsPdf = async () => {
    // Define the content to export based on selected options
    const filteredData = exportRange === 'all' 
      ? weeklyTable 
      : weeklyTable.filter(row => row.weekNumber >= selectedWeeks.start && row.weekNumber <= selectedWeeks.end);
    
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Get theme settings
    const currentTheme = localStorage.getItem('savings-tracker-theme') || 'light';
    const themeColor = localStorage.getItem('savings-tracker-theme-color') || 'blue';

    // Create a temporary div to render the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Assign ref to the temp div
    pdfContainerRef.current = tempDiv;

    // Get summary statistics
    const stats = calculateSummaryStats(weeklyTable);

    // Apply theme-specific styles
    const isDarkMode = currentTheme === 'dark';
    const bgColor = isDarkMode ? '#1f2937' : '#ffffff';
    const textColor = isDarkMode ? '#ffffff' : '#0f172a';
    const mutedTextColor = isDarkMode ? '#9ca3af' : '#64748b';
    const borderColor = isDarkMode ? '#374151' : '#e5e7eb';
    const accentColorMap = {
      blue: '#3b82f6',
      green: '#10b981',
      red: '#ef4444',
      purple: '#8b5cf6',
      orange: '#f97316'
    };
    const accentColor = accentColorMap[themeColor] || accentColorMap.blue;
    const headerBgColor = isDarkMode ? '#111827' : '#f8fafc';
    const altRowBgColor = isDarkMode ? '#374151' : '#f1f5f9';

    // Create PDF content HTML
    // We'll create an HTML structure similar to the UI but with explicit styling
    tempDiv.innerHTML = `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; color: ${textColor}; background-color: ${bgColor}; padding: 40px; width: 1000px; position: relative;">
        <!-- Header Section -->
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: ${textColor};">${activeGoal?.name || 'Goal'} - Weekly Performance</h1>
          
          <!-- Summary box -->
          <div style="background-color: ${headerBgColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid ${borderColor};">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Date Range</p>
                <p style="font-size: 14px; font-weight: bold;">${stats?.firstWeekDate || ''} to ${stats?.lastWeekDate || ''}</p>
              </div>
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Total Weeks</p>
                <p style="font-size: 14px; font-weight: bold;">${stats?.totalWeeks || 0}</p>
              </div>
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Weekly Target</p>
                <p style="font-size: 14px; font-weight: bold;">$${weeklyTarget}</p>
              </div>
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Average Weekly Profit</p>
                <p style="font-size: 14px; font-weight: bold;">$${Math.round(stats?.avgProfit || 0).toLocaleString()}</p>
              </div>
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Total Earned</p>
                <p style="font-size: 14px; font-weight: bold;">$${Math.round(stats?.totalProfit || 0).toLocaleString()}</p>
              </div>
              <div style="flex: 1; min-width: 120px;">
                <p style="font-size: 12px; color: ${mutedTextColor}; margin-bottom: 4px;">Goals Met</p>
                <p style="font-size: 14px; font-weight: bold;">${stats?.goalsMetCount || 0}/${stats?.totalWeeks || 0} (${Math.round((stats?.targetMet || 0) * 100)}%)</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Table Section -->
        <div style="overflow-hidden; border-radius: 8px; border: 1px solid ${borderColor};">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
            <thead>
              <tr style="background-color: ${headerBgColor}; border-bottom: 2px solid ${accentColor};">
                <th style="padding: 12px 16px; text-align: left; font-weight: bold; font-size: 14px;">Week #</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: bold; font-size: 14px;">Date Range</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: bold; font-size: 14px;">Profit ($)</th>
                <th style="padding: 12px 16px; text-align: left; font-weight: bold; font-size: 14px;">Goal Met?</th>
                ${exportIncludeNotes ? `<th style="padding: 12px 16px; text-align: left; font-weight: bold; font-size: 14px;">Notes</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((row, index) => `
                <tr style="background-color: ${index % 2 === 0 ? bgColor : altRowBgColor}; border-bottom: 1px solid ${borderColor};">
                  <td style="padding: 12px 16px; font-size: 14px;">${row.weekNumber}</td>
                  <td style="padding: 12px 16px; font-size: 14px;">${row.dateRange}</td>
                  <td style="padding: 12px 16px; font-size: 14px;">$${row.profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  <td style="padding: 12px 16px; font-size: 14px;">
                    ${row.goalMet 
                      ? `<span style="color: #22c55e; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: rgba(34, 197, 94, 0.1);">✓</span>` 
                      : `<span style="color: #ef4444; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: rgba(239, 68, 68, 0.1);">✕</span>`
                    }
                  </td>
                  ${exportIncludeNotes ? `<td style="padding: 12px 16px; font-size: 14px;">${row.notes}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Watermark Footer -->
        <div style="position: absolute; bottom: 20px; right: 20px; font-size: 10px; color: ${mutedTextColor};">
          Generated with GT3 Tracker
        </div>
      </div>
    `;

    try {
      toast.loading('Generating PDF...');
      
      // Use html2canvas and jsPDF for better quality
      const canvas = await html2canvas(tempDiv, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: bgColor
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit on A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`${activeGoal?.name || 'Goal'}_Weekly_Performance.pdf`);
      
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    } finally {
      // Clean up
      if (pdfContainerRef.current) {
        document.body.removeChild(pdfContainerRef.current);
        pdfContainerRef.current = null;
      }
    }
  };

  // Calculate the date range for a week
  const calculateWeekDateRange = (weekNumber, startDate) => {
    if (!startDate) return { start: new Date(), end: new Date() };
    
    const start = new Date(startDate);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return { start, end };
  };

  // Handle export as image
  const downloadAsImage = async () => {
    // Similar to PDF but export as image
    const filteredData = exportRange === 'all' 
      ? weeklyTable 
      : weeklyTable.filter(row => row.weekNumber >= selectedWeeks.start && row.weekNumber <= selectedWeeks.end);
    
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create temporary div similar to PDF export
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Get current theme and styling
    const currentTheme = localStorage.getItem('savings-tracker-theme') || 'light';
    const themeColor = localStorage.getItem('savings-tracker-theme-color') || 'blue';
    const isDarkMode = currentTheme === 'dark';
    const bgColor = isDarkMode ? '#1f2937' : '#ffffff';

    // Add content similar to PDF but simplified
    // (Reuse the HTML structure from the PDF function)
    tempDiv.innerHTML = pdfContainerRef.current?.innerHTML || '';

    try {
      toast.loading('Generating image...');
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better image quality
        useCORS: true,
        logging: false,
        backgroundColor: bgColor
      });
      
      // Convert to image and download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${activeGoal?.name || 'Goal'}_Weekly_Performance.png`;
      link.href = url;
      link.click();
      
      toast.dismiss();
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate image');
    } finally {
      // Clean up
      document.body.removeChild(tempDiv);
    }
  };

  if (!activeGoal) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-4">No active goal selected</h2>
          <p className="mb-6">Please create a goal to start reviewing weekly performance.</p>
          <Button onClick={() => navigate('/goals')}>Go to Goals</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Weekly Performance Review</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="weeklyTarget" className="text-sm font-medium whitespace-nowrap">
            Weekly Target: $
          </label>
          <Input
            id="weeklyTarget"
            type="number"
            value={weeklyTarget}
            onChange={handleWeeklyTargetChange}
            className="w-24"
            min="0"
          />
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <Button onClick={saveAllNotes} className="flex items-center gap-2">
              <Save size={16} />
              Save Notes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <FileEdit size={16} />
              Edit Notes
            </Button>
          )}
          
          <Popover open={showExportOptions} onOpenChange={setShowExportOptions}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Export Options</h3>
                
                {/* Export Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weeks to Include:</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      id="range-all" 
                      name="exportRange" 
                      value="all"
                      checked={exportRange === 'all'}
                      onChange={() => setExportRange('all')}
                      className="mr-1"
                    />
                    <label htmlFor="range-all" className="text-sm">All Weeks</label>
                    
                    <input 
                      type="radio" 
                      id="range-custom" 
                      name="exportRange" 
                      value="custom"
                      checked={exportRange === 'custom'}
                      onChange={() => setExportRange('custom')}
                      className="ml-4 mr-1"
                    />
                    <label htmlFor="range-custom" className="text-sm">Custom Range</label>
                  </div>
                  
                  {exportRange === 'custom' && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm">From Week:</label>
                      <Input 
                        type="number" 
                        value={selectedWeeks.start}
                        onChange={(e) => setSelectedWeeks({...selectedWeeks, start: parseInt(e.target.value) || 1})}
                        className="w-16"
                        min="1"
                      />
                      <label className="text-sm">To Week:</label>
                      <Input 
                        type="number" 
                        value={selectedWeeks.end}
                        onChange={(e) => setSelectedWeeks({...selectedWeeks, end: parseInt(e.target.value) || 1})}
                        className="w-16"
                        min={selectedWeeks.start}
                      />
                    </div>
                  )}
                </div>
                
                {/* Include Notes */}
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="include-notes"
                    checked={exportIncludeNotes}
                    onCheckedChange={setExportIncludeNotes}
                  />
                  <label htmlFor="include-notes" className="text-sm">Include Notes</label>
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2 justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadAsImage}
                    className="flex items-center gap-1"
                  >
                    <Download size={14} />
                    As Image
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      downloadAsPdf();
                      setShowExportOptions(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Download size={14} />
                    As PDF
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div id="weekly-performance-table" className="p-4">
          {activeGoal && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">{activeGoal.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Target: ${activeGoal.target.toLocaleString()} | Weekly Target: ${weeklyTarget}
              </p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left">Week #</th>
                  <th className="py-3 px-4 text-left">Date Range</th>
                  <th className="py-3 px-4 text-left">Profit ($)</th>
                  <th className="py-3 px-4 text-left">Goal Met?</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {weeklyTable.map((row) => (
                  <tr 
                    key={row.weekNumber} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4">{row.weekNumber}</td>
                    <td className="py-3 px-4">{row.dateRange}</td>
                    <td className="py-3 px-4">
                      ${row.profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Checkbox 
                          checked={row.goalMet}
                          onCheckedChange={(checked) => handleGoalMetChange(row.weekNumber, checked)}
                          id={`goal-met-${row.weekNumber}`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <Input
                          value={row.notes}
                          onChange={(e) => handleNotesChange(row.weekNumber, e.target.value)}
                          placeholder="Add notes here..."
                        />
                      ) : (
                        <div className="min-h-6">{row.notes}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Performance; 