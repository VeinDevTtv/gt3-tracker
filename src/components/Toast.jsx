import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, emoji, onClose, autoClose = true, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };
  
  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 
        bg-white dark:bg-gray-800 
        shadow-md rounded-lg p-4 
        flex items-center gap-2 
        max-w-sm
        transform transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      {emoji && <div className="text-2xl">{emoji}</div>}
      <div className="flex-1 text-sm">{message}</div>
      <button 
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast; 