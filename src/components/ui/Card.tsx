import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-xl border p-6',
          glass 
            ? 'bg-zinc-900/40 backdrop-blur-md border-zinc-800 shadow-xl' 
            : 'bg-zinc-900 border-zinc-800',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";
