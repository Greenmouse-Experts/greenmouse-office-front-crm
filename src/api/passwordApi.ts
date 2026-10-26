import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import apiClient, { new_url } from "./simpleApi";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetOwnerPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const useChangeStaffPassword = () =>
  useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await apiClient.patch("/staffs/profile/password", payload);
      return data;
    },
  });

export const useChangeOwnerPassword = () =>
  useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await apiClient.patch("/owner/password", payload);
      return data;
    },
  });

export const useRequestOwnerPasswordReset = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axios.post(`${new_url}owner/forgot-password`, { email });
      return data;
    },
  });

export const useResetOwnerPassword = () =>
  useMutation({
    mutationFn: async (payload: ResetOwnerPasswordPayload) => {
      const { data } = await axios.post(`${new_url}owner/reset-password`, payload);
      return data;
    },
  });
