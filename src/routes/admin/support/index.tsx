import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Inbox,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useAdminTickets } from "@/api/adminSupportApi";
import { useStaffs } from "@/api/adminApi";
import type { TicketPriority, TicketStatus } from "@/api/supportApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";

export const Route = createFileRoute("/admin/support/")({
  component: RouteComponent,
});

const statusOptions: (TicketStatus | "all")[] = [
  "all",
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const priorityOptions: (TicketPriority | "all")[] = [
  "all",
  "low",
  "medium",
  "high",
  "urgent",
];
const label = (value: string) => value.replaceAll("_", " ");
const ownerName = (ticket: {
  assignedAdmin?: { firstName: string; lastName: string } | null;
}) =>
  ticket.assignedAdmin
    ? `${ticket.assignedAdmin.firstName} ${ticket.assignedAdmin.lastName}`
    : "Unassigned";

function RouteComponent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [assignedAdminId, setAssignedAdminId] = useState("");
  const staffsQuery = useStaffs();
  const ticketsQuery = useAdminTickets({
    ...(status !== "all" ? { status } : {}),
    ...(priority !== "all" ? { priority } : {}),
    ...(assignedAdminId ? { assignedAdminId } : {}),
  });
  const tickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(ticketsQuery.data ?? [])]
      .filter(
        (ticket) =>
          !term ||
          [
            ticket.subject,
            ticket.ticketNumber,
            ticket.description,
            ticket.tenant?.companyName,
            ticket.tenant?.email,
            ticket.contact?.email,
          ].some((value) => value?.toLowerCase().includes(term)),
      )
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [ticketsQuery.data, search]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Platform support"
        description="Review escalated tenant tickets and keep each request moving."
      >
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => ticketsQuery.refetch()}
          disabled={ticketsQuery.isFetching}
        >
          <RefreshCw
            className={`size-4 ${ticketsQuery.isFetching ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </button>
      </PageHeader>
      <div className="rounded-box bg-base-100 shadow overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-base-200 p-4 lg:flex-row lg:items-center">
          <label className="input input-bordered flex w-full items-center gap-2 lg:max-w-sm">
            <Search
              className="size-4 text-base-content/60"
              aria-hidden="true"
            />
            <input
              type="search"
              className="grow"
              aria-label="Search tickets or tenants"
              placeholder="Search tickets or tenants"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3 lg:ml-auto">
            <select
              className="select select-bordered w-full"
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TicketStatus | "all")
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : label(option)}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered w-full"
              aria-label="Filter by priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TicketPriority | "all")
              }
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All priorities" : label(option)}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered w-full"
              aria-label="Filter by owner"
              value={assignedAdminId}
              disabled={staffsQuery.isPending || staffsQuery.isError}
              onChange={(event) => setAssignedAdminId(event.target.value)}
            >
              <option value="">All owners</option>
              {staffsQuery.data?.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.firstName} {staff.lastName}
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
                  ? "No tickets match your search"
                  : "No escalated tickets"}
              </h2>
              <p className="text-sm text-base-content/60">
                {ticketsQuery.data?.length
                  ? "Try another search or filter."
                  : "Tickets escalated to platform support will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to="/admin/support/$id"
                  params={{ id: ticket.id }}
                  className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-base-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" aria-hidden="true" />
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
                      {ticket.tenant?.companyName ||
                        ticket.tenant?.email ||
                        "Tenant"}{" "}
                      · {ownerName(ticket)}
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
                      {label(ticket.status)}
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
    </section>
  );
}
