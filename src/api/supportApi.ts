import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  senderId?: string;
  sender?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  senderName?: string;
  senderType?: "staff" | "customer" | "admin";
  visibility?: "public" | "private";
  content: string;
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: string;
  assignedStaff?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  escalated?: boolean;
  escalation?: { reason?: string; createdAt?: string } | null;
  attachments?: string[];
  messages?: TicketMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export type CreateTicketInput = Pick<
  Ticket,
  "subject" | "contactId" | "description" | "priority"
> & { attachments?: string[] };
export type UpdateTicketInput = { id: string } & Partial<
  Pick<
    Ticket,
    "subject" | "contactId" | "description" | "priority" | "attachments"
  >
>;

const unwrap = <T>(value: any): T => value?.data?.data ?? value?.data ?? value;

export const useTickets = (params?: TicketQueryParams) => {
  return useQuery<Ticket[]>({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/tickets", {
        params,
      });
      const tickets = unwrap<unknown>(data);
      return Array.isArray(tickets)
        ? tickets
        : Array.isArray((tickets as any)?.tickets)
          ? (tickets as any).tickets
          : [];
    },
  });
};

export const useTicket = (id?: string) => {
  return useQuery<Ticket>({
    queryKey: ["tickets", id],
    queryFn: async () => {
      if (!id) throw new Error("Ticket ID required");
      const { data } = await apiClient.get(`/tickets/${id}`);
      return unwrap<Ticket>(data);
    },
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: CreateTicketInput) => {
      const { data } = await apiClient.post("/tickets", ticket);
      return unwrap<Ticket>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...ticket }: UpdateTicketInput) => {
      const { data } = await apiClient.patch(`/tickets/${id}`, ticket);
      return unwrap<Ticket>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tickets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: TicketStatus;
    }) => {
      const { data } = await apiClient.patch(`/tickets/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { data } = await apiClient.patch(`/tickets/${id}/assign`, {
        staffId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useReplyTicketMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
      attachments,
    }: {
      id: string;
      content: string;
      attachments?: string[];
    }) => {
      const { data } = await apiClient.post(`/tickets/${id}/messages`, {
        content,
        attachments,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useEscalateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post(`/tickets/${id}/escalate`, {
        reason,
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });
};
