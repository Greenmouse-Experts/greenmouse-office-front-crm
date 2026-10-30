import { useState, useRef, useMemo } from "react";
import {
  createFileRoute,
  useParams,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  Ticket,
  Plus,
  MessageSquare,
  Calendar,
  Clock,
  Send,
  PhoneCall,
  Users,
} from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import ConfirmModal, {
  type ConfirmModalHandle,
} from "@/components/ConfirmModal";
import PageLoader from "@/components/layout/PageLoader";
import CustomTabs from "@/components/CustomTabs";
import { useTabs } from "@/stores/client";
import CreateTicketModal, {
  type CreateTicketModalHandle,
} from "@/components/support/CreateTicketModal";
import {
  useContact,
  useDeleteContact,
  useAddContactNote,
  useContactInteractions,
  useRecordContactInteraction,
  type Contact,
  type ContactNote,
  type ContactInteraction,
} from "@/api/crmApi";

export const Route = createFileRoute("/staff/contacts/customers/details/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useContact(id);
  const deleteContact = useDeleteContact();
  const addNote = useAddContactNote();
  const recordInteraction = useRecordContactInteraction();
  const interactionsQuery = useContactInteractions(id);

  const ticketModalRef = useRef<CreateTicketModalHandle>(null);
  const confirmRef = useRef<ConfirmModalHandle>(null);
  const [newNote, setNewNote] = useState("");
  const [interactionType, setInteractionType] = useState<
    "call" | "email" | "meeting" | "other"
  >("call");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [showLogInteraction, setShowLogInteraction] = useState(false);

  const tabs = useMemo(
    () => [
      { name: "Overview & Profile" },
      { name: "Interactions History" },
      { name: "Notes & Remarks" },
    ],
    [],
  );
  const tabProps = useTabs(tabs, tabs[0]);

  const handleDelete = async (contact: Contact) => {
    const name =
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      contact.email;
    const confirmed = await confirmRef.current?.confirm({
      title: "Delete customer",
      message: `Are you sure you want to delete customer "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteContact.mutateAsync(contact.id);
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`Customer "${name}" deleted successfully.`);
      navigate({ to: "/staff/contacts/customers" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete customer.");
    }
  };

  const handleAddNote = async (contactId: string) => {
    if (!newNote.trim()) return;
    try {
      await addNote.mutateAsync({ id: contactId, content: newNote.trim() });
      await queryClient.invalidateQueries({
        queryKey: ["contacts", contactId],
      });
      await query.refetch();
      setNewNote("");
      toast.success("Note added successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add note.");
    }
  };

  const handleRecordInteraction = async (contactId: string) => {
    if (!interactionNotes.trim()) {
      toast.error("Please enter details or notes for this interaction.");
      return;
    }
    try {
      await recordInteraction.mutateAsync({
        contactId,
        type: interactionType,
        notes: interactionNotes.trim(),
        occurredAt: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["contacts", contactId, "interactions"],
      });
      await interactionsQuery.refetch();
      setInteractionNotes("");
      setShowLogInteraction(false);
      toast.success("Interaction logged successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to log interaction.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      <PageHeader
        title="Customer Profile"
        description="Detailed client contact overview, engagement history, and communication records"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/staff/contacts/customers"
            className="btn btn-outline btn-sm gap-2"
          >
            <ArrowLeft className="size-4" /> Back to Customers
          </Link>
          {query.data && (
            <>
              <button
                type="button"
                className="btn btn-outline btn-sm gap-2"
                onClick={() =>
                  ticketModalRef.current?.open({ contactId: query.data.id })
                }
              >
                <Ticket className="size-4" /> Create Ticket
              </button>
              <Link
                to="/staff/contacts/customers/details/$id/edit"
                params={{ id: query.data.id }}
                className="btn btn-primary btn-sm gap-2"
              >
                <Pencil className="size-4" /> Edit Customer
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-error btn-sm gap-2"
                onClick={() => handleDelete(query.data)}
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </>
          )}
        </div>
      </PageHeader>

      <PageLoader
        query={query}
        emptyState={{
          title: "Customer Not Found",
          description: "The requested customer profile could not be located.",
        }}
      >
        {(contact: Contact) => {
          const fullName =
            `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
            "Unnamed Customer";
          const status = (contact.status || "active").toLowerCase();
          const statusBadge =
            status === "active" || status === "customer"
              ? "badge-success text-white"
              : status === "lead"
                ? "badge-warning text-white"
                : "badge-ghost";

          const interactions = interactionsQuery.data || [];
          const rawNotes = contact.notes || [];

          return (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start p-6 bg-base-100 border border-base-200 shadow-sm rounded-2xl gap-6">
                <div className="size-24 rounded-2xl ring-4 ring-primary/20 ring-offset-2 bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl shrink-0">
                  <User className="size-12" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-2xl font-bold text-base-content">
                          {fullName}
                        </h2>
                        <span
                          className={`badge badge-sm uppercase font-semibold text-[10px] ${statusBadge}`}
                        >
                          {contact.status || "Active"}
                        </span>
                        <span className="badge badge-sm badge-outline capitalize">
                          {contact.type || "Individual"}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/60 mt-1">
                        {contact.companyName ||
                          contact.company?.name ||
                          "Independent Client"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                      <Link
                        to="/staff/contacts/customers/details/$id/edit"
                        params={{ id: contact.id }}
                        className="btn btn-sm btn-outline gap-1.5"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary gap-1.5"
                        onClick={() =>
                          ticketModalRef.current?.open({
                            contactId: contact.id,
                          })
                        }
                      >
                        <Ticket className="size-3.5" /> New Ticket
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-3 border-t border-base-200">
                    <div className="flex items-center gap-2 text-base-content/80">
                      <Mail className="size-4 text-primary shrink-0" />
                      <span className="truncate">{contact.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/80">
                      <Phone className="size-4 text-primary shrink-0" />
                      <span>
                        {contact.phone ||
                          contact.workPhone ||
                          contact.cellPhone ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/80">
                      <Building2 className="size-4 text-primary shrink-0" />
                      <span className="truncate">
                        {contact.companyName || contact.company?.name || "None"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/80">
                      <MapPin className="size-4 text-primary shrink-0" />
                      <span className="truncate">
                        {[contact.city, contact.state, contact.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm space-y-6">
                <CustomTabs tabs={tabs} tabProps={tabProps} />

                {/* Tab 1: Overview & Profile */}
                {tabProps.tab.name === "Overview & Profile" && (
                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Identity & Company Details */}
                      <div className="bg-base-200/40 border border-base-200 rounded-xl p-5 space-y-4">
                        <h4 className="text-sm font-semibold text-base-content uppercase tracking-wider">
                          Identity & Affiliation
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              First Name
                            </span>
                            <p className="font-semibold text-base-content mt-0.5">
                              {contact.firstName || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Last Name
                            </span>
                            <p className="font-semibold text-base-content mt-0.5">
                              {contact.lastName || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Customer Type
                            </span>
                            <p className="font-medium capitalize text-base-content mt-0.5">
                              {contact.type || "Individual"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Company Name
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.companyName ||
                                contact.company?.name ||
                                "Independent"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Status
                            </span>
                            <p className="font-medium capitalize text-base-content mt-0.5">
                              {contact.status || "Active"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Lead Source
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.source || "Referral"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Phone Numbers */}
                      <div className="bg-base-200/40 border border-base-200 rounded-xl p-5 space-y-4">
                        <h4 className="text-sm font-semibold text-base-content uppercase tracking-wider">
                          Contact Channels
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2">
                            <span className="text-xs text-base-content/60 font-medium">
                              Primary Email
                            </span>
                            <p className="font-semibold text-base-content mt-0.5 break-all">
                              {contact.email || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Primary Phone
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.phone || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Work Phone
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.workPhone || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Cell Phone
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.cellPhone || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Assigned Staff
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.assignedTo || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Address Details */}
                      <div className="md:col-span-2 bg-base-200/40 border border-base-200 rounded-xl p-5 space-y-4">
                        <h4 className="text-sm font-semibold text-base-content uppercase tracking-wider">
                          Address & Location
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="sm:col-span-2">
                            <span className="text-xs text-base-content/60 font-medium">
                              Street Address
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.address || contact.addressLine1 || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              City
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.city || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              State / Region
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.state || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Country
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.country || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-base-content/60 font-medium">
                              Postal / Zip Code
                            </span>
                            <p className="font-medium text-base-content mt-0.5">
                              {contact.zipCode || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="p-4 bg-base-200/30 rounded-xl">
                        <span className="text-xs font-semibold text-base-content/70 block mb-2">
                          Tags & Labels
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {contact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="badge badge-sm badge-neutral"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Interactions History */}
                {tabProps.tab.name === "Interactions History" && (
                  <div className="space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-base-200/50 p-4 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-base-content">
                          Customer Touchpoints & Engagement
                        </h4>
                        <p className="text-xs text-base-content/60">
                          Log and monitor phone calls, emails, and meetings with{" "}
                          {fullName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowLogInteraction(!showLogInteraction)
                        }
                        className="btn btn-sm btn-primary gap-1.5"
                      >
                        <Plus className="size-4" /> Log Interaction
                      </button>
                    </div>

                    {/* Log Interaction Form */}
                    {showLogInteraction && (
                      <div className="bg-base-200/70 border border-primary/20 rounded-xl p-5 space-y-4">
                        <h5 className="font-semibold text-sm text-base-content flex items-center gap-2">
                          <Clock className="size-4 text-primary" /> Record New
                          Touchpoint
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="form-control w-full">
                            <span className="label-text text-xs font-medium mb-1">
                              Interaction Type
                            </span>
                            <select
                              className="select select-bordered select-sm w-full"
                              value={interactionType}
                              onChange={(e) =>
                                setInteractionType(
                                  e.target.value as
                                    | "call"
                                    | "email"
                                    | "meeting"
                                    | "other",
                                )
                              }
                            >
                              <option value="call">Phone Call</option>
                              <option value="email">Email</option>
                              <option value="meeting">Meeting</option>
                              <option value="other">Other / Note</option>
                            </select>
                          </label>
                        </div>
                        <label className="form-control w-full">
                          <span className="label-text text-xs font-medium mb-1">
                            Notes / Summary
                          </span>
                          <textarea
                            className="textarea textarea-bordered w-full h-24 text-sm"
                            placeholder="Discussed requirements, follow-up timeline, proposal feedback..."
                            value={interactionNotes}
                            onChange={(e) =>
                              setInteractionNotes(e.target.value)
                            }
                          />
                        </label>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => {
                              setShowLogInteraction(false);
                              setInteractionNotes("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary gap-1.5"
                            disabled={recordInteraction.isPending}
                            onClick={() => handleRecordInteraction(contact.id)}
                          >
                            <Send className="size-3.5" />
                            {recordInteraction.isPending
                              ? "Saving..."
                              : "Save Interaction"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Interactions List */}
                    {interactions.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-base-300 rounded-xl">
                        <MessageSquare className="size-10 mx-auto text-base-content/30 mb-2" />
                        <h5 className="font-semibold text-base-content">
                          No interactions logged yet
                        </h5>
                        <p className="text-xs text-base-content/60 max-w-sm mx-auto mt-1">
                          Keep your team aligned by recording calls, meetings,
                          or emails held with this customer.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {interactions.map((interaction: ContactInteraction) => {
                          const type = (
                            interaction.type || "call"
                          ).toLowerCase();
                          return (
                            <div
                              key={interaction.id}
                              className="p-4 bg-base-200/40 border border-base-200 rounded-xl flex items-start gap-3"
                            >
                              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                {type === "call" ? (
                                  <PhoneCall className="size-4" />
                                ) : type === "email" ? (
                                  <Mail className="size-4" />
                                ) : type === "meeting" ? (
                                  <Users className="size-4" />
                                ) : (
                                  <MessageSquare className="size-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-base-content">
                                    {interaction.type || "Touchpoint"}
                                  </span>
                                  <span className="text-[11px] text-base-content/50 flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {interaction.occurredAt
                                      ? new Date(
                                          interaction.occurredAt,
                                        ).toLocaleString()
                                      : new Date(
                                          interaction.createdAt,
                                        ).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-base-content/80 mt-1 whitespace-pre-wrap">
                                  {interaction.notes}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Notes & Remarks */}
                {tabProps.tab.name === "Notes & Remarks" && (
                  <div className="space-y-6 pt-2">
                    {/* Add note field */}
                    <div className="bg-base-200/50 p-4 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-base-content">
                        Add Customer Note
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <textarea
                          className="textarea textarea-bordered flex-1 text-sm h-20"
                          placeholder="Type an internal note regarding this customer..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary self-end sm:self-auto gap-2"
                          disabled={addNote.isPending || !newNote.trim()}
                          onClick={() => handleAddNote(contact.id)}
                        >
                          <Send className="size-4" />
                          {addNote.isPending ? "Adding..." : "Add Note"}
                        </button>
                      </div>
                    </div>

                    {/* Notes listing */}
                    {rawNotes.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-base-300 rounded-xl">
                        <MessageSquare className="size-8 mx-auto text-base-content/30 mb-2" />
                        <p className="text-xs text-base-content/60">
                          No notes have been added for this customer yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rawNotes.map(
                          (noteItem: ContactNote | string, idx: number) => {
                            const content =
                              typeof noteItem === "string"
                                ? noteItem
                                : noteItem.content;
                            const date =
                              typeof noteItem === "object" &&
                              noteItem?.createdAt
                                ? new Date(noteItem.createdAt).toLocaleString()
                                : null;
                            return (
                              <div
                                key={idx}
                                className="p-4 bg-base-200/40 border border-base-200 rounded-xl space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] text-base-content/50">
                                  <span>Note #{idx + 1}</span>
                                  {date && <span>{date}</span>}
                                </div>
                                <p className="text-sm text-base-content whitespace-pre-wrap">
                                  {content}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </PageLoader>

      <CreateTicketModal ref={ticketModalRef} />
      <ConfirmModal ref={confirmRef} />
    </div>
  );
}
