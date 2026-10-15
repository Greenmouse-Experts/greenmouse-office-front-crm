import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface ReminderPreferences {
  invoiceDueEnabled: boolean;
  invoiceOverdueEnabled: boolean;
  dealCloseEnabled: boolean;
  quoteExpiryEnabled: boolean;
  leadDaysBefore: number;
  sendHour: number;
  timezone: string;
  recipientScope: "tenant_only" | "all" | string;
  updatedAt?: string;
}

export interface UpdateReminderPreferencesPayload
  extends Partial<ReminderPreferences> {}

export const useReminderPreferences = () => {
  return useQuery<ReminderPreferences>({
    queryKey: ["reminders", "preferences"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/reminders/preferences");
      return data?.data || data;
    },
  });
};

export const useUpdateReminderPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateReminderPreferencesPayload) => {
      const { data } = await apiClient.patch<any>(
        "/reminders/preferences",
        payload
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "preferences"] });
    },
  });
};
