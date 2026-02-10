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

    const { data: profileData, error: profileError } = await supabase
      .from("personal")
      .select(`*, departman(departman_slug)`)
      .eq("auth_user_id", authData.user.id)
      .single();

    if (profileError) {
      alert("Profil bilgileri alınamadı.");
      setLoading(false);
      return;
    }

    const slug = profileData.departman?.departman_slug;
    const role = profileData.role;

    if (role === "superadmin") navigate("/super-admin");
    else if (role === "admin") navigate("/admin-panel");
    else if (slug === "uretim") navigate("/production");
    else if (slug === "satis") navigate("/sales");
    else navigate("/dashboard");

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "sans-serif" }}
    >
      {/* Logolar Bölümü */}
      <div className="flex flex-col items-center mb-10 w-full max-w-sm text-center">
        {/* Ana Şirket: Marmosium (Büyük ve Net) */}
        <img
          src="/Marmosium-logo.png"
          alt="Marmosium"
          style={{
            height: "85px",
            width: "auto",
            display: "block",
            marginBottom: "16px",
          }}
        />

        {/* Bağlı Marka: Deconore (Daha Küçük ama TAM NET) */}
        <div className="flex items-center gap-3">
          <div
            style={{
              height: "1.5px",
              width: "40px",
              backgroundColor: "#f05a28",
            }}
          ></div>{" "}
          {/* Deconore turuncusunda çizgi */}
          <img
            src="/Deconore-logo.png"
            alt="Deconore"
            style={{ height: "35px", width: "auto", display: "block" }} // Opacity (solukluk) kaldırıldı
          />
          <div
            style={{
              height: "1.5px",
              width: "40px",
              backgroundColor: "#f05a28",
            }}
          ></div>
        </div>
      </div>

      {/* Login Kartı */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8 uppercase tracking-wide">
          Marmosium & Deconore <br></br>Stok Yönetim Sistemi
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              E-Posta
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="kurumsal@marmosium.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Şifre
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#f05a28" }}
            className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:bg-slate-300 mt-4"
          >
            {loading ? "GİRİŞ YAPILIYOR..." : "SİSTEME GİRİŞ YAP"}
          </button>
        </form>
      </div>

      <p className="mt-10 text-slate-400 text-[10px] tracking-[0.3em] uppercase font-semibold">
        © 2026 Marmosium Group
      </p>
    </div>
  );
}
