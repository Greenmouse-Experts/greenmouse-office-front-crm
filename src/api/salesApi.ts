import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== QUOTES ====================

export interface Quote {
  id: string;
  date?: string;
  clientName: string;
  amount: number;
  description?: string;
  status: "pending" | "accepted" | "rejected" | "expired" | string;
  contactId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteQueryParams {
  search?: string;
  status?: string;
}

export interface ConvertQuotePayload {
  target: "invoice" | "order" | string;
  contactId?: string;
  currency?: string;
  discount?: number;
  tax?: number;
  issuedDate?: string;
  dueDate?: string;
  notes?: string;
  assignedTo?: string;
  items?: any[];
}

export const useQuotes = (params?: QuoteQueryParams) => {
  return useQuery<Quote[]>({
    queryKey: ["quotes", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Quote[]>("/quotes", {
        params,
      });
      return data;
    },
  });
};

export const useQuote = (id?: string) => {
  return useQuery<Quote>({
    queryKey: ["quotes", id],
    queryFn: async () => {
      if (!id) throw new Error("Quote ID required");
      const { data } = await apiClient.get<Quote>(`/quotes/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useQuoteStats = () => {
  return useQuery<{
    total?: number;
    pending?: number;
    accepted?: number;
    rejected?: number;
    totalAmount?: number;
  }>({
    queryKey: ["quotes", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quotes/stats");
      return data;
    },
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quote: Partial<Quote>) => {
      const { data } = await apiClient.post<Quote>("/quotes", quote);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...quote }: Partial<Quote> & { id: string }) => {
      const { data } = await apiClient.patch<Quote>(`/quotes/${id}`, quote);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/quotes/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/quotes/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useConvertQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ConvertQuotePayload & { id: string }) => {
      const { data } = await apiClient.post<any>(
        `/quotes/${id}/convert`,
        payload,
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

// ==================== ORDERS ====================

export interface OrderItem {
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  quoteId?: string;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  discount?: number;
  tax?: number;
  currency?: string;
  total?: number;
  status: "pending" | "processing" | "completed" | "cancelled" | string;
  paymentStatus: "paid" | "unpaid" | "partial" | string;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

type OrderWriteFields = Pick<
  Order,
  | "items"
  | "quoteId"
  | "discount"
  | "tax"
  | "currency"
  | "status"
  | "paymentStatus"
  | "assignedTo"
  | "notes"
> & { contactId?: string | null };

type CreateOrderInput = Pick<OrderWriteFields, "items"> &
  Partial<Omit<OrderWriteFields, "items">>;

type UpdateOrderInput = Partial<OrderWriteFields> & { id: string };

export interface OrderQueryParams {
  search?: string;
  status?: string;
}

export const useOrders = (params?: OrderQueryParams) => {
  return useQuery<Order[]>({
    queryKey: ["orders", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>("/orders", {
        params,
      });
      return data;
    },
  });
};

export const useOrder = (id?: string) => {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: async () => {
      if (!id) throw new Error("Order ID required");
      const { data } = await apiClient.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useOrderStats = () => {
  return useQuery<{
    total?: number;
    pending?: number;
    processing?: number;
    completed?: number;
    cancelled?: number;
    totalRevenue?: number;
  }>({
    queryKey: ["orders", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/orders/stats");
      return data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      const { data } = await apiClient.post<Order>("/orders", order);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...order }: UpdateOrderInput) => {
      const { data } = await apiClient.patch<Order>(`/orders/${id}`, order);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/orders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/orders/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
