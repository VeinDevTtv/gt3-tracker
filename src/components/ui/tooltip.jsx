import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipContext = React.createContext({})

const Tooltip = ({ children, content, className }) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const childRef = React.useRef(null)

  const showTooltip = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
      setIsVisible(true)
    }
  }

  const hideTooltip = () => {
    setIsVisible(false)
  }

  return (
    <TooltipContext.Provider value={{ childRef }}>
      <div 
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
        {isVisible && (
          <div
            className={cn(
              "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black rounded shadow-lg",
              "transform -translate-x-1/2 -translate-y-full",
              "pointer-events-none",
              "dark:bg-gray-700 dark:text-gray-100",
              "animate-in fade-in-50 zoom-in-95",
              className
            )}
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {content}
            <div 
              className="absolute w-2 h-2 bg-black rotate-45 -bottom-1 left-1/2 -translate-x-1/2 dark:bg-gray-700" 
            />
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  )
}

export { Tooltip } 