import React, { useState } from "react";
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
} from "lucide-react";

export default function SuperAdminView() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      title: "Personel",
      icon: <Users size={24} />,
      color: "bg-blue-500",
      desc: "Çalışan kayıtları ve yetki yönetimi",
    },
    {
      title: "Departman",
      icon: <Briefcase size={24} />,
      color: "bg-indigo-500",
      desc: "Bölüm bazlı organizasyon yapısı",
    },
    {
      title: "Ürün",
      icon: <Package size={24} />,
      color: "bg-orange-500",
      desc: "Ürün listesi ve detay tanımları",
    },
    {
      title: "Stok Lokasyonu",
      icon: <MapPin size={24} />,
      color: "bg-emerald-500",
      desc: "Depo ve raf konumlandırma",
    },
    {
      title: "Tedarikçi",
      icon: <Truck size={24} />,
      color: "bg-amber-500",
      desc: "Tedarik zinciri ve firma rehberi",
    },
    {
      title: "Raporlar",
      icon: <BarChart3 size={24} />,
      color: "bg-purple-500",
      desc: "Verimlilik ve stok analizleri",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* MOBİL BUTON */}
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
        {/* LOGO BÖLÜMÜ - Alt boşluk mb-12 yapıldı */}
        <div className="flex items-center justify-between p-4 mb-12 mt-4 h-16 shrink-0">
          <div
            className={`flex items-center transition-all duration-300 ${isOpen ? "w-32 ml-2" : "w-10 ml-1"}`}
          >
            <img
              src="/marmo-deco.png"
              alt="Marmosium Logo"
              className={`w-full h-auto object-contain transition-all duration-300 ${!isOpen ? "scale-[2.5]" : ""}`}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center hover:bg-white/10 w-8 h-8 rounded-full transition-colors shrink-0"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* BUTONLAR - Aradaki boşluk space-y-4 yapıldı */}
        <nav className="px-3 space-y-4 flex-1">
          {navigation.map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 transition-all group text-slate-300 hover:text-white"
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
          <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={24} />
            <span className={`${!isOpen && "hidden"}`}>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK - Sidebar genişliğine göre dinamik margin */}
      <main
        className={`flex-1 transition-all duration-300 p-6 lg:p-10 ${isOpen ? "lg:ml-64" : "lg:ml-20"}`}
      >
        <header className="mb-12 mt-10 lg:mt-0">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Yönetici Paneline Hoş Geldiniz
          </h1>
          <p className="text-slate-500 font-medium">
            Hangi süreci yönetmek istersiniz?
          </p>
        </header>

        {/* KARTLAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {navigation.map((card, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              <div
                className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:rotate-6 transition-all`}
              >
                {React.cloneElement(card.icon, { size: 28 })}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {card.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
