'use client';

import { createContext, useContext, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idPrefix = useId();
  let toastCounter = 0;

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 3500
  ) => {
    const id = `${idPrefix}-${++toastCounter}`;
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, [idPrefix]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: '#E8F5E9',
          border: '#81C784',
          text: '#2E7D32',
          icon: '✓',
        };
      case 'error':
        return {
          bg: '#FFEBEE',
          border: '#EF5350',
          text: '#C62828',
          icon: '✕',
        };
      case 'info':
      default:
        return {
          bg: '#E3F2FD',
          border: '#64B5F6',
          text: '#1565C0',
          icon: 'ℹ',
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const styles = getStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 400, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 400, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-lg shadow-lg border backdrop-blur-md"
                style={{
                  background: styles.bg,
                  borderColor: styles.border,
                }}
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: styles.border,
                    color: styles.bg,
                  }}
                >
                  {styles.icon}
                </div>
                <p
                  className="text-sm font-medium leading-snug max-w-xs"
                  style={{ color: styles.text, fontFamily: 'Georgia, serif' }}
                >
                  {toast.message}
                </p>
                <button
                  onClick={() => onRemove(toast.id)}
                  className="flex-shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: styles.text }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
