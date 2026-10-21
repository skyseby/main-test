import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface Props {
  toasts: ToastMessage[];
  dismiss: (id: string) => void;
}

export function ToastRegion({ toasts, dismiss }: Props) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? CircleAlert : Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
            <Icon size={18} aria-hidden="true" />
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}