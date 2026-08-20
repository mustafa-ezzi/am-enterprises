import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

/** Subtle page enter fade for storefront routes. */
export function PageFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power1.out" },
    );
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ opacity: 0, minHeight: "100%" }}>
      {children}
    </div>
  );
}
