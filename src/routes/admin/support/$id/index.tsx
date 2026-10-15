import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  LockKeyhole,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { uploadTicketAttachments } from "@/api/supportAttachments";
import { useStaffs } from "@/api/adminApi";
import {
  useAdminTicket,
  useAdminTicketAssignment,
  useAdminTicketPriority,
  useAdminTicketRemoveEscalation,
  useAdminTicketReply,
  useAdminTicketStatus,
} from "@/api/adminSupportApi";
import type { TicketPriority, TicketStatus } from "@/api/supportApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import UpdateImages from "@/components/images/UpdateImages";

export const Route = createFileRoute("/admin/support/$id/")({
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
const dateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Unknown date";
const personName = (
  person?: { firstName?: string; lastName?: string; email?: string } | null,
) =>
  person
    ? `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
      person.email ||
      "Unknown"
    : "Unknown";
const safeLinks = (urls?: string[]) =>
  urls?.filter((url) => /^https?:\/\//i.test(url)) ?? [];

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const ticketQuery = useAdminTicket(id);
  const staffsQuery = useStaffs();
  const statusMutation = useAdminTicketStatus();
  const priorityMutation = useAdminTicketPriority();
  const assignmentMutation = useAdminTicketAssignment();
  const replyMutation = useAdminTicketReply();
  const removeEscalationMutation = useAdminTicketRemoveEscalation();
  const [content, setContent] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const ticket = ticketQuery.data;

  const changeStatus = async (status: TicketStatus) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      toast.success("Status updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update status.");
    }
  };
  const changePriority = async (priority: TicketPriority) => {
    try {
      await priorityMutation.mutateAsync({ id, priority });
      toast.success("Priority updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not update priority.",
      );
    }
  };
  const changeOwner = async (adminId: string) => {
    try {
      await assignmentMutation.mutateAsync({ id, adminId: adminId || null });
      toast.success(adminId ? "Ticket assigned." : "Ticket unassigned.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not change owner.");
    }
  };
  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      toast.error("Write a message before sending.");
      return;
    }
    try {
      setIsUploading(true);
      const attachments = await uploadTicketAttachments(attachmentFiles);
      await replyMutation.mutateAsync({
        id,
        content: content.trim(),
        visibility,
        attachments,
      });
      setContent("");
      setAttachmentFiles([]);
      setPickerKey((key) => key + 1);
      toast.success(
        visibility === "private" ? "Private note added." : "Public reply sent.",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not send message.",
      );
    } finally {
      setIsUploading(false);
    }
  };
  const removeEscalation = async () => {
    if (
      !window.confirm(
        "Remove this ticket from platform support and return it to the shared queue?",
      )
    )
      return;
    try {
      await removeEscalationMutation.mutateAsync(id);
      toast.success("Escalation removed.");
      navigate({ to: "/admin/support" });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not remove escalation.",
      );
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <Link to="/admin/support" className="btn btn-ghost btn-sm -ml-2">
          <ArrowLeft className="size-4" /> All support tickets
        </Link>
      </div>
      <PageLoader query={ticketQuery}>
        {ticket && (
          <>
            <PageHeader
              title={ticket.subject}
              description={`${ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`} · Opened ${dateTime(ticket.createdAt)}`}
            />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
              <div className="min-w-0 space-y-5">
                <div className="rounded-box bg-base-100 p-5 shadow">
                  <h2 className="font-semibold">Issue description</h2>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-base-content/80">
                    {ticket.description}
                  </p>
                  <AttachmentList urls={ticket.attachments} />
                </div>
                <div className="rounded-box bg-base-100 shadow overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-base-200 p-5">
                    <MessageSquare className="size-5 text-primary" />
                    <h2 className="font-semibold">Conversation</h2>
                    <span className="badge badge-ghost badge-sm ml-auto">
                      {ticket.messages?.length || 0}
                    </span>
                  </div>
                  {!ticket.messages?.length ? (
                    <p className="px-5 py-10 text-center text-sm text-base-content/60">
                      No messages yet. Send an update below.
                    </p>
                  ) : (
                    <ol className="divide-y divide-base-200">
                      {[...ticket.messages]
                        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                        .map((message) => (
                          <li
                            key={message.id}
                            className={`p-5 ${message.visibility === "private" ? "bg-warning/5" : ""}`}
                          >
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-semibold">
                                {message.senderName ||
                                  (message.sender
                                    ? personName(message.sender)
                                    : null) ||
                                  message.senderType ||
                                  "Support"}
                              </span>
                              {message.visibility === "private" && (
                                <span className="badge badge-warning badge-soft badge-xs">
                                  <LockKeyhole className="size-3" /> Private
                                  note
                                </span>
                              )}
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
                  <div>
                    <h2 className="font-semibold">Add to conversation</h2>
                    <p className="text-sm text-base-content/60">
                      Public replies are visible to the tenant. Private notes
                      stay with platform support.
                    </p>
                  </div>
                  <div className="join">
                    <button
                      type="button"
                      className={`btn btn-sm join-item ${visibility === "public" ? "btn-primary" : "btn-outline"}`}
                      aria-pressed={visibility === "public"}
                      onClick={() => setVisibility("public")}
                    >
                      Public reply
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm join-item ${visibility === "private" ? "btn-primary" : "btn-outline"}`}
                      aria-pressed={visibility === "private"}
                      onClick={() => setVisibility("private")}
                    >
                      Private note
                    </button>
                  </div>
                  <SimpleTextArea
                    label={visibility === "private" ? "Internal note" : "Reply"}
                    required
                    rows={5}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={
                      visibility === "private"
                        ? "Add context for the support team..."
                        : "Write an update for the tenant..."
                    }
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Attachments (optional)
                    </p>
                    <UpdateImages
                      key={pickerKey}
                      setNew={setAttachmentFiles}
                      accept="image/*,application/pdf,video/*"
                      fileMode
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={replyMutation.isPending || isUploading}
                    >
                      <Send className="size-4" />{" "}
                      {isUploading
                        ? "Uploading..."
                        : replyMutation.isPending
                          ? "Sending..."
                          : visibility === "private"
                            ? "Add private note"
                            : "Send public reply"}
                    </button>
                  </div>
                </form>
              </div>
              <aside
                className="rounded-box bg-base-100 p-5 shadow space-y-5 lg:sticky lg:top-5"
                aria-label="Ticket details"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="font-semibold">Ticket details</h2>
                </div>
                <div>
                  <label
                    htmlFor="admin-ticket-status"
                    className="mb-1 block text-xs font-medium text-base-content/60"
                  >
                    Status
                  </label>
                  <select
                    id="admin-ticket-status"
                    className="select select-bordered w-full capitalize"
                    value={ticket.status}
                    disabled={statusMutation.isPending}
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
                  <label
                    htmlFor="admin-ticket-priority"
                    className="mb-1 block text-xs font-medium text-base-content/60"
                  >
                    Priority
                  </label>
                  <select
                    id="admin-ticket-priority"
                    className="select select-bordered w-full capitalize"
                    value={ticket.priority}
                    disabled={priorityMutation.isPending}
                    onChange={(event) =>
                      changePriority(event.target.value as TicketPriority)
                    }
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {label(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="admin-ticket-owner"
                    className="mb-1 block text-xs font-medium text-base-content/60"
                  >
                    Platform owner
                  </label>
                  <select
                    id="admin-ticket-owner"
                    className="select select-bordered w-full"
                    value={
                      ticket.assignedAdminId ||
                      ticket.assignedAdmin?.id ||
                      ticket.escalation?.assignedAdminId ||
                      ""
                    }
                    disabled={
                      staffsQuery.isPending ||
                      staffsQuery.isError ||
                      assignmentMutation.isPending
                    }
                    onChange={(event) => changeOwner(event.target.value)}
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
                      Platform staff could not be loaded.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Tenant
                  </p>
                  <p className="text-sm font-medium">
                    {ticket.tenant?.companyName || "Tenant"}
                  </p>
                  {ticket.tenant?.email && (
                    <p className="break-all text-xs text-base-content/60">
                      {ticket.tenant.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Contact
                  </p>
                  <p className="text-sm">{personName(ticket.contact)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-base-content/60">
                    Last updated
                  </p>
                  <p className="text-sm">{dateTime(ticket.updatedAt)}</p>
                </div>
                <div className="border-t border-base-200 pt-4 space-y-3">
                  <h3 className="text-sm font-semibold">Escalation</h3>
                  {ticket.escalation?.reason && (
                    <p className="whitespace-pre-wrap break-words text-sm text-base-content/70">
                      {ticket.escalation.reason}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm w-full"
                    disabled={removeEscalationMutation.isPending}
                    onClick={removeEscalation}
                  >
                    {removeEscalationMutation.isPending
                      ? "Removing..."
                      : "Remove escalation"}
                  </button>
                </div>
              </aside>
            </div>
          </>
        )}
      </PageLoader>
    </section>
  );
}

function AttachmentList({ urls }: { urls?: string[] }) {
  const links = safeLinks(urls);
  if (!links.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {links.map((url, index) => (
        <li key={`${url}-${index}`}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs max-w-full"
          >
            <FileText className="size-3" /> Attachment {index + 1}
            <ArrowUpRight className="size-3" />
          </a>
        </li>
      ))}
    </ul>
  );
}
