import React from 'react';
import { cn } from "../../lib/utils";

export function RadioGroup({ defaultValue, value, onValueChange, className, children }) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);
  
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, child => {
        // Find the RadioGroupItem within each div
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, innerChild => {
              if (innerChild.type === RadioGroupItem) {
                return React.cloneElement(innerChild, {
                  checked: selectedValue === innerChild.props.value,
                  onChange: () => handleValueChange(innerChild.props.value)
                });
              }
              return innerChild;
            })
          });
        }
        return child;
      })}
    </div>
  );
}

export function RadioGroupItem({ value, id, checked, onChange, className }) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      className={cn(
        "h-4 w-4 rounded-full border border-input bg-background text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
} 