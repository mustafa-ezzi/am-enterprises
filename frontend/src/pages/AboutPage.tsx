import { useEffect, useState } from "react";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { PageMeta } from "../components/PageMeta";
import { LoadingBlock } from "../components/StatusBlocks";
import { PillFilledButton, Tag } from "../components/ui";
import {
  AnimatedContent,
  BlurText,
  CountUp,
  FadeContent,
  HalftoneReveal,
  ScrollReveal,
  TrueFocus,
} from "../components/motion";
import { api } from "../lib/api";
import type { SiteSettings } from "../types/catalog";

const ABOUT_PHOTO =
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1600&q=80";

export function AboutPage() {
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .siteSettings()
      .then(setSite)
      .catch(() => setSite(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StorefrontLayout>
      <PageMeta
        title="About"
        description="Your trust, our commitment — the AM Enterprises story."
      />

      <SectionBand tone="champagne">
        <Tag>Brand</Tag>
        <hr className="rule-red" />
        <h1 className="text-heading" style={{ margin: "0 0 20px" }}>
          About AM Enterprises
        </h1>
        <BlurText
          text={site?.slogan ?? "Your trust, our commitment"}
          className="text-subheading"
          style={{ fontWeight: 400, maxWidth: 640, margin: "0 0 28px" }}
        />
        {loading ? <LoadingBlock /> : null}
        {!loading ? (
          <ScrollReveal
            text={
              site?.about_blurb ||
              "AM Enterprises supplies trusted household products for kitchens, cleaning, organization, bathroom, and laundry."
            }
            className="text-body"
            style={{ maxWidth: 640, marginBottom: 0 }}
          />
        ) : null}
      </SectionBand>

      <SectionBand tone="mint">
        <HalftoneReveal
          style={{
            marginBottom: 40,
            maxWidth: 720,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "var(--neo-convex)",
            border: "1px solid color-mix(in srgb, var(--color-jade) 40%, transparent)",
          }}
        >
          <img
            src={ABOUT_PHOTO}
            alt="Household interior"
            style={{
              width: "100%",
              height: 360,
              objectFit: "cover",
              background: "var(--neo-raised)",
            }}
          />
        </HalftoneReveal>

        <TrueFocus
          words={["Your", "trust,", "our", "commitment"]}
          className="text-heading-sm"
          style={{ margin: "0 0 28px" }}
        />
        <div
          style={{
            display: "grid",
            gap: 32,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            {
              title: "What we sell",
              copy: "Practical household essentials — from mixing bowls to laundry racks — chosen for everyday use.",
            },
            {
              title: "How we work",
              copy: "Clear catalogue, honest stock, and a checkout path built for simplicity.",
            },
            {
              title: "Who we serve",
              copy: "Homes and families who want reliable products without the noise.",
            },
          ].map((block, i) => (
            <AnimatedContent key={block.title} delay={i * 0.08}>
              <article
                className={
                  i === 0
                    ? "neo-card neo-card--mint"
                    : i === 1
                      ? "neo-card neo-card--sky"
                      : "neo-card neo-card--champagne"
                }
                style={{ padding: 22, height: "100%" }}
              >
                <h2 className="text-subheading" style={{ margin: "0 0 12px" }}>
                  {block.title}
                </h2>
                <p className="text-body-sm" style={{ margin: 0 }}>
                  {block.copy}
                </p>
              </article>
            </AnimatedContent>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="sky">
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            marginBottom: 40,
          }}
        >
          <div className="neo-card" style={{ padding: 22 }}>
            <p className="text-heading" style={{ margin: 0 }}>
              <CountUp to={5} />
            </p>
            <p className="text-caption" style={{ color: "var(--color-pewter)" }}>
              Categories
            </p>
          </div>
          <div className="neo-card neo-card--champagne" style={{ padding: 22 }}>
            <p className="text-heading" style={{ margin: 0 }}>
              <CountUp to={100} suffix="%" />
            </p>
            <p className="text-caption" style={{ color: "var(--color-pewter)" }}>
              Commitment
            </p>
          </div>
        </div>

        <FadeContent>
          <h2 className="text-heading-sm" style={{ margin: "0 0 16px" }}>
            Contact
          </h2>
          <ul
            className="text-body-sm"
            style={{ margin: "0 0 28px", paddingLeft: 18, lineHeight: 1.8 }}
          >
            <li>{site?.contact_email || "hello@amenterprises.local"}</li>
            <li>{site?.contact_phone || "+92 300 0000000"}</li>
            <li>{site?.contact_address || "Pakistan"}</li>
          </ul>
          <PillFilledButton to="/catalogue">Browse catalogue</PillFilledButton>
        </FadeContent>
      </SectionBand>
    </StorefrontLayout>
  );
}
