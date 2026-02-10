import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProductionPage from "../pages/ProductionPage";
import SalesPage from "../pages/SalesPage";
import AdminPanel from "../pages/AdminPanel"; // Yeni eklenen
import SuperAdminPanel from "../pages/SuperAdminPanel"; // Yeni eklenen

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
    path: "/production",
    element: <ProductionPage />,
  },
  {
    path: "/sales",
    element: <SalesPage />,
  },
  {
    path: "/admin-panel",
    element: <AdminPanel />,
  },
  {
    path: "/super-admin",
    element: <SuperAdminPanel />,
  },
]);
