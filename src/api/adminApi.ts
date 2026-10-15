import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== DASHBOARD TYPES & HOOKS ====================

export interface DashboardStats {
  totalStaffs: number;
  totalInvoices: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface DashboardBalance {
  totalBalance: number;
  incomeToday: number;
  expenseToday: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
}

export interface DashboardIncomeExpense {
  year: number;
  months: string[];
  income: number[];
  expense: number[];
}

export interface DashboardProfit {
  year: number;
  months: string[];
  profit: number[];
}

export interface DashboardUserAnalytics {
  users: number;
  products: number;
  expenses: number;
  revenue: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>(
        "/admins/dashboard/stats",
      );
      return data;
    },
  });
};

export const useDashboardBalance = () => {
  return useQuery<DashboardBalance>({
    queryKey: ["dashboard", "balance"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardBalance>(
        "/admins/dashboard/balance",
      );
      return data;
    },
  });
};

export const useDashboardIncomeExpense = (
  year: number = new Date().getFullYear(),
) => {
  return useQuery<DashboardIncomeExpense>({
    queryKey: ["dashboard", "income-expense", year],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardIncomeExpense>(
        `/admins/dashboard/income-expense?year=${year}`,
      );
      return data;
    },
  });
};

export const useDashboardProfit = (year: number = new Date().getFullYear()) => {
  return useQuery<DashboardProfit>({
    queryKey: ["dashboard", "profit", year],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardProfit>(
        `/admins/dashboard/profit?year=${year}`,
      );
      return data;
    },
  });
};

export const useDashboardUserAnalytics = () => {
  return useQuery<DashboardUserAnalytics>({
    queryKey: ["dashboard", "user-analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardUserAnalytics>(
        "/admins/dashboard/user-analytics",
      );
      return data;
    },
  });
};

// ==================== TENANTS TYPES & HOOKS ====================

