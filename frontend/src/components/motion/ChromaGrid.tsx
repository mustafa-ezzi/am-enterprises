import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { prefersReducedMotion } from "../../lib/motion";

type Item = {
  id: string | number;
  image?: string | null;
  title: string;
  meta?: ReactNode;
  href?: string;
};

type Props = {
  items: Item[];
  className?: string;
  style?: CSSProperties;
};

/** Grayscale tiles → color on hover. */
export function ChromaGrid({ items, className, style }: Props) {
  const reduce = prefersReducedMotion();
  return (
    <div
      className={["chroma-grid", className].filter(Boolean).join(" ")}
      style={{
        display: "grid",
        gap: 20,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        ...style,
      }}
    >
      {items.map((item) => {
        const inner = (
          <>
            <div
              style={{
                aspectRatio: "4 / 3",
                background: "var(--color-newsprint-gray)",
                overflow: "hidden",
              }}
            >
              {item.image ? (
                <img
                  className="chroma-img"
                  src={item.image}
                  alt=""
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: reduce ? "none" : "grayscale(1)",
                    transition: reduce ? undefined : "filter 0.35s ease",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--color-paper-white)",
                  }}
                />
              )}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 19, fontWeight: 600 }}>
              {item.title}
            </p>
            {item.meta}
          </>
        );
        return item.href ? (
          <Link
            key={item.id}
            to={item.href}
            className="chroma-tile"
            style={{ display: "block", color: "inherit" }}
          >
            {inner}
          </Link>
        ) : (
          <div key={item.id} className="chroma-tile">
            {inner}
          </div>
        );
      })}
      <style>{`
        .chroma-tile:hover .chroma-img { filter: grayscale(0) !important; }
      `}</style>
    </div>
  );
}
