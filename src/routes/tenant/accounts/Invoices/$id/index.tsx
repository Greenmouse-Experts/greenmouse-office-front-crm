import SimpleTitle from "@/components/SimpleTitle";
import { useParams, Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  useInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
} from "@/api/financeApi";
import PageLoader from "@/components/layout/PageLoader";
import { toast } from "sonner";
import {
  Send,
  CheckCircle,
  FileText,
  Calendar,
  Building,
  Mail,
  Edit,
} from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/Invoices/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });

  const query = useInvoice(id);
  const sendInvoice = useSendInvoice();
  const markPaid = useMarkInvoicePaid();

  const invoice = query.data;

  const handleSend = async () => {
    if (!id) return;
    try {
      await sendInvoice.mutateAsync(id);
      toast.success("Invoice sent to customer.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invoice.");
    }
  };

  const handleMarkPaid = async () => {
    if (!id) return;
    try {
      await markPaid.mutateAsync(id);
      toast.success("Invoice marked as paid.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to mark invoice paid.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <SimpleTitle
        backBtn
        title={`Invoice Details: ${invoice?.invoiceNumber || id || ""}`}
      />

      <PageLoader query={query}>
        {invoice && (
          <section className="space-y-6 max-w-4xl mx-auto">
            {/* Header / Brand Card */}
            <div className="card bg-primary text-primary-content shadow-lg">
              <div className="card-body p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-white/20 grid place-items-center font-semibold text-2xl">
                    <FileText className="size-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
                    </h2>
                    <p className="text-sm opacity-85">Greenmouse CRM Billing</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-lg bg-white/20 text-white font-semibold uppercase tracking-wider border-0">
                    {invoice.status || "Draft"}
                  </span>
                  <Link
                    to="/tenant/accounts/Invoices/$id/edit"
                    params={{ id: invoice.id }}
                    className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Edit className="size-4 mr-1" /> Edit
                  </Link>
                  {invoice.status !== "paid" && (
                    <button
                      onClick={handleMarkPaid}
                      disabled={markPaid.isPending}
                      className="btn btn-sm btn-accent text-accent-content"
                    >
                      <CheckCircle className="size-4 mr-1" /> Mark Paid
                    </button>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={sendInvoice.isPending}
                    className="btn btn-sm btn-neutral"
                  >
                    <Send className="size-4 mr-1" /> Send
                  </button>
                </div>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-base-content">
                      <Calendar className="size-4 text-primary" /> Invoice
                      Schedule
                    </h3>
                    <div className="text-sm space-y-1 text-base-content/70">
                      <div>
                        <span className="font-semibold">Issued Date: </span>
                        {invoice.issuedDate
                          ? new Date(invoice.issuedDate).toLocaleDateString()
                          : "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Due Date: </span>
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "—"}
                      </div>
                      {invoice.paidAt && (
                        <div>
                          <span className="font-semibold text-success">
                            Paid Date:{" "}
                          </span>
                          {new Date(invoice.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-base-content">
                      <Building className="size-4 text-primary" /> Billed To
                    </h3>
                    <div className="text-sm space-y-1 text-base-content/70">
                      <div className="font-semibold text-base-content">
                        {invoice.contact
                          ? `${invoice.contact.firstName} ${invoice.contact.lastName}`
                          : "General Customer"}
                      </div>
                      {invoice.contact?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="size-3" /> {invoice.contact.email}
                        </div>
                      )}
                      {invoice.billingAddress && (
                        <div>{invoice.billingAddress}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="card bg-base-100 shadow border border-base-200">
              <div className="card-body p-6 space-y-4">
                <h3 className="font-semibold text-base text-base-content">
                  Line Items
                </h3>

                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-base-200/50 text-xs">
                      <tr>
                        <th>ITEM / DESCRIPTION</th>
                        <th className="text-center">QTY</th>
                        <th className="text-right">UNIT RATE</th>
                        <th className="text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="font-medium text-base-content">
                              {item.description}
                            </td>
                            <td className="text-center">{item.qty}</td>
                            <td className="text-right">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="text-right font-semibold">
                              ${(item.qty * item.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-4 text-base-content/60"
                          >
                            No items recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divider"></div>

                <div className="flex justify-end">
                  <div className="w-72 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Subtotal</span>
                      <span className="font-medium">
                        $
                        {(
                          invoice.items?.reduce(
                            (a, b) => a + (b.qty || 1) * (b.unitPrice || 0),
                            0,
                          ) || 0
                        ).toFixed(2)}
                      </span>
                    </div>

                    {!!invoice.discount && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-${Number(invoice.discount).toFixed(2)}</span>
                      </div>
                    )}

                    {!!invoice.tax && (
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Tax</span>
                        <span>+${Number(invoice.tax).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="divider my-1"></div>

                    <div className="flex justify-between text-base font-semibold text-base-content">
                      <span>Total Amount</span>
                      <span className="text-primary">
                        ${(invoice.total || 0).toFixed(2)}{" "}
                        {invoice.currency || "USD"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </PageLoader>
    </section>
  );
}
