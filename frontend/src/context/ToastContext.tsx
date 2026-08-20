import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; message: string; tone?: "ok" | "error" };

type ToastContextValue = {
  toasts: Toast[];
  push: (message: string, tone?: "ok" | "error") => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: "ok" | "error" = "ok") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 80,
          display: "grid",
          gap: 8,
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            style={{
              textAlign: "left",
              border: "1px solid var(--color-charcoal-ink)",
              background:
                t.tone === "error"
                  ? "var(--color-paper-white)"
                  : "var(--color-charcoal-ink)",
              color:
                t.tone === "error"
                  ? "var(--color-signal-red)"
                  : "var(--color-paper-white)",
              padding: "12px 14px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
