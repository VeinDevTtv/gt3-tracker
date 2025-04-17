import * as React from "react"
import { cn } from "@/lib/utils"

const Toggle = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
        "hover:bg-muted hover:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        checked && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  )
})

Toggle.displayName = "Toggle"

export { Toggle } 