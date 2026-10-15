import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endpoint does not exist for admin: GET /v1/admins/sales does not exist on backend.
// Route commented out / redirected to accounts.
export const Route = createFileRoute("/admin/accounts/sales/")({
  component: () => <Navigate to="/admin/accounts/income-expenses" replace />,
});

/*
Original stub commented out because backend does not provide /admins/sales:

function RouteComponent() {
  return <div>Hello "/admin/accounts/sales/"!</div>;
}
*/
