import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useOrder } from "@/api/salesApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import OrderForm from "../-components/OrderForm";

export const Route = createFileRoute("/staff/orders/$id/edit")({
  component: EditOrderPage,
});

function EditOrderPage() {
  const { id } = Route.useParams();
  const orderQuery = useOrder(id);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <Link to="/staff/orders" className="btn btn-ghost btn-sm w-fit gap-2">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>
      <PageHeader title="Edit order" description="Update products, payment status, and fulfillment details." />
      <PageLoader query={orderQuery} loadingText="Loading order...">
        {(order) => <OrderForm key={order.id} order={order} />}
      </PageLoader>
    </div>
  );
}
