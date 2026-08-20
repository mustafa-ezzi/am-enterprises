import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";

type Step = { label: string };

type Props = {
  steps: Step[];
  current: number;
  onChange?: (step: number) => void;
  className?: string;
  style?: CSSProperties;
};

/** Flat editorial stepper for checkout / wizards. */
export function Stepper({
  steps,
  current,
  onChange,
  className,
  style,
}: Props) {
  return (
    <div
      className={className}
      role="tablist"
      aria-label="Progress"
      style={{ display: "flex", gap: 10, flexWrap: "wrap", ...style }}
    >
      {steps.map((step, i) => {
        const n = i + 1;
        const active = current === n;
        return (
          <button
            key={step.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(n)}
            style={{
              border: "1px solid #000",
              borderRadius: 500,
              padding: "8px 14px",
              fontSize: 14,
              background: active ? "#000" : "#fff",
              color: active ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {n}. {step.label}
          </button>
        );
      })}
    </div>
  );
}

type PillNavItem = { to?: string; label: string; onClick?: () => void; active?: boolean };

export function PillNav({
  items,
  className,
  style,
}: {
  items: PillNavItem[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <nav
      className={["pill-nav", className].filter(Boolean).join(" ")}
      style={{ display: "flex", gap: 10, flexWrap: "wrap", ...style }}
      aria-label="Section"
    >
      {items.map((item) => {
        const pillStyle = {
          display: "inline-flex",
          border: item.active
            ? "1px solid color-mix(in srgb, var(--color-gold) 60%, transparent)"
            : "1px solid color-mix(in srgb, var(--color-jade) 45%, transparent)",
          borderRadius: 500,
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 400,
          background: item.active
            ? "linear-gradient(145deg, #1f2c42, var(--color-ink))"
            : "var(--neo-raised)",
          color: item.active ? "var(--color-champagne)" : "var(--color-ink)",
          boxShadow: "var(--neo-flat)",
        } as const;

        if (item.onClick || !item.to) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{ ...pillStyle, cursor: "pointer" }}
            >
              {item.label}
            </button>
          );
        }

        return (
          <Link key={item.label} to={item.to} style={pillStyle}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccordionGallery({
  items,
}: {
  items: Array<{ title: string; body: ReactNode; image?: string }>;
}) {
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {items.map((item) => (
        <details
          key={item.title}
          style={{ borderTop: "1px solid #000", paddingBlock: 16 }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontSize: 23,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              listStyle: "none",
            }}
          >
            {item.title}
          </summary>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: item.image ? "1fr 1fr" : "1fr",
              marginTop: 16,
            }}
            className="accordion-panel"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                style={{ width: "100%", display: "block" }}
              />
            ) : null}
            <div className="text-body-sm">{item.body}</div>
          </div>
        </details>
      ))}
    </div>
  );
}
