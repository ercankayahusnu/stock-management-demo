import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardHome from "../pages/DashboardHome";

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
    element: <Unauthorized />,
  },
  {
    /* YENİ MİMARİ: Artık her departman için ayrı route tanımlamıyoruz. 
       Kullanıcı giriş yapınca bu tek adrese gelir, sistem onu tanır 
       ve DashboardHome içindeki 'DashboardManager' ile doğru sayfayı basar.
    */
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardHome />
      </ProtectedRoute>
    ),
  },
  /* Eski route'ları istersen bir süre tutabilirsin ama 
     kullanıcının login olduktan sonra navigate("/dashboard") 
     adresine yönlendirildiğinden emin ol.
  */
  {
    path: "/super-admin",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/production",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/sales",
    element: <Navigate to="/dashboard" replace />,
  },
]);
