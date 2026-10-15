import { createFileRoute } from "@tanstack/react-router";
import TenantCharts from "./-components/TenantCharts";
import TenantDashStats from "./-components/TenantDashStats";
import AdminUserList from "./-components/AdminUserList";
import DashStats from "./-components/DashStats";
import AdminMonthly from "./-components/AdminMonthly";

export const Route = createFileRoute("/tenant/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-12 space-y-6">
      <TenantCharts />
      <TenantDashStats />
      <AdminMonthly />
      <DashStats />
      {/*<AdminRecents />*/}
      <AdminUserList />
    </div>
  );
}
