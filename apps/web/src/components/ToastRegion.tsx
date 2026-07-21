import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { useDemoStore } from '../store/useDemoStore';

export function ToastRegion() {
  const toasts = useDemoStore((state) => state.toasts);
  const dismiss = useDemoStore((state) => state.dismissToast);
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? CircleAlert : Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
            <Icon size={19} aria-hidden="true" />
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
              <X size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
