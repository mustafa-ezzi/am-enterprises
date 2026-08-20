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
  /** scroll = scrub unblur; load = entrance on mount (hero collage). */
  mode?: "scroll" | "load";
  delay?: number;
};

/** Cinematic un-blur on scroll or load. */
export function GradualBlur({
  children,
  className,
  style,
  mode = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { filter: "blur(0px)", opacity: 1 });
      return;
    }
    if (mode === "load") {
      gsap.fromTo(
        el,
        { filter: "blur(16px)", opacity: 0.2 },
        {
          filter: "blur(0px)",
          opacity: 1,
          duration: 1.1,
          delay,
          ease: "power2.out",
        },
      );
      return;
    }
    gsap.fromTo(
      el,
      { filter: "blur(12px)", opacity: 0.4 },
      {
        filter: "blur(0px)",
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      },
    );
  }, [mode, delay]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
