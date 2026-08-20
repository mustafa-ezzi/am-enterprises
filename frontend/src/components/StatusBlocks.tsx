import type { CSSProperties } from "react";

type SkeletonProps = {
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
};

/** Newsprint gray skeleton band. */
export function Skeleton({
  height = 16,
  width = "100%",
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={["skeleton-band", className].filter(Boolean).join(" ")}
      style={{
        height,
        width,
        background: "var(--color-newsprint-gray)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className="product-card"
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0 }}
    >
      <Skeleton height={220} />
      <div style={{ padding: "0 16px 16px", display: "grid", gap: 10 }}>
        <Skeleton height={14} width="40%" />
        <Skeleton height={18} width="80%" />
        <Skeleton height={14} width="30%" />
      </div>
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        padding: "40px 20px",
        background: "var(--color-newsprint-gray)",
        color: "var(--color-pewter)",
        textAlign: "center",
        fontSize: 16,
      }}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        border: "1px solid var(--color-charcoal-ink)",
        padding: 24,
      }}
    >
      <p
        className="text-body-sm"
        style={{ margin: 0, color: "var(--color-signal-red)" }}
      >
        {message}
      </p>
    </div>
  );
}
