import {
  TrendingUp,
  PieChart,
  Activity,
  Download,
  Calendar,
  MousePointer2,
} from "lucide-react";

export default function ReportManagement() {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-700 text-left pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-2">
            <Activity className="text-blue-600" /> ANALİTİK MERKEZİ
          </h2>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">
            Marmosium Real-Time Data Engine
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
            <Calendar size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Download size={18} /> PDF DIŞA AKTAR
          </button>
        </div>
      </div>

      {/* MAIN CHART: STOCK TREND (LINE CHART STYLE) */}
      <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <TrendingUp size={200} className="text-white" />
        </div>

        <div className="relative z-10 flex justify-between items-start mb-12">
          <div>
            <h3 className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              Genel Stok Akışı
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white tracking-tighter">
                142.850
              </span>
              <span className="text-emerald-400 text-sm font-bold mb-2 flex items-center gap-1">
                <TrendingUp size={16} /> +12.4%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {["Haftalık", "Aylık", "Yıllık"].map((t) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${t === "Aylık" ? "bg-white text-slate-900" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SANAL ÇİZGİ GRAFİK (CSS PATH) */}
        <div className="relative h-64 w-full flex items-end justify-between px-2 group/chart">
          {/* Arka Plan Izgarası */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-[1px] bg-white" />
            ))}
          </div>

          {/* Dinamik Grafiğimsi Çubuklar ve Noktalar */}
          <svg
            className="absolute inset-0 w-full h-full preserve-3xl"
            preserveAspectRatio="none"
          >
            <path
              d="M0 150 Q 100 80, 200 130 T 400 50 T 600 100 T 800 30 T 1200 80"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              className="animate-chart-flow"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Grafik Altı Etiketler */}
          <div className="absolute bottom-[-30px] w-full flex justify-between px-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DONUT CHART: DEPARTMAN DAĞILIMI */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Sanal Donut */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#f1f5f9"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#3b82f6"
                strokeWidth="20"
                fill="none"
                strokeDasharray="502"
                strokeDashoffset="150"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#8b5cf6"
                strokeWidth="20"
                fill="none"
                strokeDasharray="502"
                strokeDashoffset="350"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">7</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Departman
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter mb-4">
              Departman Yoğunluğu
            </h4>
            <ChartLegend color="bg-blue-500" label="Üretim" value="%45" />
            <ChartLegend color="bg-purple-500" label="Satın Alma" value="%30" />
            <ChartLegend color="bg-slate-200" label="Diğer" value="%25" />
          </div>
        </div>

        {/* BAR CHART: LOKASYON DOLULUK */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-slate-800 uppercase italic tracking-tighter">
              Lokasyon Kapasite
            </h4>
            <PieChart className="text-slate-300" />
          </div>
          <div className="space-y-6">
            <ProgressBar label="Depo-A" percent={85} color="bg-emerald-500" />
            <ProgressBar
              label="Raf Sistemi-B"
              percent={42}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Soğuk Hava"
              percent={68}
              color="bg-purple-500"
            />
            <ProgressBar label="Dış Alan" percent={15} color="bg-orange-500" />
          </div>
        </div>
      </div>

      {/* HEATMAP STYLE: ACTIVITY MAP */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
        <h4 className="font-black text-slate-800 uppercase italic tracking-tighter mb-8 flex items-center gap-2">
          <MousePointer2 size={18} className="text-blue-500" /> İşlem Yoğunluk
          Haritası
        </h4>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg transition-all hover:scale-110 cursor-pointer shadow-sm
                        ${i % 7 === 0 ? "bg-blue-600" : i % 5 === 0 ? "bg-blue-400" : i % 3 === 0 ? "bg-blue-200" : "bg-slate-50"}`}
            />
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Az</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-slate-50 rounded-sm" />
            <div className="w-3 h-3 bg-blue-200 rounded-sm" />
            <div className="w-3 h-3 bg-blue-400 rounded-sm" />
            <div className="w-3 h-3 bg-blue-600 rounded-sm" />
          </div>
          <span>Çok</span>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function ChartLegend({ color, label, value }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-800">{value}</span>
    </div>
  );
}

function ProgressBar({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
        <span>{label}</span>
        <span>%{percent}</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div
          style={{ width: `${percent}%` }}
          className={`h-full ${color} rounded-full transition-all duration-1000 shadow-lg`}
        />
      </div>
    </div>
  );
}
