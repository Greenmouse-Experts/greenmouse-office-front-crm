import { Bell, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUnreadNotificationCount } from "@/api/notifications-api";
import TenantUserProfile from "./TenantUserProfile";

export default function AdminHeader() {
  const { data: unreadCount } = useUnreadNotificationCount();

  return (
    <div className="h-18 px-4 flex sticky top-0 bg-base-100  border-b border-current/10 shadow z-20 items-center">
      <label
        htmlFor="tenant-drawer"
        className="btn btn-square btn-ghost lg:hidden"
      >
        <Menu />
      </label>
      <h2 className="text-current/80 font-semibold text-md md:text-xl">
        Staff DashBoard
      </h2>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/staff/notifications"
          className="btn btn-ghost btn-square relative"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell className="size-5" aria-hidden="true" />
          {!!unreadCount && (
            <span className="badge badge-error badge-xs absolute -right-1 -top-1 min-w-5 text-[10px]" aria-hidden="true">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <TenantUserProfile />
      </div>
    </div>
  );
}