export interface Tenant {
  id: string;
  email: string;
  companyName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  status: "active" | "suspended" | string;
  subscriptionStatus: "trial" | "active" | "expired" | string;
  subscriptionPlanId?: string;
  billingCycle?: string;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantStats {
  total: number;
  active: number;
  suspended: number;
  trial: number;
  verified: number;
}

export interface TenantFilterParams {
  search?: string;
  subscriptionStatus?: string;
  status?: string;
}

export const useAdminTenants = (params?: TenantFilterParams) => {
  return useQuery<Tenant[]>({
    queryKey: ["admin", "tenants", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.set("search", params.search);
      if (params?.subscriptionStatus && params.subscriptionStatus !== "all") {
        queryParams.set("subscriptionStatus", params.subscriptionStatus);
      }
      if (params?.status && params.status !== "all") {
        queryParams.set("status", params.status);
      }
      const queryString = queryParams.toString();
      const url = queryString
        ? `/admins/tenants?${queryString}`
        : "/admins/tenants";
      const { data } = await apiClient.get<unknown>(url);
      if (Array.isArray(data)) return data as Tenant[];
      const payload = asObject(data)?.data ?? data;
      if (Array.isArray(payload)) return payload as Tenant[];
      const nested = asObject(payload);
      if (Array.isArray(nested?.data)) return nested.data as Tenant[];
      if (Array.isArray(nested?.tenants)) return nested.tenants as Tenant[];
      throw new Error("Tenant list format is not supported.");
    },
  });
};

export const useAdminTenantStats = () => {
  return useQuery<TenantStats>({
    queryKey: ["admin", "tenants", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<TenantStats>(
        "/admins/tenants/stats",
      );
      return data;
    },
  });
};

export const useAdminTenant = (id?: string) => {
  return useQuery<Tenant>({
    queryKey: ["admin", "tenants", id],
    queryFn: async () => {
      if (!id) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<unknown>(`/admins/tenants/${id}`);
      const payload = unwrapTenantPayload(data);
      const tenant = asObject(payload)?.tenant ?? payload;
      if (!asObject(tenant)?.id) {
        throw new Error("Tenant detail format is not supported.");
      }
      return tenant as Tenant;
    },
    enabled: !!id,
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/admins/tenants/${id}/status`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
};

export const useAssignTenantSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subscriptionPlanId,
      billingCycle,
    }: {
      id: string;
      subscriptionPlanId: string;
      billingCycle: "monthly" | "yearly";
    }) => {
      const { data } = await apiClient.patch(
        `/admins/tenants/${id}/subscription`,
        {
          subscriptionPlanId,
          billingCycle,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
};

// ==================== SUBSCRIPTIONS TYPES & HOOKS ====================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxStaff: number;
  maxContacts: number;
  maxProducts: number;
  maxServices: number;
  maxInvoicesPerMonth: number;
  maxOrdersPerMonth: number;
  maxCategories: number;
  features: string[];
  paystackPlanCodeMonthly?: string | null;
  paystackPlanCodeYearly?: string | null;
  isCustomPrice: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const useAdminSubscriptions = (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  return useQuery<SubscriptionPlansResponse>({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", String(params.page));
      if (params?.limit) queryParams.set("limit", String(params.limit));
      if (params?.isActive !== undefined)
        queryParams.set("isActive", String(params.isActive));
      const queryString = queryParams.toString();
      const url = queryString
        ? `/admins/subscriptions?${queryString}`
        : "/admins/subscriptions";
      const { data } = await apiClient.get<SubscriptionPlansResponse>(url);
      return data;
    },
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<SubscriptionPlan>) => {
      const { data } = await apiClient.post<SubscriptionPlan>(
        "/admins/subscriptions",
        plan,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...plan
    }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data } = await apiClient.patch<SubscriptionPlan>(
        `/admins/subscriptions/${id}`,
        plan,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/admins/subscriptions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export interface SubscriptionFeature {
  key: string;
  name: string;
  description?: string;
  category?: string;
}

export const useAdminSubscriptionFeatures = () => {
  return useQuery<any>({
    queryKey: ["admin", "subscriptions", "features"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/subscriptions/features",
      );
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    },
  });
};

// ==================== ADMIN PROFILE & SECURITY HOOKS ====================

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePic?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfile>("/admins/profile");
      return data;
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<AdminProfile>) => {
      const { data } = await apiClient.patch<AdminProfile>(
        "/admins/profile",
        profile,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });
};

export const useChangeAdminPassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      const { data } = await apiClient.patch(
        "/admins/change-password",
        payload,
      );
      return data;
    },
  });
};

export interface AdminPermission {
  key: string;
  description: string;
}

export const useAdminPermissions = () => {
  return useQuery<AdminPermission[]>({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<any>("/admins/permissions");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.permissions)
              ? data.permissions
              : [];
        return list.map((item: any) => {
          if (typeof item === "string") {
            return { key: item, description: item.replace(/[:_]/g, " ") };
          }
          return {
            key: item.key || item.name || item.id || "",
            description: item.description || item.name || item.key || "",
          };
        });
      } catch {
        const { data } = await apiClient.get<any>("/admins/permissions");
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        return list;
      }
    },
  });
};

// ==================== STAFFS & ROLES HOOKS ====================

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
    permissions?: string[];
  };
  status: "active" | "inactive" | string;
  profilePic?: string;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt?: string;
}

export interface RolePermission {
  key: string;
  name?: string;
  description: string;
  category?: string;
}

export const useStaff = (id: string) => {
  return useQuery<StaffMember>({
    queryKey: ["staff", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/admins/staff/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useStaffs = () => {
  return useQuery<StaffMember[]>({
    queryKey: ["staffs"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/staff");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.staffs)) return data.staffs;
      return [];
    },
  });
};

export const useRole = (id: string) => {
  return useQuery<Role>({
    queryKey: ["role", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/admins/roles/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/roles");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.roles)) return data.roles;
      return [];
    },
  });
};

export const useRolePermissions = () => {
  return useQuery<RolePermission[]>({
    queryKey: ["roles", "permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/permissions");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.permissions)
            ? data.permissions
            : [];
      return list.map((item: any) => {
        if (typeof item === "string") {
          return {
            key: item,
            name: item,
            description: item.replace(/[:_]/g, " "),
            category: item.split(":")[0] || "general",
          };
        }
        const key = item.key || item.name || item.permission || item.id || "";
        const name = item.name || item.label || key;
        const description = item.description || item.desc || name;
        const category =
          item.category || item.module || key.split(":")[0] || "general";
        return {
          key,
          name,
          description,
          category,
        };
      });
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: {
      name: string;
      description?: string;
      permissions: string[];
    }) => {
      const { data } = await apiClient.post<any>("/admins/roles", role);
      const created = data?.data || data;
      if (created?.id && role.permissions && role.permissions.length > 0) {
        try {
          await apiClient.patch(`/admins/roles/${created.id}/permissions`, {
            permissions: role.permissions,
          });
        } catch {
          // ignore secondary sync
        }
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      permissions,
    }: {
      id: string;
      name?: string;
      description?: string;
      permissions?: string[];
    }) => {
      const { data } = await apiClient.patch<any>(`/admins/roles/${id}`, {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(permissions ? { permissions } : {}),
      });
      if (permissions) {
        try {
          await apiClient.patch(`/admins/roles/${id}/permissions`, {
            permissions,
          });
        } catch {
          // ignore if already handled
        }
      }
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      permissions,
    }: {
      id: string;
      permissions: string[];
    }) => {
      const { data } = await apiClient.patch<any>(
        `/admins/roles/${id}/permissions`,
        {
          permissions,
        },
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/admins/roles/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      roleId?: string;
      profilePic?: string;
    }) => {
      const { data } = await apiClient.post<any>("/admins/staff", staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...staff
    }: Partial<StaffMember> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/admins/staff/${id}`, staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/admins/staff/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

// ==================== PLATFORM OVERVIEW & ANALYTICS ====================

export interface PlatformOverviewSummary {
  mrr?: number;
  totalTenants?: number;
  activeTenants?: number;
  trialingTenants?: number;
  expiringTrials?: number;
  churnRate?: number;
  [key: string]: any;
}

export interface RevenueTrendPoint {
  month: string;
  added: number;
  lost: number;
  net: number;
}

export interface RevenueTrend {
  trend: RevenueTrendPoint[];
  note?: string;
}

export interface PlanDistributionItem {
  planId: string;
  planName: string;
  tenantCount: number;
  percentage?: number;
}

export interface TrialFunnelData {
  started: number;
  converted: number;
  expired: number;
  conversionRate: number;
}

export interface TenantEngagementData {
  dailyActiveTenants?: number;
  weeklyActiveTenants?: number;
  dormantTenants?: number;
  onboardingCompletedPercent?: number;
  [key: string]: any;
}

export const useAdminPlatformOverview = () => {
  return useQuery<PlatformOverviewSummary>({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/overview");
      return data?.data || data;
    },
  });
};

export function parseAdminRevenueTrend(response: unknown): RevenueTrend {
  const outer = asObject(response);
  const payload = asObject(outer?.data) ?? outer;
  if (!payload || !Array.isArray(payload.trend)) {
    throw new Error("Revenue trend format is not supported.");
  }

  const trend = payload.trend.map((row): RevenueTrendPoint => {
    const point = asObject(row);
    const added = amount(point?.added);
    const lost = amount(point?.lost);
    const net = amount(point?.net);
    if (
      typeof point?.month !== "string" ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.month) ||
      added === null ||
      lost === null ||
      net === null
    ) {
      throw new Error("Revenue trend format is not supported.");
    }
    return { month: point.month, added, lost, net };
  });

  return {
    trend,
    ...(typeof payload.note === "string" ? { note: payload.note } : {}),
  };
}

export const useAdminRevenueTrend = () => {
  return useQuery<RevenueTrend>({
    queryKey: ["admin", "overview", "revenue-trend"],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>(
        "/admins/overview/revenue-trend",
      );
      return parseAdminRevenueTrend(data);
    },
  });
};

export interface TenantRevenueMonth {
  month: string;
  invoiced: number;
  received: number;
}

export interface TenantRevenueTrend {
  months: TenantRevenueMonth[];
  outstandingTotal?: number;
  currency?: string;
}

const asObject = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const amount = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const firstAmount = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const parsed = amount(record[key]);
    if (parsed !== null) return parsed;
  }
  return null;
};

