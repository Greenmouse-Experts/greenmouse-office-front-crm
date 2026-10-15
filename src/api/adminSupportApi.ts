import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type { Ticket, TicketPriority, TicketStatus } from "./supportApi";

export interface AdminTicket extends Ticket {
  tenantId?: string;
  tenant?: { id: string; companyName?: string; email?: string };
  assignedAdminId?: string | null;
  assignedAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
  escalated?: boolean;
  escalation?: {
    reason?: string;
    assignedAdminId?: string | null;
    createdAt?: string;
  } | null;
  messages?: (NonNullable<Ticket["messages"]>[number] & {
    visibility?: "public" | "private";
  })[];
}

export interface AdminTicketQueryParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAdminId?: string;
  escalated?: boolean;
}

const unwrap = <T>(value: any): T => value?.data?.data ?? value?.data ?? value;
const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });

export const useAdminTickets = (params?: AdminTicketQueryParams) =>
  useQuery<AdminTicket[]>({
    queryKey: ["admin", "tickets", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/admins/tickets", { params });
      const payload = unwrap<unknown>(data);
      if (Array.isArray(payload)) return payload;
      if (Array.isArray((payload as any)?.tickets))
        return (payload as any).tickets;
      return [];
    },
  });

export const useAdminTicket = (id?: string) =>
  useQuery<AdminTicket>({
    queryKey: ["admin", "tickets", id],
    queryFn: async () => {
      if (!id) throw new Error("Ticket ID required");
      const { data } = await apiClient.get(`/admins/tickets/${id}`);
      const payload = unwrap<any>(data);
      return payload?.ticket ?? payload;
    },
    enabled: !!id,
  });

export const useAdminTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) =>
      (await apiClient.patch(`/admins/tickets/${id}/status`, { status })).data,
    onSuccess: () => invalidate(queryClient),
  });
};

export const useAdminTicketPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      priority,
    }: {
      id: string;
      priority: TicketPriority;
    }) =>
      (await apiClient.patch(`/admins/tickets/${id}/priority`, { priority }))
        .data,
    onSuccess: () => invalidate(queryClient),
  });
};

export const useAdminTicketAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      adminId,
    }: {
      id: string;
      adminId: string | null;
    }) =>
      (await apiClient.patch(`/admins/tickets/${id}/assignment`, { adminId }))
        .data,
    onSuccess: () => invalidate(queryClient),
  });
};

export const useAdminTicketReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
      visibility,
      attachments,
    }: {
      id: string;
      content: string;
      visibility: "public" | "private";
      attachments?: string[];
    }) =>
      (
        await apiClient.post(`/admins/tickets/${id}/messages`, {
          content,
          visibility,
          attachments,
        })
      ).data,
    onSuccess: () => invalidate(queryClient),
  });
};

export const useAdminTicketEscalate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      assignedAdminId,
    }: {
      id: string;
      reason: string;
      assignedAdminId?: string;
    }) =>
      (
        await apiClient.post(`/admins/tickets/${id}/escalate`, {
          reason,
          ...(assignedAdminId ? { assignedAdminId } : {}),
        })
      ).data,
    onSuccess: () => invalidate(queryClient),
  });
};

export const useAdminTicketRemoveEscalation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await apiClient.delete(`/admins/tickets/${id}/escalation`)).data,
    onSuccess: () => invalidate(queryClient),
  });
};
