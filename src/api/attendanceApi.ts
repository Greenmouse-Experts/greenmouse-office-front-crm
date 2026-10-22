import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface DailyReport {
  summary?: string;
  completedTasks?: string[];
  blockers?: string;
  nextSteps?: string;
}

export interface AttendanceRecord {
  id?: string;
  date?: string;
  staffId?: string;
  staff?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  status?: string;
  checkedInAt?: string;
  checkInAt?: string;
  checkInTime?: string;
  attendanceDate?: string;
  createdAt?: string;
  report?: DailyReport | null;
  summary?: string;
  completedTasks?: string[];
  blockers?: string;
  nextSteps?: string;
}

export interface AttendanceFilters {
  from?: string;
  to?: string;
  staffId?: string;
}

const unwrap = (response: unknown): unknown => {
  let value = response;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!value || typeof value !== "object" || Array.isArray(value)) break;
    const data = (value as { data?: unknown }).data;
    if (data === undefined) break;
    value = data;
  }
  return value;
};

const recordsFrom = (response: unknown): AttendanceRecord[] => {
  const value = unwrap(response);
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  for (const key of ["items", "records", "attendance", "attendances", "entries", "results"]) {
    if (Array.isArray(object[key])) return object[key] as AttendanceRecord[];
    if (key === "attendance" && object[key] && typeof object[key] === "object") {
      return [object[key] as AttendanceRecord];
    }
  }
  return object.id || object.staffId || object.checkedInAt || object.checkInAt || object.checkInTime
    ? [object as AttendanceRecord]
    : [];
};

const attendanceKey = ["attendance"] as const;

export const useTodayAttendance = () =>
  useQuery<{ records: AttendanceRecord[]; checkedIn?: boolean }>({
    queryKey: [...attendanceKey, "today"],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance/today");
      const payload = unwrap(data);
      const object = payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload as Record<string, unknown> : {};
      const checkedIn = typeof object.checkedIn === "boolean"
        ? object.checkedIn : typeof object.isCheckedIn === "boolean"
          ? object.isCheckedIn : undefined;
      return { records: recordsFrom(data), checkedIn };
    },
  });

export const useMyAttendance = (filters: Pick<AttendanceFilters, "from" | "to">) =>
  useQuery<AttendanceRecord[]>({
    queryKey: [...attendanceKey, "me", filters.from, filters.to],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance/me", { params: filters });
      return recordsFrom(data);
    },
  });

export const useAttendanceList = (filters: AttendanceFilters, enabled = true) =>
  useQuery<AttendanceRecord[]>({
    queryKey: [...attendanceKey, "list", filters.staffId, filters.from, filters.to],
    queryFn: async () => {
      const { data } = await apiClient.get("/attendance", {
        params: {
          ...(filters.staffId ? { staffId: filters.staffId } : {}),
          from: filters.from,
          to: filters.to,
        },
      });
      return recordsFrom(data);
    },
    enabled,
  });

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/attendance/check-in");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKey }),
  });
};

export const useSaveAttendanceReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, ...report }: DailyReport & { date: string }) => {
      const { data } = await apiClient.put(`/attendance/${date}/report`, report);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKey }),
  });
};
