import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  get_user_value,
  set_user_value,
  clear_user,
  DEFAULT_ADMIN_SESSION,
  DEFAULT_STAFF_SESSION,
} from "@/store/authStore";
import { toast } from "sonner";
import { documentedEndpoints } from "./endpointManifest";

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  // status: string;
  statusCode: number;
  path: string;
  pagination: Pagination;
}
export interface Pagination {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
  total: number;
}
export interface ApiResponseV2<T = any> {
  message?: string;
  data: { data: T; pagination: Pagination } & { [key: string]: any };
  // status: string;
  status: number;
  path: string;
}

const rawUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://crmgrenmouse-backend-api.onrender.com/v1/";
export const new_url = rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`;

export class UnsupportedApiEndpointError extends Error {
  constructor(method: string, path: string) {
    super(
      `${method.toUpperCase()} ${path} is not in the current Office CRM API collection.`,
    );
    this.name = "UnsupportedApiEndpointError";
  }
}

const endpointPatterns = documentedEndpoints.map((signature) => {
  const [method, path] = signature.split(" ");
  const pattern = path
    .split("/")
    .map((segment) =>
      segment.startsWith(":")
        ? "[^/]+"
        : segment.replace(/[^a-zA-Z0-9_-]/g, "\\$&"),
    )
    .join("/");
  return { method, pattern: new RegExp(`^${pattern}$`) };
});

export const isSupportedApiEndpoint = (method: string, url: string) => {
  const pathname = new URL(url, new_url).pathname.replace(/\/$/, "") || "/";
  const path =
    pathname === "/v1" || pathname.startsWith("/v1/")
      ? pathname
      : `/v1${pathname}`;
  return endpointPatterns.some(
    (entry) =>
      entry.method === method.toUpperCase() && entry.pattern.test(path),
  );
};

const apiClient = axios.create({
  baseURL: new_url,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const user = get_user_value();
  const token =
    user?.accessToken ||
    (config.url?.startsWith("/admin") || config.url?.startsWith("admin")
      ? DEFAULT_ADMIN_SESSION.accessToken
      : DEFAULT_STAFF_SESSION.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Standardize /admin/* to /admins/* so all admin endpoints route cleanly to the backend
  if (config.url) {
    if (
      config.url.startsWith("/admin/") &&
      !config.url.startsWith("/admin/login")
    ) {
      config.url = config.url.replace(/^\/admin\//, "/admins/");
    } else if (
      config.url.startsWith("admin/") &&
      !config.url.startsWith("admin/login")
    ) {
      config.url = config.url.replace(/^admin\//, "admins/");
    }
  }
  if (
    config.url &&
    !isSupportedApiEndpoint(config.method || "get", config.url)
  ) {
    const pathname = new URL(config.url, new_url).pathname;
    throw new UnsupportedApiEndpointError(config.method || "get", pathname);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const user = get_user_value();
  if (!user?.refreshToken) {
    throw new Error("No refresh token available");
  }

  const refreshEndpoint = "auth/refresh";

  const { data } = await axios.post(`${new_url}${refreshEndpoint}`, {
    refreshToken: user.refreshToken,
  });

  const newAccessToken =
    data?.data?.accessToken || data?.accessToken || data?.payload?.accessToken;
  const newRefreshToken =
    data?.data?.refreshToken ||
    data?.refreshToken ||
    data?.payload?.refreshToken ||
    user.refreshToken;

  if (!newAccessToken) {
    throw new Error("New access token not received.");
  }

  set_user_value({
    ...user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return newAccessToken;
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Do not attempt to refresh if:
    // 1. Not a 401 error
    // 2. Request config is missing or already retried
    // 3. Request URL is an auth or refresh endpoint (prevents infinite refresh loops)
    const url = original?.url || "";
    const isAuthEndpoint =
      url.includes("auth/refresh") ||
      url.includes("auth/login") ||
      url.includes("auth/admin/login") ||
      url.includes("auth/staff/login") ||
      url.includes("auth/logout");

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      }
    } catch (refreshErr) {
      console.error("Token refresh failed, ending session:", refreshErr);
      clear_user();

      if (typeof window !== "undefined") {
        toast.info("Session expired. Please log in again.", { duration: 2500 });
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/")) {
          const redirectUrl = currentPath.startsWith("/admin")
            ? "/auth/admin"
            : "/auth/login";
          window.location.href = redirectUrl;
        }
      }
      return Promise.reject(refreshErr);
    }

    return Promise.reject(error);
  },
);

export const test_route = (route: string) =>
  useQuery({
    queryKey: ["test_route", route],
    queryFn: async () => {
      let resp = await apiClient.get(route);
      return resp;
    },
  });

export default apiClient;
