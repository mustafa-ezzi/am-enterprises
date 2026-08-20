import type { CSSProperties } from "react";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  opacity?: number;
  style?: CSSProperties;
};

/** Very low-opacity film grain overlay. */
export function Noise({ opacity = 0.035, style }: Props) {
  if (prefersReducedMotion()) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        zIndex: 60,
        opacity,
        mixBlendMode: "multiply",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        ...style,
      }}
    />
  );
}
