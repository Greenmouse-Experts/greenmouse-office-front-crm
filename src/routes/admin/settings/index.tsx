import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to: "/admin/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/admin/settings/"!</div>;
}
