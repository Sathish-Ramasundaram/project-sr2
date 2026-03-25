import { Navigate, Outlet } from "react-router-dom";
import { getAdminSession, getAdminToken } from "@/store/admin/adminStorage";

function AdminProtectedRoute() {
  const isAuthenticated = getAdminSession() && Boolean(getAdminToken());

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
