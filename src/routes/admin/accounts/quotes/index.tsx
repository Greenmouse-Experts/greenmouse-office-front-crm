import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomTable from "@/components/tables/CustomTable";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import StatCard from "@/components/StatCard";
import { useAdminCrossQuotes, useAdminQuoteStats } from "@/api/adminApi";
import type { Quote } from "@/api/salesApi";
import {
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/accounts/quotes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchProps = useSearch();

  const query = useAdminCrossQuotes({
    search: searchProps.search || undefined,
  });
  const statsQuery = useAdminQuoteStats();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const handleOpenDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    detailsModalRef.current?.open();
  };

  const quotesList: Quote[] = (query.data || []) as Quote[];

  const filteredQuotes = useMemo(() => {
    return quotesList.filter((q) => {
      if (statusFilter !== "all" && q.status?.toLowerCase() !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [quotesList, statusFilter]);

  const totalQuotes = statsQuery.data?.total ?? quotesList.length;
  const acceptedQuotes =
    statsQuery.data?.accepted ??
    quotesList.filter((q) => q.status?.toLowerCase() === "accepted").length;
  const pendingQuotes =
    statsQuery.data?.pending ??
    quotesList.filter((q) => q.status?.toLowerCase() === "pending").length;
  const rejectedQuotes =
    statsQuery.data?.rejected ??
    quotesList.filter((q) => q.status?.toLowerCase() === "rejected").length;

  const columns = [
    {
      key: "quoteNumber",
      label: "Quote #",
      render: (val: any, item: Quote) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            <FileText className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {val || `QUO-${item.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-sm text-base-content/50">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "clientName",
      label: "Client / Company",
      render: (val: any, item: any) => (
        <div>
          <span className="font-medium text-base-content text-sm block">
            {val || item.contact?.firstName
              ? `${item.contact?.firstName || ""} ${item.contact?.lastName || ""}`.trim()
              : "General Client"}
          </span>
          {item.contact?.email && (
            <span className="text-sm text-base-content/50 block">
              {item.contact.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val: any, item: any) => (
        <span className="font-semibold text-base-content">
          {item.currency || "₦"}
          {Number(val || item.total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-warning text-white";
        if (s === "accepted") badgeClass = "badge-success text-white";
        else if (s === "rejected") badgeClass = "badge-error text-white";
        else if (s === "expired") badgeClass = "badge-ghost";

        return (
          <span
            className={`badge badge-md font-semibold capitalize ${badgeClass}`}
          >
            {status || "Pending"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Quote>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cross-Tenant Quotes Audit"
        description="Inspect, audit, and track sales estimates and proposals across all platform tenants"
      >
        <button
          onClick={() => query.refetch()}
          className="btn btn-outline btn-sm gap-2"
          disabled={query.isFetching}
        >
          <RefreshCw
            size={15}
            className={query.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </PageHeader>

      <PageLoader query={query}>
        {() => (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Quotes"
                value={totalQuotes}
                icon={<FileText className="size-6" />}
                variant="primary"
              />
              <StatCard
                title="Pending"
                value={pendingQuotes}
                icon={<Clock className="size-6" />}
                variant="warning"
              />
              <StatCard
                title="Accepted"
                value={acceptedQuotes}
                icon={<CheckCircle2 className="size-6" />}
                variant="success"
              />
              <StatCard
                title="Rejected"
                value={rejectedQuotes}
                icon={<DollarSign className="size-6" />}
                variant="error"
              />
            </div>

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search quotes..."
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Quotes", key: "all" },
                    { label: "Pending", key: "pending" },
                    { label: "Accepted", key: "accepted" },
                    { label: "Rejected", key: "rejected" },
                    { label: "Expired", key: "expired" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`btn btn-sm rounded-full text-sm ${
                        statusFilter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </ContainerRow>

              <CustomTable
                actions={actions}
                columns={columns}
                data={filteredQuotes}
              />
            </SimpleContainer>

            {/* Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedQuote && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-base-200 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-base-content">
                        Quote #{selectedQuote.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-base-content/60">
                        {selectedQuote.createdAt
                          ? new Date(selectedQuote.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`badge badge-md font-semibold capitalize ${
                        selectedQuote.status === "accepted"
                          ? "badge-success text-white"
                          : selectedQuote.status === "rejected"
                            ? "badge-error text-white"
                            : "badge-warning text-white"
                      }`}
                    >
                      {selectedQuote.status || "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Client
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedQuote.clientName ||
                          (selectedQuote as any).contact?.firstName ||
                          "Direct Client"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Quote Value
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {(selectedQuote as any).currency || "₦"}
                        {Number(
                          selectedQuote.amount ||
                            (selectedQuote as any).total ||
                            0,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Tenant Scope
                      </span>
                      <span className="text-sm font-mono text-base-content truncate block">
                        {(selectedQuote as any).tenantId || "Platform Tenant"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Valid Until
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {(selectedQuote as any).validUntil ||
                          (selectedQuote as any).dueDate ||
                          "—"}
                      </span>
                    </div>
                  </div>

                  {selectedQuote.description && (
                    <div className="bg-base-200/30 p-3 rounded-lg text-sm text-base-content/70">
                      <span className="font-semibold block text-sm mb-1">
                        Proposal Notes:
                      </span>
                      {selectedQuote.description}
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
        )}
      </PageLoader>
    </div>
  );
}
