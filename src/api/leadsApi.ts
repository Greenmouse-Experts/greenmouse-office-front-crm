import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export type LeadSource =
  | "website"
  | "referral"
  | "social_media"
  | "direct"
  | "campaign"
  | "cold_call"
  | "other"
  | string;

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | string;

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: LeadSource;
  status: LeadStatus;
  score?: number;
  notes?: string;
  assignedTo?: string;
  convertedCustomerId?: string | null;
  convertedDealId?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface CreateLeadPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: LeadSource;
  status?: LeadStatus;
  score?: number;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {}

export interface ConvertLeadPayload {
  createDeal?: boolean;
  pipelineId?: string;
  stageId?: string;
  initialValue?: number;
}

export interface ConvertLeadResponse {
  customerId: string;
  dealId?: string | null;
  message?: string;
}

export interface LeadQueryParams {
  status?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ImportSyncResponse {
  success: boolean;
  importedCount: number;
  failedCount?: number;
  errors?: string[];
}

export interface ImportAsyncResponse {
  jobId: string;
  status: string;
  message: string;
}

// ==================== HOOKS ====================

export const useLeads = (params?: LeadQueryParams) => {
  return useQuery<Lead[]>({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/leads", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.leads)) return data.leads;
      return [];
    },
  });
};

export const useLead = (id?: string) => {
  return useQuery<Lead>({
    queryKey: ["leads", id],
    queryFn: async () => {
      if (!id) throw new Error("Lead ID required");
      const { data } = await apiClient.get<any>(`/leads/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLeadPayload) => {
      const { data } = await apiClient.post<any>("/leads", payload);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateLeadPayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/leads/${id}`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", variables.id] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/leads/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ConvertLeadPayload & { id: string }) => {
      const { data } = await apiClient.post<any>(`/leads/${id}/convert`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
};

export const exportLeadsToCsv = async (params?: LeadQueryParams) => {
  const response = await apiClient.get("/leads/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const useImportLeadsSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<ImportSyncResponse>("/leads/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useImportLeadsAsync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<ImportAsyncResponse>(
        "/leads/import/async",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["import", "jobs"] });
    },
  });
};
