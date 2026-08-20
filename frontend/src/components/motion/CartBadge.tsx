import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type CartBadgeProps = {
  count: number;
};

/** Pulsing count when cart updates. */
export function CartBadge({ count }: CartBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(count);

  useEffect(() => {
    if (count === prev.current) return;
    prev.current = count;
    const el = ref.current;
    if (!el || count <= 0 || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { scale: 1 },
      { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.out" },
    );
  }, [count]);

  if (count <= 0) return null;

  return (
    <span
      ref={ref}
      style={{
        display: "inline-flex",
        marginLeft: 6,
        minWidth: 18,
        height: 18,
        paddingInline: 5,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 500,
        border: "1px solid currentColor",
        fontSize: 11,
        lineHeight: 1,
      }}
      aria-label={`${count} items in cart`}
    >
      {count}
    </span>
  );
}
