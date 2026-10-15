import { Link } from "@tanstack/react-router";
import { Users, FileText, UsersRound, ShoppingBag, Clock } from "lucide-react";
import { useDashboardStats } from "@/api/tenantApi";

export default function TenantDashStats() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: "Total Customers",
      value: isLoading ? "..." : (stats?.totalCustomers ?? 0),
      subtitle: "Active CRM contacts",
      icon: UsersRound,
      to: "/tenant/contacts/customers",
      color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Products & Services",
      value: isLoading ? "..." : (stats?.totalProducts ?? 0),
      subtitle: "Catalog items available",
      icon: ShoppingBag,
      to: "/tenant/products",
      color:
        "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Pending Orders",
      value: isLoading ? "..." : (stats?.pendingOrders ?? 0),
      subtitle: "Awaiting fulfillment",
      icon: Clock,
      to: "/tenant/orders",
      color:
        "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Total Invoices",
      value: isLoading ? "..." : (stats?.totalInvoices ?? 0),
      subtitle: "Generated billings",
      icon: FileText,
      to: "/tenant/accounts/Invoices",
      color:
        "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Team Members",
      value: isLoading ? "..." : (stats?.totalStaffs ?? 0),
      subtitle: "Active workspace staff",
      icon: Users,
      to: "/tenant/users",
      color: "from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-400",
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
