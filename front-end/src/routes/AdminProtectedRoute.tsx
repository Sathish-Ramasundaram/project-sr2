import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

function AdminProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;