export function parseTenantRevenueTrend(response: unknown): TenantRevenueTrend {
  let payload: unknown = response;
  for (let depth = 0; depth < 3; depth += 1) {
    const object = asObject(payload);
    if (!object || object.data === undefined) break;
    payload = object.data;
  }

  const report = asObject(payload);
  const rows = Array.isArray(payload)
    ? payload
    : [report?.monthly, report?.trend, report?.points, report?.months].find(
        Array.isArray,
      );

  if (!rows) throw new Error("Revenue report format is not supported.");

  const months = rows.map((row, index): TenantRevenueMonth => {
    const item = asObject(row);
    const parallelMonths = Array.isArray(report?.months) ? report.months : [];
    const month =
      item?.month ??
      item?.label ??
      item?.period ??
      item?.name ??
      parallelMonths[index];
    const invoiced = item
      ? firstAmount(item, [
          "invoiced",
          "invoicedAmount",
          "totalInvoiced",
          "invoiceTotal",
        ])
      : amount(
          Array.isArray(report?.invoiced) ? report.invoiced[index] : undefined,
        );
    const received = item
      ? firstAmount(item, [
          "received",
          "receivedAmount",
          "totalReceived",
          "paid",
        ])
      : amount(
          Array.isArray(report?.received) ? report.received[index] : undefined,
        );

    if (month === undefined || (invoiced === null && received === null)) {
      throw new Error("Revenue report format is not supported.");
    }
    return {
      month: String(month),
      invoiced: invoiced ?? 0,
      received: received ?? 0,
    };
  });

  const outstandingTotal = report
    ? firstAmount(report, [
        "outstandingTotal",
        "totalOutstanding",
        "outstanding",
      ])
    : null;
  return {
    months,
    ...(outstandingTotal !== null ? { outstandingTotal } : {}),
    ...(typeof report?.currency === "string"
      ? { currency: report.currency }
      : {}),
  };
}

