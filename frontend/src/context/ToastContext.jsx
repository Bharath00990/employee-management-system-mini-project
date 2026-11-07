import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, variant = 'success', duration = 4000) => {
    const id = ++idRef.current;
    setToasts((current) => [...current, { id, message, variant }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toastRef = useRef(null);
  if (!toastRef.current) {
    toastRef.current = {
      success: (message) => {},
      error: (message) => {},
      info: (message) => {},
    };
  }

  // Update refs to latest addToast
  toastRef.current.success = (message) => addToast(message, 'success');
  toastRef.current.error = (message) => addToast(message, 'error', 6000);
  toastRef.current.info = (message) => addToast(message, 'info');

  return (
    <ToastContext.Provider value={toastRef.current}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          const IconComp = ICONS[t.variant] ?? Info;
          return (
            <div key={t.id} className={`toast toast--${t.variant}`}>
              <IconComp size={20} className="toast__icon" />
              <div className="toast__content">
                <p className="toast__message">{t.message}</p>
              </div>
              <button
                type="button"
                className="toast__close"
                onClick={() => removeToast(t.id)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { ToastProvider, useToast };
