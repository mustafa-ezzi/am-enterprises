import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type SharedProps = {
  children: ReactNode;
  size?: "compact" | "standard";
  className?: string;
};

type AsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type AsLink = SharedProps &
  Omit<LinkProps, "className" | "children"> & {
    to: LinkProps["to"];
  };

export type PillButtonProps = AsButton | AsLink;

function sizePadding(size: "compact" | "standard") {
  return size === "compact" ? "10px 15px" : "16px 20px";
}

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function PillGhostButton(props: PillButtonProps) {
  const { children, size = "compact", className, ...rest } = props;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid var(--color-charcoal-ink)",
    borderRadius: "var(--radius-buttons)",
    background: "var(--color-paper-white)",
    color: "var(--color-charcoal-ink)",
    padding: sizePadding(size),
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: "0.005em",
    cursor: "pointer",
    textAlign: "center" as const,
  };

  if ("to" in props && props.to !== undefined) {
    const { to, ...linkRest } = rest as AsLink;
    return (
      <Link
        to={to}
        className={cx("pill-ghost-btn", className)}
        style={style}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  const buttonRest = rest as AsButton;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={cx("pill-ghost-btn", className)}
      style={style}
      {...buttonRest}
    >
      {children}
    </button>
  );
}

export function PillFilledButton(props: PillButtonProps) {
  const { children, size = "compact", className, ...rest } = props;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: "var(--radius-buttons)",
    background: "var(--color-charcoal-ink)",
    color: "var(--color-paper-white)",
    padding: size === "compact" ? "10px 18px" : "16px 22px",
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: "0.005em",
    cursor: "pointer",
    textAlign: "center" as const,
  };

  if ("to" in props && props.to !== undefined) {
    const { to, ...linkRest } = rest as AsLink;
    return (
      <Link
        to={to}
        className={cx("pill-filled-btn", className)}
        style={style}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  const buttonRest = rest as AsButton;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={cx("pill-filled-btn", className)}
      style={style}
      {...buttonRest}
    >
      {children}
    </button>
  );
}
