import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useContacts } from "@/api/crmApi";
import { useProducts } from "@/api/catalogApi";
import { useCreateOrder, useUpdateOrder, type Order, type OrderItem } from "@/api/salesApi";
import SimpleInput from "@/components/inputs/SimpleInput";
import PriceInput from "@/components/inputs/PriceInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import MarkdownTextArea from "@/components/inputs/MarkdownTextArea";

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
  contactId: "", currency: "NGN", discount: 0, tax: 0,
  status: "pending", paymentStatus: "unpaid", notes: "",
};
const emptyItem = (): OrderItem => ({ productId: "", qty: 1, unitPrice: 0 });
const errorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || "Failed to save order. Please try again.";
};
const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value) || 0);
  } catch {
    return `${currency} ${(Number(value) || 0).toFixed(2)}`;
  }
};

export default function OrderForm({ order }: { order?: Order }) {
  const navigate = useNavigate();
  const productsQuery = useProducts();
  const contactsQuery = useContacts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const [items, setItems] = useState<OrderItem[]>(() =>
    order?.items?.length
      ? order.items.map(({ productId, qty, unitPrice }) => ({ productId, qty, unitPrice }))
      : [emptyItem()],
  );
  const methods = useForm<OrderFormValues>({ defaultValues: order ? {
    contactId: order.contactId || "",
    currency: order.currency || "NGN",
    discount: Number(order.discount) || 0,
    tax: Number(order.tax) || 0,
    status: order.status || "pending",
    paymentStatus: order.paymentStatus || "unpaid",
    notes: order.notes || "",
  } : defaultValues });
  useEffect(() => {
    if (!order) return;
    methods.reset({
      contactId: order.contactId || "",
      currency: order.currency || "NGN",
      discount: Number(order.discount) || 0,
      tax: Number(order.tax) || 0,
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "unpaid",
      notes: order.notes || "",
    });
    setItems(order.items?.length
      ? order.items.map(({ productId, qty, unitPrice }) => ({ productId, qty, unitPrice }))
      : [emptyItem()]);
  }, [order, methods.reset]);

  const products = productsQuery.data || [];
  const contacts = contactsQuery.data || [];
  const currency = methods.watch("currency") || "NGN";
  const discount = Number(methods.watch("discount")) || 0;
  const tax = Number(methods.watch("tax")) || 0;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  const total = Math.max(0, subtotal - discount + tax);
  const isSaving = createOrder.isPending || updateOrder.isPending;

  const changeProduct = (index: number, productId: string) => {
    const product = products.find((item) => item.id === productId);
    setItems((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, productId, unitPrice: product ? Number(product.price) || 0 : 0 } : item,
    ));
  };
  const changeItemNumber = (index: number, field: "qty" | "unitPrice", value: number) => {
    setItems((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    ));
  };
  const onSubmit = async (values: OrderFormValues) => {
    if (items.length === 0 || items.some((item) =>
      !item.productId || !Number.isInteger(Number(item.qty)) || Number(item.qty) < 1 ||
      !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0,
    )) {
      toast.error("Choose a product and enter a valid quantity and price for each item.");
      return;
    }
    const payload = {
      items: items.map(({ productId, qty, unitPrice }) => ({ productId, qty: Number(qty), unitPrice: Number(unitPrice) })),
      contactId: values.contactId || (order ? null : undefined),
      currency: values.currency,
      discount: Number(values.discount) || 0,
      tax: Number(values.tax) || 0,
      status: values.status,
      paymentStatus: values.paymentStatus,
      notes: values.notes.trim(),
    };
    try {
      if (order) {
        await updateOrder.mutateAsync({ id: order.id, ...payload });
        toast.success("Order updated successfully.");
      } else {
        await createOrder.mutateAsync(payload);
        toast.success("Order created successfully.");
      }
      await navigate({ to: "/staff/orders" });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5 rounded-xl bg-base-100 p-5 sm:p-8">
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
              <p className="text-sm text-error">
                Customers could not be loaded. You can still create an
                unassigned order.
              </p>
            )}

            <div className="space-y-3 border-t border-base-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Order Items</h4>
                  <p className="text-xs text-base-content/70">
                    Add products, quantities, and negotiated unit prices.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() =>
                    setItems((current) => [...current, emptyItem()])
                  }
                >
                  <Plus className="size-3.5" /> Add Item
                </button>
              </div>

              {productsQuery.isLoading ? (
                <div className="py-4 text-center text-sm text-base-content/70">
                  Loading product list...
                </div>
              ) : productsQuery.isError ? (
                <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
                  Products could not be loaded. Please reload the page before
                  creating an order.
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning-content">
                  No products are available yet. Add products in the catalog
                  before creating an order.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-base-200 bg-base-200/30 p-3 sm:grid-cols-[1.5fr_0.8fr_1fr_auto] sm:items-end"
                    >
                      <LocalSelect
                        label={`Item #${index + 1}`}
                        value={item.productId}
                        onChange={(e) => changeProduct(index, e.target.value)}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (
                            {formatMoney(Number(product.price) || 0, currency)})
                          </option>
                        ))}
                      </LocalSelect>
                      <SimpleInput
                        label="Qty"
                        type="number"
                        min="1"
                        step="1"
                        value={item.qty}
                        onChange={(e) =>
                          changeItemNumber(
                            index,
                            "qty",
                            Math.max(1, Number(e.target.value) || 1),
                          )
                        }
                      />
                      <PriceInput
                        label="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) =>
                          changeItemNumber(
                            index,
                            "unitPrice",
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label="Remove item"
                        disabled={items.length === 1}
                        className="btn btn-ghost btn-sm text-error self-end disabled:opacity-30"
                        onClick={() =>
                          setItems((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 border-t border-base-200 pt-4 sm:grid-cols-2">
              <SimpleInput
                label="Discount"
                type="number"
                min="0"
                step="0.01"
                {...methods.register("discount", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
              <SimpleInput
                label="Tax"
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
              <LocalSelect
                label="Payment status"
                {...methods.register("paymentStatus")}
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially paid</option>
                <option value="paid">Paid</option>
              </LocalSelect>
            </div>
            <Controller
              control={methods.control}
              name="notes"
              render={({ field }) => (
                <MarkdownTextArea
                  label="Notes"
                  placeholder="Optional fulfillment notes..."
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="rounded-lg bg-base-200/60 p-3 text-sm tabular-nums">
              <div className="flex justify-between text-base-content/70">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base-content/70">
                <span>Discount</span>
                <span>−{formatMoney(discount, currency)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base-content/70">
                <span>Tax</span>
                <span>+{formatMoney(tax, currency)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-base-300 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatMoney(total, currency)}</span>
              </div>
            </div>
        <div className="flex justify-end gap-2 border-t border-base-200 pt-4">
          <Link to="/staff/orders" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={isSaving || productsQuery.isLoading || productsQuery.isError || products.length === 0}>
            {isSaving ? "Saving..." : order ? "Save changes" : "Create order"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
