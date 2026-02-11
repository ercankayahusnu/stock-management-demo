export default function StockLocationManagement() {
  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Stok Lokasyonu Yönetimi
      </h2>
      <p className="text-slate-500 font-medium">
        Bu modül şu anda geliştirme aşamasındadır.
      </p>

      {/* İleride buraya gelecek liste için yer tutucu */}
      <div className="mt-8 space-y-3 max-w-md mx-auto">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-12 bg-white rounded-xl border border-slate-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
