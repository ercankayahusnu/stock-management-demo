import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

interface Props {
  children: ReactNode;
  requiredSlug?: string;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredSlug,
  requiredRole,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("personal")
        .select(`role, departman(departman_slug)`)
        .eq("auth_user_id", session.user.id)
        .single();

      setUserProfile(data);
      setLoading(false);
    };
    getProfile();
  }, []);

  // 1. ADIM ÇÖZÜMÜ: Yazıyı kaldırdık, boş dönüyoruz.
  // Böylece "Yetkiler..." yazısı görünüp kaybolarak sayfa titremesi yapmaz.
  if (loading) return null;

  if (!userProfile) return <Navigate to="/login" replace />;

  const userSlug = userProfile.departman?.departman_slug;
  const userRole = userProfile.role;

  // 1. Superadmin her zaman geçer
  if (userRole === "superadmin") return <>{children}</>;

  // 2. Rol uyuşmazlığı varsa engelle
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Slug (Departman) uyuşmazlığı varsa engelle
  if (requiredSlug && userSlug !== requiredSlug) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
