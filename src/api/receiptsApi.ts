import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface ReceiptPayment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference?: string;
  paidAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: "issued" | "voided" | string;
  voidReason?: string;
  voidedAt?: string;
  issuedAt: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    total: number;
    amountPaid: number;
    balanceDue: number;
  };
  payment?: ReceiptPayment;
  createdAt: string;
  updatedAt: string;
}

export interface VoidReceiptPayload {
  reason?: string;
}

// ==================== RECEIPT HOOKS ====================

export const useReceipt = (id?: string) => {
  return useQuery<Receipt>({
    queryKey: ["receipts", id],
    queryFn: async () => {
      if (!id) throw new Error("Receipt ID required");
      const { data } = await apiClient.get<any>(`/receipts/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const downloadReceiptPdf = async (id: string) => {
  const response = await apiClient.get(`/receipts/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

export const fetchReceiptHtml = async (id: string) => {
  const { data } = await apiClient.get<string>(`/receipts/${id}/html`, {
    responseType: "text" as any,
  });
  return data;
};

export const useReceiptHtml = (id?: string) => {
  return useQuery<string>({
    queryKey: ["receipts", id, "html"],
    queryFn: async () => {
      if (!id) throw new Error("Receipt ID required");
      return await fetchReceiptHtml(id);
    },
    enabled: !!id,
  });
};

export const useVoidReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: VoidReceiptPayload & { id: string }) => {
      const { data } = await apiClient.post<any>(`/receipts/${id}/void`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useResendReceipt = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/receipts/${id}/resend`);
      return data?.data || data;
    },
  });
};
