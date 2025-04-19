import React from 'react';
import { cn } from "../../lib/utils";

export function Tabs({ value, onValueChange, className, children }) {
  console.log("Tabs render with value:", value);
  
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (!child) return null;
        
        if (child.type === TabsContent) {
          console.log("Tabs child is TabsContent with value:", child.props.value);
          return React.cloneElement(child, { 
            selected: child.props.value === value,
          });
        } else if (child.type === TabsList) {
          console.log("Tabs child is TabsList");
          return React.cloneElement(child, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ value, onValueChange, className, children }) {
  console.log("TabsList render with value:", value);
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {React.Children.map(children, child => {
        if (!child) return null;
        
        if (child.type === TabsTrigger) {
          console.log("TabsList child is TabsTrigger with value:", child.props.value);
          return React.cloneElement(child, {
            selected: child.props.value === value,
            onClick: () => {
              console.log("TabsTrigger clicked with value:", child.props.value);
              onValueChange(child.props.value);
            },
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, selected, className, children, ...props }) {
  return (
    <button
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-all",
        selected 
          ? "bg-primary text-primary-foreground shadow" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, selected, className, children }) {
  console.log("TabsContent render with value:", value, "selected:", selected);
  
  if (!selected) return null;
  
  return (
    <div className={cn("mt-2", className)}>
      {children}
    </div>
  );
} 