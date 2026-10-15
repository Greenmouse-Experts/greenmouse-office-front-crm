import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import PageLoader from "@/components/layout/PageLoader";
import { useContacts } from "@/api/crmApi";
import { useProducts } from "@/api/catalogApi";
import {
  useOrders,
  useOrder,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  type Order,
  type OrderItem,
} from "@/api/salesApi";

export const Route = createFileRoute("/tenant/orders/")({
  component: RouteComponent,
});

interface OrderFormValues {
  contactId: string;
  currency: string;
  discount: number;
  tax: number;
  status: string;
  paymentStatus: string;
  notes: string;
}

const defaultValues: OrderFormValues = {
  contactId: "",
  currency: "NGN",
  discount: 0,
  tax: 0,
  status: "pending",
  paymentStatus: "unpaid",
  notes: "",
};

const emptyItem = (): OrderItem => ({ productId: "", qty: 1, unitPrice: 0 });

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      Number(value) || 0,
    );
  } catch {
    return `${currency} ${(Number(value) || 0).toFixed(2)}`;
  }
};

const statusBadge = (status?: string) => {
  const value = status?.toLowerCase() || "pending";
  const color =
    ["completed", "delivered"].includes(value)
      ? "badge-success"
      : value === "cancelled"
        ? "badge-error"
        : value === "processing" || value === "shipped"
          ? "badge-warning"
          : "badge-info";
  return (
    <span className={`badge badge-sm badge-soft font-medium capitalize ${color}`}>
      {value}
    </span>
  );
};

