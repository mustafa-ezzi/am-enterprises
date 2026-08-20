import type { ReactNode } from "react";
import { useCart } from "../../context/CartContext";
import { Noise } from "../motion/Noise";
import { PageFade } from "../motion/PageFade";
import { Footer } from "./Footer";
import { NavBar } from "./NavBar";

type StorefrontLayoutProps = {
  children: ReactNode;
};

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const { itemCount } = useCart();

  return (
    <div
      className="storefront-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        position: "relative",
      }}
    >
      <Noise opacity={0.012} />
      <NavBar cartCount={itemCount} />
      <main id="main-content" style={{ flex: 1 }} tabIndex={-1}>
        <PageFade>{children}</PageFade>
      </main>
      <Footer />
    </div>
  );
}
