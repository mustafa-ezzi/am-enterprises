import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type SplitTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "p" | "span";
  delay?: number;
};

/** React Bits–style split character stagger (editorial entrance). */
export function SplitText({
  text,
  className,
  style,
  as: Tag = "h1",
  delay = 0,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const chars = el.querySelectorAll<HTMLElement>(".split-char");
      if (prefersReducedMotion()) {
        gsap.set(chars, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        chars,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.028,
          ease: "power2.out",
          delay,
        },
      );
    },
    { dependencies: [text, delay] },
  );

  const words = text.split(" ");

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((ch, ci) => (
            <span
              key={`${wi}-${ci}`}
              className="split-char"
              style={{ display: "inline-block", opacity: 0 }}
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}
          {wi < words.length - 1 ? (
            <span className="split-char" style={{ display: "inline-block", opacity: 0 }} aria-hidden="true">
              {"\u00A0"}
            </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}
