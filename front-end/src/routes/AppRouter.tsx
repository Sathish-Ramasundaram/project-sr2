import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import AdminProtectedRoute from '@/routes/AdminProtectedRoute';
import ProtectedRoute from '@/routes/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const CataloguePage = lazy(() => import('@/pages/public/CataloguePage'));
const FaqPage = lazy(() => import('@/pages/public/FaqPage'));
const CustomerLoginPage = lazy(
  () => import('@/pages/customer/auth/CustomerLoginPage')
);
const CustomerForgotPasswordPage = lazy(
  () => import('@/pages/customer/auth/CustomerForgotPasswordPage')
);
const CustomerRegisterPage = lazy(
  () => import('@/pages/customer/auth/CustomerRegisterPage')
);
const CustomerHomePage = lazy(
  () => import('@/pages/customer/home/CustomerHomePage')
);
const CustomerCartPage = lazy(
  () => import('@/pages/customer/cart/CustomerCartPage')
);
const CustomerOrderHistoryPage = lazy(
  () => import('@/pages/customer/orders/CustomerOrderHistoryPage')
);
const CustomerNotificationsPage = lazy(
  () => import('@/pages/customer/notifications/CustomerNotificationsPage')
);
const CustomerOrderTrackPage = lazy(
  () => import('@/pages/customer/orders/CustomerOrderTrackPage')
);
const CustomerProductDetailsPage = lazy(
  () => import('@/pages/customer/products/CustomerProductDetailsPage')
);
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminSalesGraphPage = lazy(
  () => import('@/pages/admin/AdminSalesGraphPage')
);
const AdminStockAlertsPage = lazy(
  () => import('@/pages/admin/AdminStockAlertsPage')
);
const AdminProductManagementPage = lazy(
  () => import('@/pages/admin/AdminProductManagementPage')
);
const AdminCustomerDetailsPage = lazy(
  () => import('@/pages/admin/AdminCustomerDetailsPage')
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen text-2xl font-semibold">
            Loading page...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route
            path="/customer/forgot-password"
            element={<CustomerForgotPasswordPage />}
          />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/customer/home" element={<CustomerHomePage />} />
            <Route path="/customer/cart" element={<CustomerCartPage />} />
            <Route
              path="/customer/orders"
              element={<CustomerOrderHistoryPage />}
            />
            <Route
              path="/customer/notifications"
              element={<CustomerNotificationsPage />}
            />
            <Route
              path="/customer/orders/:orderId/track"
              element={<CustomerOrderTrackPage />}
            />
            <Route
              path="/customer/product/:productId"
              element={<CustomerProductDetailsPage />}
            />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/sales-graph" element={<AdminSalesGraphPage />} />
            <Route
              path="/admin/stock-alerts"
              element={<AdminStockAlertsPage />}
            />
            <Route
              path="/admin/product-management"
              element={<AdminProductManagementPage />}
            />
            <Route
              path="/admin/inventory"
              element={<AdminProductManagementPage />}
            />
            <Route
              path="/admin/customer-details"
              element={<AdminCustomerDetailsPage />}
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
