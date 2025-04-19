import React, { useState, useRef, useEffect } from 'react';
import { cn } from "../../lib/utils";
import { ChevronDown } from 'lucide-react';

export function Select({ value, onValueChange, children, className }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Find the selected value's label
  let selectedLabel = "";
  React.Children.forEach(children, child => {
    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, triggerChild => {
        if (triggerChild.type === SelectValue) {
          selectedLabel = triggerChild.props.placeholder;
        }
      });
    } else if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, contentChild => {
        if (contentChild.type === SelectItem && contentChild.props.value === value) {
          selectedLabel = contentChild.props.children;
        }
      });
    }
  });
  
  return (
    <div ref={selectRef} className={cn("relative w-full", className)}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
            selectedLabel
          });
        } else if (child.type === SelectContent) {
          return open && React.cloneElement(child, {
            onValueChange,
            onClose: () => setOpen(false)
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ id, className, children, onClick, selectedLabel, disabled }) {
  return (
    <button
      id={id}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectValue) {
          return React.cloneElement(child, { selectedLabel });
        }
        return child;
      })}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, selectedLabel }) {
  return <span>{selectedLabel || placeholder}</span>;
}

export function SelectContent({ className, children, onValueChange, onClose }) {
  return (
    <div className={cn(
      "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1",
      className
    )}>
      <div className="p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onClick: () => {
                onValueChange(child.props.value);
                onClose();
              }
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ className, value, onClick, children }) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
} 