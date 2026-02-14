import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Plus,
  Search,
  Loader2,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Calendar,
} from "lucide-react";

// --- TİPLER ---
interface StockLocation {
  location_id: number;
  location_name: string;
  is_active: boolean;
  created_at: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function StockLocationManagement() {
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    location_name: "",
    is_active: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  async function fetchLocations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_locations")
        .select("*")
        .order("location_name", { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      showToast("Veri çekme hatası: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (loc: StockLocation) => {
    setIsEditing(true);
    setSelectedId(loc.location_id);
    setFormData({
      location_name: loc.location_name,
      is_active: loc.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData({ location_name: "", is_active: true });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from("stock_locations")
          .update({
            location_name: formData.location_name,
            is_active: formData.is_active,
          })
          .eq("location_id", selectedId);

        if (error) throw error;
        showToast("Lokasyon güncellendi!", "success");
      } else {
        const { error } = await supabase
          .from("stock_locations")
          .insert([
            {
              location_name: formData.location_name,
              is_active: formData.is_active,
            },
          ]);

        if (error) throw error;
        showToast("Yeni lokasyon eklendi!", "success");
      }
      closeModal();
      fetchLocations();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu lokasyonu silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase
        .from("stock_locations")
        .delete()
        .eq("location_id", id);
      if (error) throw error;
      showToast("Lokasyon silindi.", "success");
      fetchLocations();
    } catch (err: any) {
      if (err.code === "23503") {
        showToast(
          "Bu lokasyonda ürün var! Silmek için önce ürünleri başka yere taşıyın.",
          "error",
        );
      } else {
        showToast(err.message, "error");
      }
    }
  }

  async function toggleStatus(id: number, current: boolean) {
    const { error } = await supabase
      .from("stock_locations")
      .update({ is_active: !current })
      .eq("location_id", id);
    if (!error) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.location_id === id ? { ...loc, is_active: !current } : loc,
        ),
      );
      showToast("Lokasyon durumu güncellendi.", "success");
    }
  }

  const filtered = locations.filter((loc) =>
    loc.location_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700 relative text-left">
      {/* TOAST BİLDİRİMİ */}
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

      {/* ÜST PANEL */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl flex items-center gap-5 w-full md:w-auto min-w-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              Toplam Lokasyon
            </p>
            <h4 className="text-3xl font-black text-slate-800">
              {locations.length}
            </h4>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Lokasyon ara... (Örn: Depo-A, Raf-12)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Plus size={18} /> YENİ LOKASYON
          </button>
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">
              <tr>
                <th className="px-8 py-5">Lokasyon Tanımı</th>
                <th className="px-8 py-5 text-center">Durum</th>
                <th className="px-8 py-5 text-center">Eklenme Tarihi</th>
                <th className="px-8 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 px-8">
              {filtered.map((loc) => (
                <tr
                  key={loc.location_id}
                  className="group hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 font-bold text-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shadow-sm uppercase">
                        {loc.location_name.substring(0, 2)}
                      </div>
                      <span>{loc.location_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() =>
                        toggleStatus(loc.location_id, loc.is_active)
                      }
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${loc.is_active ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"}`}
                    >
                      {loc.is_active ? "AKTİF" : "PASİF"}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-center text-xs text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar size={14} />
                      {new Date(loc.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2 text-slate-300">
                    <button
                      onClick={() => handleEditClick(loc)}
                      className="p-2.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.location_id)}
                      className="p-2.5 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
                <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-lg shadow-emerald-200">
                  <MapPin size={20} />
                </div>
                {isEditing ? "Lokasyonu Düzenle" : "Yeni Lokasyon Ekle"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Lokasyon Adı / Kodu
                </label>
                <input
                  required
                  type="text"
                  placeholder="Örn: Depo-A, Raf-01, Soğuk Hava"
                  value={formData.location_name}
                  onChange={(e) =>
                    setFormData({ ...formData, location_name: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kullanım Durumu
                </label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, is_active: true })
                    }
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.is_active ? "bg-white shadow-lg text-emerald-600" : "text-slate-400 opacity-50"}`}
                  >
                    AKTİF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, is_active: false })
                    }
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${!formData.is_active ? "bg-white shadow-lg text-red-600" : "text-slate-400 opacity-50"}`}
                  >
                    PASİF
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm tracking-widest hover:bg-emerald-600 shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> LOKASYONU KAYDET
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
