export default function SalesView() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        Satış & Pazarlama Paneli
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-3xl">
          <p className="opacity-80 text-sm">Aylık Ciro</p>
          <p className="text-2xl font-bold">₺1.250.000</p>
        </div>
        {/* Diğer satış kartları... */}
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <h2 className="font-bold mb-4">Son Siparişler</h2>
        <table className="w-full text-left text-sm text-slate-500">
          <tr className="border-b">
            <li className="py-2">Mermer Ltd. Şti - 500m2 Traverten</li>
          </tr>
        </table>
      </div>
    </div>
  );
}
