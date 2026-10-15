import { Bell, Menu, Shield } from "lucide-react";
import AdminUserProfile from "./AdminUserProfile";

export default function AdminHeader() {
  return (
    <div className="h-18 px-4 flex sticky top-0 bg-base-100 border-b border-current/10 shadow z-20 items-center">
      <label
        htmlFor="admin-drawer"
        className="btn btn-square btn-ghost lg:hidden"
      >
        <Menu />
      </label>

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary hidden sm:flex">
          <Shield className="size-5" />
        </div>
        <div>
          <h2 className="text-current font-semibold text-md md:text-lg">
            Super Admin Portal
          </h2>
          <span className="text-xs text-base-content/60 hidden sm:inline-block">
            Greenmouse CRM Platform Management
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="btn btn-ghost btn-circle relative"
        >
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <Bell className="size-5" />
        </button>
        <AdminUserProfile />
      </div>
    </div>
  );
}
