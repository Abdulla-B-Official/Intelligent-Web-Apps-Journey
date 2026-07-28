import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'border-emerald-500/20 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/20',
    error: 'border-rose-500/20 bg-rose-950/40 text-rose-100 shadow-rose-950/20',
    info: 'border-blue-500/20 bg-blue-950/40 text-blue-100 shadow-blue-950/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`flex items-center gap-3 p-4 border rounded-xl backdrop-blur-md shadow-lg ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
