import type { ApiResponse } from "@/client/api";
import apiClient from "@/client/api";
import { useAuth, useProfile } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export const extract_message = (data: AxiosError<ApiResponse>) => {
  const api_error = data.response?.data?.message;
  if (!api_error) {
    return (data as any).message || data.message;
  }
  return api_error;
};

export const useLogout = (logoutFn?: () => Promise<any>) => {
  const [, setUser] = useAuth();
  const [, setProfile] = useProfile();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const nav = useNavigate();
  const { mutateAsync } = useMutation({
    mutationFn:
      logoutFn ||
      (async () => {
        let resp = await apiClient.put("/auth/users/logout");
        return resp.data;
      }),
    onSuccess: () => {
      setUser(null);
      setProfile(null);
      resetOnboarding();
      nav({
        to: "/auth/login",
        search: { email: "" },
      });
    },
  });
  const logout = () => {
    toast.promise(mutateAsync(), {
      loading: "Logging out...",
      success: extract_message,
      error: extract_message,
    });
  };
  return { logout };
};
