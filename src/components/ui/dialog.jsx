import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from "../../lib/utils";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  
  // Using React Portal to ensure the dialog is rendered at the root level
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false);
      }
    }}>
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-auto dark:bg-gray-800 dark:text-white">
        {children}
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
}

export function DialogTrigger({ asChild, children, onClick }) {
  if (asChild) {
    return React.cloneElement(children, { 
      onClick: () => {
        onClick && onClick();
        children.props.onClick && children.props.onClick();
      }
    });
  }
  return <div onClick={onClick}>{children}</div>;
}

export function DialogContent({ className, children, ...props }) {
  return <div className={cn("p-6", className)} {...props}>{children}</div>;
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-gray-600 dark:text-gray-400", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
} 