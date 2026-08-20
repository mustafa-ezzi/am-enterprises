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

/** Media frame expands toward full-bleed on scroll (radius kept at 0). */
export function ScrollExpand({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { scale: 1, width: "100%" });
      return;
    }
    gsap.fromTo(
      el,
      { scale: 0.88, width: "78%" },
      {
        scale: 1,
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      },
    );
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        marginInline: "auto",
        borderRadius: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
