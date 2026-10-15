import { useAuth, clear_user } from "@/store/authStore";
import { useAdminProfile } from "@/api/adminApi";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut, ShieldCheck, Settings } from "lucide-react";

export default function AdminUserProfile() {
  const [auth] = useAuth();
  const { data: profile } = useAdminProfile();
  const navigate = useNavigate();

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : auth?.user?.firstName && auth?.user?.lastName
      ? `${auth.user.firstName} ${auth.user.lastName}`
      : "Greenmouse Admin";

  const email = profile?.email || auth?.user?.email || "admin@greenmouse.com";

  const handleLogout = () => {
    clear_user();
    navigate({ to: "/auth/admin" as any });
  };

  return (
    <div className="flex items-center border-l pl-3 ml-2 border-base-300">
      <div className="mr-3 md:flex flex-col text-sm text-right hidden">
        <span className="font-semibold leading-tight">{displayName}</span>
        <div className="flex items-center justify-end gap-1 text-xs text-primary font-medium">
          <ShieldCheck className="size-3" />
          <span>Super Admin</span>
        </div>
      </div>
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          className="btn btn-circle avatar ring ring-primary/20 ring-offset-2 ring-offset-base-100"
        >
          <div className="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-30 p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-200 mt-2"
        >
          <li className="menu-title px-4 py-2 border-b border-base-200">
            <span className="font-semibold text-base-content block truncate">
              {displayName}
            </span>
            <span className="text-xs text-base-content/60 block truncate">
              {email}
            </span>
          </li>
          <li>
            <Link
              to="/admin/settings/profile"
              className="flex items-center gap-2 py-2"
            >
              <User className="size-4" />
              <span>Admin Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className="flex items-center gap-2 py-2">
              <Settings className="size-4" />
              <span>Settings & Security</span>
            </Link>
          </li>
          <li className="border-t border-base-200 mt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-error py-2"
            >
              <LogOut className="size-4" />
              <span>Log Out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
