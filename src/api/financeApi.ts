import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface FinancialCategory {
  id: string;
  kind: "income" | "expense";
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useFinancialCategories = (params?: {
  kind?: FinancialCategory["kind"];
  isActive?: boolean;
}) =>
  useQuery<FinancialCategory[]>({
    queryKey: ["financial-categories", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/financial-categories", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

export const useCreateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Pick<FinancialCategory, "kind" | "name">) => {
      const { data } = await apiClient.post("/financial-categories", category);
      return data?.data || data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["financial-categories"] }),
  });
};

export const useUpdateFinancialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...changes
    }: {
      id: string;
      name?: string;
      isActive?: boolean;
    }) => {
      const { data } = await apiClient.patch(
        `/financial-categories/${id}`,
        changes,
      );
      return data?.data || data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["financial-categories"] }),
  });
};

// ==================== INCOME ====================

export interface IncomeRecord {
  id: string;
  amount: number;
  categoryId: string;
  category?: FinancialCategory;
  source: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeQueryParams {
  search?: string;
  status?: string;
  type?: string;
}

export type CreateIncomeInput = Pick<
  IncomeRecord,
  "amount" | "categoryId" | "source" | "description" | "status"
> & { date: string };

export const useIncomeRecords = (params?: IncomeQueryParams) => {
  return useQuery<IncomeRecord[]>({
    queryKey: ["income", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/income", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.income)) return data.income;
      return [];
    },
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: CreateIncomeInput) => {
      const { data } = await apiClient.post<any>("/income", record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...record
    }: Partial<CreateIncomeInput> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/income/${id}`, record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/income/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateIncomeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/income/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};


export const exportIncomeToCsv = async (params?: IncomeQueryParams) => {
  const response = await apiClient.get('/income/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

// ==================== EXPENSES ====================

export interface ExpenseRecord {
  id: string;
  amount: number;
  categoryId: string;
  category?: FinancialCategory;
  paidTo: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseQueryParams {
  search?: string;
  status?: string;
  category?: string;
}

export type CreateExpenseInput = Pick<
  ExpenseRecord,
  "amount" | "categoryId" | "date" | "paidTo" | "description" | "status"
> & { date: string };

export const useExpenseRecords = (params?: ExpenseQueryParams) => {
  return useQuery<ExpenseRecord[]>({
    queryKey: ["expenses", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/expenses", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.expenses)) return data.expenses;
      return [];
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: CreateExpenseInput) => {
      const { data } = await apiClient.post<any>("/expenses", record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...record
    }: Partial<CreateExpenseInput> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/expenses/${id}`, record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/expenses/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateExpenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/expenses/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};


export const exportExpensesToCsv = async (params?: ExpenseQueryParams) => {
  const response = await apiClient.get('/expenses/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const useUploadExpenseReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<any>(
        `/expenses/${id}/receipt`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
};

// ==================== INVOICES ====================

export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  issuedDate?: string;
  dueDate?: string;
  paidAt?: string;
  items: InvoiceItem[];
  orderId?: string;
  quoteId?: string;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  billingAddress?: string;
  discount?: number;
  tax?: number;
  currency?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | string;
  pdfUrl?: string;
  total?: number;
  amountDue?: number;
  paidAmount?: number;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

type CreateInvoiceInput = {
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  orderId?: string;
  quoteId?: string;
  contactId?: string;
  billingAddress?: string;
  discount?: number;
  tax?: number;
  currency?: string;
  status?: Invoice["status"];
};

export interface InvoiceQueryParams {
  search?: string;
  contactId?: string;
  status?: string;
}

export const useInvoices = (params?: InvoiceQueryParams) => {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/invoices", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.invoices)) return data.invoices;
      return [];
    },
  });
};


export const exportInvoicesToCsv = async (params?: InvoiceQueryParams) => {
  const response = await apiClient.get('/invoices/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const useInvoice = (id?: string) => {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(`/invoices/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export interface InvoiceStatusStats {
  count: number;
  total: number;
}

export interface InvoiceStatsData {
  totalInvoices: number;
  [status: string]: number | InvoiceStatusStats;
}

export const useInvoiceStats = () => {
  return useQuery<InvoiceStatsData>({
    queryKey: ["invoices", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/invoices/stats");
      return data?.data || data;
    },
  });
};

export interface InvoiceBrandingConfig {
  logo?: string;
  companyName?: string;
  companyAddress?: string;
  primaryColor?: string;
  accentColor?: string;
  notes?: string;
  terms?: string;
}

export const useInvoiceBranding = () => {
  return useQuery<InvoiceBrandingConfig>({
    queryKey: ["invoices", "branding"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/invoices/branding");
      return data?.data || data;
    },
  });
};

export const useUpdateInvoiceBranding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (branding: InvoiceBrandingConfig) => {
      const { data } = await apiClient.patch<any>(
        "/invoices/branding",
        branding,
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", "branding"] });
    },
  });
};

export const useInvoiceHtml = (id?: string) => {
  return useQuery<string>({
    queryKey: ["invoices", id, "html"],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<string>(`/invoices/${id}/html`);
      return data;
    },
    enabled: !!id,
  });
};

