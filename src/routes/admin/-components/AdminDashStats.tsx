import { Link } from "@tanstack/react-router";
import {
  Users,
  FileText,
  UsersRound,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { useDashboardStats, useAdminTenantStats } from "@/api/adminApi";

export default function AdminDashStats() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: tenantStats, isLoading: tenantLoading } = useAdminTenantStats();

  const cards = [
    {
      title: "Active Tenants",
      value: tenantLoading ? "..." : (tenantStats?.total ?? 0),
      subtitle: tenantStats
        ? `${tenantStats.active} Active • ${tenantStats.trial} Trial`
        : "Registered businesses",
      icon: Building2,
      to: "/admin/tenants",
      color:
        "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Staffs",
      value: statsLoading ? "..." : (stats?.totalStaffs ?? 0),
      subtitle: "Platform operators",
      icon: Users,
      to: "/admin/users",
      color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Customers",
      value: statsLoading ? "..." : (stats?.totalCustomers ?? 0),
      subtitle: "Across CRM accounts",
      icon: UsersRound,
      to: "/admin/contacts/customers",
      color:
        "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Total Invoices",
      value: statsLoading ? "..." : (stats?.totalInvoices ?? 0),
      subtitle: "System invoices generated",
      icon: FileText,
      to: "/admin/accounts/invoices",
      color:
        "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Catalog Products",
      value: statsLoading ? "..." : (stats?.totalProducts ?? 0),
      subtitle: `${stats?.pendingOrders ?? 0} Pending orders`,
      icon: ShoppingBag,
      to: "/admin/products",
      color: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link
            key={index}
            to={card.to}
            className="card bg-base-100 shadow-sm hover:shadow-md border border-base-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <p className="text-2xl font-semibold text-base-content">
                    {card.value}
                  </p>
                  <p className="text-xs text-base-content/60 font-medium">
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
