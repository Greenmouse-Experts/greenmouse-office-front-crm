import { useFormContext } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import FormattedPriceInput from "@/components/inputs/FormattedPriceInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import type { Company, Contact } from "@/api/crmApi";
import type { Quote } from "@/api/salesApi";
import MarkdownEditor from "./MarkdownEditor";

export interface QuoteFormValues {
  date: string;
  amount: number;
  description: string;
  status: string;
  contactId: string;
  companyRecordId: string;
  expiresAt: string;
  notes: string;
}

export const defaultQuoteValues = (): QuoteFormValues => ({
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  description: "",
  status: "draft",
  contactId: "",
  companyRecordId: "",
  expiresAt: "",
  notes: "",
});

export const quotePayload = (values: QuoteFormValues): Partial<Quote> => ({
  date: values.date,
  amount: Number(values.amount),
  description: values.description.trim(),
  status: values.status,
  ...(values.contactId ? { contactId: values.contactId } : {}),
  ...(values.companyRecordId ? { companyRecordId: values.companyRecordId } : {}),
  ...(values.expiresAt ? { expiresAt: values.expiresAt } : {}),
  ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
});

interface QuoteFieldsProps {
  contacts: Contact[];
  companies: Company[];
  contactsLoading?: boolean;
  companiesLoading?: boolean;
  editingStatus?: string;
}

export default function QuoteFields({
  contacts,
  companies,
  contactsLoading,
  companiesLoading,
  editingStatus,
}: QuoteFieldsProps) {
  const methods = useFormContext<QuoteFormValues>();
  const quoteDate = methods.watch("date");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SimpleInput label="Quote date" type="date" {...methods.register("date", { required: "Quote date is required" })} />
        <SimpleInput
          label="Expires on"
          type="date"
          min={quoteDate || undefined}
          {...methods.register("expiresAt", {
            validate: (value) => !value || !quoteDate || value >= quoteDate || "Expiry must be on or after the quote date",
          })}
        />
        <FormattedPriceInput
          label="Amount (₦)"
          {...methods.register("amount", {
            required: "Amount is required",
            valueAsNumber: true,
            min: { value: 0.01, message: "Amount must be positive" },
          })}
        />
        <LocalSelect label="Status" {...methods.register("status")}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          {editingStatus && !["draft", "sent", "accepted", "rejected"].includes(editingStatus.toLowerCase()) && (
            <option value={editingStatus.toLowerCase()}>{editingStatus}</option>
          )}
        </LocalSelect>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Customer details</h2>
          <p className="text-sm text-base-content/70">Link a contact, a company, or both to this quote.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <LocalSelect label="Contact" {...methods.register("contactId")}>
              <option value="">No contact selected</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email}
                </option>
              ))}
            </LocalSelect>
            {contactsLoading && <p className="mt-1 text-xs text-base-content/70">Loading contacts...</p>}
          </div>
          <div>
            <LocalSelect label="Company" {...methods.register("companyRecordId")}>
              <option value="">No company selected</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </LocalSelect>
            {companiesLoading && <p className="mt-1 text-xs text-base-content/70">Loading companies...</p>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Quote content</h2>
          <p className="text-sm text-base-content/70">Add the work covered by the quote and any internal notes.</p>
        </div>
        <MarkdownEditor />
        <SimpleTextArea
          label="Notes"
          rows={3}
          placeholder="Payment terms or other notes..."
          {...methods.register("notes")}
        />
      </div>
    </div>
  );
}
