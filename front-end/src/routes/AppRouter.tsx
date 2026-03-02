import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminProtectedRoute from "./AdminProtectedRoute";
import ProtectedRoute from "./ProtectedRoute";

const HomePage = lazy(() => import('@/pages/HomePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const CataloguePage = lazy(() => import("../pages/CataloguePage"));
const CustomerLoginPage = lazy(() => import("../pages/CustomerLoginPage"));
const CustomerForgotPasswordPage = lazy(() => import("../pages/CustomerForgotPasswordPage"));
const CustomerRegisterPage = lazy(() => import("../pages/CustomerRegisterPage"));
const CustomerHomePage = lazy(() => import("../pages/CustomerHomePage"));
const CustomerProductDetailsPage = lazy(() => import("../pages/CustomerProductDetailsPage"));
const AdminLoginPage = lazy(() => import("../pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            ⏳ Loading page...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />


          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route
            path="/customer/forgot-password"
            element={<CustomerForgotPasswordPage />}
          />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/customer/home" element={<CustomerHomePage />} />
            <Route
              path="/customer/product/:productId"
              element={<CustomerProductDetailsPage />}
            />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
