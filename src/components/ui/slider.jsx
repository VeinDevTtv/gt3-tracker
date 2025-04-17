import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, ...props }, ref) => {
    const handleChange = (event) => {
      const newValue = Number(event.target.value)
      if (onValueChange) {
        onValueChange(newValue)
      }
    }

    const percentage = ((value - min) / (max - min)) * 100

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute h-full rounded-full bg-porsche-red"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute w-full h-2 cursor-pointer opacity-0"
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider } 