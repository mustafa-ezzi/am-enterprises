import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: number;
};

/** Subtle magnetic pull toward cursor on primary CTAs. */
export function Magnet({
  children,
  className,
  style,
  padding = 16,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, {
        x: x * 0.12,
        y: y * 0.12,
        duration: 0.28,
        ease: "power2.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [padding]);

  return (
    <div ref={ref} className={className} style={{ display: "inline-block", ...style }}>
      {children}
    </div>
  );
}
