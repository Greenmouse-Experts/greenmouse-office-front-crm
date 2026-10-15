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
  CheckCircle,
  Users,
  QuoteIcon,
  List,
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
    path: "/tenant",
    label: "Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/tenant/users",
    label: "Users",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/tenant/users",
        label: "Staffs",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/users/roles",
        label: "Roles",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      // {
      //   path: "/tenant/users/permissions",
      //   label: "Permissions",
      //   icon: <Cog size={ICON_SIZE} />,
      //   type: "menu",
      //   children: null,
      // },
    ],
  },
  {
    path: "/tenant/contacts",
    label: "Contacts",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/tenant/contacts/customers",
        label: "Customers",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/contacts/companies",
        label: "Companies",
        icon: <Shirt size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/tenant/products",
    label: "Products",
    icon: <Package size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/tenant/products",
        label: "Products",
        icon: <Package size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/products/service",
        label: "Services",
        icon: <Package size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/products/categories",
        label: "Categories",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/tenant/accounts",
    label: "Accounts",
    icon: <CreditCard size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/tenant/accounts/income-expenses",
        label: "Income & Expenses",
        icon: <ReceiptText size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/accounts/invoices",
        label: "Invoices",
        icon: <ShoppingCart size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/accounts/quotes",
        label: "Quotes",
        icon: <QuoteIcon size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/tenant/accounts/analysis",
        label: "Analysis",
        icon: <BarChart2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      // {
      //   path: "/tenant/accounts/transactions",
      //   label: "Transactions",
      //   icon: <DollarSign size={ICON_SIZE} />,
      //   type: "menu",
      //   children: null,
      // },
    ],
  },
  {
    path: "/tenant/orders",
    label: "Orders",
    icon: <List size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/tenant/subscription",
    label: "Subscription",
    icon: <CheckCircle size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/tenant/support",
    label: "Support",
    icon: <HelpCircle size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/tenant/settings",
    label: "Settings",
    icon: <Settings size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
] satisfies Links[];
export const Route = createFileRoute("/tenant")({
  component: RouteComponent,
  notFoundComponent: () => (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold">404 - Page Not Found</h1>
          <p className="py-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Link to="/tenant" className="btn btn-primary">
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
    console.log(auth?.user.userType);

    if (auth?.user?.userType != "tenant") {
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
          <div className="font-semibold h-18 text-lg flex  items-center px-4 border-b border-base-300/40">
            KINOVIA CRM
          </div>
          <ul className="menu  w-full space-y-2 ">
            {nav_links.map((link) => {
              const int_url = link.path;
              if (link.type === "submenu" && link.children) {
                // Submenus should be open by default
                return (
                  <li key={link.path} className="mb-2">
                    <details open>
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
