import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({
  type = 'error',
  title,
  message,
  className = '',
  onClose,
}) {
  if (!message && !title) return null;

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type] || styles.error;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all ${current.bg} ${className}`}
      role="alert"
    >
      {current.icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-gray-400 hover:text-gray-600 -mr-1 -mt-1 p-1 rounded-md"
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
}