function RouteComponent() {
  const ordersQuery = useOrders();
  const productsQuery = useProducts();
  const contactsQuery = useContacts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const searchProps = useSearch();
  const formModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const methods = useForm<OrderFormValues>({ defaultValues });
  const detailsQuery = useOrder(selectedOrderId);

  const products = productsQuery.data || [];
  const contacts = contactsQuery.data || [];
  const orders = ordersQuery.data || [];
  const currency = methods.watch("currency") || "NGN";
  const discount = Number(methods.watch("discount")) || 0;
  const tax = Number(methods.watch("tax")) || 0;
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
    0,
  );
  const total = Math.max(0, subtotal - discount + tax);

  const customerName = (order: Order) => {
    const contact = order.contact || contacts.find((item) => item.id === order.contactId);
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

  const openCreate = () => {
    setEditingOrder(null);
    setItems([emptyItem()]);
    methods.reset(defaultValues);
    formModalRef.current?.open();
  };

  const openDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    detailsModalRef.current?.open();
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setItems(
      order.items?.length
        ? order.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
          }))
        : [emptyItem()],
    );
    methods.reset({
      contactId: order.contactId || "",
      currency: order.currency || "NGN",
      discount: Number(order.discount) || 0,
      tax: Number(order.tax) || 0,
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "unpaid",
      notes: order.notes || "",
    });
    detailsModalRef.current?.close();
    formModalRef.current?.open();
  };

  const changeProduct = (index: number, productId: string) => {
    const product = products.find((item) => item.id === productId);
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, productId, unitPrice: product ? Number(product.price) || 0 : 0 }
          : item,
      ),
    );
  };

  const changeItemNumber = (index: number, field: "qty" | "unitPrice", value: number) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !item.productId ||
          !Number.isInteger(Number(item.qty)) ||
          Number(item.qty) < 1 ||
          !Number.isFinite(Number(item.unitPrice)) ||
          Number(item.unitPrice) < 0,
      )
    ) {
      toast.error("Choose a product and enter a valid quantity and price for each item.");
      return;
    }

    const payload = {
      items: items.map(({ productId, qty, unitPrice }) => ({
        productId,
        qty: Number(qty),
        unitPrice: Number(unitPrice),
      })),
      contactId: values.contactId || (editingOrder ? null : undefined),
      currency: values.currency,
      discount: Number(values.discount) || 0,
      tax: Number(values.tax) || 0,
      status: values.status,
      paymentStatus: values.paymentStatus,
      notes: values.notes.trim(),
    };

    try {
      if (editingOrder) {
        await updateOrder.mutateAsync({ id: editingOrder.id, ...payload });
        toast.success("Order updated successfully.");
      } else {
        await createOrder.mutateAsync(payload);
        toast.success("Order created successfully.");
      }
      formModalRef.current?.close();
      setEditingOrder(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save order. Please try again."));
    }
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm(`Delete order ${order.orderNumber || order.id}?`)) return;
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted.");
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
        <span className="font-medium text-base-content">{customerName(order)}</span>
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
        <span className="text-sm capitalize text-base-content/70">{value || "Unpaid"}</span>
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
      render: () => <span className="font-medium text-error">Delete Order</span>,
      action: handleDelete,
    },
  ];

  const isSaving = createOrder.isPending || updateOrder.isPending;
  const selectedOrder = detailsQuery.data;

  return (
    <div className="space-y-4 pb-12">
      <PageHeader title="Orders" description="Track customer orders, fulfillment, and payment status.">
        <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus className="size-4" /> Create Order
        </button>
      </PageHeader>

      <SimpleContainer title={<>Order Management {ordersQuery.data && `(${orders.length})`}</>}>
        <ContainerRow searchProps={searchProps} showSearch searchPlaceholder="Search orders..." />
        <PageLoader
          query={ordersQuery}
          emptyState={{
            title: "No Orders Yet",
            description: "Create an order to start tracking purchases and fulfillment.",
            actionText: "Create Order",
            onAction: openCreate,
          }}
        >
          {() =>
            filteredOrders.length ? (
              <>
                <div className="hidden lg:block">
                  <CustomTable ring={false} data={filteredOrders} columns={columns} actions={actions} />
                </div>
                <div className="divide-y divide-base-200 rounded-b-box border border-base-200 bg-base-100 lg:hidden">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-base-content">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </p>
                          <p className="mt-1 truncate text-sm text-base-content/70">{customerName(order)}</p>
                        </div>
                        <span className="max-w-[55%] break-all text-right text-sm font-semibold tabular-nums">
                          {formatMoney(Number(order.total) || 0, order.currency || "NGN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {statusBadge(order.status)}
                          <span className="text-xs text-base-content/70">
                            {order.items?.length ?? 0} items
                          </span>
                        </div>
                        <button type="button" onClick={() => openDetails(order)} className="btn btn-sm btn-ghost text-primary">
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

      <Modal ref={formModalRef} title={editingOrder ? "Edit Order" : "Create Order"}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <LocalSelect label="Customer" {...methods.register("contactId")}>
                <option value="">Unassigned</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </LocalSelect>
              <LocalSelect label="Currency" {...methods.register("currency")}>
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </LocalSelect>
            </div>
            {contactsQuery.isError && (
              <p className="text-sm text-error">Customers could not be loaded. You can still create an unassigned order.</p>
            )}

            <div className="space-y-3 border-t border-base-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">Order items</h4>
                  <p className="text-xs text-base-content/70">Choose products and adjust quantities or prices.</p>
                </div>
                <button type="button" className="btn btn-sm btn-ghost text-primary" onClick={() => setItems((current) => [...current, emptyItem()])}>
                  <Plus className="size-4" /> Add item
                </button>
              </div>
              {productsQuery.isLoading ? (
                <p className="py-4 text-sm text-base-content/70">Loading products...</p>
              ) : productsQuery.isError ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-error/10 p-3 text-sm text-error">
                  <span>Products could not be loaded.</span>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => productsQuery.refetch()}>Try again</button>
                </div>
              ) : products.length === 0 ? (
                <p className="rounded-lg bg-base-200 p-3 text-sm text-base-content/70">
                  Add a product before creating an order. <Link to="/tenant/products" className="font-medium text-primary underline">View products</Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-lg border border-base-200 bg-base-200/30 p-3">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_auto] sm:items-end">
                        <div>
                          <label className="mb-1 block text-xs font-medium" htmlFor={`order-product-${index}`}>Product</label>
                          <select
                            id={`order-product-${index}`}
                            value={item.productId}
                            onChange={(event) => changeProduct(index, event.target.value)}
                            className="select select-sm select-bordered w-full"
                            required
                          >
                            <option value="">Select product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium" htmlFor={`order-qty-${index}`}>Qty</label>
                          <input
                            id={`order-qty-${index}`}
                            type="number"
                            min="1"
                            step="1"
                            value={item.qty}
                            onChange={(event) => changeItemNumber(index, "qty", Number(event.target.value))}
                            className="input input-sm input-bordered w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium" htmlFor={`order-price-${index}`}>Unit price</label>
                          <input
                            id={`order-price-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(event) => changeItemNumber(index, "unitPrice", Number(event.target.value))}
                            className="input input-sm input-bordered w-full"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove item ${index + 1}`}
                          title="Remove item"
                          disabled={items.length === 1}
                          onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          className="btn btn-sm btn-ghost justify-self-end text-error"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-right text-xs font-medium tabular-nums text-base-content/70">
                        Line total: {formatMoney((Number(item.qty) || 0) * (Number(item.unitPrice) || 0), currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 border-t border-base-200 pt-4 sm:grid-cols-2">
              <SimpleInput
                label={`Discount (${currency})`}
                type="number"
                min="0"
                step="0.01"
                {...methods.register("discount", { valueAsNumber: true, min: 0 })}
              />
              <SimpleInput
                label={`Tax (${currency})`}
                type="number"
                min="0"
                step="0.01"
                {...methods.register("tax", { valueAsNumber: true, min: 0 })}
              />
              <LocalSelect label="Status" {...methods.register("status")}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </LocalSelect>
              <LocalSelect label="Payment status" {...methods.register("paymentStatus")}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially paid</option>
                <option value="paid">Paid</option>
              </LocalSelect>
            </div>
            <SimpleInput label="Notes" placeholder="Optional fulfillment notes" {...methods.register("notes")} />
            <div className="rounded-lg bg-base-200/60 p-3 text-sm tabular-nums">
              <div className="flex justify-between text-base-content/70"><span>Subtotal</span><span>{formatMoney(subtotal, currency)}</span></div>
              <div className="mt-1 flex justify-between text-base-content/70"><span>Discount</span><span>−{formatMoney(discount, currency)}</span></div>
              <div className="mt-1 flex justify-between text-base-content/70"><span>Tax</span><span>+{formatMoney(tax, currency)}</span></div>
              <div className="mt-2 flex justify-between border-t border-base-300 pt-2 font-semibold"><span>Total</span><span>{formatMoney(total, currency)}</span></div>
            </div>
            <div className="flex justify-end gap-2 border-t border-base-200 pt-4">
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => formModalRef.current?.close()}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-primary" disabled={isSaving || productsQuery.isLoading || productsQuery.isError || products.length === 0}>
                {isSaving ? "Saving..." : editingOrder ? "Save Changes" : "Create Order"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <Modal ref={detailsModalRef} title="Order Details">
        {detailsQuery.isLoading ? (
          <div className="py-8 text-center text-sm text-base-content/70">Loading order details...</div>
        ) : detailsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-sm">
            <span>Order details could not be loaded.</span>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => detailsQuery.refetch()}>Try again</button>
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold">{selectedOrder.orderNumber || selectedOrder.id}</p>
                <p className="mt-1 text-sm text-base-content/70">{customerName(selectedOrder)}</p>
              </div>
              {statusBadge(selectedOrder.status)}
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-base-200/50 p-3"><p className="text-xs text-base-content/70">Payment</p><p className="mt-1 font-medium capitalize">{selectedOrder.paymentStatus || "Unpaid"}</p></div>
              <div className="rounded-lg bg-base-200/50 p-3"><p className="text-xs text-base-content/70">Created</p><p className="mt-1 font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "—"}</p></div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Items</h4>
              <div className="divide-y divide-base-200 rounded-lg border border-base-200">
                {selectedOrder.items?.length ? selectedOrder.items.map((item, index) => {
                  const product = item.product || products.find((entry) => entry.id === item.productId);
                  return (
                    <div key={`${item.productId}-${index}`} className="flex items-start justify-between gap-3 p-3 text-sm">
                      <div className="min-w-0"><p className="font-medium">{product?.name || "Product"}</p><p className="text-xs text-base-content/70">{item.qty} × {formatMoney(item.unitPrice, selectedOrder.currency || "NGN")}</p></div>
                      <span className="shrink-0 font-medium tabular-nums">{formatMoney(item.qty * item.unitPrice, selectedOrder.currency || "NGN")}</span>
                    </div>
                  );
                }) : <p className="p-3 text-sm text-base-content/70">No item details available.</p>}
              </div>
            </div>
            {selectedOrder.notes && <p className="rounded-lg bg-base-200/50 p-3 text-sm text-base-content/70">{selectedOrder.notes}</p>}
            <div className="flex items-center justify-between border-t border-base-200 pt-4">
              <span className="font-semibold tabular-nums">{formatMoney(selectedOrder.total || 0, selectedOrder.currency || "NGN")}</span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => detailsModalRef.current?.close()}>Close</button>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openEdit(selectedOrder)}>Edit Order</button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
