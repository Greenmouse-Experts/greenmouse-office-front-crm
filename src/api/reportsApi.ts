import { useQuery } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== REPORT TYPES ====================

export interface ReportPeriod {
  from: string;
  to: string;
}

export interface ProfitLossMonthly {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface ProfitLossReport {
  basis: string;
  period: ReportPeriod;
  incomeTotal: number;
  expenseTotal: number;
  profit: number;
  monthly: ProfitLossMonthly[];
  incomeByCategory?: Record<string, number>;
  expenseByCategory?: Record<string, number>;
}

export interface RevenueMonthly {
  month: string;
  total: number;
  count: number;
}

export interface ReportCategory {
  categoryId?: string;
  name: string;
  total: number;
  count: number;
}

export interface RevenueReport {
  basis: string;
  period: ReportPeriod;
  total: number;
  count: number;
  monthly: RevenueMonthly[];
  byCategory?: ReportCategory[];
}

export interface ExpensesReport {
  basis: string;
  period: ReportPeriod;
  total: number;
  count: number;
  monthly: RevenueMonthly[];
  byCategory?: ReportCategory[];
}

export interface InvoiceRevenueMonthly {
  month: string;
  invoiced: number;
  received: number;
  outstanding: number;
}

export interface InvoiceRevenueReport {
  period: ReportPeriod;
  currency: string;
  invoicedTotal: number;
  receivedTotal: number;
  outstandingTotal: number;
  outstandingCount: number;
  legacyPaidWithoutDateCount?: number;
  monthly: InvoiceRevenueMonthly[];
}

export interface OutstandingInvoiceItem {
  id: string;
  invoiceNumber: string;
  issuedDate?: string;
  dueDate?: string;
  status: string;
  currency: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  customer?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
  };
}

export interface OutstandingInvoicesReport {
  currency: string;
  data: OutstandingInvoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PipelineFunnelStage {
  stageId: string;
  stageName: string;
  color?: string;
  order: number;
  count: number;
  value: number;
  conversionRate?: number;
}

export interface PipelineFunnelReport {
  pipelineId?: string;
  pipelineName?: string;
  stages: PipelineFunnelStage[];
  totalDeals: number;
  totalValue: number;
}

export interface WinRateMonthly {
  month: string;
  won: number;
  lost: number;
  rate: number;
}

export interface WinRateReport {
  totalWon: number;
  totalLost: number;
  winRate: number;
  monthly: WinRateMonthly[];
}

export interface AvgDealMonthly {
  month: string;
  averageValue: number;
  count: number;
}

export interface AvgDealReport {
  overallAverage: number;
  monthly: AvgDealMonthly[];
}

export interface CycleTimeMonthly {
  month: string;
  averageDays: number;
  count: number;
}

export interface CycleTimeReport {
  averageDays: number;
  monthly: CycleTimeMonthly[];
}

export interface RevenueTrendMonthly {
  month: string;
  invoiced: number;
  received: number;
}

export interface RevenueTrendReport {
  currency: string;
  year: number;
  totalInvoiced: number;
  totalReceived: number;
  outstandingTotal: number;
  monthly: RevenueTrendMonthly[];
}

export interface StageDwellItem {
  stageId: string;
  stageName: string;
  averageHours: number;
  averageDays: number;
}

export interface StageDwellReport {
  pipelineId?: string;
  stages: StageDwellItem[];
}

export interface ReportDateFilterParams {
  year?: number;
  from?: string;
  to?: string;
}

// ==================== REPORT HOOKS ====================

export const useProfitLossReport = (params?: ReportDateFilterParams) => {
  return useQuery<ProfitLossReport>({
    queryKey: ["reports", "profit-loss", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/profit-loss", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useRevenueReport = (params?: ReportDateFilterParams) => {
  return useQuery<RevenueReport>({
    queryKey: ["reports", "revenue", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/revenue", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useExpensesReport = (params?: ReportDateFilterParams) => {
  return useQuery<ExpensesReport>({
    queryKey: ["reports", "expenses", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/expenses", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useInvoiceRevenueReport = (
  params?: ReportDateFilterParams & { currency?: string },
) => {
  return useQuery<InvoiceRevenueReport>({
    queryKey: ["reports", "invoice-revenue", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/invoice-revenue", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useOutstandingInvoicesReport = (params?: {
  currency?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<OutstandingInvoicesReport>({
    queryKey: ["reports", "outstanding-invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/reports/outstanding-invoices",
        { params },
      );
      if (Array.isArray(data?.data)) return data;
      if (Array.isArray(data?.data?.data)) return data.data;
      return data?.data ?? data;
    },
  });
};

export const usePipelineFunnelReport = (pipelineId?: string) => {
  return useQuery<PipelineFunnelReport>({
    queryKey: ["reports", "pipeline-funnel", pipelineId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/pipeline-funnel", {
        params: { pipelineId },
      });
      return data?.data || data;
    },
  });
};

export const useWinRateReport = (
  params?: { pipelineId?: string; year?: number },
  options?: { enabled?: boolean },
) => {
  return useQuery<WinRateReport>({
    enabled: options?.enabled ?? true,
    queryKey: ["reports", "win-rate", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/win-rate", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useAvgDealReport = (
  params?: { pipelineId?: string; year?: number },
  options?: { enabled?: boolean },
) => {
  return useQuery<AvgDealReport>({
    enabled: options?.enabled ?? true,
    queryKey: ["reports", "avg-deal", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/avg-deal", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useCycleTimeReport = (
  params?: { pipelineId?: string; year?: number },
  options?: { enabled?: boolean },
) => {
  return useQuery<CycleTimeReport>({
    enabled: options?.enabled ?? true,
    queryKey: ["reports", "cycle-time", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/cycle-time", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useRevenueTrendReport = (params?: {
  year?: number;
  currency?: string;
}) => {
  return useQuery<RevenueTrendReport>({
    queryKey: ["reports", "revenue-trend", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/revenue-trend", {
        params,
      });
      return data?.data || data;
    },
  });
};

export const useStageDwellReport = (pipelineId?: string) => {
  return useQuery<StageDwellReport>({
    queryKey: ["reports", "stage-dwell", pipelineId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reports/stage-dwell", {
        params: { pipelineId },
      });
      return data?.data || data;
    },
  });
};
