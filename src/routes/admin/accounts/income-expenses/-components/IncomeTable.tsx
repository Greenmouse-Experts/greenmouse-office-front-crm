import { useState, useRef, useMemo } from "react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import { useAdminCrossIncome } from "@/api/adminApi";
import type { IncomeRecord } from "@/api/financeApi";
import { TrendingUp } from "lucide-react";

interface IncomeTableProps {
  searchTerm?: string;
}

export default function IncomeTable({ searchTerm = "" }: IncomeTableProps) {
  const query = useAdminCrossIncome();
  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(
    null,
  );

  const handleOpenDetails = (income: IncomeRecord) => {
    setSelectedIncome(income);
    detailsModalRef.current?.open();
  };

  const rawList: IncomeRecord[] = (query.data || []) as IncomeRecord[];

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawList;
    const term = searchTerm.toLowerCase();
    return rawList.filter(
      (item) =>
        item.source?.toLowerCase().includes(term) ||
        item.category?.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term),
    );
  }, [rawList, searchTerm]);

  const columns = [
    {
      key: "source",
      label: "Source / Client",
      render: (source: string, item: IncomeRecord) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {source || "General Revenue"}
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
      label: "Revenue Stream",
      render: (_value: string, item: IncomeRecord) => (
        <span className="badge badge-ghost badge-md font-medium">
          {item.category?.name || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val: any) => (
        <span className="font-semibold text-success">
          +₦{Number(val || 0).toLocaleString()}
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
      label: "Recorded Date",
      render: (val: any) => (
        <span className="text-sm text-base-content/60">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<IncomeRecord>[] = [
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
        {selectedIncome && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-base-200 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  Income #{selectedIncome.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-sm text-base-content/60">
                  {selectedIncome.createdAt
                    ? new Date(selectedIncome.createdAt).toLocaleString()
                    : ""}
                </p>
              </div>
              <span
                className={`badge badge-md font-semibold capitalize ${
                  selectedIncome.status === "approved" ||
                  selectedIncome.status === "paid"
                    ? "badge-success text-white"
                    : "badge-warning text-white"
                }`}
              >
                {selectedIncome.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Amount
                </span>
                <span className="text-xl font-semibold text-success">
                  +₦{Number(selectedIncome.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Stream Type
                </span>
                <span className="text-sm font-semibold text-base-content">
                  {selectedIncome.category?.name || "—"}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Source / Payee
                </span>
                <span className="text-sm font-semibold text-base-content">
                  {selectedIncome.source || "General Client"}
                </span>
              </div>
              <div className="bg-base-200/50 p-3 rounded-lg">
                <span className="text-sm text-base-content/60 block">
                  Tenant Scope
                </span>
                <span className="text-sm font-mono text-base-content truncate block">
                  {(selectedIncome as any).tenantId || "Platform Tenant"}
                </span>
              </div>
            </div>

            {selectedIncome.description && (
              <div className="bg-base-200/30 p-3 rounded-lg text-sm text-base-content/70">
                <span className="font-semibold block text-sm mb-1">
                  Description:
                </span>
                {selectedIncome.description}
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
