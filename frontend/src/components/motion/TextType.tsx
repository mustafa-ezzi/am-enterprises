import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  as?: "p" | "span" | "h2";
};

/** One-shot typewriter — do not loop. */
export function TextType({
  text,
  className,
  style,
  speed = 28,
  as: Tag = "p",
}: Props) {
  const [shown, setShown] = useState(prefersReducedMotion() ? text : "");

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <Tag className={className} style={style} aria-label={text}>
      {shown}
      <span aria-hidden="true" style={{ opacity: shown.length < text.length ? 1 : 0 }}>
        |
      </span>
    </Tag>
  );
}
