import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: GET /v1/admins/analysis does not exist on backend.
// Route commented out / redirected to main admin dashboard.
export const Route = createFileRoute("/admin/accounts/analysis/")({
  component: () => <Navigate to="/admin" replace />,
});

/*
Original route content commented out because backend does not provide /admins/analysis:

import AdminDashStats from "../../-components/AdminDashStats";
import IncomeExpense from "../../-components/charts/IncomeExpense";
import AdminMonthly from "../../-components/AdminMonthly";
import AreaChartExample from "../../-components/charts/AreaChart";
import PieChartExample from "../../-components/charts/PieChart";
import SimpleContainer from "@/components/SimpleContainer";

function RouteComponent() {
  return (
    <>
      <AdminDashStats />
      <IncomeExpense />
      <AdminMonthly />
      <div className="grid grid-cols-3 gap-6">
        <div className="  col-span-3 lg:col-span-2  space-y-8 ">
          <SimpleContainer title="Total Profit">
            <div className="rounded-b-box ring ring-current/20 p-4">
              <AreaChartExample />
            </div>
          </SimpleContainer>
        </div>
        <section className=" col-span-3 lg:col-span-1  rounded-box">
          <PieChartExample />
        </section>
      </div>
    </>
  );
}
*/
