import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import DashboardManager from "../components/dashboard/DashboardManager";

export default function DashboardHome() {
  const [userProfile, setUserProfile] = useState<{
    role: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data } = await supabase
          .from("personal")
          .select(`role, departman ( departman_slug )`)
          .eq("auth_user_id", session.user.id)
          .single();

        if (data) {
          const dept = data.departman as any;
          const slugValue = Array.isArray(dept)
            ? dept[0]?.departman_slug
            : dept?.departman_slug;

          setUserProfile({
            role: data.role || "",
            slug: slugValue || "",
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Yazı yerine boş ama şık bir iskelet (Skeleton) gösteriyoruz
  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 animate-pulse">
        <div className="w-64 bg-slate-900 h-full fixed" />{" "}
        {/* Sidebar İskeleti */}
        <div className="flex-1 ml-64 p-10">
          <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8" />{" "}
          {/* Başlık İskeleti */}
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-3xl border border-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardManager
      role={userProfile?.role || ""}
      slug={userProfile?.slug || ""}
    />
  );
}
