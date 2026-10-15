import { useAdminProfile } from "@/api/adminApi";
import IncomeExpense from "./charts/IncomeExpense";

export default function AdminCharts() {
  const { data: profile } = useAdminProfile();
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const adminName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "Greenmouse Admin";

  return (
    <div className="w-full space-y-4 py-2">
      <div className="bg-gradient-to-r from-primary to-emerald-800 rounded-2xl shadow-md flex flex-col justify-center text-primary-content p-6 relative w-full overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="bg-white/15 text-white font-medium rounded-md px-3 py-1 text-xs w-fit backdrop-blur-xs">
            {currentDate}
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Welcome back, {adminName}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Monitor platform performance, manage business tenants, and oversee
            subscription plans across Greenmouse CRM.
          </p>
        </div>
      </div>
      <div>
        <IncomeExpense />
      </div>
    </div>
  );
}
