import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  to: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  suffix?: string;
  prefix?: string;
};

/** Animated number counter (Count Up / Counter). */
export function CountUp({
  to,
  duration = 1.4,
  className,
  style,
  suffix = "",
  prefix = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${to}${suffix}`;
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: to,
      duration,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
      },
    });
  }, [to, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}0{suffix}
    </span>
  );
}

export const Counter = CountUp;
