import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { type ApiResponse } from "./simpleApi";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  data?: any;
}

export interface NotificationsQueryParams {
  limit?: number;
  cursor?: string | null;
  page?: number;
  unreadOnly?: boolean;
}

export const getNotifications = async (
  params?: NotificationsQueryParams,
): Promise<
  ApiResponse<{
    notifications: Notification[];
    hasMore: boolean;
    nextCursor: string | null;
    total: number;
  }>
> => {
  const resp = await apiClient.get("/notifications", {
    params: {
      limit: params?.limit ?? 20,
      cursor: params?.cursor ?? undefined,
      page: params?.page ?? undefined,
    },
  });
  return resp.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch("/notifications/read-all");
};

export const getUnreadCount = async (): Promise<
  ApiResponse<{ count: number }>
> => {
  const resp = await apiClient.get("/notifications/unread-count");
  return resp.data;
};

// ==================== REACT QUERY HOOKS ====================

export const useNotifications = (params?: NotificationsQueryParams) => {
  return useQuery<Notification[]>({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const readPage = async (page: number, limit: number) => {
        const response = await getNotifications({ ...params, page, limit });
        const payload = (response as any)?.data ?? response;
        const notifications: Notification[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.data?.notifications)
                ? payload.data.notifications
                : [];
        const pagination = (response as any)?.pagination ?? payload?.pagination ?? payload?.data?.pagination;
        const hasMore = typeof pagination?.hasMore === "boolean"
          ? pagination.hasMore
          : notifications.length >= limit;
        return { notifications, hasMore };
      };

      const limit = params?.limit ?? 20;
      const page = params?.page ?? 1;
      if (!params?.unreadOnly) {
        return (await readPage(page, limit)).notifications;
      }

      // The API currently rejects unreadOnly as a URL string. Gather enough
      // unfiltered pages to paginate unread notifications accurately.
      const unread: Notification[] = [];
      const seen = new Set<string>();
      const needed = page * limit + 1;
      for (let sourcePage = 1; unread.length < needed; sourcePage += 1) {
        const result = await readPage(sourcePage, limit);
        const newNotifications = result.notifications.filter((notification) => {
          if (seen.has(notification.id)) return false;
          seen.add(notification.id);
          return true;
        });
        unread.push(...newNotifications.filter((notification) => !notification.isRead));
        if (!result.hasMore || newNotifications.length === 0) break;
      }
      return unread.slice((page - 1) * limit, needed);
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery<number>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const data = await getUnreadCount();
      return (data as any)?.data?.count ?? (data as any)?.count ?? 0;
    },
    refetchInterval: 30000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
