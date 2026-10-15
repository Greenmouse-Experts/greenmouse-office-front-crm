import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import InvoicesStat from "./-components/InvocesStat";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import PageHeader from "@/components/Headers/PageHeader";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { useAdminCrossInvoices, useAdminInvoiceStats } from "@/api/adminApi";
import type { Invoice } from "@/api/financeApi";
import { FileText, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/accounts/Invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchProps = useSearch();

  const query = useAdminCrossInvoices({
    search: searchProps.search || undefined,
  });
  const statsQuery = useAdminInvoiceStats();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    detailsModalRef.current?.open();
  };

  const invoicesList: Invoice[] = (query.data || []) as Invoice[];

  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((inv) => {
      if (
        statusFilter !== "all" &&
        inv.status?.toLowerCase() !== statusFilter
      ) {
        return false;
      }
      return true;
    });
  }, [invoicesList, statusFilter]);

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (val: any, item: Invoice) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            <FileText className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {val || `INV-${item.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-sm text-base-content/50">
              {item.items?.length || 0} line items
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Customer / Client",
      render: (val: any, item: Invoice) => (
        <div>
          <div className="font-medium text-base-content">
            {val ? `${val.firstName} ${val.lastName}` : "Direct Client"}
          </div>
          <div className="text-sm text-base-content/50">
            {val?.email || item.billingAddress || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "issuedDate",
      label: "Dates",
      render: (val: any, item: Invoice) => (
        <div className="text-sm space-y-0.5">
          <div className="text-base-content/80">
            Issued: {val ? new Date(val).toLocaleDateString() : "—"}
          </div>
          <div className="text-base-content/50">
            Due:{" "}
            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      label: "Amount",
      render: (val: any, item: Invoice) => {
        const computed =
          val ??
          item.items?.reduce(
            (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1),
            0,
          );
        return (
          <span className="font-semibold text-base-content">
            {item.currency || "₦"}
            {Number(computed || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-ghost";
        if (s === "paid") badgeClass = "badge-success text-white";
        else if (s === "pending" || s === "sent")
          badgeClass = "badge-warning text-white";
        else if (s === "overdue" || s === "cancelled")
          badgeClass = "badge-error text-white";

        return (
          <span
            className={`badge badge-md font-semibold capitalize ${badgeClass}`}
          >
            {status || "Draft"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Invoice>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices Audit"
        description="Audit billing, receivables, and payment status across all platform tenants"
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
            <InvoicesStat invoices={invoicesList} statsData={statsQuery.data} />

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search invoices by number or customer..."
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Invoices", key: "all" },
                    { label: "Paid", key: "paid" },
                    { label: "Pending", key: "pending" },
                    { label: "Overdue", key: "overdue" },
                    { label: "Cancelled", key: "cancelled" },
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
                data={filteredInvoices}
              />
            </SimpleContainer>

            {/* Invoice Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedInvoice && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-base-200 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-base-content">
                        Invoice #
                        {selectedInvoice.invoiceNumber ||
                          selectedInvoice.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-base-content/60">
                        {selectedInvoice.issuedDate
                          ? new Date(
                              selectedInvoice.issuedDate,
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`badge badge-md font-semibold capitalize ${
                        selectedInvoice.status === "paid"
                          ? "badge-success text-white"
                          : selectedInvoice.status === "pending"
                            ? "badge-warning text-white"
                            : "badge-ghost"
                      }`}
                    >
                      {selectedInvoice.status || "Draft"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Customer
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedInvoice.contact
                          ? `${selectedInvoice.contact.firstName} ${selectedInvoice.contact.lastName}`
                          : "Direct Client"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Total Amount
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {selectedInvoice.currency || "₦"}
                        {Number(
                          selectedInvoice.total ??
                            selectedInvoice.items?.reduce(
                              (s, it) =>
                                s +
                                (Number(it.unitPrice) || 0) *
                                  (Number(it.qty) || 1),
                              0,
                            ) ??
                            0,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Tenant Scope
                      </span>
                      <span className="text-sm font-mono text-base-content truncate block">
                        {(selectedInvoice as any).tenantId || "Platform Tenant"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Due Date
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedInvoice.dueDate
                          ? new Date(
                              selectedInvoice.dueDate,
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {selectedInvoice.items &&
                    selectedInvoice.items.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-base-content/70 uppercase">
                          Line Items ({selectedInvoice.items.length})
                        </h4>
                        <div className="divide-y divide-base-200 rounded-lg border border-base-200 overflow-hidden text-sm">
                          {selectedInvoice.items.map((it: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 flex items-center justify-between bg-base-100"
                            >
                              <div>
                                <span className="font-medium text-base-content block">
                                  {it.product?.name ||
                                    it.description ||
                                    `Item #${idx + 1}`}
                                </span>
                                <span className="text-sm text-base-content/50">
                                  {it.qty} × {selectedInvoice.currency || "₦"}
                                  {Number(it.unitPrice || 0).toLocaleString()}
                                </span>
                              </div>
                              <span className="font-semibold text-base-content">
                                {selectedInvoice.currency || "₦"}
                                {(
                                  (Number(it.qty) || 1) *
                                  (Number(it.unitPrice) || 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {(selectedInvoice as any).notes && (
                    <div className="bg-base-200/30 p-3 rounded-lg text-sm text-base-content/70">
                      <span className="font-semibold block text-sm mb-1">
                        Invoice Notes:
                      </span>
                      {(selectedInvoice as any).notes}
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
