import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CataloguePage } from "./pages/CataloguePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage, ConfirmationPage } from "./pages/CheckoutPage";
import { UiSandboxPage } from "./pages/UiSandboxPage";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RequireAdmin>{children}</RequireAdmin>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogue" element={<CataloguePage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/confirmation" element={<ConfirmationPage />} />
      <Route path="/ui" element={<UiSandboxPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminDashboardPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminGuard>
            <AdminProductsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminGuard>
            <AdminProductFormPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/products/:slug"
        element={
          <AdminGuard>
            <AdminProductFormPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminGuard>
            <AdminCategoriesPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminGuard>
            <AdminOrdersPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/orders/:orderNumber"
        element={
          <AdminGuard>
            <AdminOrderDetailPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <AdminGuard>
            <AdminCustomersPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminGuard>
            <AdminSettingsPage />
          </AdminGuard>
        }
      />
    </Routes>
  );
}
