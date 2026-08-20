import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type Slide = { src: string; alt?: string };

type Props = {
  slides: Slide[];
  className?: string;
  style?: CSSProperties;
  aspectRatio?: string;
};

/** Minimal rectangular carousel for PDP and lookbook. */
export function Carousel({
  slides,
  className,
  style,
  aspectRatio = "1 / 1",
}: Props) {
  const [index, setIndex] = useState(0);
  const safe = slides.length ? slides : [{ src: "", alt: "No image" }];

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  const current = safe[Math.min(index, safe.length - 1)];

  return (
    <div className={className} style={style}>
      <div
        style={{
          aspectRatio,
          background: "var(--color-newsprint-gray)",
          overflow: "hidden",
        }}
      >
        {current.src ? (
          <img
            src={current.src}
            alt={current.alt || ""}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--color-pewter)",
            }}
          >
            No image
          </div>
        )}
      </div>
      {safe.length > 1 ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="pill-ghost-btn"
            onClick={() => setIndex((i) => (i - 1 + safe.length) % safe.length)}
            style={{
              border: "1px solid #000",
              borderRadius: 500,
              background: "#fff",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % safe.length)}
            style={{
              border: "1px solid #000",
              borderRadius: 500,
              background: "#fff",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {safe.map((s, i) => (
              <button
                key={`${s.src}-${i}`}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                style={{
                  width: 56,
                  height: 56,
                  padding: 0,
                  border: i === index ? "1px solid #000" : "1px solid #bfbfbf",
                  background: "transparent",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {s.src ? (
                  <img
                    src={s.src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
