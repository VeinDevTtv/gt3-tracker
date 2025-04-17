import React from 'react';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
        link: 'bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-2 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  title,
  children,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      title={title}
      {...props}
    >
      {children}
    </button>
  )
});

Button.displayName = 'Button';

export { buttonVariants }; 