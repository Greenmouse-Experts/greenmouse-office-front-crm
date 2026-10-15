import apiClient, { type ApiResponse } from "./simpleApi";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export const getNotifications = async (params: {
  limit?: number;
  cursor?: string | null;
}): Promise<
  ApiResponse<{
    notifications: Notification[];
    hasMore: boolean;
    nextCursor: string | null;
    total: number;
  }>
> => {
  const resp = await apiClient.get("/notifications", {
    params: {
      limit: params.limit ?? 20,
      cursor: params.cursor ?? undefined,
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
