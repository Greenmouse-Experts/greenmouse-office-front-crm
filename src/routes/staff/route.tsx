import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  CreditCard,
  BarChart2,
  HelpCircle,
  Shirt,
  Tag,
  Users,
  QuoteIcon,
  List,
  Target,
  Kanban,
  Layers,
  TrendingUp,
  Bell,
} from "lucide-react";
import AdminHeader from "./-components/AdminHeader";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";
import { toast } from "sonner";
interface Links {
  path: string;
  label: string;
  icon: React.ReactNode;
  type: "menu" | "submenu";
  children: Partial<Links[]> | null;
}
[];
const ICON_SIZE = 12;
const nav_links = [
  {
    path: "/staff",
    label: "Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/leads",
    label: "Leads",
    icon: <Target size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/deals",
    label: "Deals",
    icon: <Kanban size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/pipelines",
    label: "Pipelines",
    icon: <Layers size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/users",
    label: "Users",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/users",
        label: "Staffs",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/users/roles",
        label: "Roles",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/contacts",
    label: "Contacts",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/contacts/customers",
        label: "Customers",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/contacts/companies",
        label: "Companies",
        icon: <Shirt size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/products",
    label: "Products",
    icon: <Package size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/products",
        label: "Products",
        icon: <Package size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/products/service",
        label: "Services",
        icon: <Package size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/products/categories",
        label: "Product Categories",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/products/service/categories",
        label: "Service Categories",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/accounts",
    label: "Accounts",
    icon: <CreditCard size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/accounts/income-expenses",
        label: "Income & Expenses",
        icon: <ReceiptText size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/accounts/invoices",
        label: "Invoices",
        icon: <ShoppingCart size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/accounts/quotes",
        label: "Quotes",
        icon: <QuoteIcon size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/accounts/analysis",
        label: "Analysis",
        icon: <BarChart2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/orders",
    label: "Orders",
    icon: <List size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/reports",
    label: "Reports",
    icon: <TrendingUp size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/notifications",
    label: "Notifications",
    icon: <Bell size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/staff/support",
    label: "Support",
    icon: <HelpCircle size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/staff/settings",
    label: "Settings",
    icon: <Settings size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
] satisfies Links[];
export const Route = createFileRoute("/staff")({
  component: RouteComponent,
  notFoundComponent: () => (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold">404 - Page Not Found</h1>
          <p className="py-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Link to="/staff" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  ),
  loader: () => {
    const auth = get_user_value();
    if (!auth)
      return redirect({
        to: "/auth/login",
      });
    if (auth?.user?.userType !== "staff") {
      toast.info("wrong dashboard");
      return redirect({
        to: "/auth/login",
      });
    }
  },
});

function RouteComponent() {
  const url = useLocation();
  return (
    <div className="drawer lg:drawer-open">
      <input id="tenant-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 isolate">
        <AdminHeader />
        <main className=" min-h-screen bg-base-200 pt-4 space-y-4 px-4">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="tenant-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="min-h-full w-3xs bg-base-100 text-base-content">
          <div className="h-20 p-2 ">
            <img src="/logo.jpeg" className="size-full object-contain " />
          </div>
          <ul className="menu  w-full space-y-2 ">
            {nav_links.map((link) => {
              const int_url = link.path;
              if (link.type === "submenu" && link.children) {
                return (
                  <li key={link.path} className="mb-2">
                    <details name="staff-sidebar-submenus">
                      <summary className="text-md  ">
                        {link.icon}
                        {link.label}
                      </summary>
                      <ul className="py-1 space-y-1">
                        {link.children.map((childLink) => {
                          if (!childLink) return null;
                          const isChildActive = childLink.path === url.pathname;
                          return (
                            <li key={childLink.path}>
                              <Link
                                to={childLink.path}
                                className={` ${isChildActive ? "bg-primary text-primary-content " : ""} text-md  py-2 rounded-box`}
                              >
                                {childLink.icon}
                                {childLink.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              }

              const isActive = int_url === url.pathname;
              return (
                <li key={link.path} className="mb-2">
                  <Link
                    to={link.path}
                    className={` ${isActive ? "bg-primary text-primary-content " : ""} text-md  py-2 rounded-box`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