export const useAdminTenantRevenueTrend = (tenantId: string, year: number) => {
  return useQuery<TenantRevenueTrend>({
    queryKey: ["admin", "reports", "revenue-trend", tenantId, year],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>(
        "/admins/reports/revenue-trend",
        {
          params: { tenantId, year },
        },
      );
      return parseTenantRevenueTrend(data);
    },
  });
};

export const useAdminPlanDistribution = () => {
  return useQuery<PlanDistributionItem[]>({
    queryKey: ["admin", "overview", "plan-distribution"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/overview/plan-distribution",
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminTrialFunnel = () => {
  return useQuery<TrialFunnelData>({
    queryKey: ["admin", "overview", "trial-funnel"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/overview/trial-funnel",
      );
      return data?.data || data;
    },
  });
};

export const useAdminEngagement = () => {
  return useQuery<TenantEngagementData>({
    queryKey: ["admin", "overview", "engagement"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/overview/engagement");
      return data?.data || data;
    },
  });
};

// ==================== TENANT DEEP DIVES ====================

function unwrapTenantPayload(value: unknown): unknown {
  let payload = value;
  for (let depth = 0; depth < 3; depth += 1) {
    const nested = asObject(payload);
    if (!nested || nested.data === undefined) break;
    payload = nested.data;
  }
  return payload;
}

export function tenantRelatedRows(response: unknown): Record<string, unknown>[] {
  const payload = unwrapTenantPayload(response);
  const object = asObject(payload);
  const rows = Array.isArray(payload)
    ? payload
    : [object?.items, object?.history, object?.activity, object?.records, object?.results].find(Array.isArray);
  if (!rows) throw new Error("Tenant activity format is not supported.");
  if (!rows.every(isTenantRecord)) {
    throw new Error("Tenant activity format is not supported.");
  }
  return rows;
}

const isTenantRecord = (value: unknown): value is Record<string, unknown> =>
  asObject(value) !== null;

export const useAdminTenantHistory = (tenantId?: string) => {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["admin", "tenants", tenantId, "history"],
    queryFn: async () => {
      if (!tenantId) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<unknown>(
        `/admins/tenants/${tenantId}/history`,
      );
      return tenantRelatedRows(data);
    },
    enabled: !!tenantId,
  });
};

export const useAdminTenantLoginActivity = (tenantId?: string) => {
  return useQuery<Record<string, unknown>[]>({
    queryKey: ["admin", "tenants", tenantId, "login-activity"],
    queryFn: async () => {
      if (!tenantId) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<unknown>(
        `/admins/tenants/${tenantId}/login-activity`,
      );
      return tenantRelatedRows(data);
    },
    enabled: !!tenantId,
  });
};

export const useAdminTenantOnboarding = (tenantId?: string) => {
  return useQuery<unknown>({
    queryKey: ["admin", "tenants", tenantId, "onboarding"],
    queryFn: async () => {
      if (!tenantId) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<unknown>(
        `/admins/tenants/${tenantId}/onboarding`,
      );
      return unwrapTenantPayload(data);
    },
    enabled: !!tenantId,
  });
};

export const useAdminTenantReminders = (tenantId?: string) => {
  return useQuery<unknown>({
    queryKey: ["admin", "tenants", tenantId, "reminders"],
    queryFn: async () => {
      if (!tenantId) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<unknown>(
        `/admins/tenants/${tenantId}/reminders`,
      );
      return unwrapTenantPayload(data);
    },
    enabled: !!tenantId,
  });
};

// ==================== AGGREGATE STATS & CROSS-TENANT EXTRAS ====================

export const useAdminInvoiceStats = () => {
  return useQuery<any>({
    queryKey: ["admin", "invoices", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/invoices/stats");
      return data?.data || data;
    },
  });
};

export const useAdminOrderStats = () => {
  return useQuery<any>({
    queryKey: ["admin", "orders", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/orders/stats");
      return data?.data || data;
    },
  });
};

export const useAdminQuoteStats = () => {
  return useQuery<any>({
    queryKey: ["admin", "quotes", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/quotes/stats");
      return data?.data || data;
    },
  });
};

export const useAdminCrossQuotes = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "quotes", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/quotes", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossQuote = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "quotes", id],
    queryFn: async () => {
      if (!id) throw new Error("Quote ID required");
      const { data } = await apiClient.get<any>(`/admins/quotes/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminDealsKanban = (pipelineId?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "deals", "kanban", pipelineId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/deals/kanban", {
        params: pipelineId ? { pipelineId } : undefined,
      });
      return data?.data || data;
    },
  });
};

export const useAdminCrossStaffs = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "staff", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/staff", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossStaff = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "staff", id],
    queryFn: async () => {
      if (!id) throw new Error("Staff ID required");
      const { data } = await apiClient.get<any>(`/admins/staff/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossCompanies = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "companies", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/companies", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossCompany = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "companies", id],
    queryFn: async () => {
      if (!id) throw new Error("Company ID required");
      const { data } = await apiClient.get<any>(`/admins/companies/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossContacts = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "contacts", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/contacts", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossContact = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "contacts", id],
    queryFn: async () => {
      if (!id) throw new Error("Contact ID required");
      const { data } = await apiClient.get<any>(`/admins/contacts/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossInvoices = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/invoices", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossInvoice = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "invoices", id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(`/admins/invoices/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossInvoicePayments = (invoiceId?: string) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "invoices", invoiceId, "payments"],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(
        `/admins/invoices/${invoiceId}/payments`,
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    enabled: !!invoiceId,
  });
};

export const useAdminCrossInvoiceReceipts = (invoiceId?: string) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "invoices", invoiceId, "receipts"],
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(
        `/admins/invoices/${invoiceId}/receipts`,
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    enabled: !!invoiceId,
  });
};

