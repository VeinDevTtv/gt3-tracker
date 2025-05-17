import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Flame, AlertCircle, ChevronDown, ChevronUp, Calendar, Plus, Edit2, Trash, DollarSign, Clock, History, ArrowLeftRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, isWithinInterval, isAfter, startOfToday, addDays, isSameWeek, compareDesc, isBefore } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { useGoals } from "../contexts/GoalsContext";

const getEmojiForProfit = (profit, previousProfit = 0) => {
  if (profit === 0) return '⚖️';
  if (profit < 0) return '😢';
  if (profit > previousProfit && previousProfit > 0) return '💰';
  if (profit >= 1000) return '🤑';
  return '💸';
};

const getColorClass = (profit, theme) => {
  if (profit === 0) return '';
  const baseClass = theme === 'dark' ? 'bg-opacity-20' : 'bg-opacity-10';
  return profit > 0 
    ? `${baseClass} ${theme === 'dark' ? 'bg-green-500' : 'bg-green-200'}`
    : `${baseClass} ${theme === 'dark' ? 'bg-red-500' : 'bg-red-200'}`; 
};

const WeekInput = ({ 
  weeks, 
  onProfitChange,
  onTradeEntry,
  onDeleteEntry,
  onEditEntry,  
  weeklyTargetAverage, 
  theme, 
  currentStreak = 0,
  goalStartDate,
  goalId
}) => {
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [quickEntry, setQuickEntry] = useState({
    amount: '',
    note: '',
    selectedWeek: 'current'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const inputRef = useRef(null);
  const { getCurrentWeekNumber, ensureEnoughWeeks } = useGoals();
  
  // Ensure we have enough weeks whenever the component renders
  useEffect(() => {
    ensureEnoughWeeks(8); // Ensure we have at least 8 weeks ahead
  }, [ensureEnoughWeeks]);

  // Get current week number
  const currentWeekNum = getCurrentWeekNumber();
  const today = new Date();
  
  // Sort weeks according to the chosen sort direction
  const sortedWeeks = [...weeks].sort((a, b) => {
    // Always ensure weeks with valid dates appear first
    const aDate = a.startDate ? parseISO(a.startDate) : null;
    const bDate = b.startDate ? parseISO(b.startDate) : null;
    
    if (!aDate && !bDate) return a.week - b.week;
    if (!aDate) return 1;
    if (!bDate) return -1;
    
    return sortDirection === 'desc' ? 
      compareDesc(aDate, bDate) : 
      compareDesc(bDate, aDate);
  });
  
  // Determine which week is the current week based on dates
  const getCurrentWeekFromDates = () => {
    const today = startOfToday();
    if (!weeks || weeks.length === 0) return currentWeekNum;
    
    for (const week of weeks) {
      if (!week.startDate || !week.endDate) continue;
      
      const startDate = parseISO(week.startDate);
      const endDate = parseISO(week.endDate);
      
      // Check if today is within this week's range
      if (isWithinInterval(today, { start: startDate, end: endDate })) {
        return week.week;
      }
    }
    
    // If no match, find the earliest future week
    for (const week of weeks) {
      if (!week.startDate) continue;
      const startDate = parseISO(week.startDate);
      if (isAfter(startDate, today)) {
        return week.week;
      }
    }
    
    return currentWeekNum;
  };
  
  // Determine the current week based on dates
  const actualCurrentWeek = getCurrentWeekFromDates();

  const handleQuickEntryChange = (e) => {
    const { name, value } = e.target;
    setQuickEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickEntrySubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    if (!quickEntry.amount || isNaN(parseFloat(quickEntry.amount))) {
      alert("Please enter a valid amount");
      return;
    }
    
    setIsSubmitting(true);
    
    // Determine which week to use
    let weekNum = actualCurrentWeek;
    if (quickEntry.selectedWeek !== 'current') {
      weekNum = parseInt(quickEntry.selectedWeek);
    }
    
    // Ensure weekNum is valid
    if (weekNum < 1) weekNum = 1;
    if (weekNum > weeks.length) weekNum = weeks.length;
    
    console.log(`WeekInput: Creating trade entry for Week ${weekNum}`);
    
    // Get the selected week to find its date range
    const selectedWeek = weeks.find(w => w.week === weekNum);
    let entryTimestamp = new Date().toISOString();
    
    // If this is a past week, use the middle of that week for the timestamp
    if (selectedWeek && selectedWeek.startDate) {
      const weekStart = parseISO(selectedWeek.startDate);
      if (isBefore(weekStart, today)) {
        // Use the middle (Wednesday) of the selected week for past entries
        entryTimestamp = addDays(weekStart, 3).toISOString();
      }
    }
    
    // Create the entry with timestamp
    const entry = {
      timestamp: entryTimestamp,
      amount: parseFloat(quickEntry.amount),
      note: quickEntry.note.trim(),
      week: weekNum
    };
    
    // Call the entry handler with better error handling
    if (onTradeEntry) {
      try {
        console.log(`WeekInput: Submitting trade entry:`, entry);
        onTradeEntry(entry, weekNum);
        
        // Provide user feedback
        console.log(`WeekInput: Trade entry submitted for Week ${weekNum}`);
        
        // Reset the form
        setQuickEntry({
          amount: '',
          note: '',
          selectedWeek: 'current'
        });
        
        // Focus back on the amount input for quick successive entries
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error('Error submitting trade entry:', error);
        alert(`Failed to add trade entry: ${error.message}`);
      }
    } else {
      console.error('WeekInput: onTradeEntry handler is not defined');
      alert("Trade entry handler is not available. Please try again later.");
    }
    
    setIsSubmitting(false);
  };

  const toggleWeekExpansion = (weekIndex) => {
    if (expandedWeek === weekIndex) {
      setExpandedWeek(null);
    } else {
      setExpandedWeek(weekIndex);
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Function to get week display info
  const getWeekDisplayInfo = (week) => {
    // Parse dates
    const startDateObj = week.startDate ? parseISO(week.startDate) : null;
    const endDateObj = week.endDate ? parseISO(week.endDate) : null;
    
    // Check if this week contains today
    const containsToday = startDateObj && endDateObj && 
      isWithinInterval(today, { start: startDateObj, end: endDateObj });
    
    // Check if this week is the current week by week number
    const isCurrentWeekByNumber = week.week === currentWeekNum;
    
    // Is this week in the past, present, or future?
    let timeStatus = 'present';
    if (endDateObj && isAfter(today, addDays(endDateObj, 1))) {
      timeStatus = 'past';
    } else if (startDateObj && isAfter(startDateObj, today)) {
      timeStatus = 'future';
    }
    
    return {
      containsToday,
      isCurrentWeekByNumber,
      timeStatus,
      startDateObj,
      endDateObj
    };
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
          Weekly Input
        </CardTitle>
        <div className="flex items-center gap-2">
          {currentStreak > 0 && (
            <div className={`flex items-center gap-2 text-primary-color px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Flame className="h-4 w-4 text-primary-color" />
              <span className="font-bold">{currentStreak}</span>
              <span className="text-sm font-medium">week streak</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={toggleSortDirection}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              {sortDirection === 'desc' ? 'Newest' : 'Oldest'} First
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={toggleViewMode}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Entry Panel */}
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50'}`}>
          <h3 className="font-medium mb-3 flex items-center">
            <Plus size={16} className="mr-2" />
            Quick Trade Entry
          </h3>
          <form onSubmit={handleQuickEntrySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                  Profit/Loss
                </Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    name="amount"
                    value={quickEntry.amount}
                    onChange={handleQuickEntryChange}
                    placeholder="0.00"
                    inputMode="decimal"
                    className={`pl-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                    ref={inputRef}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="selectedWeek" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                  Week
                </Label>
                <Select
                  value={quickEntry.selectedWeek}
                  onValueChange={(value) => setQuickEntry(prev => ({ ...prev, selectedWeek: value }))}
                >
                  <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}`}>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Week ({actualCurrentWeek})</SelectItem>
                    {sortedWeeks.map((week, i) => (
                      <SelectItem key={i} value={week.week.toString()}>
                        {week.displayName || `Week ${week.week}`}
                        {week.week === actualCurrentWeek && " (Current)"}
                        {getWeekDisplayInfo(week).timeStatus === 'past' && " (Past)"}
                        {getWeekDisplayInfo(week).timeStatus === 'future' && " (Future)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                  Note (Optional)
                </Label>
                <Input
                  id="note"
                  name="note"
                  value={quickEntry.note}
                  onChange={handleQuickEntryChange}
                  placeholder="Brief trade details..."
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground"
                disabled={!quickEntry.amount || isNaN(parseFloat(quickEntry.amount)) || isSubmitting}
              >
                Add Entry
              </Button>
            </div>
          </form>
        </div>
        
        {currentStreak > 0 && (
          <div className="mb-4 text-center">
            <div className={`py-2 px-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <p className="text-sm">
                <span className="text-primary-color font-medium">Keep it up!</span> You've been saving consistently for {currentStreak} {currentStreak === 1 ? 'week' : 'weeks'}.
              </p>
            </div>
          </div>
        )}
        
        {/* Current Week Highlight */}
        {sortedWeeks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Current Week
              </h3>
              <Badge variant="outline" className="text-xs">
                Week {actualCurrentWeek}
              </Badge>
            </div>
            
            {sortedWeeks.find(w => w.week === actualCurrentWeek) ? (
              <div className={`border p-3 rounded-lg ${theme === 'dark' ? 'border-primary/50 bg-primary/5' : 'border-primary/30 bg-primary/5'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {sortedWeeks.find(w => w.week === actualCurrentWeek)?.displayName || `Week ${actualCurrentWeek}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Progress: </span>
                      <span className={sortedWeeks.find(w => w.week === actualCurrentWeek)?.profit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {sortedWeeks.find(w => w.week === actualCurrentWeek)?.profit ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sortedWeeks.find(w => w.week === actualCurrentWeek)?.profit) : '$0'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleWeekExpansion(sortedWeeks.findIndex(w => w.week === actualCurrentWeek))}
                    className={theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : ''}
                  >
                    {expandedWeek === sortedWeeks.findIndex(w => w.week === actualCurrentWeek) ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-lg">
                Current week data not available
              </div>
            )}
          </div>
        )}
        
        {/* Weekly Grid or List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedWeeks.map((week, index) => {
              const previousWeek = index > 0 ? sortedWeeks[index - 1] : null;
              const emoji = getEmojiForProfit(week.profit, previousWeek?.profit);
              const colorClass = getColorClass(week.profit, theme);
              const isPartOfCurrentStreak = currentStreak > 0 && 
                                       index >= sortedWeeks.length - currentStreak && 
                                       week.profit > 0;
              const isFilled = week.isFilled !== undefined ? week.isFilled : week.profit !== 0;
              const hasEntries = week.entries && week.entries.length > 0;
              const isExpanded = expandedWeek === index;
              
              // Get more info about this week
              const { containsToday, isCurrentWeekByNumber, timeStatus } = getWeekDisplayInfo(week);
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg transition-all 
                    ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : ''} 
                    ${colorClass} 
                    ${isPartOfCurrentStreak ? 'border-primary-color' : ''}
                    ${containsToday ? 'ring-2 ring-primary ring-opacity-70' : ''}
                    ${!isFilled ? 'opacity-60 border-dashed' : ''}
                    ${timeStatus === 'future' ? 'opacity-70' : ''}
                    ${timeStatus === 'past' ? 'opacity-85' : ''}
                  `}
                >
                  <div className="p-3">
                    <div className="mb-2">
                      <div className={`font-medium flex justify-between items-center ${theme === 'dark' ? 'text-white' : ''}`}>
                        <div className="flex items-center">
                          <span>Week {week.week}</span>
                          {containsToday && (
                            <Badge className="ml-1.5 text-xs px-1.5 py-0 h-4 bg-primary hover:bg-primary/80">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isPartOfCurrentStreak && <Flame size={14} className="mr-1 text-primary-color" />}
                          {emoji && <span>{emoji}</span>}
                        </div>
                      </div>
                      {week.displayName && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
                          <Calendar size={10} className="mr-1" />
                          {week.displayName.replace('Week of ', '')}
                        </div>
                      )}
                      {week.startDate && week.endDate && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
                          <Clock size={10} className="mr-1" />
                          {format(parseISO(week.startDate), 'MMM d')} - {format(parseISO(week.endDate), 'MMM d')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={week.profit === 0 ? "0" : week.profit || ""}
                          onChange={(e) => onProfitChange(index, e.target.value)}
                          placeholder="0"
                          className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        />
                        {!isFilled && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                <AlertCircle size={16} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-[200px]">This week isn't counted in progress or streak calculations. Add a non-zero value to include it.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {typeof weeklyTargetAverage === 'number' && weeklyTargetAverage > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute right-7 top-1/2 -translate-y-1/2 cursor-pointer">
                                <Info size={16} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Avg. Weekly Target: ${(weeklyTargetAverage || 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className={`text-xs flex justify-between ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Cumulative: ${(typeof week.cumulative === 'number' ? week.cumulative : 0).toLocaleString()}</span>
                        {!isFilled && <span className="italic text-xs">Not counted</span>}
                      </div>
                      
                      {hasEntries && (
                        <button
                          type="button"
                          onClick={() => toggleWeekExpansion(index)}
                          className={`mt-1 flex items-center justify-center text-xs py-1 w-full rounded
                            ${theme === 'dark' 
                              ? 'text-gray-300 hover:bg-gray-600/50' 
                              : 'text-gray-600 hover:bg-gray-100'} `}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={14} className="mr-1" /> Hide {week.entries.length} Entries
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} className="mr-1" /> Show {week.entries.length} Entries
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Collapsible Entries List */}
                  {isExpanded && hasEntries && (
                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                      <ul className="px-3 py-2 space-y-2 max-h-[200px] overflow-y-auto">
                        {week.entries.map((entry, entryIndex) => (
                          <li 
                            key={entryIndex} 
                            className={`text-xs p-2 rounded ${
                              entry.amount >= 0 
                                ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50' 
                                : theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className={`font-medium ${
                                  entry.amount >= 0 
                                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600' 
                                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                }`}>
                                  ${entry.amount.toLocaleString()}
                                </div>
                                <div className="text-xs opacity-80">
                                  {entry.timestamp 
                                    ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')
                                    : 'No date'}
                                </div>
                                {entry.note && (
                                  <div className="mt-1">{entry.note}</div>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => onEditEntry && onEditEntry(week.week, entry, entryIndex)}
                                  className={`p-1 rounded-full hover:bg-opacity-10 ${
                                    theme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-700'
                                  }`}
                                  title="Edit this entry"
                                  aria-label="Edit trade entry"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (onDeleteEntry) {
                                      console.log(`WeekInput: Requesting deletion of trade entry ${entryIndex} from week ${week.week}`);
                                      onDeleteEntry(week.week, entryIndex);
                                    } else {
                                      console.error('WeekInput: onDeleteEntry handler is not defined');
                                      alert('Delete functionality is not available');
                                    }
                                  }}
                                  className={`p-1 rounded-full hover:bg-opacity-10 ${
                                    theme === 'dark' ? 'hover:bg-white text-red-400' : 'hover:bg-gray-700 text-red-500'
                                  }`}
                                  title="Delete this entry"
                                  aria-label="Delete trade entry"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedWeeks.map((week, index) => {
              const { containsToday, isCurrentWeekByNumber, timeStatus } = getWeekDisplayInfo(week);
              const hasEntries = week.entries && week.entries.length > 0;
              const isExpanded = expandedWeek === index;
              const isFilled = week.isFilled !== undefined ? week.isFilled : week.profit !== 0;
              
              // Skip the current week as it's shown above
              if (week.week === actualCurrentWeek) return null;
              
              return (
                <div 
                  key={index}
                  className={`border rounded-lg overflow-hidden transition-all
                    ${theme === 'dark' ? 'border-gray-700' : ''}
                    ${!isFilled ? 'border-dashed opacity-80' : ''}
                    ${week.profit > 0 
                      ? theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50/50' 
                      : week.profit < 0 
                      ? theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50/50'
                      : ''}
                  `}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Week {week.week}</span>
                          {timeStatus === 'past' && <Badge variant="outline" className="text-xs">Past</Badge>}
                          {timeStatus === 'future' && <Badge variant="outline" className="text-xs">Future</Badge>}
                        </div>
                        
                        {week.displayName && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {week.displayName}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-medium ${
                          week.profit > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : week.profit < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-muted-foreground'
                        }`}>
                          ${(week.profit || 0).toLocaleString()}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleWeekExpansion(index)}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={week.profit === 0 ? "0" : week.profit || ""}
                              onChange={(e) => onProfitChange(index, e.target.value)}
                              placeholder="0"
                              className={`w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                            />
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Cumulative:</span> 
                            <span className="ml-1 font-medium">${(week.cumulative || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Entries if any */}
                        {hasEntries && (
                          <div>
                            <div className="text-sm font-medium mb-2">Entries ({week.entries.length})</div>
                            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                              {week.entries.map((entry, entryIndex) => (
                                <li 
                                  key={entryIndex} 
                                  className={`text-xs p-2 rounded ${
                                    entry.amount >= 0 
                                      ? theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50' 
                                      : theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className={`font-medium ${
                                        entry.amount >= 0 
                                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600' 
                                          : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                      }`}>
                                        ${entry.amount.toLocaleString()}
                                      </div>
                                      <div className="text-xs opacity-80">
                                        {entry.timestamp 
                                          ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')
                                          : 'No date'}
                                      </div>
                                      {entry.note && (
                                        <div className="mt-1">{entry.note}</div>
                                      )}
                                    </div>
                                    <div className="flex space-x-1">
                                      <button 
                                        onClick={() => onEditEntry && onEditEntry(week.week, entry, entryIndex)}
                                        className={`p-1 rounded-full hover:bg-opacity-10 ${
                                          theme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-700'
                                        }`}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button 
                                        onClick={() => onDeleteEntry && onDeleteEntry(week.week, entryIndex)}
                                        className={`p-1 rounded-full hover:bg-opacity-10 ${
                                          theme === 'dark' ? 'hover:bg-white text-red-400' : 'hover:bg-gray-700 text-red-500'
                                        }`}
                                      >
                                        <Trash size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekInput;