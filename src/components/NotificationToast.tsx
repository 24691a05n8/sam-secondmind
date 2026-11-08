import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const type = toast.type || 'info';

        const getIcon = () => {
          switch (type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            default: return <Info className="w-4 h-4 text-sam-highlight shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (type) {
            case 'success': return 'border-emerald-500/30';
            case 'warning': return 'border-amber-500/30';
            case 'error': return 'border-rose-500/30';
            default: return 'border-sam-purple/30';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl bg-sam-surface/95 border ${getBorderColor()} shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs text-sam-text animate-slideInRight`}
          >
            <div className="flex items-center gap-2.5">
              {getIcon()}
              <span className="font-medium leading-snug">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-sam-muted hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

