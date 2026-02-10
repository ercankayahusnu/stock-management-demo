import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Supabase üzerinden kimlik doğrulama
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      alert("Hata: " + authError.message);
      setLoading(false);
      return;
    }

    // 2. Kimlik doğruysa 'personal' tablosundan rol ve departman bilgisini çek
    const { data: profileData, error: profileError } = await supabase
      .from("personal")
      .select(`*, departman(departman_slug)`)
      .eq("auth_user_id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Profil çekilemedi:", profileError.message);
      alert("Profil bilgileriniz alınamadı.");
      setLoading(false);
      return;
    }

    // 3. Rol ve Departman slug değerine göre yönlendirme
    const slug = profileData.departman?.departman_slug;
    const role = profileData.role;
    console.log("Giriş Yapan Rol:", role, "Departman:", slug);

    // Yönlendirme
    if (role === "superadmin") {
      console.log("Super Admin yönlendiriliyor...");
      navigate("/super-admin");
    } else if (role === "admin") {
      console.log("Admin yönlendiriliyor...");
      navigate("/admin-panel");
    } else if (slug === "uretim") {
      navigate("/production");
    } else if (slug === "satis") {
      navigate("/sales");
      alert(
        "Yetkili bir departman veya rol bulunamadı. Dashboard'a yönlendiriliyorsunuz.",
      );
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "100px",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Marmoxium Stock System</h2>
      <form
        onSubmit={handleLogin}
        style={{
          display: "inline-block",
          textAlign: "left",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block" }}>Email:</label>
          <input
            name="email"
            type="email"
            required
            style={{ width: "200px", padding: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block" }}>Şifre:</label>
          <input
            name="password"
            type="password"
            required
            style={{ width: "200px", padding: "5px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Bağlanıyor..." : "GİRİŞ YAP"}
        </button>
      </form>
    </div>
  );
}
