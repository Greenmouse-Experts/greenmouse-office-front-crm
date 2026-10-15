import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== IMPORT TYPES ====================

export interface ImportContractField {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "email" | "phone" | string;
  required: boolean;
  description?: string;
  example?: any;
}

export interface ImportContract {
  entity: string;
  allowedExtensions: string[];
  maxFileSizeBytes: number;
  maxRows: number;
  fields: ImportContractField[];
  quota?: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface ImportJobError {
  row: number;
  column?: string;
  message: string;
  value?: any;
}

export interface ImportJob {
  id: string;
  entity: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | string;
  fileName?: string;
  fileSize?: number;
  totalRows?: number;
  processedRows?: number;
  successRows?: number;
  failedRows?: number;
  errors?: ImportJobError[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportJobQueryParams {
  limit?: number;
  cursor?: string;
  entity?: string;
}

// ==================== IMPORT HOOKS ====================

export const useImportContracts = (entity?: string) => {
  return useQuery<ImportContract>({
    queryKey: ["import", "contracts", entity],
    queryFn: async () => {
      if (!entity) throw new Error("Entity is required");
      const { data } = await apiClient.get<any>(`/import/contracts/${entity}`);
      return data?.data || data;
    },
    enabled: !!entity,
  });
};

export const downloadImportTemplate = async (entity: string) => {
  const response = await apiClient.get(`/import/templates/${entity}`, {
    responseType: "blob",
  });
  return response.data;
};

export const useImportJobs = (params?: ImportJobQueryParams) => {
  return useQuery<ImportJob[]>({
    queryKey: ["import", "jobs", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/import/jobs", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.jobs)) return data.jobs;
      return [];
    },
  });
};

export const useImportJob = (id?: string) => {
  return useQuery<ImportJob>({
    queryKey: ["import", "jobs", id],
    queryFn: async () => {
      if (!id) throw new Error("Job ID required");
      const { data } = await apiClient.get<any>(`/import/jobs/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });
};

export const useCancelImportJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/import/jobs/${id}/cancel`);
      return data?.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["import", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["import", "jobs", id] });
    },
  });
};
