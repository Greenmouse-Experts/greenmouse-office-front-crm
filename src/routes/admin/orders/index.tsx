import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { useSearch } from "@/stores/data";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw,
} from "lucide-react";
import {
  useAdminCrossOrders,
  useAdminOrderStats,
  useAdminCrossContacts,
} from "@/api/adminApi";
import type { Order } from "@/api/salesApi";

export const Route = createFileRoute("/admin/orders/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchProps = useSearch();

  const query = useAdminCrossOrders({
    search: searchProps.search || undefined,
  });
  const statsQuery = useAdminOrderStats();
  const contactsQuery = useAdminCrossContacts();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    detailsModalRef.current?.open();
  };

  const rawOrders: Order[] = (query.data || []) as Order[];

  const filteredOrders = useMemo(() => {
    return rawOrders.filter((ord) => {
      if (
        statusFilter !== "all" &&
        ord.status?.toLowerCase() !== statusFilter
      ) {
        return false;
      }
      return true;
    });
  }, [rawOrders, statusFilter]);

  const totalOrders = statsQuery.data?.total ?? rawOrders.length;
  const pendingOrders =
    statsQuery.data?.pending ??
    rawOrders.filter((o) => o.status?.toLowerCase() === "pending").length;
  const processingOrders =
    statsQuery.data?.processing ??
    rawOrders.filter((o) => o.status?.toLowerCase() === "processing").length;
  const completedOrders =
    statsQuery.data?.completed ??
    rawOrders.filter((o) => o.status?.toLowerCase() === "completed").length;

  const columns = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (val: any, item: Order) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {val || `ORD-${item.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-sm text-base-content/50">
              {item.items?.length || 0} line item(s)
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Customer / Contact",
      render: (val: any, item: Order) => {
        const contact =
          val ||
          (contactsQuery.data || []).find((c: any) => c.id === item.contactId);
        return (
          <div>
            <span className="font-medium text-base-content text-sm">
              {contact
                ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
                  contact.email ||
                  "Direct Customer"
                : "Direct Customer"}
            </span>
            {contact?.email && (
              <span className="text-sm text-base-content/50 block">
                {contact.email}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "total",
      label: "Order Value",
      render: (val: any, item: Order) => {
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
      key: "paymentStatus",
      label: "Payment",
      render: (val: any) => {
        const isPaid = val?.toLowerCase() === "paid";
        return (
          <span
            className={`badge badge-md font-semibold capitalize ${
              isPaid ? "badge-success text-white" : "badge-ghost"
            }`}
          >
            {val || "unpaid"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-warning text-white";
        if (s === "completed") badgeClass = "badge-success text-white";
        else if (s === "processing") badgeClass = "badge-info text-white";
        else if (s === "cancelled") badgeClass = "badge-error text-white";

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

  const actions: Actions<Order>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Audit, monitor, and inspect fulfillment orders across all platform tenants"
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
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-base-content/60 uppercase">
                      Total Orders
                    </p>
                    <h3 className="text-2xl font-semibold text-base-content mt-1">
                      {totalOrders}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <ShoppingBag className="size-5" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-base-content/60 uppercase">
                      Pending
                    </p>
                    <h3 className="text-2xl font-semibold text-warning mt-1">
                      {pendingOrders}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10 text-warning border border-warning/20">
                    <Clock className="size-5" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-base-content/60 uppercase">
                      Processing
                    </p>
                    <h3 className="text-2xl font-semibold text-info mt-1">
                      {processingOrders}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-info/10 text-info border border-info/20">
                    <Truck className="size-5" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-base-content/60 uppercase">
                      Completed
                    </p>
                    <h3 className="text-2xl font-semibold text-success mt-1">
                      {completedOrders}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20">
                    <CheckCircle2 className="size-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search orders..."
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Orders", key: "all" },
                    { label: "Pending", key: "pending" },
                    { label: "Processing", key: "processing" },
                    { label: "Completed", key: "completed" },
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
                data={filteredOrders}
              />
            </SimpleContainer>

            {/* Order Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedOrder && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-base-200 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-base-content">
                        Order #
                        {selectedOrder.orderNumber ||
                          selectedOrder.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-base-content/60">
                        {selectedOrder.createdAt
                          ? new Date(selectedOrder.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`badge badge-md font-semibold capitalize ${
                        selectedOrder.status === "completed"
                          ? "badge-success text-white"
                          : selectedOrder.status === "processing"
                            ? "badge-info text-white"
                            : "badge-warning text-white"
                      }`}
                    >
                      {selectedOrder.status || "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Customer
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedOrder.contact
                          ? `${selectedOrder.contact.firstName} ${selectedOrder.contact.lastName}`
                          : "Direct Customer"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Payment Status
                      </span>
                      <span className="text-sm font-semibold capitalize text-base-content">
                        {selectedOrder.paymentStatus || "Unpaid"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Total Amount
                      </span>
                      <span className="text-base font-semibold text-base-content">
                        {selectedOrder.currency || "₦"}
                        {Number(
                          selectedOrder.total ??
                            selectedOrder.items?.reduce(
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
                  </div>

                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-base-content/70 uppercase">
                        Line Items ({selectedOrder.items.length})
                      </h4>
                      <div className="divide-y divide-base-200 rounded-lg border border-base-200 overflow-hidden text-sm">
                        {selectedOrder.items.map((it: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 flex items-center justify-between bg-base-100"
                          >
                            <div>
                              <span className="font-medium text-base-content block">
                                {it.product?.name ||
                                  `Product ID: ${it.productId}`}
                              </span>
                              <span className="text-sm text-base-content/50">
                                {it.qty} × {selectedOrder.currency || "₦"}
                                {Number(it.unitPrice || 0).toLocaleString()}
                              </span>
                            </div>
                            <span className="font-semibold text-base-content">
                              {selectedOrder.currency || "₦"}
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

                  {selectedOrder.notes && (
                    <div className="bg-base-200/30 p-3 rounded-lg text-sm text-base-content/70">
                      <span className="font-semibold block text-sm mb-1">
                        Order Notes:
                      </span>
                      {selectedOrder.notes}
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
