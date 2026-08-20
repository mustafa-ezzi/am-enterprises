import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type TrueFocusProps = {
  words: string[];
  className?: string;
  style?: CSSProperties;
};

/** Sequential focus across words — trust / values line. */
export function TrueFocus({ words, className, style }: TrueFocusProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const spans = el.querySelectorAll<HTMLElement>(".focus-word");
      if (prefersReducedMotion()) {
        gsap.set(spans, { opacity: 1, filter: "blur(0px)" });
        return;
      }
      const tl = gsap.timeline({ repeat: 0 });
      spans.forEach((span, i) => {
        tl.fromTo(
          span,
          { opacity: 0.25, filter: "blur(5px)" },
          { opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power2.out" },
          i * 0.35,
        );
      });
    },
    { dependencies: [words.join("|")] },
  );

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="focus-word"
          style={{
            display: "inline-block",
            marginRight: i < words.length - 1 ? "0.35em" : 0,
            fontWeight: i === words.length - 1 ? 600 : 400,
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
