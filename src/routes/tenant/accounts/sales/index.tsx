import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tenant/accounts/sales/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tenant/accounts/sales/"!</div>;
}
