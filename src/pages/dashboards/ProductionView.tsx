export default function ProductionView() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold border-l-4 border-orange-600 pl-4 mb-6">
        Üretim Yönetim Paneli
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4 text-slate-400">
            Aktif İş Emirleri
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm">
              #1204 - Mermer Kesim (Devam Ediyor)
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg text-sm">
              #1205 - Cilalama Hattı (Beklemede)
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
          <h2 className="font-semibold mb-2">Günlük Hedef</h2>
          <div className="text-3xl font-black">%74</div>
          <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[74%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
