import SimpleTitle from "@/components/SimpleTitle";
import { useParams } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useAdminCrossInvoice } from "@/api/adminApi";
import PageLoader from "@/components/layout/PageLoader";

export const Route = createFileRoute("/admin/accounts/Invoices/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });

  const query = useAdminCrossInvoice(id);
  const invoice = query.data;

  return (
    <section className="space-y-6">
      <SimpleTitle
        backBtn
        title={`Invoice Details: ${id?.slice(0, 8).toUpperCase() || ""}`}
      />

      <PageLoader query={query}>
        {() => (
          <section className="space-y-6 max-w-4xl mx-auto">
            {invoice && (
              <>
                <div className="card bg-base-100 border border-base-200 shadow-sm p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-200 pb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-base-content">
                        Invoice #
                        {invoice.invoiceNumber ||
                          invoice.id?.slice(0, 8).toUpperCase()}
                      </h2>
                      <p className="text-xs text-base-content/60">
                        Issued:{" "}
                        {invoice.issuedDate
                          ? new Date(invoice.issuedDate).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <span
                      className={`badge badge-md font-semibold capitalize ${
                        invoice.status === "paid"
                          ? "badge-success text-white"
                          : invoice.status === "pending"
                            ? "badge-warning text-white"
                            : "badge-ghost"
                      }`}
                    >
                      {invoice.status || "Draft"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-xs font-semibold text-base-content/60 uppercase mb-1">
                        Billed To
                      </h4>
                      <p className="text-base font-semibold text-base-content">
                        {invoice.contact
                          ? `${invoice.contact.firstName} ${invoice.contact.lastName}`
                          : "Direct Client"}
                      </p>
                      {invoice.contact?.email && (
                        <p className="text-xs text-base-content/60">
                          {invoice.contact.email}
                        </p>
                      )}
                      {invoice.billingAddress && (
                        <p className="text-xs text-base-content/60 mt-1">
                          {invoice.billingAddress}
                        </p>
                      )}
                    </div>
                    <div className="sm:text-right">
                      <h4 className="text-xs font-semibold text-base-content/60 uppercase mb-1">
                        Payment & Terms
                      </h4>
                      <p className="text-xs text-base-content/70">
                        Due Date:{" "}
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "—"}
                      </p>
                      <p className="text-xs font-mono text-base-content/50 mt-1">
                        Tenant ID: {invoice.tenantId || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="card bg-base-100 border border-base-200 shadow-sm p-6">
                  <h3 className="font-semibold text-base text-base-content mb-4">
                    Line Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr className="text-xs text-base-content/60">
                          <th>Item / Description</th>
                          <th className="text-center">Qty</th>
                          <th className="text-right">Unit Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items && invoice.items.length > 0 ? (
                          invoice.items.map((it: any, idx: number) => (
                            <tr key={idx} className="border-b border-base-200">
                              <td className="font-medium">
                                {it.product?.name ||
                                  it.description ||
                                  `Item #${idx + 1}`}
                              </td>
                              <td className="text-center">{it.qty || 1}</td>
                              <td className="text-right">
                                {invoice.currency || "₦"}
                                {Number(it.unitPrice || 0).toLocaleString()}
                              </td>
                              <td className="text-right font-semibold">
                                {invoice.currency || "₦"}
                                {(
                                  (Number(it.qty) || 1) *
                                  (Number(it.unitPrice) || 0)
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center text-base-content/50 py-4"
                            >
                              No line items specified.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mt-6">
                    <div className="w-64 space-y-2 text-sm">
                      <div className="flex justify-between text-base-content/70">
                        <span>Subtotal:</span>
                        <span>
                          {invoice.currency || "₦"}
                          {Number(
                            invoice.subtotal || invoice.total || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      {invoice.tax > 0 && (
                        <div className="flex justify-between text-base-content/70">
                          <span>Tax:</span>
                          <span>
                            +{invoice.currency || "₦"}
                            {Number(invoice.tax).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {invoice.discount > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Discount:</span>
                          <span>
                            -{invoice.currency || "₦"}
                            {Number(invoice.discount).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="divider my-1"></div>
                      <div className="flex justify-between text-base font-semibold text-base-content">
                        <span>Total:</span>
                        <span>
                          {invoice.currency || "₦"}
                          {Number(invoice.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </PageLoader>
    </section>
  );
}
