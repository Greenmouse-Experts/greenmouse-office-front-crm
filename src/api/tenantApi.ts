import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== TENANT PROFILE & ONBOARDING ====================

export interface TenantProfile {
  sub: string;
  email: string;
  companyName: string;
  userType: "tenant" | string;
  isOnboarded: boolean;
}

export interface TenantOnboardingData {
  id?: string;
  _id?: string;
  companyName: string;
  isOnboarded: boolean;
  industry?: string;
  teamSize?: string;
  logo?: string | null;
  theme?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyCountry?: string;
  companyWebsite?: string;
  businessType?: string;
  isCacRegistered?: boolean;
  hearAboutUs?: string;
}

export interface LoginActivity {
  id?: string;
  _id?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  createdAt?: string;
  timestamp?: string;
  status?: string;
}

export interface LoginActivityResponse {
  data?: LoginActivity[];
  total?: number;
  page?: number;
  limit?: number;
}

export const useTenantMe = () => {
  return useQuery<TenantProfile>({
    queryKey: ["tenant", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<TenantProfile>("/tenant/auth/me");
      return data;
    },
  });
};

export const useTenantOnboarding = () => {
  return useQuery<TenantOnboardingData>({
    queryKey: ["tenant", "onboarding"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/onboarding");
      return data?.data ?? data;
    },
  });
};

export const useSaveTenantOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stepData: Partial<TenantOnboardingData>) => {
      const { data } = await apiClient.patch<any>(
        "/tenant/onboarding",
        stepData,
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", "me"] });
    },
  });
};

export const useCompleteTenantOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<any>("/tenant/onboarding/complete");
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });
};

export const useTenantChangeEmail = () => {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      currentPassword?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        "/tenant/auth/change-email",
        payload,
      );
      return data?.data ?? data;
    },
  });
};

export const useTenantLoginActivity = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery<LoginActivity[]>({
    queryKey: ["tenant", "login-activity", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/login-activity", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useTenantLatestLoginActivity = () => {
  return useQuery<LoginActivity | null>({
    queryKey: ["tenant", "login-activity", "latest"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/tenant/login-activity/latest",
      );
      return data?.data ?? data ?? null;
    },
  });
};

// ==================== TENANT DASHBOARD & ANALYTICS ====================

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
    queryKey: ["tenant", "dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/dashboard/stats");
      return data?.data ?? data;
    },
  });
};
export const useTenantDashboardStats = useDashboardStats;

export const useDashboardBalance = () => {
  return useQuery<DashboardBalance>({
    queryKey: ["tenant", "dashboard", "balance"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/dashboard/balance");
      return data?.data ?? data;
    },
  });
};
export const useTenantDashboardBalance = useDashboardBalance;

export const useDashboardIncomeExpense = (
  year: number = new Date().getFullYear(),
) => {
  return useQuery<DashboardIncomeExpense>({
    queryKey: ["tenant", "dashboard", "income-expense", year],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/dashboard/income-expense?year=${year}`,
      );
      return data?.data ?? data;
    },
  });
};
export const useTenantDashboardIncomeExpense = useDashboardIncomeExpense;

export const useDashboardProfit = (year: number = new Date().getFullYear()) => {
  return useQuery<DashboardProfit>({
    queryKey: ["tenant", "dashboard", "profit", year],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/dashboard/profit?year=${year}`,
      );
      return data?.data ?? data;
    },
  });
};
export const useTenantDashboardProfit = useDashboardProfit;

export const useDashboardUserAnalytics = () => {
  return useQuery<DashboardUserAnalytics>({
    queryKey: ["tenant", "dashboard", "user-analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/dashboard/user-analytics");
      return data?.data ?? data;
    },
  });
};
export const useTenantDashboardUserAnalytics = useDashboardUserAnalytics;

// ==================== TENANT STAFFS HOOKS & TYPES ====================

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

