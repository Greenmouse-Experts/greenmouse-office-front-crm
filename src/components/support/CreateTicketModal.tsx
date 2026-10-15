import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useContacts } from "@/api/crmApi";
import { uploadTicketAttachments } from "@/api/supportAttachments";
import { useCreateTicket, type TicketPriority } from "@/api/supportApi";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import UpdateImages from "@/components/images/UpdateImages";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";

export interface CreateTicketModalHandle {
  open: (target?: {
    contactId?: string;
    companyId?: string;
    companyName?: string;
  }) => void;
}

interface TicketFormValues {
  subject: string;
  contactId: string;
  description: string;
  priority: TicketPriority;
}

const initialForm: TicketFormValues = {
  subject: "",
  contactId: "",
  description: "",
  priority: "medium" as TicketPriority,
};
const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

const CreateTicketModal = forwardRef<CreateTicketModalHandle>(
  function CreateTicketModal(_, ref) {
    const navigate = useNavigate();
    const modalRef = useRef<ModalHandle>(null);
    const contactsQuery = useContacts();
    const createTicket = useCreateTicket();
    const methods = useForm<TicketFormValues>({ defaultValues: initialForm });
    const {
      register,
      reset,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = methods;
    const [company, setCompany] = useState<{ id: string; name: string } | null>(
      null,
    );
    const [preferredContactId, setPreferredContactId] = useState("");
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [pickerKey, setPickerKey] = useState(0);

    const contacts = useMemo(() => {
      const all = contactsQuery.data ?? [];
      if (!company) return all;
      return all.filter(
        (contact) =>
          contact.companyId === company.id ||
          contact.company?.id === company.id ||
          contact.companyName?.trim().toLowerCase() ===
            company.name.trim().toLowerCase(),
      );
    }, [contactsQuery.data, company]);

    useImperativeHandle(ref, () => ({
      open: (target) => {
        setCompany(
          target?.companyId
            ? {
                id: target.companyId,
                name: target.companyName || "this company",
              }
            : null,
        );
        setPreferredContactId(target?.contactId || "");
        reset({ ...initialForm, contactId: target?.contactId || "" });
        setAttachmentFiles([]);
        setPickerKey((key) => key + 1);
        modalRef.current?.open();
      },
    }));

    const submitTicket = async (values: TicketFormValues) => {
      try {
        setIsUploading(true);
        const attachments = await uploadTicketAttachments(attachmentFiles);
        const created = await createTicket.mutateAsync({
          subject: values.subject.trim(),
          ...(values.contactId ? { contactId: values.contactId } : {}),
          description: values.description.trim(),
          priority: values.priority,
          attachments,
        });
        toast.success("Ticket created.");
        modalRef.current?.close();
        if (created?.id)
          navigate({ to: "/tenant/support/$id", params: { id: created.id } });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not create ticket.",
        );
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Modal
        ref={modalRef}
        title={company ? `New ticket · ${company.name}` : "New support ticket"}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(submitTicket)}
            className="space-y-4 pt-2"
          >
            <SimpleInput
              label="Subject"
              required
              {...register("subject", {
                required: "Subject is required.",
                validate: (value) => !!value.trim() || "Subject is required.",
              })}
              placeholder="What needs help?"
            />
            <LocalSelect
              label="Contact (optional)"
              disabled={isUploading || createTicket.isPending}
              {...register("contactId")}
            >
              <option value="">
                {contactsQuery.isPending
                  ? "Loading contacts..."
                  : "No contact linked"}
              </option>
              {preferredContactId &&
                !contacts.some(
                  (contact) => contact.id === preferredContactId,
                ) && (
                  <option value={preferredContactId}>Selected contact</option>
                )}
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName} · {contact.email}
                </option>
              ))}
            </LocalSelect>
            {contactsQuery.isError && (
              <p className="text-sm text-error">
                Contacts could not be loaded. You can still create a ticket
                without one.
              </p>
            )}
            {!contactsQuery.isPending &&
              !contactsQuery.isError &&
              !contacts.length && (
                <p className="text-sm text-base-content/70">
                  {company
                    ? `No contacts are linked to ${company.name}. A ticket without a contact won't be linked to this company. `
                    : "You can create a ticket without a contact. "}
                  <Link
                    to="/tenant/contacts/customers/add"
                    className="link link-primary"
                  >
                    Add a contact
                  </Link>
                </p>
              )}
            <LocalSelect label="Priority" {...register("priority")}>
              {priorities.map((priority) => (
                <option key={priority} value={priority} className="capitalize">
                  {priority}
                </option>
              ))}
            </LocalSelect>
            <SimpleTextArea
              label="Description"
              required
              rows={5}
              {...register("description", {
                required: "Description is required.",
                validate: (value) =>
                  !!value.trim() || "Description is required.",
              })}
              placeholder="Describe the issue and any relevant context"
            />
            {errors.description && (
              <p className="text-sm text-error">{errors.description.message}</p>
            )}
            <div>
              <p className="text-sm font-medium">Attachments (optional)</p>
              <UpdateImages
                key={pickerKey}
                setNew={setAttachmentFiles}
                accept="image/*,application/pdf,video/*"
                fileMode
              />
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => modalRef.current?.close()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createTicket.isPending || isUploading || isSubmitting}
              >
                {isUploading
                  ? "Uploading..."
                  : createTicket.isPending
                    ? "Creating..."
                    : "Create ticket"}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    );
  },
);

export default CreateTicketModal;
