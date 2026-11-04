"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Global event bus for imperative toast calls outside of React tree
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string, title?: string) => {
    listeners.forEach((listener) =>
      listener({ type: "success", message, title })
    );
  },
  error: (message: string, title?: string) => {
    listeners.forEach((listener) =>
      listener({ type: "error", message, title })
    );
  },
  warning: (message: string, title?: string) => {
    listeners.forEach((listener) =>
      listener({ type: "warning", message, title })
    );
  },
  info: (message: string, title?: string) => {
    listeners.forEach((listener) =>
      listener({ type: "info", message, title })
    );
  },
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return toast;
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...item, id };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 on screen

      const timeout = item.duration || 4000;
      setTimeout(() => {
        removeToast(id);
      }, timeout);
    },
    [removeToast]
  );

  // Subscribe to imperative toast calls
  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: "success", message, title }),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast({ type: "error", message, title }),
    [addToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => addToast({ type: "warning", message, title }),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast({ type: "info", message, title }),
    [addToast]
  );

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  const toastIcons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const toastStyles = {
    success: {
      border: "border-status-success/30",
      bg: "bg-surface",
      icon: "text-status-success bg-status-success-soft",
    },
    error: {
      border: "border-status-danger/30",
      bg: "bg-surface",
      icon: "text-status-danger bg-status-danger-soft",
    },
    warning: {
      border: "border-status-warning/30",
      bg: "bg-surface",
      icon: "text-status-warning bg-status-warning-soft",
    },
    info: {
      border: "border-status-info/30",
      bg: "bg-surface",
      icon: "text-status-info bg-status-info-soft",
    },
  };

  const portalContent = mounted && toasts.length > 0 ? (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const IconComponent = toastIcons[t.type];
        const style = toastStyles[t.type];

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${style.bg} ${style.border}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {t.title && (
                <h5 className="text-xs font-bold text-text-primary truncate">
                  {t.title}
                </h5>
              )}
              <p className="text-xs text-text-secondary leading-relaxed font-medium break-words">
                {t.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-subtle transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted && portalContent ? createPortal(portalContent, document.body) : null}
    </ToastContext.Provider>
  );
};
