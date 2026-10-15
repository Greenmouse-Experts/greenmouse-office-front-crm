import { useState, useRef, useMemo } from "react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { useAdminCrossExpenses } from "@/api/adminApi";
import type { ExpenseRecord } from "@/api/financeApi";
import { TrendingDown } from "lucide-react";

interface ExpenseTableProps {
  searchTerm?: string;
}

export default function ExpenseTable({ searchTerm = "" }: ExpenseTableProps) {
  const query = useAdminCrossExpenses();
  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(
    null,
  );

  const handleOpenDetails = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    detailsModalRef.current?.open();
  };

  const rawList: ExpenseRecord[] = (query.data || []) as ExpenseRecord[];

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawList;
    const term = searchTerm.toLowerCase();
    return rawList.filter(
      (item) =>
        item.paidTo?.toLowerCase().includes(term) ||
        item.category?.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term),
    );
  }, [rawList, searchTerm]);

  const columns = [
    {
      key: "paidTo",
      label: "Vendor / Payee",
      render: (paidTo: string, item: ExpenseRecord) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
            <TrendingDown className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {paidTo || "General Expense"}
            </span>
            {item.description && (
              <span className="text-sm text-base-content/50 truncate max-w-xs block">
                {item.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "categoryId",
      label: "Cost Category",
      render: (_value: string, item: ExpenseRecord) => (
        <span className="badge badge-ghost badge-md font-medium">
          {item.category?.name || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val: any) => (
        <span className="font-semibold text-error">
          -₦{Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-warning text-white";
        if (s === "approved" || s === "paid")
          badgeClass = "badge-success text-white";
        else if (s === "rejected") badgeClass = "badge-error text-white";

        return (
          <span
            className={`badge badge-md font-semibold capitalize ${badgeClass}`}
          >
            {status || "Pending"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Incurred Date",
      render: (val: any) => (
        <span className="text-sm text-base-content/60">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<ExpenseRecord>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
  ];

  return (
    <div>
      <QueryCompLayout query={query}>
        {() => (
          <CustomTable
            actions={actions}
            columns={columns}
            data={filteredData}
          />
        )}
      </QueryCompLayout>

      {/* Details Modal */}
      <Modal ref={detailsModalRef}>
        {selectedExpense && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-base-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  Expense #{selectedExpense.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-sm text-base-content/60">
                  {selectedExpense.createdAt
                    ? new Date(selectedExpense.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>
              <span
                className={`badge badge-md font-semibold capitalize ${
                  selectedExpense.status === "approved" ||
                  selectedExpense.status === "paid"
                    ? "badge-success text-white"
                    : "badge-warning text-white"
                }`}
              >
                {selectedExpense.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Amount
                </span>
                <span className="text-xl font-semibold text-error">
                  -₦{Number(selectedExpense.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Category
                </span>
                <span className="text-sm font-semibold text-base-content">
                  {selectedExpense.category?.name || "—"}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Payee / Vendor
                </span>
                <span className="text-sm font-semibold text-base-content">
                  {selectedExpense.paidTo || "General Payee"}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Tenant Scope
                </span>
                <span className="text-sm font-mono text-base-content truncate block">
                  {(selectedExpense as any).tenantId || "Platform Tenant"}
                </span>
              </div>
            </div>

            {selectedExpense.description && (
              <div className="bg-base-200/30 p-3 rounded-lg text-sm text-base-content/70">
                <span className="font-semibold block text-sm mb-1">
                  Description:
                </span>
                {selectedExpense.description}
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
