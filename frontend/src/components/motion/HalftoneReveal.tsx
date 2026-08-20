import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Print-like dotted overlay that clears on scroll. */
export function HalftoneReveal({ children, className, style }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = wrap.current;
    const overlay = dots.current;
    if (!el || !overlay) return;
    if (prefersReducedMotion()) {
      gsap.set(overlay, { opacity: 0 });
      return;
    }
    gsap.fromTo(
      overlay,
      { opacity: 0.85 },
      {
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      },
    );
  }, []);

  return (
    <div
      ref={wrap}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {children}
      <div
        ref={dots}
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, #000 1px, transparent 1.2px)",
          backgroundSize: "6px 6px",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
