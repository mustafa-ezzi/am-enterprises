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
  amplitude?: number;
};

/** Gentle vertical float / parallax on scroll. */
export function ScrollFloat({
  children,
  className,
  style,
  amplitude = 40,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { y: amplitude * 0.35 },
      {
        y: -amplitude * 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }, [amplitude]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
