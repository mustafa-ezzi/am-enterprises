import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StorefrontLayout } from "../components/layout/StorefrontLayout";
import { SectionBand } from "../components/layout/SectionBand";
import { ProductCard } from "../components/ProductCard";
import { PageMeta } from "../components/PageMeta";
import {
  ErrorBlock,
  ProductCardSkeleton,
} from "../components/StatusBlocks";
import { PillFilledButton, PillGhostButton, Tag } from "../components/ui";
import {
  AnimatedContent,
  BlurText,
  ChromaGrid,
  DepthCarousel,
  FadeContent,
  FoldText,
  GradualBlur,
  HalftoneReveal,
  HorizontalMarquee,
  Magnet,
  ScrollReveal,
} from "../components/motion";
import { api, listBrands } from "../lib/api";
import { productImage } from "../lib/productPhotos";
import type { Brand, ProductListItem, SiteSettings } from "../types/catalog";

const ROOM_LINKS = [
  { label: "Kitchen", to: "/catalogue?category=kitchen-essentials", index: "01" },
  { label: "Cleaning", to: "/catalogue?category=cleaning-supplies", index: "02" },
  { label: "Organization", to: "/catalogue?category=home-organization", index: "03" },
  { label: "Bathroom", to: "/catalogue?category=bathroom", index: "04" },
  { label: "Laundry", to: "/catalogue?category=laundry", index: "05" },
];

