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
      unreadOnly: params?.unreadOnly ?? undefined,
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
      const response = await getNotifications(params);
      const payload = (response as any)?.data ?? response;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.notifications)) return payload.notifications;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.notifications))
        return payload.data.notifications;
      return [];
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
