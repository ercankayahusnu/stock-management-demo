import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProductionPage from "../pages/ProductionPage";
import SalesPage from "../pages/SalesPage";
import AdminPanel from "../pages/AdminPanel";
import SuperAdminPanel from "../pages/SuperAdminPanel";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />, // Yetkisiz erişim için özel sayfa
  },
  {
    path: "/production",
    element: (
      <ProtectedRoute requiredSlug="uretim">
        <ProductionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales",
    element: (
      <ProtectedRoute requiredSlug="satis">
        <SalesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-panel",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/super-admin",
    element: (
      <ProtectedRoute requiredRole="superadmin">
        <SuperAdminPanel />
      </ProtectedRoute>
    ),
  },
]);
