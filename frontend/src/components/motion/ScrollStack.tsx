import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../lib/motion";

gsap.registerPlugin(ScrollTrigger);

type Card = { title: string; body: ReactNode; image?: string };

type Props = {
  cards: Card[];
  className?: string;
  style?: CSSProperties;
};

/** Overlapping stack reveal on scroll (no drop shadows). */
export function ScrollStack({ cards, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const items = root.querySelectorAll<HTMLElement>(".stack-card");
    items.forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 80 + i * 20, opacity: 0.4 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 45%",
            scrub: true,
          },
        },
      );
    });
  }, [cards.length]);

  return (
    <div ref={ref} className={className} style={{ display: "grid", gap: 24, ...style }}>
      {cards.map((card) => (
        <article
          key={card.title}
          className="stack-card"
          style={{
            background: "#fff",
            border: "1px solid #000",
            padding: 0,
          }}
        >
          {card.image ? (
            <img
              src={card.image}
              alt=""
              style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "cover" }}
            />
          ) : null}
          <div style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 23, fontWeight: 600 }}>
              {card.title}
            </h3>
            <div className="text-body-sm">{card.body}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
