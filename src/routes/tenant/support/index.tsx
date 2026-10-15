import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, Plus, Search, ArrowUpRight, CircleHelp } from "lucide-react";
import {
  useTickets,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/api/supportApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import CreateTicketModal, {
  type CreateTicketModalHandle,
} from "@/components/support/CreateTicketModal";

export const Route = createFileRoute("/tenant/support/")({
  component: RouteComponent,
});

const statuses: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];
const priorities: { value: TicketPriority | "all"; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const contactName = (contact?: Ticket["contact"]) =>
  contact
    ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
      contact.email
    : "Unknown contact";
const displayStatus = (status: string) => status.replaceAll("_", " ");

function RouteComponent() {
  const ticketsQuery = useTickets();
  const modalRef = useRef<CreateTicketModalHandle>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const openCreate = () => modalRef.current?.open();

  const tickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(ticketsQuery.data ?? [])]
      .filter((ticket) => {
        if (status !== "all" && ticket.status !== status) return false;
        if (priority !== "all" && ticket.priority !== priority) return false;
        if (!term) return true;
        return [
          ticket.subject,
          ticket.ticketNumber,
          ticket.description,
          contactName(ticket.contact),
        ].some((value) => value?.toLowerCase().includes(term));
      })
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [ticketsQuery.data, search, status, priority]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Support tickets"
        description="Track customer requests, ownership, and replies in one place."
      >
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={openCreate}
        >
          <Plus className="size-4" /> New ticket
        </button>
      </PageHeader>

      <div className="rounded-box bg-base-100 shadow overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-base-200 p-4 sm:flex-row sm:items-center">
          <label className="input input-bordered flex items-center gap-2 w-full sm:max-w-sm">
            <Search
              className="size-4 text-base-content/60"
              aria-hidden="true"
            />
            <input
              type="search"
              className="grow"
              placeholder="Search tickets or contacts"
              aria-label="Search tickets or contacts"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
            <select
              className="select select-bordered w-full sm:w-40"
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TicketStatus | "all")
              }
            >
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered w-full sm:w-40"
              aria-label="Filter by priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TicketPriority | "all")
              }
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <PageLoader query={ticketsQuery}>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Inbox
                className="size-9 text-base-content/40"
                aria-hidden="true"
              />
              <h2 className="font-semibold">
                {ticketsQuery.data?.length
                  ? "No tickets match these filters"
                  : "No support tickets yet"}
              </h2>
              <p className="text-sm text-base-content/60">
                {ticketsQuery.data?.length
                  ? "Try another search, status, or priority."
                  : "Create a ticket to start a customer support thread."}
              </p>
              {!ticketsQuery.data?.length && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm mt-2"
                  onClick={openCreate}
                >
                  Create ticket
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to="/tenant/support/$id"
                  params={{ id: ticket.id }}
                  className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-base-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CircleHelp className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold group-hover:text-primary">
                        {ticket.subject}
                      </h2>
                      <span className="text-xs text-base-content/50">
                        {ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-base-content/60">
                      {contactName(ticket.contact)} ·{" "}
                      {ticket.assignedStaff
                        ? `Assigned to ${ticket.assignedStaff.firstName} ${ticket.assignedStaff.lastName}`
                        : "Unassigned"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span
                      className={`badge badge-sm capitalize ${ticket.priority === "urgent" ? "badge-error" : ticket.priority === "high" ? "badge-warning" : "badge-ghost"}`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`badge badge-sm capitalize ${ticket.status === "closed" ? "badge-ghost" : ticket.status === "resolved" ? "badge-success badge-soft" : "badge-info badge-soft"}`}
                    >
                      {displayStatus(ticket.status)}
                    </span>
                    <span className="ml-auto text-xs text-base-content/50 sm:ml-2">
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                    <ArrowUpRight
                      className="size-4 text-base-content/40"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PageLoader>
      </div>

      <CreateTicketModal ref={modalRef} />
    </section>
  );
}
