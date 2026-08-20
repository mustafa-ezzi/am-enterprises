import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "p" | "span";
};

/** Lines unfold like creased paper. */
export function FoldText({
  text,
  className,
  style,
  as: Tag = "h2",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { rotateX: 0, opacity: 1 });
      return;
    }
    gsap.fromTo(
      el,
      { rotateX: -75, opacity: 0, transformOrigin: "top center" },
      {
        rotateX: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
  }, [text]);

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        perspective: 800,
        display: "block",
        transformOrigin: "top center",
        ...style,
      }}
    >
      {text}
    </Tag>
  );
}
