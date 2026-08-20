import type { CSSProperties, ReactNode } from "react";

type SectionBandProps = {
  children: ReactNode;
  tone?:
    | "base"
    | "raised"
    | "mint"
    | "sky"
    | "champagne"
    | "rose"
    | "ink"
    | "white"
    | "gray"
    | "cream"
    | "mist"
    | "sage"
    | "blush";
  contained?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "section" | "div" | "aside";
};

const toneBg: Record<NonNullable<SectionBandProps["tone"]>, string> = {
  base: "var(--neo-base)",
  raised: "var(--neo-raised)",
  mint: "var(--color-mint)",
  sky: "var(--color-sky)",
  champagne: "var(--color-champagne)",
  rose: "var(--color-rose)",
  ink: "var(--color-ink)",
  white: "var(--neo-raised)",
  gray: "var(--color-sky)",
  cream: "var(--color-champagne)",
  mist: "var(--color-sky)",
  sage: "var(--color-mint)",
  blush: "var(--color-rose)",
};

export function SectionBand({
  children,
  tone = "base",
  contained = true,
  className,
  style,
  as: TagName = "section",
}: SectionBandProps) {
  const isInk = tone === "ink";

  return (
    <TagName
      className={[
        "section-band",
        `section-band--${tone}`,
        isInk ? "section-band--ink" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        paddingBlock: "var(--section-gap)",
        background: toneBg[tone],
        color: isInk ? "var(--color-champagne)" : undefined,
        ...style,
      }}
    >
      {contained ? <div className="page-shell">{children}</div> : children}
    </TagName>
  );
}
