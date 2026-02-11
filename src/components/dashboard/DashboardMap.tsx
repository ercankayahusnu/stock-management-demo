import SuperAdminView from "../../pages/dashboards/SuperAdminView";
import ProductionView from "../../pages/dashboards/ProductionView";
import SalesView from "../../pages/dashboards/SalesView";

// Value-Key İlişkisi
export const DASHBOARD_VIEWS: Record<string, React.ComponentType> = {
  superadmin: SuperAdminView,
  uretim: ProductionView,
  satis: SalesView,
  default: () => (
    <div className="p-10 text-center text-slate-500 font-bold">
      Tanımsız Departman veya Yetkisiz Erişim.
    </div>
  ),
};