export const useStaff = (id: string) => {
  return useQuery<StaffMember>({
    queryKey: ["tenant", "staff", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/staffs/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};
export const useTenantStaff = useStaff;

export const useStaffs = () => {
  return useQuery<StaffMember[]>({
    queryKey: ["tenant", "staffs"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/staffs");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.staffs)) return data.staffs;
      return [];
    },
  });
};
export const useTenantStaffs = useStaffs;

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
      const { data } = await apiClient.post<any>("/staffs", staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};
export const useTenantCreateStaff = useCreateStaff;

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...staff
    }: Partial<StaffMember> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/staffs/${id}`, staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};
export const useTenantUpdateStaff = useUpdateStaff;

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/staffs/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};
export const useTenantDeleteStaff = useDeleteStaff;

// ==================== TENANT RBAC ROLES HOOKS & TYPES ====================

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

export const useRole = (id: string) => {
  return useQuery<Role>({
    queryKey: ["tenant", "role", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/roles/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};
export const useTenantRole = useRole;

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["tenant", "roles"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/roles");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.roles)) return data.roles;
      return [];
    },
  });
};
export const useTenantRoles = useRoles;

export const useRolePermissions = () => {
  return useQuery<RolePermission[]>({
    queryKey: ["tenant", "roles", "permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/roles/permissions");
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
export const useTenantRolePermissions = useRolePermissions;

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: {
      name: string;
      description?: string;
      permissions: string[];
    }) => {
      const { data } = await apiClient.post<any>("/roles", role);
      const created = data?.data || data;
      if (created?.id && role.permissions && role.permissions.length > 0) {
        try {
          await apiClient.patch(`/roles/${created.id}/permissions`, {
            permissions: role.permissions,
          });
        } catch {
          // secondary permissions sync fallback
        }
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
export const useTenantCreateRole = useCreateRole;

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
      const { data } = await apiClient.patch<any>(`/roles/${id}`, {
        name,
        description,
        permissions,
      });
      const updated = data?.data || data;
      if (permissions && permissions.length > 0) {
        try {
          await apiClient.patch(`/roles/${id}/permissions`, {
            permissions,
          });
        } catch {
          // secondary permissions sync fallback
        }
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
export const useTenantUpdateRole = useUpdateRole;

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/roles/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
export const useTenantDeleteRole = useDeleteRole;

// ==================== TENANT SUBSCRIPTION HOOKS & TYPES ====================

export interface TenantCurrentSubscription {
  id?: string;
  planId?: string;
  planName?: string;
  status?: string;
  subscriptionStatus?: string;
  billingCycle?: "monthly" | "yearly" | string;
  trialEndsAt?: string | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  plan?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    priceMonthly?: number;
    priceYearly?: number;
    billingCycle?: string;
    features?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export const useTenantSubscriptionCurrent = () => {
  return useQuery<TenantCurrentSubscription>({
    queryKey: ["tenant", "subscription", "current"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/subscription/current");
      return data?.data ?? data;
    },
  });
};

export const useTenantSubscriptionPlans = () => {
  return useQuery<any[]>({
    queryKey: ["tenant", "subscription", "plans"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/subscription/plans");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useTenantSubscriptionHistory = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery<any[]>({
    queryKey: ["tenant", "subscription", "history", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/tenant/subscription/history",
        {
          params,
        },
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useTenantSubscriptionUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      planId: string;
      billingCycle?: string;
      callbackUrl?: string;
    }) => {
      try {
        const { data } = await apiClient.post<any>(
          "/tenant/subscription/upgrade",
          payload,
        );
        return data?.data ?? data;
      } catch (error: any) {
        const messages = error?.response?.data?.message;
        const rejectedCallback =
          error?.response?.status === 400 &&
          (Array.isArray(messages) ? messages : [messages]).some(
            (message) =>
              typeof message === "string" &&
              message.includes("property callbackUrl should not exist"),
          );
        if (!payload.callbackUrl || !rejectedCallback) throw error;

        // Older API deployments only accept planId and billingCycle.
        const { data } = await apiClient.post<any>(
          "/tenant/subscription/upgrade",
          {
            planId: payload.planId,
            billingCycle: payload.billingCycle,
          },
        );
        return {
          ...(data?.data ?? data),
          callbackUrlRejected: true,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "subscription"] });
    },
  });
};

export const useTenantSubscriptionDowngrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { planId: string }) => {
      const { data } = await apiClient.post<any>(
        "/tenant/subscription/downgrade",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "subscription"] });
    },
  });
};

export const useTenantSubscriptionCancel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<any>("/tenant/subscription/cancel");
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "subscription"] });
    },
  });
};

export const useTenantSubscriptionVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { reference: string }) => {
      const { data } = await apiClient.post<any>(
        "/tenant/subscription/verify",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "subscription"] });
    },
  });
};
