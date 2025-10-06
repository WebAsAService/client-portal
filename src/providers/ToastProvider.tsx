import React, { createContext, useContext, useState, useCallback } from 'react';
import ErrorToast, { ToastType } from '../components/react/ErrorToast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showError: (message: string, action?: Toast['action']) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showError = useCallback((message: string, action?: Toast['action']) => {
    showToast({
      message,
      type: 'error',
      action,
      autoClose: false // Errors require manual dismissal
    });
  }, [showToast]);

  const showSuccess = useCallback((message: string) => {
    showToast({
      message,
      type: 'success',
      autoClose: true,
      duration: 4000
    });
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast({
      message,
      type: 'warning',
      autoClose: true,
      duration: 6000
    });
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast({
      message,
      type: 'info',
      autoClose: true,
      duration: 5000
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <ErrorToast
              message={toast.message}
              type={toast.type}
              onClose={() => hideToast(toast.id)}
              action={toast.action}
              autoClose={toast.autoClose}
              duration={toast.duration}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};