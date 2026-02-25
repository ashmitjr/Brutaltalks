import React from 'react';
import { cn } from '@/lib/utils';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'destructive' | 'outline';
  fullWidth?: boolean;
}

export function BrutalButton({ 
  children, 
  className, 
  variant = 'primary', 
  fullWidth = false,
  ...props 
}: BrutalButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center brutal-border px-8 py-4 font-bold text-xl uppercase transition-all duration-75 active:duration-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";
  
  const variants = {
    primary: "bg-background text-foreground hover:bg-accent hover:text-background brutal-shadow brutal-shadow-hover brutal-shadow-active active:bg-accent",
    destructive: "bg-background text-foreground hover:bg-destructive hover:text-foreground brutal-shadow-destructive brutal-shadow-destructive-hover brutal-shadow-destructive-active active:bg-destructive",
    outline: "bg-transparent text-foreground hover:bg-foreground hover:text-background",
  };

  return (
    <button 
      className={cn(
        baseStyles,
        variants[variant],
        fullWidth ? "w-full block" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
