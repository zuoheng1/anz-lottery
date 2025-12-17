import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-black" />,
  error: <AlertCircle className="w-5 h-5 text-black" />,
  warning: <AlertTriangle className="w-5 h-5 text-black" />,
  info: <Info className="w-5 h-5 text-black" />,
};

const bgColors = {
    success: 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] border border-zinc-300 shadow',
    error: 'bg-gradient-to-r from-[#FF5858] to-[#FF1D1D] border border-zinc-300 shadow',
    warning: 'bg-gradient-to-r from-[#FFD000] via-[#FF924C] to-[#FF4444] border border-zinc-300 shadow',
    info: 'bg-gradient-to-r from-[#60a5fa] to-[#22d3ee] border border-zinc-300 shadow',
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-2 w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm ${bgColors[toast.type]} text-black`}
            aria-live="polite"
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-80 text-black" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
