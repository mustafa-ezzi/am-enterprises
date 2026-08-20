import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  deps?: unknown;
};

/** Stagger children enter (lists, cart lines, filter results). */
export function AnimatedList({
  children,
  className,
  style,
  stagger = 0.06,
  deps,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const items = el.children;
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        items,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [deps, stagger] },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
