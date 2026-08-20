import type { HTMLAttributes, ReactNode } from "react";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "editorial" | "muted" | "ink";
};

export function Tag({
  children,
  tone = "editorial",
  className,
  style,
  ...rest
}: TagProps) {
  const color =
    tone === "editorial"
      ? "var(--color-gold)"
      : tone === "muted"
        ? "var(--color-pewter)"
        : "var(--color-ink)";

  const border =
    tone === "editorial"
      ? "1px solid color-mix(in srgb, var(--color-gold) 55%, transparent)"
      : tone === "muted"
        ? "1px solid color-mix(in srgb, var(--color-pewter) 55%, transparent)"
        : "1px solid color-mix(in srgb, var(--color-jade) 50%, transparent)";

  return (
    <span
      className={["ui-tag", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        borderRadius: 500,
        border,
        padding: "6px 12px",
        background: "var(--neo-raised)",
        boxShadow: "var(--neo-flat)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
