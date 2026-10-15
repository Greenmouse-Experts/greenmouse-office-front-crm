import { useProfile } from "@/store/authStore";
import { useLogout } from "@/helpers/auth";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings, UserCircle } from "lucide-react";
import logoutApi from "@/client/logout";

export default function TenantUserProfile() {
  const [profile] = useProfile();
  const { logout } = useLogout(logoutApi);

  return (
    <div className="flex items-center border-l pl-4 ml-2 border-current/30">
      <div className="mr-2 md:flex flex-col text-sm text-right hidden font-semibold">
        <span className="truncate max-w-[150px]">
          {profile?.companyName || "Tenant User"}
        </span>
        <span className="text-base-content/70 text-xs capitalize">
          {profile?.userType || "Tenant"}
        </span>
      </div>
      <div className="dropdown dropdown-end">
        <div className="flex gap-2 items-center">
          <button className="btn btn-circle size-8 ring ring-primary/20 p-0 overflow-hidden">
            <img
              src="https://github.com/shadcn.png"
              className="w-full h-full object-cover"
              alt="User avatar"
            />
          </button>
        </div>
        <ul className="dropdown-content rounded-box bg-base-100 shadow-xl border border-base-200 min-w-[200px] w-auto menu m-1 p-2 gap-1 z-50">
          <li className="px-4 py-2 border-b border-base-200 mb-1">
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {profile?.companyName}
              </span>
              <span className="text-xs opacity-60 truncate">
                {profile?.email}
              </span>
            </div>
          </li>
          <li>
            <Link
              to="/tenant/settings/profile"
              className="flex items-center gap-2 py-2"
            >
              <UserCircle size={16} />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/tenant/settings"
              className="flex items-center gap-2 py-2"
            >
              <Settings size={16} />
              Settings
            </Link>
          </li>
          <div className="divider my-0 opacity-50"></div>
          <li>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 py-2 text-error hover:bg-error/10 hover:text-error active:bg-error/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
