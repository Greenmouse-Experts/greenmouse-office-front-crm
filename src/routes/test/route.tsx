import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/test"! <Outlet />
    </div>
  );
}