export function HomePage() {
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [featured, setFeatured] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookIndex, setLookIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.siteSettings(),
      api.products({ is_featured: true, ordering: "-created_at" }),
      listBrands(),
    ])
      .then(([settings, products, brandList]) => {
        setSite(settings);
        setFeatured(products.results ?? []);
        setBrands(brandList);
      })
      .catch((err: Error) =>
        setError(err.message || "Could not load storefront data"),
      )
      .finally(() => setLoading(false));
  }, []);

  const slogan = site?.slogan ?? "Your trust, our commitment";
  const heroPhoto = featured[0]
    ? productImage(featured[0])
    : "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80";

  return (
    <StorefrontLayout>
      <PageMeta
        title="AM Enterprises"
        description="Your trust, our commitment — Daisy & Kitchenware household products."
      />

      {/* Editorial UI hero: oversized type + asymmetric photo stage */}
      <section className="luxury-hero page-shell">
        <div>
          <div className="luxury-hero__kicker">
            <Tag>AM Enterprises</Tag>
            <hr className="luxury-hero__rule" />
          </div>
          <h1 className="luxury-hero__title">
            AM <em>Enterprises</em>
          </h1>
          <BlurText text={slogan} className="text-subheading" delay={0.2} />
          <FadeContent delay={0.35} y={12}>
            <p className="text-body luxury-hero__lede">
              Daisy and Kitchenware — household products for kitchens, laundry,
              and everyday rooms.
            </p>
            <div className="luxury-hero__actions">
              <Magnet padding={16}>
                <PillFilledButton to="/catalogue" size="standard">
                  Shop catalogue
                </PillFilledButton>
              </Magnet>
              <PillGhostButton to="/about" size="standard">
                About
              </PillGhostButton>
            </div>
          </FadeContent>
        </div>

        <div className="luxury-hero__stage">
          <HalftoneReveal className="luxury-hero__photo">
            <GradualBlur mode="load" delay={0.15}>
              <img src={heroPhoto} alt="" />
            </GradualBlur>
          </HalftoneReveal>
          <div className="luxury-hero__badge">
            <strong>Daisy · Kitchenware</strong>
            <span
              className="text-caption"
              style={{ color: "var(--color-pewter)" }}
            >
              Sub-brands of AM Enterprises
            </span>
          </div>
        </div>
      </section>

      <HorizontalMarquee
        words={[
          "AM Enterprises",
          "Daisy",
          "Kitchenware",
          "Household",
          "Catalogue",
        ]}
      />

      {/* Brand split — layout, not magazine copy */}
      {!loading && brands.length > 0 ? (
        <SectionBand tone="sky">
          <div className="layout-spread">
            <div>
              <Tag>Brands</Tag>
              <h2 className="layout-spread__display" style={{ margin: "16px 0 0" }}>
                Shop by brand
              </h2>
            </div>
            <p className="text-body" style={{ margin: 0, maxWidth: 360 }}>
              Filter the catalogue by Daisy or Kitchenware.
            </p>
          </div>
          <div className="brand-grid" style={{ marginTop: 32 }}>
            {brands.map((b, i) => (
              <AnimatedContent key={b.id} delay={i * 0.08} direction="up">
                <Link
                  to={`/catalogue?brand=${b.slug}`}
                  className={
                    i % 2 === 0
                      ? "neo-card neo-card--mint brand-card brand-card--link"
                      : "neo-card neo-card--champagne brand-card brand-card--link"
                  }
                >
                  <span
                    className="text-caption"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="layout-spread__display brand-card__name">
                    {b.name}
                  </h3>
                  {b.tagline ? (
                    <p className="text-body-sm" style={{ margin: "0 0 16px" }}>
                      {b.tagline}
                    </p>
                  ) : null}
                  <span className="brand-card__cta text-caption">
                    View products →
                  </span>
                </Link>
              </AnimatedContent>
            ))}
          </div>
        </SectionBand>
      ) : null}

      {/* Editorial UI index: big type + numbered room list */}
      <SectionBand tone="champagne">
        <div className="layout-spread layout-spread--rooms">
          <div>
            <Tag>Browse</Tag>
            <h2 className="layout-spread__display" style={{ margin: "16px 0 12px" }}>
              Shop by room
            </h2>
            <PillGhostButton to="/catalogue">Full catalogue</PillGhostButton>
          </div>
          <nav className="room-index" aria-label="Shop by room">
            {ROOM_LINKS.map((room) => (
              <Link key={room.to} to={room.to} className="room-index__row">
                <span className="room-index__num">{room.index}</span>
                <span className="room-index__label">{room.label}</span>
                <span className="room-index__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </SectionBand>

      {!loading && featured.length > 0 ? (
        <section className="h-scroll-section">
          <div className="page-shell section-head" style={{ marginBottom: 24 }}>
            <div>
              <Tag>Featured</Tag>
              <h2 className="layout-spread__display" style={{ margin: "12px 0 0", fontSize: "clamp(32px, 5vw, 48px)" }}>
                New picks
              </h2>
            </div>
          </div>
          <div className="h-scroll-rail">
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="h-scroll-card"
              >
                <img src={productImage(product)} alt={product.name} />
                <span className="h-scroll-card__label">
                  {product.brand_name ? `${product.brand_name} · ` : ""}
                  {product.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <SectionBand tone="sky">
        <div className="section-head">
          <div>
            <Tag>Catalogue</Tag>
            <FoldText
              text="Featured products"
              className="text-heading-sm"
              style={{ margin: "12px 0 0" }}
            />
          </div>
          <PillGhostButton to="/catalogue">See all</PillGhostButton>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
        {error ? <ErrorBlock message={error} /> : null}

        {!loading && !error ? (
          <div className="product-grid">
            {featured.slice(0, 6).map((product, i) => (
              <AnimatedContent key={product.id} delay={i * 0.05} direction="up">
                <ProductCard
                  product={product}
                  currency={site?.currency ?? "PKR"}
                />
              </AnimatedContent>
            ))}
          </div>
        ) : null}
      </SectionBand>

      {!loading && featured.length > 0 ? (
        <SectionBand tone="mint">
          <div className="layout-spread" style={{ marginBottom: 28 }}>
            <h2 className="layout-spread__display" style={{ margin: 0 }}>
              Colour study
            </h2>
            <p className="text-body-sm" style={{ margin: 0, maxWidth: 280 }}>
              Hover a tile to restore colour.
            </p>
          </div>
          <ChromaGrid
            items={featured.slice(0, 4).map((p) => ({
              id: p.id,
              title: p.name,
              image: productImage(p),
              href: `/products/${p.slug}`,
              meta: (
                <Tag style={{ marginTop: 8 }}>
                  {p.brand_name ? `${p.brand_name} · ` : ""}
                  {p.category_name}
                </Tag>
              ),
            }))}
          />
        </SectionBand>
      ) : null}

      {!loading && featured.length > 2 ? (
        <SectionBand tone="rose">
          <div className="layout-spread" style={{ marginBottom: 24 }}>
            <div>
              <Tag>Lookbook</Tag>
              <h2
                className="layout-spread__display"
                style={{ margin: "12px 0 0", fontSize: "clamp(32px, 5vw, 48px)" }}
              >
                Product carousel
              </h2>
            </div>
            {featured[lookIndex] ? (
              <p className="text-subheading" style={{ margin: 0, fontWeight: 500 }}>
                {featured[lookIndex].brand_name
                  ? `${featured[lookIndex].brand_name} · `
                  : ""}
                {featured[lookIndex].name}
              </p>
            ) : null}
          </div>

          <div className="lookbook-frame">
            <DepthCarousel
              items={featured.map((p) => ({
                image: productImage(p),
                alt: p.name,
              }))}
              cardWidth={280}
              cardHeight={360}
              radius={28}
              tint="#162033"
              depth={200}
              spread={80}
              tilt={18}
              tiltDirection="right"
              perspective={1400}
              visibleCards={4}
              falloff={0.18}
              blur={5}
              autoplay
              loop
              onChange={(index) => setLookIndex(index)}
            />
          </div>
        </SectionBand>
      ) : null}

      <SectionBand tone="ink">
        <div className="layout-spread">
          <ScrollReveal
            text={slogan}
            as="h2"
            className="layout-spread__display"
            style={{ margin: 0, color: "var(--color-champagne)" }}
          />
          <FadeContent>
            <Magnet padding={16}>
              <PillFilledButton to="/catalogue" size="standard">
                Shop now
              </PillFilledButton>
            </Magnet>
          </FadeContent>
        </div>
      </SectionBand>
    </StorefrontLayout>
  );
}