export const useAdminCrossInvoiceBranding = (tenantId?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "invoices", "branding", tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/invoices/branding", {
        params: tenantId ? { tenantId } : undefined,
      });
      return data?.data || data;
    },
  });
};

export const useAdminCrossReceipt = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "receipts", id],
    queryFn: async () => {
      if (!id) throw new Error("Receipt ID required");
      const { data } = await apiClient.get<any>(`/admins/receipts/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossOrders = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "orders", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/orders", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossOrder = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "orders", id],
    queryFn: async () => {
      if (!id) throw new Error("Order ID required");
      const { data } = await apiClient.get<any>(`/admins/orders/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossIncome = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "income", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/income", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossIncomeRecord = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "income", id],
    queryFn: async () => {
      if (!id) throw new Error("Income ID required");
      const { data } = await apiClient.get<any>(`/admins/income/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossExpenses = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "expenses", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/expenses", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossExpenseRecord = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "expenses", id],
    queryFn: async () => {
      if (!id) throw new Error("Expense ID required");
      const { data } = await apiClient.get<any>(`/admins/expenses/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossPipelines = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "pipelines", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/pipelines", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossPipeline = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "pipelines", id],
    queryFn: async () => {
      if (!id) throw new Error("Pipeline ID required");
      const { data } = await apiClient.get<any>(`/admins/pipelines/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossNotifications = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "notifications", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/notifications", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossUnreadNotificationsCount = (tenantId?: string) => {
  return useQuery<number>({
    queryKey: ["admin", "cross", "notifications", "unread-count", tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/notifications/unread-count",
        {
          params: tenantId ? { tenantId } : undefined,
        },
      );
      return typeof data?.unreadCount === "number"
        ? data.unreadCount
        : Number(data?.data ?? data ?? 0);
    },
  });
};

export const useAdminCrossImportJobs = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "import", "jobs", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/import/jobs", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossImportJob = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "import", "jobs", id],
    queryFn: async () => {
      if (!id) throw new Error("Import Job ID required");
      const { data } = await apiClient.get<any>(`/admins/import/jobs/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossProducts = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "products", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/products", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossProduct = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "products", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID required");
      const { data } = await apiClient.get<any>(`/admins/products/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossServices = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["admin", "cross", "services", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/services", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossService = (id?: string) => {
  return useQuery<any>({
    queryKey: ["admin", "cross", "services", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID required");
      const { data } = await apiClient.get<any>(`/admins/services/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCrossCategories = () => {
  return useQuery<any[]>({
    queryKey: ["admins", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/categories");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCrossCategory = (id: string) => {
  return useQuery<any>({
    queryKey: ["admins", "categories", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/admins/categories/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
};
