import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "p" | "span";
};

/** Word-by-word unblur on scroll. */
export function ScrollReveal({
  text,
  className,
  style,
  as: Tag = "p",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const words = el.querySelectorAll<HTMLElement>(".reveal-word");
      if (prefersReducedMotion()) {
        gsap.set(words, { opacity: 1, filter: "blur(0px)", y: 0 });
        return;
      }
      gsap.fromTo(
        words,
        { opacity: 0.15, filter: "blur(6px)", y: 10 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.55,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { dependencies: [text] },
  );

  return (
    <Tag ref={ref as never} className={className} style={style} aria-label={text}>
      {text.split(" ").map((word, i, arr) => (
        <span
          key={`${word}-${i}`}
          className="reveal-word"
          style={{ display: "inline-block", marginRight: i < arr.length - 1 ? "0.3em" : 0 }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
