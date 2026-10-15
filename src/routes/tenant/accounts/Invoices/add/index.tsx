import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateInvoice, type InvoiceItem } from "@/api/financeApi";
import { useContacts } from "@/api/crmApi";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/Invoices/add/")({
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
}

function RouteComponent() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const { data: contacts = [] } = useContacts();

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Standard Consultation & Service",
      qty: 1,
      unitPrice: 15000,
    },
  ]);

  const methods = useForm<FormValues>({
    defaultValues: {
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      contactId: "",
      billingAddress: "",
      currency: "NGN",
      tax: 0,
      discount: 0,
    },
  });

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
      navigate({ to: "/tenant/accounts/Invoices" });
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
                        (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
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
                onClick={() => navigate({ to: "/tenant/accounts/Invoices" })}
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
    </div>
  );
}
