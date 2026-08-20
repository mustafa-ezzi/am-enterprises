import type { CSSProperties, ReactNode } from "react";

type Item = {
  id: string | number;
  content: ReactNode;
  span?: 1 | 2;
};

type Props = {
  items: Item[];
  className?: string;
  style?: CSSProperties;
};

/** Asymmetric masonry lookbook band. */
export function Masonry({ items, className, style }: Props) {
  return (
    <div
      className={["masonry-band", className].filter(Boolean).join(" ")}
      style={{
        columns: 1,
        columnGap: 20,
        ...style,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            breakInside: "avoid",
            marginBottom: 20,
            display: "block",
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

type Logo = { src: string; alt: string };

export function LogoLoop({ logos }: { logos: Logo[] }) {
  if (!logos.length) return null;
  const track = [...logos, ...logos];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
      <div
        className="logo-loop-track"
        style={{
          display: "flex",
          gap: 48,
          paddingBlock: 24,
          width: "max-content",
          animation: "logo-marquee 28s linear infinite",
        }}
      >
        {track.map((logo, i) => (
          <img
            key={`${logo.alt}-${i}`}
            src={logo.src}
            alt={logo.alt}
            style={{ height: 36, width: "auto", filter: "grayscale(1)", opacity: 0.7 }}
          />
        ))}
      </div>
      <style>{`
        @keyframes logo-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-loop-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
