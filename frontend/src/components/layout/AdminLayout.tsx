import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PillGhostButton } from "../ui/PillButton";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/settings", label: "Settings" },
];

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
}: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className={`admin-aside ${navOpen ? "admin-aside--open" : ""}`}>
        <div className="admin-aside__top">
          <div>
            <p className="text-caption" style={{ margin: "0 0 4px" }}>
              AM Enterprises
            </p>
            <p style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>Admin</p>
            {user ? (
              <p
                className="text-caption"
                style={{ margin: "8px 0 0", color: "var(--color-pewter)" }}
              >
                {user.username}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="admin-nav-toggle"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? "Close" : "Menu"}
          </button>
        </div>

        <nav
          aria-label="Admin"
          className={`admin-nav ${navOpen ? "admin-nav--open" : ""}`}
        >
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `admin-nav__link${isActive ? " is-active" : ""}`
              }
              onClick={() => setNavOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="admin-nav__actions">
            <PillGhostButton to="/">← Storefront</PillGhostButton>
            <PillGhostButton
              onClick={() => {
                void logout();
              }}
            >
              Log out
            </PillGhostButton>
          </div>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-main__header">
          <div className="admin-main__header-inner">
            <div>
              <h1 className="text-heading-sm" style={{ margin: "0 0 8px" }}>
                {title}
              </h1>
              {subtitle ? (
                <p
                  className="text-body-sm"
                  style={{ margin: 0, color: "var(--color-pewter)" }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
        </header>
        <div className="admin-main__body">{children}</div>
      </div>
    </div>
  );
}
