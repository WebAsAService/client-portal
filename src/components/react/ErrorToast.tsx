import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ErrorToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true);

    // Auto close for non-error messages
    if (autoClose && type !== 'error') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, type]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseStyles = 'flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 ease-out';
    const positionStyles = `fixed top-4 right-4 z-50 min-w-80 max-w-md ${
      isVisible && !isLeaving
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0'
    }`;

    const typeStyles = {
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return `${baseStyles} ${positionStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    const iconStyles = 'w-5 h-5 mr-3 mt-0.5 flex-shrink-0';

    switch (type) {
      case 'error':
        return <AlertCircle className={`${iconStyles} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconStyles} text-yellow-500`} />;
      case 'success':
        return <CheckCircle className={`${iconStyles} text-green-500`} />;
      case 'info':
        return <Info className={`${iconStyles} text-blue-500`} />;
      default:
        return <Info className={`${iconStyles} text-gray-500`} />;
    }
  };

  const getCloseButtonStyles = () => {
    const baseStyles = 'ml-auto flex-shrink-0 p-1 rounded hover:bg-opacity-20 transition-colors';

    const typeStyles = {
      error: 'hover:bg-red-200 text-red-500',
      warning: 'hover:bg-yellow-200 text-yellow-500',
      success: 'hover:bg-green-200 text-green-500',
      info: 'hover:bg-blue-200 text-blue-500'
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getActionButtonStyles = () => {
    const baseStyles = 'ml-3 px-3 py-1 text-sm font-medium rounded border transition-colors';

    const typeStyles = {
      error: 'border-red-300 text-red-700 hover:bg-red-100',
      warning: 'border-yellow-300 text-yellow-700 hover:bg-yellow-100',
      success: 'border-green-300 text-green-700 hover:bg-green-100',
      info: 'border-blue-300 text-blue-700 hover:bg-blue-100'
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  return (
    <div className={getToastStyles()} role="alert" aria-live="polite">
      {getIcon()}
      <div className="flex-grow">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <div className="mt-2">
            <button
              onClick={action.onClick}
              className={getActionButtonStyles()}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className={getCloseButtonStyles()}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ErrorToast;