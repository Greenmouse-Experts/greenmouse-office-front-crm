import { useMemo, useRef, useState, type ReactNode } from "react";
import CustomTable from "@/components/tables/CustomTable";
import SimpleContainer from "@/components/SimpleContainer";
import SearchBar from "@/components/Searchbar";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useTransactions, type Transaction } from "@/api/financeApi";
import { ArrowUpRight, ArrowDownLeft, Activity, CreditCard } from "lucide-react";

interface TransactionsLedgerProps {
  title?: string;
  limit?: number;
  showHeaderMetrics?: boolean;
}

const EMPTY_TRANSACTIONS: Transaction[] = [];

const signedAmount = (tx: Transaction) => {
  const amount = Number(tx.amount) || 0;
  const type = tx.type?.toLowerCase() || "";
  if (["expense", "withdrawal", "debit"].includes(type)) {
    return -Math.abs(amount);
  }
  if (["income", "deposit", "invoice payment", "credit"].includes(type)) {
    return Math.abs(amount);
  }
  return amount;
};

const formatAmount = (amount: number) =>
  `₦${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: string, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime
    ? date.toLocaleString()
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const normalizedStatus = (status?: string) => {
  const value = status?.toLowerCase();
  if (["completed", "success", "approved", "paid"].includes(value || "")) {
    return "completed";
  }
  if (["failed", "rejected"].includes(value || "")) return "failed";
  return value || "unknown";
};

const statusClass = (status?: string) => {
  const value = normalizedStatus(status);
  if (value === "completed") return "badge-success";
  if (value === "failed") return "badge-error";
  if (value === "pending") return "badge-warning";
  return "badge-ghost";
};

function MetricCard({
  label,
  value,
  icon,
  tone = "text-primary bg-primary/10",
  detail,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: string;
  detail?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-base-200 bg-base-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-base-content/70">{label}</p>
          <p className="mt-2 break-words text-xl font-semibold tabular-nums text-base-content">
            {value}
          </p>
          {detail && <p className="mt-1 text-xs text-base-content/60">{detail}</p>}
        </div>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsLedger({
  title = "Financial Transactions Ledger",
  limit,
  showHeaderMetrics = true,
}: TransactionsLedgerProps) {
  const query = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const transactionsList = query.data ?? EMPTY_TRANSACTIONS;
  const totals = useMemo(() => {
    return transactionsList.reduce(
      (sum, tx) => {
        if (normalizedStatus(tx.status) !== "completed") {
          return sum;
        }
        const amount = signedAmount(tx);
        if (amount > 0) sum.inflow += amount;
        if (amount < 0) sum.outflow += Math.abs(amount);
        return sum;
      },
      { inflow: 0, outflow: 0 },
    );
  }, [transactionsList]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactionsList
      .filter((tx) => {
        const amount = signedAmount(tx);
        if (typeFilter === "inflow" && amount <= 0) return false;
        if (typeFilter === "outflow" && amount >= 0) return false;
        if (
          statusFilter !== "all" &&
          normalizedStatus(tx.status) !== statusFilter
        ) {
          return false;
        }
        if (!term) return true;
        return [
          tx.description,
          tx.type,
          tx.status,
          tx.category,
          tx.reference,
          tx.id,
        ].some((value) => value?.toLowerCase().includes(term));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactionsList, search, typeFilter, statusFilter]);

  const displayedList = limit ? filtered.slice(0, limit) : filtered;
  const hasFilters = !!search.trim() || typeFilter !== "all" || statusFilter !== "all";
  const openDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    detailsModalRef.current?.open();
  };
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (value: string) => (
        <span className="whitespace-nowrap text-sm text-base-content/70">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string, tx: Transaction) => {
        const inflow = signedAmount(tx) >= 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${inflow ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
              {inflow ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
            </span>
            <span className="whitespace-nowrap text-sm font-medium text-base-content">
              {value || (inflow ? "Inflow" : "Outflow")}
            </span>
          </div>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value: string, tx: Transaction) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-base-content" title={value || ""}>
            {value || "Transaction"}
          </p>
          {tx.category && <p className="truncate text-xs text-base-content/60">{tx.category}</p>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span className={`badge badge-sm badge-soft font-medium capitalize ${statusClass(value)}`}>
          {value || "Unknown"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_value: number, tx: Transaction) => {
        const amount = signedAmount(tx);
        return (
          <span className={`whitespace-nowrap text-sm font-semibold tabular-nums ${amount >= 0 ? "text-success" : "text-error"}`}>
            {amount >= 0 ? "+" : "−"}{formatAmount(amount)}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Transaction>[] = [
    { key: "view", label: "View Details", action: openDetails },
  ];

  return (
    <div className="space-y-5">
      {showHeaderMetrics && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total records" value={String(transactionsList.length)} icon={<Activity className="size-5" />} />
          <MetricCard label="Total inflow" value={`+${formatAmount(totals.inflow)}`} detail="Completed transactions" icon={<ArrowDownLeft className="size-5" />} tone="bg-success/10 text-success" />
          <MetricCard label="Total outflow" value={`−${formatAmount(totals.outflow)}`} detail="Completed transactions" icon={<ArrowUpRight className="size-5" />} tone="bg-error/10 text-error" />
          <MetricCard label="Net cashflow" value={`${totals.inflow - totals.outflow >= 0 ? "+" : "−"}${formatAmount(totals.inflow - totals.outflow)}`} detail="Completed transactions" icon={<CreditCard className="size-5" />} tone="bg-primary/10 text-primary" />
        </div>
      )}

      <SimpleContainer
        title={
          <span className="flex items-center gap-2">
            {title}
            {transactionsList.length > 0 && (
              <span className="badge badge-sm badge-ghost font-normal tabular-nums">
                {filtered.length}
              </span>
            )}
          </span>
        }
      >
        <div className="flex flex-col gap-3 border border-base-200 border-b-0 bg-base-100 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search transactions..."
            className="w-full lg:max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by transaction type"
              className="select select-sm select-bordered min-w-0 flex-1 sm:flex-none"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All types</option>
              <option value="inflow">Inflow</option>
              <option value="outflow">Outflow</option>
            </select>
            <select
              aria-label="Filter by transaction status"
              className="select select-sm select-bordered min-w-0 flex-1 sm:flex-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            {hasFilters && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        <PageLoader
          query={query}
          emptyState={{
            title: "No Transactions Found",
            description: "Income and expense records will appear here automatically.",
          }}
        >
          {() =>
            displayedList.length === 0 ? (
              <div className="rounded-b-box border border-base-200 bg-base-100 px-4 py-10 text-center">
                <p className="text-sm text-base-content/70">No transactions match these filters.</p>
                <button type="button" onClick={clearFilters} className="btn btn-sm btn-ghost mt-2 text-primary">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <CustomTable ring={false} data={displayedList} columns={columns} actions={actions} />
                </div>
                <div className="divide-y divide-base-200 rounded-b-box border border-base-200 bg-base-100 lg:hidden">
                  {displayedList.map((tx) => {
                    const amount = signedAmount(tx);
                    return (
                      <div key={tx.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-base-content">{tx.description || "Transaction"}</p>
                            <p className="mt-1 text-xs text-base-content/70">{tx.type || "Transaction"} · {formatDate(tx.date)}</p>
                          </div>
                          <span className={`max-w-[55%] break-all text-right text-sm font-semibold tabular-nums ${amount >= 0 ? "text-success" : "text-error"}`}>
                            {amount >= 0 ? "+" : "−"}{formatAmount(amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className={`badge badge-sm badge-soft font-medium capitalize ${statusClass(tx.status)}`}>
                            {tx.status || "Unknown"}
                          </span>
                          <button type="button" onClick={() => openDetails(tx)} className="btn btn-sm btn-ghost text-primary">
                            View details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          }
        </PageLoader>
      </SimpleContainer>

      <Modal ref={detailsModalRef} title="Transaction Details">
        {selectedTx && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-base-200/60 p-4">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${signedAmount(selectedTx) >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {signedAmount(selectedTx) >= 0 ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
              </span>
              <div className="min-w-0">
                <h4 className="break-words text-base font-semibold text-base-content">
                  {selectedTx.description || "Transaction"}
                </h4>
                <p className="mt-1 text-sm text-base-content/70">{selectedTx.type || "Transaction"}</p>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-base-200/50 p-3">
                <dt className="text-xs text-base-content/70">Amount</dt>
                <dd className={`mt-1 text-lg font-semibold tabular-nums ${signedAmount(selectedTx) >= 0 ? "text-success" : "text-error"}`}>
                  {signedAmount(selectedTx) >= 0 ? "+" : "−"}{formatAmount(signedAmount(selectedTx))}
                </dd>
              </div>
              <div className="rounded-lg bg-base-200/50 p-3">
                <dt className="text-xs text-base-content/70">Status</dt>
                <dd className="mt-1">
                  <span className={`badge badge-sm badge-soft font-medium capitalize ${statusClass(selectedTx.status)}`}>
                    {selectedTx.status || "Unknown"}
                  </span>
                </dd>
              </div>
              <div className="rounded-lg bg-base-200/50 p-3">
                <dt className="text-xs text-base-content/70">Date and time</dt>
                <dd className="mt-1 text-sm font-medium text-base-content">{formatDate(selectedTx.date, true)}</dd>
              </div>
              <div className="rounded-lg bg-base-200/50 p-3">
                <dt className="text-xs text-base-content/70">Category</dt>
                <dd className="mt-1 break-words text-sm font-medium text-base-content">{selectedTx.category || "General"}</dd>
              </div>
              <div className="rounded-lg bg-base-200/50 p-3 sm:col-span-2">
                <dt className="text-xs text-base-content/70">Reference</dt>
                <dd className="mt-1 break-all font-mono text-xs text-base-content">{selectedTx.reference || selectedTx.id}</dd>
              </div>
            </dl>

            <div className="flex justify-end">
              <button type="button" onClick={() => detailsModalRef.current?.close()} className="btn btn-sm btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
