import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        border: "1px solid var(--color-charcoal-ink)",
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--color-paper-white)",
      }}
    >
      <h3 className="text-subheading" style={{ margin: "0 0 12px" }}>
        {title}
      </h3>
      {description ? (
        <p
          className="text-body-sm"
          style={{ margin: "0 auto 20px", maxWidth: 420, color: "var(--color-brand-charcoal)" }}
        >
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
