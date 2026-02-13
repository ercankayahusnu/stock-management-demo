import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Plus,
  Search,
  Loader2,
  Phone,
  Mail,
  AlertCircle,
  Edit,
  Users,
  CheckCircle2,
  Building2,
  Filter,
  X,
  Save,
  UserPlus,
  Trash2,
  Check,
  Shield,
  Activity,
} from "lucide-react";

// --- TİPLER ---
interface Personal {
  personal_id: number;
  personal_name: string;
  personal_surname: string;
  personal_tel_no: string;
  personal_mail: string;
  role: string;
  is_active: boolean;
  departman_id?: number;
  departman: { departman_name: string } | null;
}

interface Departman {
  departman_id: number;
  departman_name: string;
}

// Toast (Bildirim) Tipi
interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function PersonnelManagement() {
  const [personnel, setPersonnel] = useState<Personal[]>([]);
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
    personal_name: "",
    personal_surname: "",
    personal_tel_no: "",
    personal_mail: "",
    departman_id: "",
    role: "user",
    is_active: true,
  });

  // --- FİLTRE STATE'LERİ ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'passive'
  const [filterRole, setFilterRole] = useState("all"); // 'all', 'admin', 'user'

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- BİLDİRİM GÖSTERME FONKSİYONU ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [pRes, dRes] = await Promise.all([
        supabase
          .from("personal")
          .select(`*, departman:departman_id (departman_name)`)
          .order("personal_id", { ascending: false }),
        supabase.from("departman").select("*").order("departman_name"),
      ]);
      if (pRes.data) setPersonnel(pRes.data);
      if (dRes.data) setDepartments(dRes.data);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // --- DÜZENLEME MODALINI AÇ ---
  const handleEditClick = (p: Personal) => {
    setIsEditing(true);
    setSelectedId(p.personal_id);
    setFormData({
      personal_name: p.personal_name,
      personal_surname: p.personal_surname,
      personal_tel_no: p.personal_tel_no,
      personal_mail: p.personal_mail,
      departman_id: p.departman_id ? p.departman_id.toString() : "",
      role: p.role,
      is_active: p.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      personal_name: "",
      personal_surname: "",
      personal_tel_no: "",
      personal_mail: "",
      departman_id: "",
      role: "user",
      is_active: true,
    });
  };

  // --- KAYDET / GÜNCELLE ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && selectedId) {
        const { error: updateError } = await supabase
          .from("personal")
          .update({
            personal_name: formData.personal_name,
            personal_surname: formData.personal_surname,
            personal_tel_no: formData.personal_tel_no,
            departman_id: parseInt(formData.departman_id),
            role: formData.role,
            is_active: formData.is_active,
          })
          .eq("personal_id", selectedId);

        if (updateError) throw updateError;
        showToast("Personel başarıyla güncellendi!", "success");
      } else {
        const { error: funcError } = await supabase.functions.invoke(
          "create-user-admin",
          {
            body: {
              email: formData.personal_mail,
              password: "GeciciSifre123!",
              personal_data: {
                personal_name: formData.personal_name,
                personal_surname: formData.personal_surname,
                personal_tel_no: formData.personal_tel_no,
                departman_id: parseInt(formData.departman_id),
                role: formData.role,
                is_active: formData.is_active,
              },
            },
          },
        );

        if (funcError) {
          const errorMsg = await funcError.context?.json();
          throw new Error(errorMsg?.error || "Fonksiyon hatası oluştu.");
        }
        showToast("Yeni personel sisteme eklendi!", "success");
      }

      closeModal();
      fetchInitialData();
    } catch (err: any) {
      showToast(err.message || "Bir hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Personeli silmek istediğinize emin misiniz?")) return;
    try {
      const { error: delErr } = await supabase
        .from("personal")
        .delete()
        .eq("personal_id", id);
      if (delErr) throw delErr;

      showToast("Personel kaydı silindi.", "success");
      fetchInitialData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  async function toggleStatus(id: number, current: boolean) {
    const { error: upErr } = await supabase
      .from("personal")
      .update({ is_active: !current })
      .eq("personal_id", id);
    if (!upErr) {
      setPersonnel((prev) =>
        prev.map((p) =>
          p.personal_id === id ? { ...p, is_active: !current } : p,
        ),
      );
      showToast("Personel durumu değiştirildi.", "success");
    }
  }

  // --- GELİŞMİŞ FİLTRELEME MANTIĞI ---
  const filtered = personnel.filter((p) => {
    const matchesSearch = `${p.personal_name} ${p.personal_surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDept =
      filterDept === "all" || p.departman?.departman_name === filterDept;

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? p.is_active
          : !p.is_active;

    const matchesRole = filterRole === "all" ? true : p.role === filterRole;

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-700 relative">
      {/* --- TOAST BİLDİRİMİ (POPUP) --- */}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <StatWidget
          icon={<Users size={24} />}
          label="Toplam Personel"
          value={personnel.length}
          color="blue"
        />
        <StatWidget
          icon={<CheckCircle2 size={24} />}
          label="Aktif"
          value={personnel.filter((p) => p.is_active).length}
          color="emerald"
        />
        <StatWidget
          icon={<Building2 size={24} />}
          label="Bölümler"
          value={departments.length}
          color="purple"
        />
      </div>

      {/* GELİŞMİŞ FİLTRELEME PANELİ */}
      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col xl:flex-row gap-6 items-center">
        {/* Sol Taraf: Filtre Etiketi */}
        <div className="flex items-center gap-2 font-black text-slate-800 xl:border-r xl:pr-6 border-slate-100 uppercase text-[10px] tracking-widest italic w-full xl:w-auto">
          <Filter size={18} className="text-blue-600" />
          <span>Filtrele</span>
        </div>

        {/* Orta Kısım: Filtre Seçenekleri (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full flex-1">
          {/* İsim Arama */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="İsim ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
            />
          </div>

          {/* Departman Filtresi */}
          <div className="relative">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full pl-4 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer appearance-none"
            >
              <option value="all">Tüm Bölümler</option>
              {departments.map((d) => (
                <option key={d.departman_id} value={d.departman_name}>
                  {d.departman_name}
                </option>
              ))}
            </select>
            <Building2
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Durum Filtresi */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-4 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer appearance-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Sadece Aktifler</option>
              <option value="passive">Sadece Pasifler</option>
            </select>
            <Activity
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Yetki Filtresi */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-4 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer appearance-none"
            >
              <option value="all">Tüm Yetkiler</option>
              <option value="admin">Yöneticiler (Admin)</option>
              <option value="user">Kullanıcılar (User)</option>
            </select>
            <Shield
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Sağ Taraf: Ekle Butonu */}
        <button
          onClick={() => {
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="w-full xl:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm tracking-wider hover:bg-blue-600 shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
        >
          <UserPlus size={18} /> EKLE
        </button>
      </div>

      {/* PERSONEL TABLOSU */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest px-8">
              <tr>
                <th className="px-8 py-5">Personel</th>
                <th className="px-8 py-5 text-center">İletişim</th>
                <th className="px-8 py-5 text-center">Durum</th>
                <th className="px-8 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 px-8">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr
                    key={p.personal_id}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 font-bold text-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg uppercase">
                          {p.personal_name[0]}
                          {p.personal_surname[0]}
                        </div>
                        <div>
                          <div>
                            {p.personal_name} {p.personal_surname}
                          </div>
                          <div className="text-[10px] text-blue-500 uppercase font-black flex items-center gap-1">
                            {p.role === "admin" && <Shield size={10} />}{" "}
                            {p.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Phone size={12} className="text-slate-400" />{" "}
                          {p.personal_tel_no}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                          <Mail size={12} className="text-slate-400" />{" "}
                          {p.personal_mail}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button
                        onClick={() => toggleStatus(p.personal_id, p.is_active)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${p.is_active ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"}`}
                      >
                        {p.is_active ? "AKTİF" : "PASİF"}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2 text-slate-300">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-2.5 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.personal_id)}
                        className="p-2.5 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Filter size={48} className="text-slate-200" />
                      <p className="text-sm font-medium">
                        Bu kriterlere uygun personel bulunamadı.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterDept("all");
                          setFilterRole("all");
                          setFilterStatus("all");
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (EKLEME & DÜZENLEME) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 uppercase italic font-black">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl text-slate-800 tracking-tighter">
                  {isEditing ? "Kaydı Düzenle" : "Yeni Kayıt"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-800"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <FormInput
                  label="Ad"
                  placeholder="Ahmet"
                  value={formData.personal_name}
                  onChange={(v: string) =>
                    setFormData({ ...formData, personal_name: v })
                  }
                />
                <FormInput
                  label="Soyad"
                  placeholder="Yılmaz"
                  value={formData.personal_surname}
                  onChange={(v: string) =>
                    setFormData({ ...formData, personal_surname: v })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <FormInput
                  label="E-Posta"
                  type="email"
                  placeholder="mail@sirket.com"
                  value={formData.personal_mail}
                  onChange={(v: string) =>
                    setFormData({ ...formData, personal_mail: v })
                  }
                  disabled={isEditing}
                />
                <FormInput
                  label="Telefon"
                  placeholder="05XX XXX XX XX"
                  value={formData.personal_tel_no}
                  onChange={(v: string) =>
                    setFormData({ ...formData, personal_tel_no: v })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Departman
                  </label>
                  <select
                    required
                    value={formData.departman_id}
                    onChange={(e) =>
                      setFormData({ ...formData, departman_id: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="">Seçiniz...</option>
                    {departments.map((d) => (
                      <option key={d.departman_id} value={d.departman_id}>
                        {d.departman_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Yetki
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none shadow-inner"
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-center">
                    Durum
                  </label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, is_active: true })
                      }
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${formData.is_active ? "bg-white shadow-xl text-emerald-600" : "text-slate-400 opacity-50"}`}
                    >
                      AKTİF
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, is_active: false })
                      }
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${!formData.is_active ? "bg-white shadow-xl text-red-600" : "text-slate-400 opacity-50"}`}
                    >
                      PASİF
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm tracking-[0.4em] hover:bg-blue-600 shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={24} /> {isEditing ? "GÜNCELLE" : "KAYDET"}
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

// YARDIMCI BİLEŞENLER
function StatWidget({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl flex items-center gap-5 transition-transform hover:-translate-y-2 duration-300">
      <div
        className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center shadow-inner`}
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">
          {label}
        </p>
        <h4 className="text-3xl font-black text-slate-800 leading-none">
          {value}
        </h4>
      </div>
    </div>
  );
}

function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
}: any) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">
        {label}
      </label>
      <input
        required
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner disabled:opacity-50"
      />
    </div>
  );
}
