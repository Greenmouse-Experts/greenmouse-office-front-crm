import { Link, useLocation } from "@tanstack/react-router";
import { Package, Wrench, Layers } from "lucide-react";

export default function ProductNav() {
  const pathname = useLocation({ select: (l) => l.pathname });

  const tabs = [
    { label: "Products Catalog", path: "/admin/products", icon: Package, exact: true },
    { label: "Services", path: "/admin/products/service", icon: Wrench },
    { label: "Categories", path: "/admin/products/categories", icon: Layers },
  ];

  return (
    <div className="flex items-center gap-1 bg-base-200/60 p-1 rounded-xl w-fit mb-6 border border-base-300/40">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.path || pathname === `${tab.path}/`
          : pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/70 hover:text-base-content hover:bg-base-200"
            }`}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
