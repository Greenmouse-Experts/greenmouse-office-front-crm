import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Banknote, FileText, Search } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { ModalHandle } from "@/components/DialogModal";
import { useInvoiceRevenueReport, useOutstandingInvoicesReport, type OutstandingInvoiceItem } from "@/api/reportsApi";
import type { Invoice } from "@/api/financeApi";
import RecordPaymentModal from "../Invoices/-components/RecordPaymentModal";

export const Route = createFileRoute("/staff/accounts/debts/")({ component: DebtsPage });

const PAGE_SIZE = 20;
const currencies = ["NGN", "USD", "EUR", "GBP"];
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(value) || 0);

const dateLabel = (value?: string) => {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const overdueDays = (value?: string) => {
  if (!value) return 0;
  const due = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000));
};

const customerName = (item: OutstandingInvoiceItem) => {
  const customer = item.customer;
  return customer?.name || [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || customer?.companyName || "Unassigned customer";
};

function DebtsPage() {
  const [currency, setCurrency] = useState("NGN");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const paymentModalRef = useRef<ModalHandle>(null);
  const reportQuery = useOutstandingInvoicesReport({ currency, page, limit: PAGE_SIZE });
  const revenueQuery = useInvoiceRevenueReport({ currency });
  const report = reportQuery.data;

  const openPayment = (item: OutstandingInvoiceItem) => {
    setPaymentInvoice({
      id: item.id,
      invoiceNumber: item.invoiceNumber,
      status: item.status,
      currency: item.currency || currency,
      total: Number(item.total),
      paidAmount: Number(item.amountPaid),
      amountDue: Number(item.balanceDue),
      items: [],
    });
    paymentModalRef.current?.open();
  };

  const totalPages = Math.max(1, report?.totalPages || Math.ceil((report?.total || 0) / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader title="Debts" description="Track outstanding invoice balances and record payments as they arrive.">
        <Link to="/staff/accounts/Invoices" className="btn btn-outline btn-sm">
          <FileText className="size-4" aria-hidden="true" /> All invoices
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Banknote className="size-4" aria-hidden="true" /> Total outstanding · {currency}
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {revenueQuery.isLoading ? "…" : revenueQuery.data ? money(revenueQuery.data.outstandingTotal, currency) : "—"}
          </p>
          {revenueQuery.isError && <p className="mt-1 text-xs text-error">Could not load the total balance.</p>}
        </div>
        <div className="rounded-xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Invoices with a balance</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {reportQuery.isLoading ? "…" : report ? new Intl.NumberFormat().format(report.total) : "—"}
          </p>
          <p className="mt-1 text-xs text-base-content/60">Across all pages in {currency}</p>
        </div>
      </div>

      <section className="rounded-xl border border-base-200 bg-base-100 shadow-sm" aria-labelledby="debts-heading">
        <div className="flex flex-col gap-4 border-b border-base-200 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="debts-heading" className="text-lg font-semibold">Outstanding invoices</h2>
            <p className="text-sm text-base-content/60">Sent, partially paid, and overdue invoices.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <SimpleInput label="Search this page" aria-label="Search this page" icon={<Search className="size-4" aria-hidden="true" />} placeholder="Invoice or customer" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="w-full sm:w-32">
              <LocalSelect label="Currency" aria-label="Currency" value={currency} onChange={(event) => {
                setCurrency(event.target.value);
                setPage(1);
                setSearch("");
              }}>
                {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
              </LocalSelect>
            </div>
          </div>
        </div>

        <PageLoader query={reportQuery} loadingText="Loading outstanding invoices...">
          {(data) => {
            const term = search.trim().toLowerCase();
            const visibleInvoices = term
              ? data.data.filter((item) => [item.invoiceNumber, customerName(item), item.customer?.email]
                  .some((value) => value?.toLowerCase().includes(term)))
              : data.data;
            return visibleInvoices.length ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Invoice</th><th>Customer</th><th>Due date</th><th className="text-right">Total</th><th className="text-right">Paid</th><th className="text-right">Balance</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {visibleInvoices.map((item) => {
                    const overdue = overdueDays(item.dueDate);
                    return (
                      <tr key={item.id}>
                        <td>
                          <Link to="/staff/accounts/Invoices/$id" params={{ id: item.id }} className="font-medium text-primary hover:underline">{item.invoiceNumber || `#${item.id.slice(0, 8)}`}</Link>
                          <div className="text-xs capitalize text-base-content/50">{item.status}</div>
                        </td>
                        <td><div className="font-medium">{customerName(item)}</div>{item.customer?.email && <div className="text-xs text-base-content/60">{item.customer.email}</div>}</td>
                        <td><div>{dateLabel(item.dueDate)}</div>{overdue > 0 && <span className="badge badge-error badge-soft badge-sm mt-1">{overdue} days overdue</span>}</td>
                        <td className="text-right tabular-nums">{money(item.total, item.currency || currency)}</td>
                        <td className="text-right tabular-nums">{money(item.amountPaid, item.currency || currency)}</td>
                        <td className="text-right font-semibold tabular-nums">{money(item.balanceDue, item.currency || currency)}</td>
                        <td className="text-right"><button type="button" className="btn btn-primary btn-sm whitespace-nowrap" onClick={() => openPayment(item)}>Record payment <ArrowRight className="size-3.5" aria-hidden="true" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="font-medium">{search ? "No matches on this page" : "No outstanding invoices"}</p>
              <p className="mt-1 text-sm text-base-content/60">{search ? "Try another search or change pages." : `There are no invoice balances in ${currency}.`}</p>
            </div>
          );}}
        </PageLoader>

        {report && report.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-200 px-5 py-4 text-sm">
            <span className="text-base-content/60">Page {report.page || page} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1 || reportQuery.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <button type="button" className="btn btn-outline btn-sm" disabled={page >= totalPages || reportQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
      <RecordPaymentModal invoice={paymentInvoice} modalRef={paymentModalRef} />
    </div>
  );
}
