import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Plus,
  Search,
  Loader2,
  Building2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Users,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";

// --- TİPLER ---
interface Departman {
  departman_id: number;
  departman_name: string;
  departman_slug: string | null;
  created_date: string;
  // Supabase'den gelen ilişkili veri (count)
  personal?: [{ count: number }];
}

// Toast (Bildirim) Tipi
interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Departman[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Bildirim State'i
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    departman_name: "",
    departman_slug: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  // --- BİLDİRİM GÖSTERME ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- SLUG OLUŞTURUCU ---
  // Türkçe karakterleri ve boşlukları URL dostu hale getirir
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Boşlukları tire yap
      .replace(/[ğ]/g, "g")
      .replace(/[ü]/g, "u")
      .replace(/[ş]/g, "s")
      .replace(/[ı]/g, "i")
      .replace(/[ö]/g, "o")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9\-]+/g, "") // Alfanümerik ve tire dışındakileri sil
      .replace(/\-\-+/g, "-"); // Tekrarlayan tireleri tek tire yap
  };

  // 1. İsim değişince Slug'ı da güncelle
  const handleNameChange = (val: string) => {
    setFormData({
      ...formData,
      departman_name: val,
      departman_slug: generateSlug(val),
    });
  };

  // 2. Kullanıcı Slug'a elle müdahale ederse (Yine de formatı koru)
  const handleSlugChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      departman_slug: generateSlug(val),
    }));
  };

  async function fetchDepartments() {
    try {
      setLoading(true);
      // 'personal (count)' kısmı Supabase'de Foreign Key varsa çalışır.
      // İlişki adı farklıysa burayı güncellemek gerekebilir.
      const { data, error } = await supabase
        .from("departman")
        .select(
          `
          *,
          personal (count)
        `,
        )
        .order("departman_name", { ascending: true });

      if (error) throw error;
      setDepartments(data || []);
    } catch (err: any) {
      showToast("Veri çekilirken hata: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // --- DÜZENLEME MODALINI AÇ ---
  const handleEditClick = (d: Departman) => {
    setIsEditing(true);
    setSelectedId(d.departman_id);
    setFormData({
      departman_name: d.departman_name,
      departman_slug: d.departman_slug || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData({ departman_name: "", departman_slug: "" });
  };

  // --- KAYDET / GÜNCELLE ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Slug boşsa isimden üret, doluysa olduğu gibi kullan (zaten formatlı)
      const finalSlug =
        formData.departman_slug || generateSlug(formData.departman_name);

      if (isEditing && selectedId) {
        // GÜNCELLEME
        const { error } = await supabase
          .from("departman")
          .update({
            departman_name: formData.departman_name,
            departman_slug: finalSlug,
            update_date: new Date().toISOString(),
          })
          .eq("departman_id", selectedId);

        if (error) throw error;
        showToast("Departman güncellendi!", "success");
      } else {
        // YENİ KAYIT
        const { error } = await supabase.from("departman").insert([
          {
            departman_name: formData.departman_name,
            departman_slug: finalSlug,
          },
        ]);

        if (error) throw error;
        showToast("Yeni departman oluşturuldu!", "success");
      }

      closeModal();
      fetchDepartments();
    } catch (err: any) {
      if (err.message.includes("unique constraint") || err.code === "23505") {
        showToast("Bu departman ismi veya URL kodu zaten kullanımda!", "error");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  // --- SİLME İŞLEMİ ---
  async function handleDelete(id: number) {
    if (!confirm("Bu departmanı silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("departman")
        .delete()
        .eq("departman_id", id);

      if (error) throw error;

      showToast("Departman silindi.", "success");
      fetchDepartments();
    } catch (err: any) {
      if (err.message.includes("foreign key") || err.code === "23503") {
        showToast(
          "DİKKAT: Bu departmana bağlı personel var! Silmeden önce personelleri taşıyın.",
          "error",
        );
      } else {
        showToast("Silme hatası: " + err.message, "error");
      }
    }
  }

  const filtered = departments.filter((d) =>
    d.departman_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700 relative">
      {/* --- TOAST BİLDİRİMİ --- */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 ${toast.type === "success" ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-red-500 text-white shadow-red-200"}`}
        >
          <div className="bg-white/20 p-2 rounded-full">
            {toast.type === "success" ? (
              <Check size={20} className="stroke-[4]" />
            ) : (
              <AlertCircle size={20} className="stroke-[4]" />
            )}
          </div>
          <div>
            <h4 className="font-black text-sm tracking-wide uppercase">
              {toast.type === "success" ? "BAŞARILI" : "HATA"}
            </h4>
            <p className="text-xs font-medium opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ ...toast, show: false })}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              Toplam Departman
            </p>
            <h4 className="text-3xl font-black text-slate-800">
              {departments.length}
            </h4>
          </div>
        </div>
      </div>

      {/* ARAMA VE EKLEME PANELİ */}
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Departman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={18} /> YENİ DEPARTMAN
        </button>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">
              <tr>
                <th className="px-8 py-5">Departman Adı</th>
                <th className="px-8 py-5">Kod (Slug)</th>
                <th className="px-8 py-5 text-center">Personel Sayısı</th>
                <th className="px-8 py-5 text-center">Oluşturulma</th>
                <th className="px-8 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 px-8">
              {filtered.map((d) => (
                <tr
                  key={d.departman_id}
                  className="group hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 font-bold text-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black shadow-sm uppercase">
                        {d.departman_name.substring(0, 2)}
                      </div>
                      <span>{d.departman_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                      <LinkIcon size={12} className="opacity-50" />
                      {d.departman_slug || "-"}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                      <Users size={14} />
                      {d.personal && d.personal[0] ? d.personal[0].count : 0}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center text-xs text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar size={14} />
                      {new Date(d.created_date).toLocaleDateString("tr-TR")}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2 text-slate-300">
                    <button
                      onClick={() => handleEditClick(d)}
                      className="p-2.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.departman_id)}
                      className="p-2.5 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-10 text-center text-slate-400 text-sm font-medium"
                  >
                    Kayıtlı departman bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Building2 size={20} />
                </div>
                {isEditing ? "Departmanı Düzenle" : "Yeni Departman"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* DEPARTMAN ADI */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Departman Adı
                </label>
                <input
                  required
                  type="text"
                  placeholder="Örn: İnsan Kaynakları"
                  value={formData.departman_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* SLUG (URL KODU) - ARTIK DÜZENLENEBİLİR */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    URL Kodu (Slug)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Otomatik veya Manuel
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs select-none">
                    /
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="insan-kaynaklari"
                    value={formData.departman_slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-200 focus:border-indigo-300 rounded-2xl text-sm font-mono font-medium text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1 flex gap-1">
                  <AlertCircle size={12} />
                  Sistem içinde kullanılacak benzersiz kod. Türkçe karakter
                  içermez.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-indigo-600 shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> KAYDET
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
