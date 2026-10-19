import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import PriceInput from "@/components/inputs/PriceInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateInvoice, type InvoiceItem } from "@/api/financeApi";
import { useContacts } from "@/api/crmApi";
import { toast } from "sonner";
import { Plus, Search, Trash2, X } from "lucide-react";
import MarkdownTextArea from "@/components/inputs/MarkdownTextArea";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useOrders, useQuotes } from "@/api/salesApi";

export const Route = createFileRoute("/staff/accounts/Invoices/add/")({
  component: RouteComponent,
});

type ReferenceKind = "orderId" | "quoteId" | "contactId";

const referenceLabels: Record<ReferenceKind, string> = {
  orderId: "Order",
  quoteId: "Quote",
  contactId: "Customer / Contact",
};

interface FormValues {
  issuedDate: string;
  dueDate: string;
  contactId: string;
  orderId: string;
  quoteId: string;
  billingAddress: string;
  currency: string;
  tax: number;
  discount: number;
}

function RouteComponent() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const contactsQuery = useContacts();
  const ordersQuery = useOrders();
  const quotesQuery = useQuotes();
  const pickerRef = useRef<ModalHandle>(null);
  const [pickerKind, setPickerKind] = useState<ReferenceKind>("contactId");
  const [pickerSearch, setPickerSearch] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "",
      qty: 1,
      unitPrice: 0,
    },
  ]);

  const methods = useForm<FormValues>({
    defaultValues: {
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      contactId: "",
      orderId: "",
      quoteId: "",
      billingAddress: "",
      currency: "NGN",
      tax: 0,
      discount: 0,
    },
  });

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0 }]);
  };

  const openPicker = (kind: ReferenceKind) => {
    setPickerKind(kind);
    setPickerSearch("");
    pickerRef.current?.open();
  };

  const selectReference = (id: string) => {
    methods.setValue(pickerKind, id, { shouldDirty: true });
    pickerRef.current?.close();
  };

  const orderId = methods.watch("orderId");
  const quoteId = methods.watch("quoteId");
  const contactId = methods.watch("contactId");
  const selectedOrder = ordersQuery.data?.find((order) => order.id === orderId);
  const selectedQuote = quotesQuery.data?.find((quote) => quote.id === quoteId);
  const selectedContact = contactsQuery.data?.find(
    (contact) => contact.id === contactId,
  );

  const referenceFields = [
    {
      kind: "orderId" as const,
      value: orderId,
      selected: selectedOrder
        ? `Order ${selectedOrder.orderNumber || `#${selectedOrder.id.slice(0, 8)}`}`
        : orderId,
    },
    {
      kind: "quoteId" as const,
      value: quoteId,
      selected: selectedQuote
        ? `${selectedQuote.clientName || "Quote"} · #${selectedQuote.id.slice(0, 8)}`
        : quoteId,
    },
    {
      kind: "contactId" as const,
      value: contactId,
      selected: selectedContact
        ? `${selectedContact.firstName} ${selectedContact.lastName}`.trim() ||
          selectedContact.email
        : contactId,
    },
  ];

  const renderPickerOptions = (
    options: { id: string; title: string; detail: string }[],
  ) => {
    const search = pickerSearch.trim().toLowerCase();
    const filtered = search
      ? options.filter((option) =>
          `${option.title} ${option.detail} ${option.id}`
            .toLowerCase()
            .includes(search),
        )
      : options;

    if (!filtered.length) {
      return (
        <p className="py-8 text-center text-sm text-base-content/60">
          {options.length
            ? "No matches found."
            : `No ${referenceLabels[pickerKind].toLowerCase()} records available.`}
        </p>
      );
    }

    return (
      <ul className="max-h-80 divide-y divide-base-200 overflow-y-auto rounded-lg border border-base-200">
        {filtered.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-base-200 focus-visible:bg-base-200"
              onClick={() => selectReference(option.id)}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {option.title}
                </span>
                <span className="block truncate text-xs text-base-content/60">
                  {option.detail}
                </span>
              </span>
              {methods.getValues(pickerKind) === option.id && (
                <span className="badge badge-primary badge-sm">Selected</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Invoice must contain at least one item.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const subtotal = items.reduce(
    (acc, curr) =>
      acc + (Number(curr.qty) || 0) * (Number(curr.unitPrice) || 0),
    0,
  );
  const currency = methods.watch("currency") || "NGN";
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      amount,
    );
  const discount = Number(methods.watch("discount")) || 0;
  const tax = Number(methods.watch("tax")) || 0;
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const onSubmit = async (data: FormValues) => {
    if (items.some((i) => !i.description.trim())) {
      toast.error("Please provide descriptions for all line items.");
      return;
    }

    const discountVal = Number(data.discount) || 0;
    const taxVal = Number(data.tax) || 0;

    try {
      const invoice = await createInvoice.mutateAsync({
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        contactId: data.contactId || undefined,
        orderId: data.orderId || undefined,
        quoteId: data.quoteId || undefined,
        billingAddress: data.billingAddress,
        currency: data.currency,
        items,
        discount: discountVal,
        tax: taxVal,
        status: "draft",
      });
      toast.success(
        invoice?.invoiceNumber
          ? `Invoice "${invoice.invoiceNumber}" created successfully!`
          : "Invoice created successfully!",
      );
      navigate({ to: "/staff/accounts/Invoices" });
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Failed to create invoice. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <SimpleTitle title="Create New Invoice" backBtn />
      <section className="p-6 bg-base-100 shadow rounded-box">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormWrapper title="Invoice Details">
                <p className="text-sm text-base-content/70">
                  An invoice number will be generated when you save.
                </p>
                <SimpleInput
                  label="Issue Date"
                  type="date"
                  {...methods.register("issuedDate", {
                    required: "Issue Date is required",
                  })}
                />
                <SimpleInput
                  label="Due Date"
                  type="date"
                  {...methods.register("dueDate", {
                    required: "Due Date is required",
                  })}
                />
                <LocalSelect label="Currency" {...methods.register("currency")}>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </LocalSelect>
              </FormWrapper>

              <FormWrapper title="Customer & Billing Details">
                {referenceFields.map(({ kind, value, selected }) => (
                  <div key={kind} className="space-y-2">
                    <span className="text-sm font-semibold">
                      {referenceLabels[kind]}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline min-w-0 flex-1 justify-between font-normal"
                        onClick={() => openPicker(kind)}
                      >
                        <span className="truncate">
                          {selected ||
                            `Select ${referenceLabels[kind].toLowerCase()}`}
                        </span>
                        <Search
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      </button>
                      {value && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-square"
                          aria-label={`Clear ${referenceLabels[kind]}`}
                          onClick={() =>
                            methods.setValue(kind, "", { shouldDirty: true })
                          }
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-base-content/60">
                  Linked records do not change the invoice line items below.
                </p>
                <SimpleInput
                  label="Billing Address"
                  placeholder="Street, City, State, Country"
                  {...methods.register("billingAddress")}
                />
              </FormWrapper>
            </div>

            <FormWrapper title="Invoice Line Items" className="space-y-4">
              <div className="overflow-x-auto border border-base-200 rounded-lg">
                <table className="table w-full">
                  <thead className="bg-base-200/50 text-xs">
                    <tr>
                      <th className="w-1/2">Item Description</th>
                      <th className="text-center w-24">Qty</th>
                      <th className="text-right w-36">Unit Price</th>
                      <th className="text-right w-36">Line Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const lineTotal =
                        (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                      return (
                        <tr key={idx}>
                          <td>
                            <MarkdownTextArea
                              label={`Item ${idx + 1} description`}
                              value={item.description}
                              onChange={(value) =>
                                handleItemChange(idx, "description", value)
                              }
                              placeholder="Describe the service or product..."
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "qty",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="input input-bordered input-sm w-20 text-center mx-auto block"
                            />
                          </td>
                          <td>
                            <PriceInput
                              size="sm"
                              currency={null}
                              value={item.unitPrice}
                              onValueChange={(values, sourceInfo) =>
                                sourceInfo.source === "event" &&
                                handleItemChange(idx, "unitPrice", values.floatValue ?? 0)
                              }
                              className="text-right"
                              wrapperClassName="w-32 ml-auto"
                            />
                          </td>
                          <td className="text-right font-semibold">
                            {formatAmount(lineTotal)}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="btn btn-ghost btn-xs text-error"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start pt-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-sm btn-outline btn-primary gap-1"
                >
                  <Plus className="size-4" /> Add Item
                </button>

                <div className="w-72 space-y-2 bg-base-200/40 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Subtotal:</span>
                    <span className="font-medium">
                      {formatAmount(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">
                      Discount ({currency}):
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input input-bordered input-xs w-24 text-right"
                      {...methods.register("discount")}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">
                      Tax ({currency}):
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input input-bordered input-xs w-24 text-right"
                      {...methods.register("tax")}
                    />
                  </div>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Grand Total:</span>
                    <span className="text-primary">
                      {formatAmount(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </FormWrapper>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate({ to: "/staff/accounts/Invoices" })}
              >
                Cancel
              </button>
              <ActionButton
                type="submit"
                title={
                  createInvoice.isPending ? "Generating..." : "Save Invoice"
                }
                className="btn btn-primary"
                disabled={createInvoice.isPending}
              />
            </div>
          </form>
        </FormProvider>
      </section>
      <Modal ref={pickerRef} title={`Select ${referenceLabels[pickerKind]}`}>
        <div className="space-y-4">
          <SimpleInput
            label={`Search ${referenceLabels[pickerKind].toLowerCase()}`}
            value={pickerSearch}
            onChange={(event) => setPickerSearch(event.target.value)}
            placeholder="Search by name or ID"
          />
          {pickerKind === "orderId" && (
            <PageLoader
              query={ordersQuery}
              customLoading={
                <div className="py-8 text-center">
                  <span className="loading loading-spinner loading-md" />
                </div>
              }
            >
              {(orders) =>
                renderPickerOptions(
                  orders.map((order) => ({
                    id: order.id,
                    title: `Order ${order.orderNumber || `#${order.id.slice(0, 8)}`}`,
                    detail: [
                      `${order.contact?.firstName || ""} ${order.contact?.lastName || ""}`.trim(),
                      order.status,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  })),
                )
              }
            </PageLoader>
          )}
          {pickerKind === "quoteId" && (
            <PageLoader
              query={quotesQuery}
              customLoading={
                <div className="py-8 text-center">
                  <span className="loading loading-spinner loading-md" />
                </div>
              }
            >
              {(quotes) =>
                renderPickerOptions(
                  quotes.map((quote) => ({
                    id: quote.id,
                    title: `${quote.clientName || "Quote"} · #${quote.id.slice(0, 8)}`,
                    detail: [quote.status, quote.date?.slice(0, 10)]
                      .filter(Boolean)
                      .join(" · "),
                  })),
                )
              }
            </PageLoader>
          )}
          {pickerKind === "contactId" && (
            <PageLoader
              query={contactsQuery}
              customLoading={
                <div className="py-8 text-center">
                  <span className="loading loading-spinner loading-md" />
                </div>
              }
            >
              {(contacts) =>
                renderPickerOptions(
                  contacts.map((contact) => ({
                    id: contact.id,
                    title:
                      `${contact.firstName} ${contact.lastName}`.trim() ||
                      contact.email,
                    detail: contact.email,
                  })),
                )
              }
            </PageLoader>
          )}
        </div>
      </Modal>
    </div>
  );
}
