import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tenant/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to: "/tenant/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/tenant/settings/"!</div>;
}
