import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { StaggeredMenu } from "../motion/StaggeredMenu";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "About" },
];

const menuLinks = [
  ...navLinks,
  { to: "/cart", label: "Cart" },
];

type NavBarProps = {
  cartCount?: number;
};

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Liquid-crystal header — logo, links, bag + menu icons. */
export function NavBar({ cartCount = 0 }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <svg className="liquid-crystal-defs" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="liquid-crystal" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.03"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="18s"
                values="0.012 0.03;0.018 0.022;0.012 0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="page-shell">
        <div className="liquid-crystal-bar">
          <div className="liquid-crystal-bar__glow" aria-hidden="true" />
          <div className="liquid-crystal-bar__inner">
            <Link to="/" className="site-header__brand" aria-label="AM Enterprises home">
              <img src="/logo.jpg" alt="AM Enterprises" className="site-header__logo" />
            </Link>

            <nav className="site-header__nav" aria-label="Primary">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `site-header__link${isActive ? " is-active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="site-header__actions">
              <Link
                to="/cart"
                className="site-header__icon-btn"
                aria-label={
                  cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
                }
              >
                <BagIcon />
                {cartCount > 0 ? (
                  <span className="site-header__count">{cartCount}</span>
                ) : null}
              </Link>

              <button
                type="button"
                className="site-header__icon-btn site-header__menu-btn"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StaggeredMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={menuLinks}
        cartCount={cartCount}
      />
    </header>
  );
}
