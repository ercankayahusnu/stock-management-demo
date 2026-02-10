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

  if (loading)
    return <div style={{ padding: "20px" }}>Yetkiler kontrol ediliyor...</div>;

  if (!userProfile) return <Navigate to="/login" replace />;

  const userSlug = userProfile.departman?.departman_slug;
  const userRole = userProfile.role;

  console.log("--- GÜVENLİK KONTROLÜ ---");
  console.log(
    "Sayfa Ne İstiyor? -> Slug:",
    requiredSlug,
    "| Role:",
    requiredRole,
  );
  console.log("Kullanıcıda Ne Var? -> Slug:", userSlug, "| Role:", userRole);

  // 1. Superadmin her zaman geçer
  if (userRole === "superadmin") return <>{children}</>;

  // 2. Rol uyuşmazlığı varsa engelle
  if (requiredRole && userRole !== requiredRole) {
    console.warn("ERİŞİM REDDİ: Rol yetersiz!");
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Slug (Departman) uyuşmazlığı varsa engelle
  if (requiredSlug && userSlug !== requiredSlug) {
    console.warn("ERİŞİM REDDİ: Yanlış departman!");
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
