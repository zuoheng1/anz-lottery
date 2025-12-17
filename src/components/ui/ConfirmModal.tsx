import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] w-full px-4 pointer-events-none flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="pointer-events-auto bg-white border border-zinc-300 rounded-xl p-5 w-full max-w-md shadow-xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={28} className="text-red-500" />
          <h2 className="text-lg font-black text-black tracking-wider">{title}</h2>
        </div>
        <p className="text-zinc-700 mb-4 text-sm">{description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-zinc-700 hover:bg-zinc-100">
            取消
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="text-red-600 border-red-300 hover:bg-red-100"
          >
            确认执行
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
