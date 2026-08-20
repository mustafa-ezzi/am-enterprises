import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import gsap from "gsap";
import { prefersReducedMotion } from "../../lib/motion";
import { CartBadge } from "./CartBadge";

export type MenuLink = {
  to: string;
  label: string;
  end?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  links: MenuLink[];
  cartCount?: number;
  footerLink?: MenuLink;
};

/** Fullscreen staggered nav — stacked editorial type like Eindhoven. */
export function StaggeredMenu({
  open,
  onClose,
  links,
  cartCount = 0,
  footerLink,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll(".stagger-row");
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      items,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
      },
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      id="site-menu"
      className="staggered-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="staggered-menu__chrome page-shell">
        <span className="staggered-menu__label">Menu</span>
        <button type="button" className="staggered-menu__close" onClick={onClose}>
          Close ×
        </button>
      </div>

      <div className="staggered-menu__body page-shell" ref={panelRef}>
        <p className="staggered-menu__watermark" aria-hidden="true">
          AM
        </p>
        <nav className="staggered-menu__stack" aria-label="Primary">
          {links.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="stagger-row staggered-menu__link"
              onClick={onClose}
            >
              <span className="staggered-menu__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="staggered-menu__title">{link.label}</span>
              {link.to === "/cart" ? <CartBadge count={cartCount} /> : null}
            </NavLink>
          ))}
        </nav>

        {footerLink ? (
          <NavLink
            to={footerLink.to}
            className="stagger-row staggered-menu__admin"
            onClick={onClose}
          >
            {footerLink.label}
          </NavLink>
        ) : null}
      </div>
    </div>
  );
}
