import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Direction = "up" | "down" | "left" | "right";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
};

const offset = (direction: Direction, distance: number) => {
  switch (direction) {
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: distance };
  }
};

/** Directional slide-in wrapper (Animated Content). */
export function AnimatedContent({
  children,
  className,
  style,
  direction = "up",
  distance = 28,
  delay = 0,
  duration = 0.65,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const from = offset(direction, distance);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, ...from },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  }, [direction, distance, delay, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}
