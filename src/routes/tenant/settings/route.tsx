import { useLocation } from "@tanstack/react-router";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/tenant/settings")({
  component: RouteComponent,
});

interface Links {
  path: string;
  name: string;
}
[];
const links: Links[] = [
  { path: "/tenant/settings", name: "Profile" },
  { path: "/tenant/settings/theme", name: "Theme" },
  { path: "/tenant/settings/security", name: "Security" },
  { path: "/tenant/settings/notifications", name: "Notifications" },
];

function RouteComponent() {
  const location = useLocation();
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold opacity-90">Account Settings </h2>
        <label
          htmlFor="my-drawer-3"
          className="btn btn-neutral btn-ghost btn-square ml-auto lg:hidden"
        >
          <Menu />
        </label>
      </div>
      <section className=" bg-base-100 rounded-box shadow">
        <div className="drawer lg:drawer-open">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content p-4 ">
            <Outlet />
            {/* Page content here */}
            {/*<label
              htmlFor="my-drawer-3"
              className="btn drawer-button lg:hidden"
            >
              Open drawer
            </label>*/}
          </div>
          <div className="drawer-side ">
            <label
              htmlFor="my-drawer-3"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-100 py-4 min-h-full w-60  space-y-2 border-r border-r-current/20">
              {/* Sidebar content here */}
              <h2 className="text-lg px-3  font-semibold"> Settings</h2>
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    className={`${location.pathname === link.path ? "bg-primary text-primary-content " : ""}   `}
                    to={link.path}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
