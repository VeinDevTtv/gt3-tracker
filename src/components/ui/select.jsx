import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className={cn("relative w-full", className)}>
      {children}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    />
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        "animate-in fade-in-80 dark:bg-gray-800 dark:border-gray-700",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-white",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* <Check className="h-4 w-4" /> */}
      </span>
      <span className="pl-2">{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 