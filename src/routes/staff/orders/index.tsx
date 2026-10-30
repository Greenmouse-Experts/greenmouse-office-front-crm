import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";
import PageLoader from "@/components/layout/PageLoader";
import { useContacts } from "@/api/crmApi";
import { useProducts } from "@/api/catalogApi";
import {
  useOrders,
  useOrder,
  useDeleteOrder,
  type Order,
  type OrderItem,
} from "@/api/salesApi";

export const Route = createFileRoute("/staff/orders/")({
  component: RouteComponent,
});

const errorMessage = (error: unknown, fallback: string) => {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${(Number(value) || 0).toFixed(2)}`;
  }
};

const statusBadge = (status?: string) => {
  const value = status?.toLowerCase() || "pending";
  const color = ["completed", "delivered"].includes(value)
    ? "badge-success"
    : value === "cancelled"
      ? "badge-error"
      : value === "processing" || value === "shipped"
        ? "badge-warning"
        : "badge-info";
  return (
    <span
      className={`badge badge-sm badge-soft font-medium capitalize ${color}`}
    >
      {value}
    </span>
  );
};

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const contactsQuery = useContacts();
  const deleteOrder = useDeleteOrder();
  const searchProps = useSearch();
  const detailsModalRef = useRef<ModalHandle>(null);
  const confirmRef = useRef<ConfirmModalHandle>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const detailsQuery = useOrder(selectedOrderId);

  const products = productsQuery.data || [];
  const contacts = contactsQuery.data || [];
  const orders = ordersQuery.data || [];

  const customerName = (order: Order) => {
    const contact =
      order.contact || contacts.find((item) => item.id === order.contactId);
    if (!contact) return "Unassigned";
    return `${contact.firstName} ${contact.lastName}`.trim() || "Unassigned";
  };

  const filteredOrders = useMemo(() => {
    const search = (searchProps.search || "").trim().toLowerCase();
    if (!search) return orders;
    return orders.filter((order) =>
      [
        order.orderNumber,
        order.id,
        customerName(order),
        order.status,
        order.paymentStatus,
      ].some((value) => value?.toLowerCase().includes(search)),
    );
  }, [orders, contacts, searchProps.search]);

  const openDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    detailsModalRef.current?.open();
  };

  const handleDelete = async (order: Order) => {
    const confirmed = await confirmRef.current?.confirm({
      title: "Delete order",
      message: `Delete order ${order.orderNumber || order.id}? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted.");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await ordersQuery.refetch();
      if (selectedOrderId === order.id) detailsModalRef.current?.close();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete order."));
    }
  };

  const columns: columnType<Order>[] = [
    {
      key: "orderNumber",
      label: "Order",
      render: (value: string, order: Order) => (
        <span className="font-mono text-sm font-medium text-base-content">
          {value || `#${order.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      key: "contactId",
      label: "Customer",
      render: (_value: string, order: Order) => (
        <span className="font-medium text-base-content">
          {customerName(order)}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (value: OrderItem[]) => <span>{value?.length ?? 0}</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (value: number, order: Order) => (
        <span className="whitespace-nowrap font-semibold tabular-nums">
          {formatMoney(Number(value) || 0, order.currency || "NGN")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => statusBadge(value),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value: string) => (
        <span className="text-sm capitalize text-base-content/70">
          {value || "Unpaid"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => (
        <span className="whitespace-nowrap text-sm text-base-content/70">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Order>[] = [
    { key: "view", label: "View Details", action: openDetails },
    {
      key: "delete",
      label: "Delete Order",
      render: () => (
        <span className="font-medium text-error">Delete Order</span>
      ),
      action: handleDelete,
    },
  ];

  const selectedOrder = detailsQuery.data;

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Orders"
        description="Track customer orders, fulfillment, and payment status."
      >
        <Link to="/staff/orders/add" className="btn btn-primary btn-sm">
          <Plus className="size-4" /> Create Order
        </Link>
      </PageHeader>

      <SimpleContainer
        title={<>Order Management {ordersQuery.data && `(${orders.length})`}</>}
      >
        <ContainerRow
          searchProps={searchProps}
          showSearch
          searchPlaceholder="Search orders..."
        />
        <PageLoader
          query={ordersQuery}
          emptyState={{
            title: "No Orders Yet",
            description:
              "Create an order to start tracking purchases and fulfillment.",
            actionText: "Create Order",
            onAction: () => {
              void navigate({ to: "/staff/orders/add" });
            },
          }}
        >
          {() =>
            filteredOrders.length ? (
              <>
                <div className="hidden lg:block">
                  <CustomTable
                    ring={false}
                    data={filteredOrders}
                    columns={columns}
                    actions={actions}
                  />
                </div>
                <div className="divide-y divide-base-200 rounded-b-box border border-base-200 bg-base-100 lg:hidden">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-base-content">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </p>
                          <p className="mt-1 truncate text-sm text-base-content/70">
                            {customerName(order)}
                          </p>
                        </div>
                        <span className="max-w-[55%] break-all text-right text-sm font-semibold tabular-nums">
                          {formatMoney(
                            Number(order.total) || 0,
                            order.currency || "NGN",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {statusBadge(order.status)}
                          <span className="text-xs text-base-content/70">
                            {order.items?.length ?? 0} items
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDetails(order)}
                          className="btn btn-sm btn-ghost text-primary"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-b-box border border-base-200 bg-base-100 px-4 py-10 text-center text-sm text-base-content/70">
                No orders match your search.
              </div>
            )
          }
        </PageLoader>
      </SimpleContainer>

      <Modal ref={detailsModalRef} title="Order Details">
        {detailsQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-base-content/70">
            Loading order details...
          </div>
        ) : detailsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-sm">
            <span>Order details could not be loaded.</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => detailsQuery.refetch()}
            >
              Try again
            </button>
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </p>
                <p className="mt-1 text-sm text-base-content/70">
                  {customerName(selectedOrder)}
                </p>
              </div>
              {statusBadge(selectedOrder.status)}
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-base-200/50 p-3">
                <p className="text-xs text-base-content/70">Payment</p>
                <p className="mt-1 font-medium capitalize">
                  {selectedOrder.paymentStatus || "Unpaid"}
                </p>
              </div>
              <div className="rounded-lg bg-base-200/50 p-3">
                <p className="text-xs text-base-content/70">Created</p>
                <p className="mt-1 font-medium">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Items</h4>
              <div className="divide-y divide-base-200 rounded-lg border border-base-200">
                {selectedOrder.items?.length ? (
                  selectedOrder.items.map((item, index) => {
                    const product =
                      item.product ||
                      products.find((entry) => entry.id === item.productId);
                    return (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-start justify-between gap-3 p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            {product?.name || "Product"}
                          </p>
                          <p className="text-xs text-base-content/70">
                            {item.qty} ×{" "}
                            {formatMoney(
                              item.unitPrice,
                              selectedOrder.currency || "NGN",
                            )}
                          </p>
                        </div>
                        <span className="shrink-0 font-medium tabular-nums">
                          {formatMoney(
                            item.qty * item.unitPrice,
                            selectedOrder.currency || "NGN",
                          )}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-3 text-sm text-base-content/70">
                    No item details available.
                  </p>
                )}
              </div>
            </div>
            {selectedOrder.notes && (
              <div className="rounded-lg bg-base-200/50 p-3 text-sm text-base-content/70">
                <h4 className="mb-2 font-semibold text-base-content">Notes</h4>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5">{children}</ol>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {selectedOrder.notes}
                </ReactMarkdown>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-base-200 pt-4">
              <span className="font-semibold tabular-nums">
                {formatMoney(
                  selectedOrder.total || 0,
                  selectedOrder.currency || "NGN",
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => detailsModalRef.current?.close()}
                >
                  Close
                </button>
                <Link
                  to="/staff/orders/$id/edit"
                  params={{ id: selectedOrder.id }}
                  className="btn btn-sm btn-primary"
                >
                  Edit Order
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
