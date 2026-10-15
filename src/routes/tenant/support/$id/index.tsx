import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTicket,
  useUpdateTicket,
  useUpdateTicketStatus,
  useAssignTicket,
  useReplyTicketMessage,
  useDeleteTicket,
  useEscalateTicket,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/api/supportApi";
import { useStaffs } from "@/api/tenantApi";
import { useContacts } from "@/api/crmApi";
import { uploadTicketAttachments } from "@/api/supportAttachments";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import UpdateImages from "@/components/images/UpdateImages";

export const Route = createFileRoute("/tenant/support/$id/")({
  component: RouteComponent,
});

const statusOptions: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const priorityOptions: TicketPriority[] = ["low", "medium", "high", "urgent"];
const label = (value: string) => value.replaceAll("_", " ");
const nameOf = (person?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) =>
  person
    ? `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
      person.email ||
      "Unknown"
    : "Unknown";
const dateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Unknown date";
const attachmentLinks = (urls?: string[]) =>
  urls?.filter((url) => /^https?:\/\//i.test(url)) ?? [];

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const ticketQuery = useTicket(id);
  const staffsQuery = useStaffs();
  const contactsQuery = useContacts();
  const updateTicket = useUpdateTicket();
  const updateStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();
  const reply = useReplyTicketMessage();
  const deleteTicket = useDeleteTicket();
  const escalateTicket = useEscalateTicket();
  const editModalRef = useRef<ModalHandle>(null);
  const [edit, setEdit] = useState({
    subject: "",
    contactId: "",
    description: "",
    priority: "medium" as TicketPriority,
  });
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [isUploadingReply, setIsUploadingReply] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [replyPickerKey, setReplyPickerKey] = useState(0);
  const [editPickerKey, setEditPickerKey] = useState(0);
  const editImages = useMemo(
    () => existingAttachments.map((url) => ({ url, path: url })),
    [existingAttachments],
  );
  const [escalationReason, setEscalationReason] = useState("");
  const [sharedWithPlatform, setSharedWithPlatform] = useState(false);
  const ticket = ticketQuery.data;
  const visibleMessages =
    ticket?.messages?.filter((message) => message.visibility !== "private") ??
    [];

  const openEdit = (item: Ticket) => {
    setEdit({
      subject: item.subject,
      contactId: item.contactId || "",
      description: item.description,
      priority: item.priority,
    });
    setExistingAttachments(item.attachments || []);
    setEditFiles([]);
    setEditPickerKey((key) => key + 1);
    editModalRef.current?.open();
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ticket || !edit.subject.trim() || !edit.description.trim()) return;
    try {
      setIsUploadingEdit(true);
      const uploaded = await uploadTicketAttachments(editFiles);
      await updateTicket.mutateAsync({
        id: ticket.id,
        subject: edit.subject.trim(),
        description: edit.description.trim(),
        priority: edit.priority,
        contactId: edit.contactId || undefined,
        attachments: [...existingAttachments, ...uploaded],
      });
      toast.success("Ticket updated.");
      editModalRef.current?.close();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update ticket.",
      );
    } finally {
      setIsUploadingEdit(false);
    }
  };

  const changeStatus = async (status: TicketStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update status.");
    }
  };

  const assign = async (staffId: string) => {
    if (!staffId) return;
    try {
      await assignTicket.mutateAsync({ id, staffId });
      toast.success("Ticket assigned.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not assign ticket.");
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = replyText.trim();
    if (!content) {
      toast.error("Write a reply before sending.");
      return;
    }
    try {
      setIsUploadingReply(true);
      const attachments = await uploadTicketAttachments(replyFiles);
      await reply.mutateAsync({
        id,
        content,
        attachments,
      });
      setReplyText("");
      setReplyFiles([]);
      setReplyPickerKey((key) => key + 1);
      toast.success("Reply added.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not send reply.",
      );
    } finally {
      setIsUploadingReply(false);
    }
  };

  const removeTicket = async () => {
    if (
      !ticket ||
      !window.confirm(
        `Delete ticket “${ticket.subject}”? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success("Ticket deleted.");
      navigate({ to: "/tenant/support" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not delete ticket.");
    }
  };

  const escalate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!escalationReason.trim()) {
      toast.error("Explain why platform support is needed.");
      return;
    }
    try {
      await escalateTicket.mutateAsync({ id, reason: escalationReason.trim() });
      setSharedWithPlatform(true);
      setEscalationReason("");
      toast.success("Ticket shared with platform support.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not escalate ticket.",
      );
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <Link to="/tenant/support" className="btn btn-ghost btn-sm -ml-2">
          <ArrowLeft className="size-4" /> All tickets
        </Link>
      </div>
      <PageLoader query={ticketQuery}>
        {ticket && (
          <>
            <PageHeader
              title={ticket.subject}
              description={`${ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`} · Opened ${dateTime(ticket.createdAt)}`}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => openEdit(ticket)}
              >
                <Pencil className="size-4" /> Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                disabled={deleteTicket.isPending}
                onClick={removeTicket}
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </PageHeader>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
              <div className="min-w-0 space-y-5">
                <div className="rounded-box bg-base-100 p-5 shadow">
                  <h2 className="font-semibold">Issue description</h2>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-base-content/80">
                    {ticket.description}
                  </p>
                  {!!attachmentLinks(ticket.attachments).length && (
                    <AttachmentList urls={ticket.attachments} />
                  )}
                </div>
                <div className="rounded-box bg-base-100 shadow overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-base-200 p-5">
                    <MessageSquare className="size-5 text-primary" />
                    <h2 className="font-semibold">Conversation</h2>
                    <span className="badge badge-ghost badge-sm ml-auto">
                      {visibleMessages.length}
                    </span>
                  </div>
                  {!visibleMessages.length ? (
                    <p className="px-5 py-10 text-center text-sm text-base-content/60">
                      No replies yet. Send the first update below.
                    </p>
                  ) : (
                    <ol className="divide-y divide-base-200">
                      {[...visibleMessages]
                        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                        .map((message) => (
                          <li key={message.id} className="p-5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <span className="font-semibold">
                                {message.senderName ||
                                  (message.sender
                                    ? nameOf(message.sender)
                                    : null) ||
                                  message.senderType ||
                                  "Support"}
                              </span>
                              <span className="text-xs text-base-content/50">
                                {dateTime(message.createdAt)}
                              </span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                              {message.content}
                            </p>
                            <AttachmentList urls={message.attachments} />
                          </li>
                        ))}
                    </ol>
                  )}
                </div>
                <form
                  onSubmit={sendReply}
                  className="rounded-box bg-base-100 p-5 shadow space-y-3"
                >
                  <h2 className="font-semibold">Reply to ticket</h2>
                  <SimpleTextArea
                    label="Message"
                    rows={5}
                    required
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write an update for this ticket..."
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Attachments (optional)
                    </p>
                    <UpdateImages
                      key={replyPickerKey}
                      setNew={setReplyFiles}
                      accept="image/*,application/pdf,video/*"
                      fileMode
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={reply.isPending || isUploadingReply}
                    >
                      <Send className="size-4" />{" "}
                      {isUploadingReply
                        ? "Uploading..."
                        : reply.isPending
                          ? "Sending..."
                          : "Send reply"}
                    </button>
                  </div>
                </form>
              </div>
              <aside
                className="rounded-box bg-base-100 p-5 shadow space-y-5 lg:sticky lg:top-5"
                aria-label="Ticket details"
              >
                <h2 className="font-semibold">Ticket details</h2>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Status
                  </p>
                  <select
                    className="select select-bordered w-full capitalize"
                    aria-label="Ticket status"
                    value={ticket.status}
                    disabled={updateStatus.isPending}
                    onChange={(event) =>
                      changeStatus(event.target.value as TicketStatus)
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {label(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Priority
                  </p>
                  <span
                    className={`badge capitalize ${ticket.priority === "urgent" ? "badge-error" : ticket.priority === "high" ? "badge-warning" : "badge-ghost"}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Assigned to
                  </p>
                  <select
                    className="select select-bordered w-full"
                    aria-label="Assign ticket to staff"
                    value={ticket.assignedTo || ticket.assignedStaff?.id || ""}
                    disabled={
                      staffsQuery.isPending ||
                      staffsQuery.isError ||
                      assignTicket.isPending
                    }
                    onChange={(event) => assign(event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {staffsQuery.data?.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName}
                      </option>
                    ))}
                  </select>
                  {staffsQuery.isError && (
                    <p className="mt-1 text-xs text-error">
                      Staff could not be loaded.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Contact
                  </p>
                  <p className="text-sm font-medium">
                    {nameOf(ticket.contact)}
                  </p>
                  {ticket.contact?.email && (
                    <p className="break-all text-xs text-base-content/60">
                      {ticket.contact.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Last updated
                  </p>
                  <p className="text-sm">{dateTime(ticket.updatedAt)}</p>
                </div>
                <div className="border-t border-base-200 pt-4 space-y-3">
                  <h3 className="text-sm font-semibold">Platform support</h3>
                  {sharedWithPlatform ||
                  ticket.escalated ||
                  ticket.escalation ? (
                    <p className="text-sm text-base-content/70">
                      This ticket is shared with platform support.
                    </p>
                  ) : (
                    <form onSubmit={escalate} className="space-y-2">
                      <p className="text-xs text-base-content/60">
                        Share this ticket and its thread with platform support
                        when your team needs help.
                      </p>
                      <label
                        htmlFor="tenant-escalation-reason"
                        className="text-xs font-medium"
                      >
                        Reason
                      </label>
                      <textarea
                        id="tenant-escalation-reason"
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        required
                        value={escalationReason}
                        onChange={(event) =>
                          setEscalationReason(event.target.value)
                        }
                        placeholder="Why is platform support needed?"
                      />
                      <button
                        type="submit"
                        className="btn btn-outline btn-sm w-full"
                        disabled={escalateTicket.isPending}
                      >
                        {escalateTicket.isPending
                          ? "Sharing..."
                          : "Share with platform support"}
                      </button>
                    </form>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </PageLoader>

      <Modal ref={editModalRef} title="Edit ticket">
        <form onSubmit={saveEdit} className="space-y-4 pt-2">
          <SimpleInput
            label="Subject"
            required
            value={edit.subject}
            onChange={(event) =>
              setEdit({ ...edit, subject: event.target.value })
            }
          />
          <LocalSelect
            label="Contact"
            value={edit.contactId}
            disabled={contactsQuery.isPending || contactsQuery.isError}
            onChange={(event) =>
              setEdit({ ...edit, contactId: event.target.value })
            }
          >
            <option value="">Keep current contact</option>
            {contactsQuery.data?.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName} · {contact.email}
              </option>
            ))}
          </LocalSelect>
          <LocalSelect
            label="Priority"
            value={edit.priority}
            onChange={(event) =>
              setEdit({
                ...edit,
                priority: event.target.value as TicketPriority,
              })
            }
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option} className="capitalize">
                {label(option)}
              </option>
            ))}
          </LocalSelect>
          <SimpleTextArea
            label="Description"
            required
            rows={5}
            value={edit.description}
            onChange={(event) =>
              setEdit({ ...edit, description: event.target.value })
            }
          />
          <div>
            <p className="text-sm font-medium">Attachments (optional)</p>
            <UpdateImages
              key={editPickerKey}
              images={editImages}
              setNew={setEditFiles}
              setPrev={(images) =>
                setExistingAttachments(images.map((image) => image.url))
              }
              accept="image/*,application/pdf,video/*"
              fileMode
            />
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateTicket.isPending || isUploadingEdit}
            >
              {isUploadingEdit
                ? "Uploading..."
                : updateTicket.isPending
                  ? "Saving..."
                  : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function AttachmentList({ urls }: { urls?: string[] }) {
  const links = attachmentLinks(urls);
  if (!links.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {links.map((url, index) => (
        <li key={`${url}-${index}`}>
          <a
            className="btn btn-ghost btn-xs max-w-full"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="size-3" /> Attachment {index + 1}
            <ArrowUpRight className="size-3" />
          </a>
        </li>
      ))}
    </ul>
  );
}
