import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type BlurTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
};

/** Soft blur → clarity reveal (slogan / trust line). */
export function BlurText({
  text,
  className,
  style,
  as: Tag = "p",
  delay = 0.15,
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, filter: "blur(0px)" });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0.2, filter: "blur(8px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
          delay,
        },
      );
    },
    { dependencies: [text, delay] },
  );

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {text}
    </Tag>
  );
}
