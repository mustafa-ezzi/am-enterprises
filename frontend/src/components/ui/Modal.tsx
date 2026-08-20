import { useEffect, type ReactNode } from "react";
import { PillGhostButton } from "./PillButton";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.86)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(100%, 520px)",
          background: "var(--color-paper-white)",
          border: "1px solid var(--color-charcoal-ink)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <h2 id="modal-title" className="text-subheading" style={{ margin: 0 }}>
            {title}
          </h2>
          <PillGhostButton aria-label="Close dialog" onClick={onClose}>
            Close
          </PillGhostButton>
        </div>
        <div className="text-body-sm">{children}</div>
        {footer ? (
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
