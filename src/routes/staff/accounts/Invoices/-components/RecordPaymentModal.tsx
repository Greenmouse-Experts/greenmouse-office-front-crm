import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PriceInput from "@/components/inputs/PriceInput";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  useRecordInvoicePayment,
  type Invoice,
  type InvoicePaymentPayload,
} from "@/api/financeApi";

interface PaymentFields {
  amount: string;
  method: string;
  reference: string;
  paidAt: string;
  notes: string;
  sendEmail: boolean;
}

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  modalRef: React.RefObject<ModalHandle | null>;
}

const localDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

function PaymentForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const recordPayment = useRecordInvoicePayment();
  const outstanding = invoice.amountDue ?? invoice.balance ??
    (invoice.total != null ? Math.max(0, invoice.total - (invoice.paidAmount ?? 0)) : undefined);
  const form = useForm<PaymentFields>({
    defaultValues: {
      amount: outstanding && outstanding > 0 ? String(outstanding) : "",
      method: "bank_transfer",
      reference: "",
      paidAt: localDateTime(),
      notes: "",
      sendEmail: false,
    },
  });

  const submit = async (values: PaymentFields) => {
    const payload: InvoicePaymentPayload & { invoiceId: string } = {
      invoiceId: invoice.id,
      amount: Number(values.amount),
      method: values.method,
      paidAt: new Date(values.paidAt).toISOString(),
      sendEmail: values.sendEmail,
    };
    if (values.reference.trim()) payload.reference = values.reference.trim();
    if (values.notes.trim()) payload.notes = values.notes.trim();

    try {
      await recordPayment.mutateAsync(payload);
      toast.success("Payment recorded and receipt issued.");
      onClose();
    } catch (error) {
      const response = error as { response?: { data?: { message?: string | string[] } } };
      const message = response.response?.data?.message;
      toast.error((Array.isArray(message) ? message.join(". ") : message) || "Could not record payment.");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <p className="text-sm text-base-content/70">
          Record a full or partial payment for {invoice.invoiceNumber || invoice.id}.
        </p>
        {outstanding != null && (
          <p className="text-sm font-medium">
            Outstanding: {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: invoice.currency || "NGN",
            }).format(outstanding)}
          </p>
        )}
        <Controller
          name="amount"
          control={form.control}
          rules={{
            validate: (value) =>
              (Number.isFinite(Number(value)) && Number(value) > 0 &&
                (outstanding == null || Number(value) <= outstanding)) ||
              "Enter a positive amount no greater than the outstanding balance.",
          }}
          render={({ field }) => (
            <PriceInput
              label="Payment amount"
              aria-label="Payment amount"
              name={field.name}
              ref={field.ref}
              value={field.value}
              currency={invoice.currency || "NGN"}
              onBlur={field.onBlur}
              onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source === "event") field.onChange(values.value);
              }}
              required
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LocalSelect label="Payment method" aria-label="Payment method" {...form.register("method", { required: true })}>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </LocalSelect>
          <SimpleInput label="Reference" aria-label="Reference" placeholder="TRF-123456" {...form.register("reference")} />
        </div>
        <SimpleInput
          label="Paid at"
          aria-label="Paid at"
          type="datetime-local"
          required
          {...form.register("paidAt", { required: "Payment date is required." })}
        />
        <SimpleTextArea label="Notes" aria-label="Notes" rows={3} placeholder="Optional payment note" {...form.register("notes")} />
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" {...form.register("sendEmail")} />
          Email the receipt to the customer
        </label>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={recordPayment.isPending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={recordPayment.isPending}>
            {recordPayment.isPending ? "Recording..." : "Record payment"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function RecordPaymentModal({ invoice, modalRef }: RecordPaymentModalProps) {
  return (
    <Modal ref={modalRef} title="Record invoice payment">
      {invoice && <PaymentForm invoice={invoice} onClose={() => modalRef.current?.close()} />}
    </Modal>
  );
}
