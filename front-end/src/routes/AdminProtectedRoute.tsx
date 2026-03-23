import { Navigate, Outlet } from "react-router-dom";
import { getAdminSession } from "@/store/admin/adminStorage";

function AdminProtectedRoute() {
  const isAuthenticated = getAdminSession();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
