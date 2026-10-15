import { useState, useEffect } from "react";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import PageLoader from "@/components/layout/PageLoader";
import {
  useInvoice,
  useUpdateInvoice,
  type InvoiceItem,
} from "@/api/financeApi";
import { useContacts } from "@/api/crmApi";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/Invoices/$id/edit")({
  component: RouteComponent,
});

interface FormValues {
  issuedDate: string;
  dueDate: string;
  contactId: string;
  billingAddress: string;
  currency: string;
  tax: number;
  discount: number;
  status: string;
}

const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
};

function RouteComponent() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  const query = useInvoice(id);
  const updateInvoice = useUpdateInvoice();
  const { data: contacts = [] } = useContacts();

  const invoice = query.data;

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: 1, unitPrice: 0 },
  ]);

  const methods = useForm<FormValues>({
    defaultValues: {
      issuedDate: "",
      dueDate: "",
      contactId: "",
      billingAddress: "",
      currency: "USD",
      tax: 0,
      discount: 0,
      status: "draft",
    },
  });

  useEffect(() => {
    if (invoice) {
      methods.reset({
        issuedDate: formatDateForInput(invoice.issuedDate),
        dueDate: formatDateForInput(invoice.dueDate),
        contactId: invoice.contactId || invoice.contact?.id || "",
        billingAddress: invoice.billingAddress || "",
        currency: invoice.currency || "USD",
        tax: Number(invoice.tax) || 0,
        discount: Number(invoice.discount) || 0,
        status: invoice.status || "draft",
      });
      if (invoice.items && invoice.items.length > 0) {
        setItems(
          invoice.items.map((item) => ({
            description: item.description || "",
            qty: Number(item.qty) || 1,
            unitPrice: Number(item.unitPrice) || 0,
          })),
        );
      }
    }
  }, [invoice, methods]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0 }]);
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
  const currency = methods.watch("currency") || "USD";
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      amount,
    );
  const discount = Number(methods.watch("discount")) || 0;
  const tax = Number(methods.watch("tax")) || 0;
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    if (items.some((i) => !i.description.trim())) {
      toast.error("Please provide descriptions for all line items.");
      return;
    }

    const discountVal = Number(data.discount) || 0;
    const taxVal = Number(data.tax) || 0;

    try {
      await updateInvoice.mutateAsync({
        id,
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        contactId: data.contactId || undefined,
        billingAddress: data.billingAddress,
        currency: data.currency,
        items,
        discount: discountVal,
        tax: taxVal,
        status: data.status,
      });
      toast.success("Invoice updated successfully!");
      navigate({ to: `/tenant/accounts/Invoices/${id}` });
    } catch (err: any) {
      const message = err.response?.data?.message;
      toast.error(
        (Array.isArray(message) ? message.join(". ") : message) ||
          "Failed to update invoice. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <SimpleTitle
        title={`Edit Invoice: ${invoice?.invoiceNumber || id || ""}`}
        backBtn
      />
      <PageLoader query={query}>
        {invoice && (
          <section className="p-6 bg-base-100 shadow rounded-box">
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <FormWrapper title="Invoice Details">
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
                    <LocalSelect
                      label="Currency"
                      {...methods.register("currency")}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="NGN">NGN (₦)</option>
                    </LocalSelect>
                    <LocalSelect label="Status" {...methods.register("status")}>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </LocalSelect>
                  </FormWrapper>

                  <FormWrapper title="Customer & Billing Details">
                    <LocalSelect
                      label="Select Customer / Contact"
                      {...methods.register("contactId")}
                    >
                      <option value="">General Client / Unassigned</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.email})
                        </option>
                      ))}
                    </LocalSelect>
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
                            (Number(item.qty) || 0) *
                            (Number(item.unitPrice) || 0);
                          return (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Service or product name..."
                                  className="input input-bordered input-sm w-full"
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
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    handleItemChange(
                                      idx,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="input input-bordered input-sm w-32 text-right ml-auto block"
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
                    onClick={() =>
                      navigate({ to: `/tenant/accounts/Invoices/${id}` })
                    }
                  >
                    Cancel
                  </button>
                  <ActionButton
                    type="submit"
                    title={
                      updateInvoice.isPending ? "Updating..." : "Update Invoice"
                    }
                    className="btn btn-primary"
                    disabled={updateInvoice.isPending}
                  />
                </div>
              </form>
            </FormProvider>
          </section>
        )}
      </PageLoader>
    </div>
  );
}
