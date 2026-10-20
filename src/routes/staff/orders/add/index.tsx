import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import OrderForm from "../-components/OrderForm";

export const Route = createFileRoute("/staff/orders/add/")({
  component: AddOrderPage,
});

function AddOrderPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <Link to="/staff/orders" className="btn btn-ghost btn-sm w-fit gap-2">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>
      <PageHeader title="Create order" description="Choose a customer, add products, and set fulfillment details." />
      <OrderForm />
    </div>
  );
}
