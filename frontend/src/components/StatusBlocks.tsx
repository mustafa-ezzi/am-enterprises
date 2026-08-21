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
    <div className="product-card product-card--skeleton">
      <div className="product-card__media">
        <Skeleton height="100%" className="product-card__skeleton-media" />
      </div>
      <div className="product-card__body">
        <Skeleton height={12} width="42%" />
        <Skeleton height={16} width="88%" />
        <Skeleton height={12} width="55%" />
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
