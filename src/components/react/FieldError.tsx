import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center mt-1 text-sm text-red-600 ${className}`} role="alert">
      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default FieldError;