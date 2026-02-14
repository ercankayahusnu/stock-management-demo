import { useState, useEffect, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import {
  Users,
  Briefcase,
  Package,
  MapPin,
  Truck,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";

// Yönetim Sayfalarını Import Ediyoruz
import PersonnelManagement from "../management/PersonnelManagement";
import DepartmentManagement from "../management/DepartmentManagement";
import ProductManagement from "../management/ProductManagement";
import StockLocationManagement from "../management/StockLocationManagement";
import SupplierManagement from "../management/SupplierManagement";
import ReportManagement from "../management/ReportManagement";

type TabId =
  | "home"
  | "personnel"
  | "department"
  | "product"
  | "stock"
  | "supplier"
  | "reports";

export default function SuperAdminView() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // --- İSTATİSTİK STATE'LERİ ---
  const [stats, setStats] = useState({
    personnel: { total: 0, active: 0 },
    department: { total: 0 },
    stock: { total: 0, active: 0 },
    supplier: { total: 0, active: 0 }, // Tedarikçi eklendi
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // --- VERİ ÇEKME (ZIBAMM) ---
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoadingStats(true);
      // Tüm sorguları paralel atarak hızı koruyoruz
      const [
        pTotal,
        pActive,
        dTotal,
        sLocTotal,
        sLocActive,
        supTotal,
        supActive,
      ] = await Promise.all([
        // Personel Sayıları
        supabase.from("personal").select("*", { count: "exact", head: true }),
        supabase
          .from("personal")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        // Departman Sayısı
        supabase.from("departman").select("*", { count: "exact", head: true }),
        // Stok Lokasyon Sayıları
        supabase
          .from("stock_locations")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("stock_locations")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        // Tedarikçi Sayıları (YENİ)
        supabase.from("suppliers").select("*", { count: "exact", head: true }),
        supabase
          .from("suppliers")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      setStats({
        personnel: { total: pTotal.count || 0, active: pActive.count || 0 },
        department: { total: dTotal.count || 0 },
        stock: { total: sLocTotal.count || 0, active: sLocActive.count || 0 },
        supplier: { total: supTotal.count || 0, active: supActive.count || 0 },
      });
    } catch (error) {
      console.error("İstatistik hatası:", error);
    } finally {
      setLoadingStats(false);
    }
  }

  const navigation = [
    {
      title: "Personel",
      id: "personnel" as TabId,
      icon: <Users size={24} />,
      color: "bg-blue-500",
      desc: "Çalışan kayıtları ve yetki yönetimi",
      stats: loadingStats ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <div className="flex gap-2 mt-3">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-black border border-blue-100 uppercase">
            Toplam: {stats.personnel.total}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black border border-emerald-100 uppercase">
            Aktif: {stats.personnel.active}
          </span>
        </div>
      ),
    },
    {
      title: "Departman",
      id: "department" as TabId,
      icon: <Briefcase size={24} />,
      color: "bg-indigo-500",
      desc: "Bölüm bazlı organizasyon yapısı",
      stats: loadingStats ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <div className="flex gap-2 mt-3">
          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-black border border-indigo-100 uppercase">
            Tanımlı Bölüm: {stats.department.total}
          </span>
        </div>
      ),
    },
    {
      title: "Ürün",
      id: "product" as TabId,
      icon: <Package size={24} />,
      color: "bg-orange-500",
      desc: "Ürün listesi ve detay tanımları",
    },
    {
      title: "Stok Lokasyonu",
      id: "stock" as TabId,
      icon: <MapPin size={24} />,
      color: "bg-emerald-500",
      desc: "Depo ve raf konumlandırma",
      stats: loadingStats ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <div className="flex gap-2 mt-3">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black border border-emerald-100 uppercase">
            Toplam Alan: {stats.stock.total}
          </span>
          <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded-md text-[10px] font-black border border-slate-100 uppercase">
            Aktif: {stats.stock.active}
          </span>
        </div>
      ),
    },
    {
      title: "Tedarikçi",
      id: "supplier" as TabId,
      icon: <Truck size={24} />,
      color: "bg-amber-500",
      desc: "Tedarik zinciri ve firma rehberi",
      stats: loadingStats ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <div className="flex gap-2 mt-3">
          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[10px] font-black border border-amber-100 uppercase">
            Firma: {stats.supplier.total}
          </span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-black border border-emerald-100 uppercase">
            Aktif: {stats.supplier.active}
          </span>
        </div>
      ),
    },
    {
      title: "Raporlar",
      id: "reports" as TabId,
      icon: <BarChart3 size={24} />,
      color: "bg-purple-500",
      desc: "Verimlilik ve stok analizleri",
    },
  ];

  const handleNavigate = (id: TabId) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Çıkış hatası:", error.message);
    } else {
      navigate("/login");
    }
  };

  const getActiveTitle = () => {
    const item = navigation.find((n) => n.id === activeTab);
    return item ? item.title : "Yönetim";
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* MOBİL MENÜ BUTONU */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1e293b] text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#1e293b] text-white transition-all duration-300 ease-in-out border-r border-white/5 flex flex-col ${
          isOpen ? "w-64" : "w-20"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* LOGO BÖLÜMÜ */}
        <div className="flex items-center justify-between p-4 mb-12 mt-4 h-16 shrink-0">
          <div
            className={`flex items-center cursor-pointer transition-all duration-300 ${
              isOpen ? "w-32 ml-2" : "w-10 ml-1"
            }`}
            onClick={() => setActiveTab("home")}
          >
            {isOpen ? (
              <span className="text-xl font-black tracking-tighter text-white">
                MARMOSIUM
              </span>
            ) : (
              <span className="text-xl font-black text-white">M</span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center hover:bg-white/10 w-8 h-8 rounded-full transition-colors shrink-0"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* SIDEBAR NAVİGASYON */}
        <nav className="px-3 space-y-4 flex-1">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
              }`}
              title={!isOpen ? item.title : ""}
            >
              <div className="min-w-[24px] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                  !isOpen
                    ? "lg:opacity-0 pointer-events-none hidden"
                    : "opacity-100 block"
                }`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </nav>

        {/* ÇIKIŞ BUTONU */}
        <div className="p-4 mt-auto border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={24} />
            <span className={`${!isOpen && "hidden"}`}>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main
        className={`flex-1 transition-all duration-300 p-6 lg:p-10 ${
          isOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {activeTab === "home" ? (
          /* ANA DASHBOARD (KARTLAR) */
          <>
            <header className="mb-12 mt-10 lg:mt-0 text-left">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Yönetici Paneline Hoş Geldiniz
              </h1>
              <p className="text-slate-500 font-medium">
                Hangi süreci yönetmek istersiniz?
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
              {navigation.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(card.id)}
                  className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col items-start h-full"
                >
                  <div
                    className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:rotate-6 transition-all`}
                  >
                    {cloneElement(card.icon, { size: 28 })}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-auto">
                    {card.desc}
                  </p>

                  {/* İSTATİSTİK BÖLÜMÜ */}
                  {card.stats && (
                    <div className="w-full pt-4 mt-2 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2">
                      {card.stats}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ALT YÖNETİM SAYFALARI */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="mb-8 flex items-center justify-between mt-10 lg:mt-0">
              <div>
                <button
                  onClick={() => setActiveTab("home")}
                  className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-2"
                >
                  <ChevronLeft
                    size={18}
                    className="group-hover:-translate-x-1 transition-transform"
                  />
                  <span className="text-sm font-semibold">Ana Menüye Dön</span>
                </button>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  {getActiveTitle()} Yönetimi
                </h1>
              </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 min-h-[400px]">
              {/* Dinamik Komponent Seçici */}
              {activeTab === "personnel" && <PersonnelManagement />}
              {activeTab === "department" && <DepartmentManagement />}
              {activeTab === "product" && <ProductManagement />}
              {activeTab === "stock" && <StockLocationManagement />}
              {activeTab === "supplier" && <SupplierManagement />}
              {activeTab === "reports" && <ReportManagement />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
