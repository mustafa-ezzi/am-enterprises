import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";

type Props = {
  words: string[];
  speed?: number;
  className?: string;
};

/** Full-bleed editorial marquee — oversized type drifting horizontally. */
export function HorizontalMarquee({ words, speed = 40, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const phrase = words.join(" · ");
  const loop = `${phrase} · ${phrase} · ${phrase} · `;

  useGSAP(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;
    const half = el.scrollWidth / 2;
    gsap.fromTo(
      el,
      { x: 0 },
      {
        x: -half,
        duration: Math.max(half / speed, 18),
        ease: "none",
        repeat: -1,
      },
    );
  }, [loop, speed]);

  return (
    <div
      className={["marquee-band", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <div ref={trackRef} className="marquee-track">
        <span className="marquee-text">{loop}</span>
        <span className="marquee-text">{loop}</span>
      </div>
    </div>
  );
}
