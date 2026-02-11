import { DASHBOARD_VIEWS } from "./DashboardMap";

interface DashboardManagerProps {
  role: string;
  slug: string;
}

export default function DashboardManager({
  role,
  slug,
}: DashboardManagerProps) {
  // Mantık: Superadmin ise direkt onu aç, değilse slug'a (departman) bak.
  const viewKey = role === "superadmin" ? "superadmin" : slug;

  const ActiveView = DASHBOARD_VIEWS[viewKey] || DASHBOARD_VIEWS["default"];

  return <ActiveView />;
}
