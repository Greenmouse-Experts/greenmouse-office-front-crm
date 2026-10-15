import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "email" | "call" | "meeting" | "follow_up" | "task" | string;
  status: "open" | "in_progress" | "completed" | "cancelled" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  relatedType?: "deal" | "lead" | "contact" | "company" | "invoice" | "order" | string;
  relatedId?: string;
  assignedTo?: string;
  assignee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskQueryParams {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  relatedType?: string;
  relatedId?: string;
  dueFrom?: string;
  dueTo?: string;
  overdue?: boolean | string;
  page?: number;
  limit?: number;
}

export interface CalendarTasksParams {
  from: string;
  to: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  relatedType?: string;
  relatedId?: string;
  assignedTo?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

export const useTasks = (params?: TaskQueryParams) => {
  return useQuery<Task[]>({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tasks", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.tasks)) return data.tasks;
      return [];
    },
  });
};

export const useTask = (id?: string) => {
  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: async () => {
      if (!id) throw new Error("Task ID required");
      const { data } = await apiClient.get<any>(`/tasks/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useTaskCalendar = (params: CalendarTasksParams, enabled: boolean = true) => {
  return useQuery<Task[]>({
    queryKey: ["tasks", "calendar", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tasks/calendar", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.tasks)) return data.tasks;
      return [];
    },
    enabled: Boolean(enabled && params.from && params.to),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await apiClient.post<any>("/tasks", payload);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTaskPayload) => {
      const { data } = await apiClient.patch<any>(`/tasks/${id}`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch<any>(`/tasks/${id}/status`, { status });
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/tasks/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
