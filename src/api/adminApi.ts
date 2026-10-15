import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== DASHBOARD RE-EXPORTS ====================
// Dashboard analytics live under /v1/dashboard/* in the backend
export {
  type DashboardStats,
  type DashboardBalance,
  type DashboardIncomeExpense,
  type DashboardProfit,
  type DashboardUserAnalytics,
  useDashboardStats,
  useDashboardBalance,
  useDashboardIncomeExpense,
  useDashboardProfit,
  useDashboardUserAnalytics,
} from "./tenantApi";

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
      const { data } = await apiClient.get<any>("/admins/profile");
      return data?.data || data;
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<AdminProfile>) => {
      const { data } = await apiClient.patch<any>("/admins/profile", profile);
      return data?.data || data;
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
    },
  });
};

// ==================== ADMIN ACCOUNTS & ROLES HOOKS ====================

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
  isActive?: boolean;
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
    queryKey: ["admin", "accounts", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/admins/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useStaffs = () => {
  return useQuery<StaffMember[]>({
    queryKey: ["admin", "accounts"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.admins)) return data.admins;
      return [];
    },
  });
};

export const useRole = (id: string) => {
  return useQuery<Role | undefined>({
    queryKey: ["role", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/admins/roles");
      const roles: Role[] = Array.isArray(data)
        ? data
        : data?.data || data?.roles || [];
      return roles.find((role) => role.id === id);
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
      return data?.data || data;
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
      permissions,
    }: {
      id: string;
      permissions: string[];
    }) => {
      const { data } = await apiClient.patch<any>(
        `/admins/roles/${id}/permissions`,
        { permissions },
      );
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
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      roleId: string;
    }) => {
      const { data } = await apiClient.post<any>("/admins", staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...staff
    }: {
      id: string;
      roleId?: string;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    }) => {
      const { data } = await apiClient.patch<any>(`/admins/${id}`, staff);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/admins/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
  });
};

// ==================== REVENUE & TENANT ACTIVITY PARSERS ====================

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

function unwrapTenantPayload(value: unknown): unknown {
  let payload = value;
  for (let depth = 0; depth < 3; depth += 1) {
    const nested = asObject(payload);
    if (!nested || nested.data === undefined) break;
    payload = nested.data;
  }
  return payload;
}

const isTenantRecord = (value: unknown): value is Record<string, unknown> =>
  asObject(value) !== null;

export function tenantRelatedRows(
  response: unknown,
): Record<string, unknown>[] {
  const payload = unwrapTenantPayload(response);
  const object = asObject(payload);
  const rows = Array.isArray(payload)
    ? payload
    : [
        object?.items,
        object?.history,
        object?.activity,
        object?.records,
        object?.results,
      ].find(Array.isArray);
  if (!rows) throw new Error("Tenant activity format is not supported.");
  if (!rows.every(isTenantRecord)) {
    throw new Error("Tenant activity format is not supported.");
  }
  return rows;
}
