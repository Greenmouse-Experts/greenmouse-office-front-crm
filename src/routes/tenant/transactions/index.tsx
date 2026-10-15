import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import TransactionsLedger from "../-components/TransactionsLedger";

export const Route = createFileRoute("/tenant/transactions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <></>;
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Transactions Ledger"
        description="Audit company movements, debits, credits, and processed receipts"
      />
      <TransactionsLedger />
    </div>
  );
}