export const useInvoicePdf = (id?: string) => {
  return useQuery<Blob>({
    queryKey: ["invoices", id, "pdf"],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: CreateInvoiceInput) => {
      const { data } = await apiClient.post<any>("/invoices", invoice);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...invoice
    }: Partial<Invoice> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/invoices/${id}`, invoice);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/invoices/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/invoices/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/invoices/${id}/send`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/invoices/${id}/cancel`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

// ==================== PAYMENTS & RECEIPTS ====================

export interface InvoicePaymentPayload {
  amount: number;
  method: string;
  reference?: string;
  paidAt?: string;
  notes?: string;
  sendEmail?: boolean;
}

export interface PaymentLedgerEntry {
  id: string;
  invoiceId: string;
  receiptId?: string;
  receiptNumber?: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt: string;
  notes?: string;
  createdAt?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoice?: Invoice;
  paymentId?: string;
  payment?: PaymentLedgerEntry;
  amount: number;
  currency?: string;
  status: "issued" | "void" | string;
  issuedAt?: string;
  voidReason?: string;
  voidedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useInvoicePayments = (invoiceId?: string) => {
  return useQuery<PaymentLedgerEntry[]>({
    queryKey: ["invoices", invoiceId, "payments"],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(
        `/invoices/${invoiceId}/payments`,
      );
      const payload = data?.data ?? data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.payments)) return payload.payments;
      return [];
    },
    enabled: !!invoiceId,
  });
};

export const useInvoiceReceipts = (invoiceId?: string) => {
  return useQuery<Receipt[]>({
    queryKey: ["invoices", invoiceId, "receipts"],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(
        `/invoices/${invoiceId}/receipts`,
      );
      const payload = data?.data ?? data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.receipts)) return payload.receipts;
      return [];
    },
    enabled: !!invoiceId,
  });
};

export const useRecordInvoicePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoiceId,
      ...payload
    }: InvoicePaymentPayload & { invoiceId: string }) => {
      const { data } = await apiClient.post<any>(
        `/invoices/${invoiceId}/payments`,
        payload,
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({
        queryKey: ["invoices", variables.invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", variables.invoiceId, "payments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", variables.invoiceId, "receipts"],
      });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "outstanding-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "invoice-revenue"] });
    },
  });
};

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

export const useReceiptHtml = (id?: string) => {
  return useQuery<string>({
    queryKey: ["receipts", id, "html"],
    queryFn: async () => {
      if (!id) throw new Error("Receipt ID required");
      const { data } = await apiClient.get<any>(`/receipts/${id}/html`);
      const html = typeof data === "string" ? data : data?.html ?? data?.data?.html ?? data?.data;
      if (typeof html !== "string") throw new Error("Receipt preview is unavailable.");
      return html;
    },
    enabled: !!id,
  });
};

export const downloadReceiptPdf = async (id: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(`/receipts/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
};

export const useReceiptPdf = (id?: string) => {
  return useQuery<Blob>({
    queryKey: ["receipts", id, "pdf"],
    queryFn: async () => {
      if (!id) throw new Error("Receipt ID required");
      const { data } = await apiClient.get<Blob>(`/receipts/${id}/pdf`, {
        responseType: "blob",
      });
      return data;
    },
    enabled: !!id,
  });
};

export const useVoidReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.post<any>(`/receipts/${id}/void`, {
        reason,
      });
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "outstanding-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "invoice-revenue"] });
    },
  });
};

export const useResendReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/receipts/${id}/resend`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
};

// ==================== TRANSACTIONS ====================

export interface Transaction {
  id: string;
  date: string;
  type:
    | "Income"
    | "Expense"
    | "Invoice Payment"
    | "Deposit"
    | "Withdrawal"
    | string;
  amount: number;
  description: string;
  status: "Completed" | "Pending" | "Failed" | string;
  reference?: string;
  category?: string;
}

const transactionStatus = (status?: string) => {
  const value = status?.toLowerCase();
  if (["paid", "approved", "completed", "success"].includes(value || "")) {
    return "Completed";
  }
  if (["rejected", "failed"].includes(value || "")) return "Failed";
  return "Pending";
};

export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      // The collection has no /transactions route; combine the two ledgers.
      const [incomeRes, expenseRes] = await Promise.all([
        apiClient.get<any>("/income"),
        apiClient.get<any>("/expenses"),
      ]);
      const income = Array.isArray(incomeRes.data)
        ? incomeRes.data
        : incomeRes.data?.data || [];
      const expenses = Array.isArray(expenseRes.data)
        ? expenseRes.data
        : expenseRes.data?.data || [];
      const list: Transaction[] = [];
      if (Array.isArray(income)) {
        income.forEach((inc: any) => {
          list.push({
            id: inc.id,
            date: inc.date || inc.createdAt || new Date().toISOString(),
            type: "Income",
            amount: Number(inc.amount),
            description: inc.description || `Income from ${inc.source}`,
            status: transactionStatus(inc.status),
            category: inc.type,
          });
        });
      }
      if (Array.isArray(expenses)) {
        expenses.forEach((exp: any) => {
          list.push({
            id: exp.id,
            date: exp.date || exp.createdAt || new Date().toISOString(),
            type: "Expense",
            amount: -Math.abs(Number(exp.amount)),
            description: exp.description || `Payment to ${exp.paidTo}`,
            status: transactionStatus(exp.status),
            category: exp.category,
          });
        });
      }
      return list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },
  });
};
