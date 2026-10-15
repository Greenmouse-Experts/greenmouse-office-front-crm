import { useProfile } from "@/store/authStore";
import { useTenantMe, useTenantOnboarding } from "@/api/tenantApi";
import { Link } from "@tanstack/react-router";
import { FileText, UserPlus, Receipt } from "lucide-react";
import IncomeExpense from "./charts/IncomeExpense";

export default function TenantCharts() {
  const [authProfile] = useProfile();
  const { data: tenantMe } = useTenantMe();
  const { data: onboarding } = useTenantOnboarding();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const companyName =
    tenantMe?.companyName ||
    onboarding?.companyName ||
    authProfile?.companyName ||
    "Your Business";

  return (
    <div className="w-full space-y-4 py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary/50  rounded-2xl shadow-sm text-primary-content p-5 sm:p-6 relative w-full overflow-hidden relative isolate">
        <div className="absolute inset-0 bg-primary/50"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-primary-content/70">
              {currentDate}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary-content">
              Welcome back, {companyName}
            </h2>
            <p className="text-xs sm:text-sm text-primary-content/80">
              Here is your business performance overview for today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/tenant/accounts/Invoices"
              className="btn btn-sm bg-white/15 hover:bg-white/25 text-white border-none backdrop-blur-sm"
            >
              <FileText className="size-3.5" />
              New Invoice
            </Link>
            <Link
              to="/tenant/contacts/customers"
              className="btn btn-sm bg-white/15 hover:bg-white/25 text-white border-none backdrop-blur-sm"
            >
              ath the
              <UserPlus className="size-3.5" />
              Add Customer
            </Link>
            <Link
              to="/tenant/accounts/income-expenses"
              className="btn btn-sm bg-white/15 hover:bg-white/25 text-white border-none backdrop-blur-sm"
            >
              <Receipt className="size-3.5" />
              Record Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Income & Expense Chart */}
      <div>
        <IncomeExpense />
      </div>
    </div>
  );
}
