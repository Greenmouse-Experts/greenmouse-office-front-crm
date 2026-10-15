import { createFileRoute } from "@tanstack/react-router";
import AdminDashStats from "./-components/AdminDashStats";
import AdminUserList from "./-components/AdminUserList";
import AdminFinanceTrend from "./-components/AdminFinance";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-12 space-y-6">
      <AdminDashStats />
      <AdminFinanceTrend />
      {/*<AdminCharts />*/}
      {/*<AdminMonthly />*/}
      <AdminUserList />
    </div>
  );
}
