import React, { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

const DatePicker = ({ value, onChange, placeholder = "Select date", className }) => {
  const [open, setOpen] = useState(false);
  const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value) : undefined;
  
  const handleSelect = (date) => {
    onChange(date);
    setOpen(false);
  };
  
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    try {
      // Handle manual input in the format yyyy-MM-dd
      const dateObj = parseISO(inputValue);
      if (isValid(dateObj)) {
        onChange(dateObj);
      }
    } catch (error) {
      // If parsing fails, ignore and keep the previous value
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue && isValid(dateValue) ? (
            format(dateValue, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker }; 