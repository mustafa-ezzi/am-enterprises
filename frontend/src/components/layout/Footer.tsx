import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <p className="text-caption" style={{ margin: "0 0 10px", color: "var(--color-gold)" }}>
              AM Enterprises
            </p>
            <p className="text-heading-sm" style={{ margin: 0, maxWidth: 380 }}>
              Your trust, our commitment
            </p>
          </div>
          <div className="site-footer__links">
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/about">About</Link>
            <Link to="/cart">Cart</Link>
          </div>
        </div>
        <p className="text-caption" style={{ margin: 0, color: "var(--color-pewter)" }}>
          © {new Date().getFullYear()} AM Enterprises · Soft living, lasting goods
        </p>
      </div>
    </footer>
  );
}
