import { useRef, useState } from "react";
import { Download, Eye, Mail, ReceiptText, RotateCcw, Ban } from "lucide-react";
import { toast } from "sonner";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import {
  downloadReceiptPdf,
  useInvoicePayments,
  useInvoiceReceipts,
  useReceipt,
  useReceiptHtml,
  useResendReceipt,
  useVoidReceipt,
  type Invoice,
  type Receipt,
} from "@/api/financeApi";

const dateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount);

const errorMessage = (error: unknown, fallback: string) => {
  const response = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const message = response.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || response.message || fallback;
};

export default function InvoiceReceipts({ invoice }: { invoice: Invoice }) {
  const receiptsQuery = useInvoiceReceipts(invoice.id);
  const paymentsQuery = useInvoicePayments(invoice.id);
  const receiptModalRef = useRef<ModalHandle>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const receiptQuery = useReceipt(selectedReceiptId ?? undefined);
  const htmlQuery = useReceiptHtml(selectedReceiptId ?? undefined);
  const resendReceipt = useResendReceipt();
  const voidReceipt = useVoidReceipt();
  const currency = invoice.currency || "NGN";

  const openReceipt = (id: string) => {
    setSelectedReceiptId(id);
    setConfirmVoid(false);
    setVoidReason("");
    receiptModalRef.current?.open();
  };

  const closeReceipt = () => {
    receiptModalRef.current?.close();
    setSelectedReceiptId(null);
  };

  const downloadPdf = async (receipt: Receipt) => {
    setDownloadingId(receipt.id);
    try {
      const blob = await downloadReceiptPdf(receipt.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${receipt.receiptNumber || receipt.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error(errorMessage(error, "Could not download the receipt."));
    } finally {
      setDownloadingId(null);
    }
  };

  const resend = async (id: string) => {
    try {
      await resendReceipt.mutateAsync(id);
      toast.success("Receipt email sent.");
    } catch (error) {
      toast.error(errorMessage(error, "Could not resend the receipt."));
    }
  };

  const voidSelected = async () => {
    if (!selectedReceiptId) return;
    try {
      await voidReceipt.mutateAsync({ id: selectedReceiptId, reason: voidReason.trim() || undefined });
      toast.success("Receipt voided. The invoice balance has been updated.");
      closeReceipt();
    } catch (error) {
      toast.error(errorMessage(error, "Could not void the receipt."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="card border border-base-200 bg-base-100 shadow-sm" aria-labelledby="payments-heading">
        <div className="card-body gap-4 p-5 sm:p-6">
          <div>
            <h3 id="payments-heading" className="text-lg font-semibold">Payment history</h3>
            <p className="text-sm text-base-content/60">Payments recorded against this invoice.</p>
          </div>
          <PageLoader query={paymentsQuery} loadingText="Loading payments...">
            {(payments) => payments.length ? (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead><tr><th>Paid at</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th><th>Receipt</th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{dateTime(payment.paidAt)}</td>
                        <td className="capitalize">{payment.method?.replaceAll("_", " ") || "—"}</td>
                        <td>{payment.reference || "—"}</td>
                        <td className="text-right font-medium">{money(Number(payment.amount) || 0, currency)}</td>
                        <td>{payment.receiptId ? (
                          <button type="button" className="link link-primary" onClick={() => openReceipt(payment.receiptId!)}>
                            {payment.receiptNumber || "View receipt"}
                          </button>
                        ) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-base-content/60">No payments recorded yet.</p>}
          </PageLoader>
        </div>
      </section>

      <section className="card border border-base-200 bg-base-100 shadow-sm" aria-labelledby="receipts-heading">
        <div className="card-body gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-primary" aria-hidden="true" />
            <h3 id="receipts-heading" className="text-lg font-semibold">Receipts</h3>
          </div>
          <PageLoader query={receiptsQuery} loadingText="Loading receipts..." emptyState={{
            title: "No receipts yet",
            description: "A receipt will appear here when you record a payment.",
          }}>
            {(receipts) => (
              <ul className="divide-y divide-base-200 rounded-lg border border-base-200">
                {receipts.map((receipt) => (
                  <li key={receipt.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{receipt.receiptNumber || receipt.id}</span>
                        <span className={`badge badge-sm ${receipt.status === "void" ? "badge-error badge-soft" : "badge-success badge-soft"}`}>
                          {receipt.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-base-content/60">
                        {dateTime(receipt.issuedAt || receipt.createdAt)} · {money(Number(receipt.amount) || 0, receipt.currency || currency)}
                      </p>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openReceipt(receipt.id)}>
                      <Eye className="size-4" aria-hidden="true" /> View receipt
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </PageLoader>
        </div>
      </section>

      <Modal ref={receiptModalRef} title="Receipt details">
        {selectedReceiptId && (
          <PageLoader query={receiptQuery} loadingText="Loading receipt...">
            {(receipt) => (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold">{receipt.receiptNumber || receipt.id}</h4>
                    <p className="text-sm text-base-content/60">Issued {dateTime(receipt.issuedAt || receipt.createdAt)}</p>
                  </div>
                  <span className={`badge ${receipt.status === "void" ? "badge-error badge-soft" : "badge-success badge-soft"}`}>
                    {receipt.status}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 rounded-lg bg-base-200/50 p-4 text-sm">
                  <div><dt className="text-base-content/60">Amount</dt><dd className="font-semibold">{money(Number(receipt.amount) || 0, receipt.currency || currency)}</dd></div>
                  <div><dt className="text-base-content/60">Paid at</dt><dd>{dateTime(receipt.payment?.paidAt)}</dd></div>
                  <div><dt className="text-base-content/60">Method</dt><dd className="capitalize">{receipt.payment?.method?.replaceAll("_", " ") || "—"}</dd></div>
                  <div><dt className="text-base-content/60">Reference</dt><dd className="break-all">{receipt.payment?.reference || "—"}</dd></div>
                </dl>
                {receipt.voidReason && <p className="text-sm text-error">Void reason: {receipt.voidReason}</p>}
                <div>
                  <h5 className="mb-2 font-medium">Preview</h5>
                  {htmlQuery.isLoading && <div className="flex h-48 items-center justify-center"><span className="loading loading-spinner" /></div>}
                  {htmlQuery.isError && (
                    <div className="rounded-lg border border-error/30 p-4 text-sm text-error">
                      {errorMessage(htmlQuery.error, "Could not load the receipt preview.")}
                      <button type="button" className="btn btn-ghost btn-sm ml-2" onClick={() => htmlQuery.refetch()}><RotateCcw className="size-4" /> Retry</button>
                    </div>
                  )}
                  {htmlQuery.data && <iframe title={`Preview of ${receipt.receiptNumber}`} srcDoc={htmlQuery.data} sandbox="" className="h-96 w-full rounded-lg border border-base-200 bg-white" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary btn-sm" disabled={downloadingId === receipt.id} onClick={() => downloadPdf(receipt)}>
                    <Download className="size-4" /> {downloadingId === receipt.id ? "Downloading..." : "Download PDF"}
                  </button>
                  {receipt.status !== "void" && (
                    <>
                      <button type="button" className="btn btn-outline btn-sm" disabled={resendReceipt.isPending} onClick={() => resend(receipt.id)}>
                        <Mail className="size-4" /> {resendReceipt.isPending ? "Sending..." : "Resend email"}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => setConfirmVoid(true)}>
                        <Ban className="size-4" /> Void receipt
                      </button>
                    </>
                  )}
                </div>
                {confirmVoid && receipt.status !== "void" && (
                  <div className="space-y-3 rounded-lg border border-error/30 bg-error/5 p-4">
                    <p className="text-sm font-medium">Voiding this receipt reverses its payment and updates the invoice balance.</p>
                    <input aria-label="Reason for voiding" className="input input-bordered w-full" placeholder="Reason (optional)" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-error btn-sm" disabled={voidReceipt.isPending} onClick={voidSelected}>
                        {voidReceipt.isPending ? "Voiding..." : "Confirm void"}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmVoid(false)} disabled={voidReceipt.isPending}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </PageLoader>
        )}
      </Modal>
    </div>
  );
}
