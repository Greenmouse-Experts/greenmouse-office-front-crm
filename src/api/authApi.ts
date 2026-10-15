import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import {
  set_user_value,
  clear_user,
  get_user_value,
  type AuthUser as StoreAuthSession,
} from "@/store/authStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminSetupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  roleId?: string;
  companyId?: string;
  avatar?: string;
  permissions?: string[];
  isOnboarded?: boolean;
  isSuperAdmin?: boolean;
  [key: string]: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: UserAccount;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserAccount;
}

// Client functions
export const staffLogin = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<any>("/auth/staff/login", payload);
  const result = data?.data || data;
  if (result?.accessToken) {
    set_user_value({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as any,
    });
  }
  return result;
};

export const adminLogin = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<any>("/auth/admin/login", payload);
  const result = data?.data || data;
  if (result?.accessToken) {
    set_user_value({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user as any,
    });
  }
  return result;
};

export const refreshToken = async (): Promise<AuthTokens> => {
  const currentUser = get_user_value();
  const { data } = await apiClient.post<any>("/auth/refresh", {
    refreshToken: currentUser?.refreshToken,
  });
  const result = data?.data || data;
  if (result?.accessToken) {
    set_user_value({
      ...(currentUser as StoreAuthSession),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || currentUser?.refreshToken || "",
      user: (result.user || currentUser?.user) as any,
    });
  }
  return result;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clear_user();
  }
};

export const getCurrentUser = async (): Promise<UserAccount> => {
  const { data } = await apiClient.get<any>("/auth/me");
  return data?.data || data;
};

// React Query Hooks
export const useStaffLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useAdminSetup = () => {
  return useMutation({
    mutationFn: async (payload: AdminSetupPayload) => {
      const { data } = await apiClient.post<any>("/admins/setup", payload);
      return data?.data || data;
    },
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useAuthMe = () => {
  const user = get_user_value();
  return useQuery<UserAccount>({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: !!user?.accessToken,
  });
};
