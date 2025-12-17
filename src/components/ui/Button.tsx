import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import React from 'react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] text-black border border-zinc-300 shadow hover:brightness-105',
      secondary: 'bg-white hover:bg-zinc-50 text-black border border-zinc-300 shadow-sm',
      outline: 'bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
      ghost: 'bg-transparent hover:bg-zinc-100 text-zinc-700',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-8 py-3 text-lg font-semibold',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative overflow-hidden rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
