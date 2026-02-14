import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Plus,
  Search,
  Loader2,
  Truck,
  Phone,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  X,
  Save,
  Check,
  Building,
  Hash,
} from "lucide-react";

// --- TİPLER ---
interface Supplier {
  supplier_id: number;
  name: string;
  trade_name: string | null;
  tel_number: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
    name: "",
    trade_name: "",
    tel_number: "",
    address: "",
    is_active: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err: any) {
      showToast("Veriler yüklenirken hata oluştu: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (s: Supplier) => {
    setIsEditing(true);
    setSelectedId(s.supplier_id);
    setFormData({
      name: s.name,
      trade_name: s.trade_name || "",
      tel_number: s.tel_number,
      address: s.address || "",
      is_active: s.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      name: "",
      trade_name: "",
      tel_number: "",
      address: "",
      is_active: true,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        trade_name: formData.trade_name || null,
        tel_number: formData.tel_number,
        address: formData.address || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && selectedId) {
        const { error } = await supabase
          .from("suppliers")
          .update(payload)
          .eq("supplier_id", selectedId);
        if (error) throw error;
        showToast("Tedarikçi başarıyla güncellendi!", "success");
      } else {
        const { error } = await supabase.from("suppliers").insert([payload]);
        if (error) throw error;
        showToast("Yeni tedarikçi başarıyla eklendi!", "success");
      }
      closeModal();
      fetchSuppliers();
    } catch (err: any) {
      if (err.code === "23505") {
        showToast("Bu telefon numarası başka bir tedarikçiye ait!", "error");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu tedarikçiyi silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("supplier_id", id);
      if (error) throw error;
      showToast("Tedarikçi silindi.", "success");
      fetchSuppliers();
    } catch (err: any) {
      if (err.code === "23503") {
        showToast(
          "Bu tedarikçiye bağlı ürünler var! Önce ürünleri silmelisiniz.",
          "error",
        );
      } else {
        showToast(err.message, "error");
      }
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700 relative text-left">
      {/* TOAST POPUP */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 ${toast.type === "success" ? "bg-amber-500 text-white shadow-amber-200" : "bg-red-500 text-white shadow-red-200"}`}
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

      {/* İSTATİSTİK VE ARAMA */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl flex items-center gap-5 min-w-[280px]">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">
              Tedarikçi Sayısı
            </p>
            <h4 className="text-3xl font-black text-slate-800 leading-none">
              {suppliers.length}
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
              placeholder="Firma adı veya ünvan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> TEDARİKÇİ EKLE
          </button>
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">
              <tr>
                <th className="px-8 py-5">Firma Bilgisi</th>
                <th className="px-8 py-5">İletişim & Adres</th>
                <th className="px-8 py-5 text-center">Durum</th>
                <th className="px-8 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 px-8">
              {filtered.map((s) => (
                <tr
                  key={s.supplier_id}
                  className="group hover:bg-amber-50/30 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3 font-bold text-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shadow-sm uppercase">
                        {s.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter truncate max-w-[200px]">
                          {s.trade_name || "Ticari Ünvan Belirtilmedi"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Phone size={12} className="text-amber-500" />{" "}
                        {s.tel_number}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                        <MapPin size={12} /> {s.address || "Adres bilgisi yok"}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${s.is_active ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"}`}
                    >
                      {s.is_active ? "AKTİF" : "PASİF"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2 text-slate-300">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-2.5 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all shadow-sm"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.supplier_id)}
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
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase italic">
                <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-200">
                  <Truck size={20} />
                </div>
                {isEditing ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Firma Adı (Kısa)
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Marmosium A.Ş."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      required
                      type="text"
                      placeholder="05XX XXX XX XX"
                      value={formData.tel_number}
                      onChange={(e) =>
                        setFormData({ ...formData, tel_number: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Ticari Ünvan
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Marmosium Mobilya Dekorasyon ve San. Tic. Ltd. Şti."
                    value={formData.trade_name}
                    onChange={(e) =>
                      setFormData({ ...formData, trade_name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Adres
                </label>
                <textarea
                  rows={3}
                  placeholder="Firma açık adresi..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${formData.is_active ? "bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100" : "bg-red-50 text-red-600"}`}
                >
                  {formData.is_active ? <Check size={16} /> : <X size={16} />}
                  {formData.is_active ? "AKTİF" : "PASİF"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm tracking-widest hover:bg-amber-600 shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> TEDARİKÇİYİ KAYDET
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
