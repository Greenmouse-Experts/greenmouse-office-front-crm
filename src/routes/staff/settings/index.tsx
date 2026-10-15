import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/staff/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to: "/staff/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/staff/settings/"!</div>;
}
