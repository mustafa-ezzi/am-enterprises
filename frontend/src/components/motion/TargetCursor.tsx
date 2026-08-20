import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/motion";

/** Desktop-only corner brackets that follow the pointer. */
export function TargetCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setOn(true);
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!on) return null;

  const arm = 10;
  const gap = 14;
  const stroke = "#000";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 25,
        mixBlendMode: "difference",
      }}
    >
      {[
        { x: -gap, y: -gap, borders: "borderTop borderLeft" },
        { x: gap, y: -gap, borders: "borderTop borderRight" },
        { x: -gap, y: gap, borders: "borderBottom borderLeft" },
        { x: gap, y: gap, borders: "borderBottom borderRight" },
      ].map((c, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            width: arm,
            height: arm,
            borderColor: stroke,
            borderStyle: "solid",
            borderWidth: 0,
            borderTopWidth: c.borders.includes("borderTop") ? 1 : 0,
            borderBottomWidth: c.borders.includes("borderBottom") ? 1 : 0,
            borderLeftWidth: c.borders.includes("borderLeft") ? 1 : 0,
            borderRightWidth: c.borders.includes("borderRight") ? 1 : 0,
            transform: `translate(${c.x < 0 ? -100 : 0}%, ${c.y < 0 ? -100 : 0}%)`,
          }}
        />
      ))}
    </div>
  );
}
