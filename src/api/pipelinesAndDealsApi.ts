import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== PIPELINE TYPES ====================

export interface PipelineStage {
  id: string;
  pipelineId?: string;
  name: string;
  color?: string;
  order?: number;
  isWon?: boolean;
  isLost?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  stages?: PipelineStage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePipelinePayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePipelinePayload extends Partial<CreatePipelinePayload> {}

export interface CreateStagePayload {
  name: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface UpdateStagePayload extends Partial<CreateStagePayload> {}

export interface ReorderStagesPayload {
  stageIds: string[];
}

// ==================== DEAL TYPES ====================

export type DealStatus = "open" | "won" | "lost" | string;

export interface Deal {
  id: string;
  name: string;
  pipelineId: string;
  stageId: string;
  leadId?: string | null;
  contactId?: string | null;
  value: number;
  currency?: string;
  expectedCloseDate?: string | null;
  status: DealStatus;
  notes?: string;
  assignedTo?: string | null;
  pipeline?: Pipeline;
  stage?: PipelineStage;
  contact?: any;
  lead?: any;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface CreateDealPayload {
  name: string;
  pipelineId: string;
  stageId: string;
  leadId?: string;
  contactId?: string;
  value: number;
  currency?: string;
  expectedCloseDate?: string;
  status?: DealStatus;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateDealPayload extends Partial<CreateDealPayload> {}

export interface MoveDealStagePayload {
  stageId: string;
}

export interface DealQueryParams {
  pipelineId?: string;
  stageId?: string;
  status?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface KanbanStageColumn {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
  count: number;
}

export interface DealTimelineEvent {
  id: string;
  dealId: string;
  type: string;
  description: string;
  createdAt: string;
  actor?: any;
}

// ==================== PIPELINE HOOKS ====================

export const usePipelines = () => {
  return useQuery<Pipeline[]>({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/pipelines");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.pipelines)) return data.pipelines;
      return [];
    },
  });
};

export const usePipeline = (id?: string) => {
  return useQuery<Pipeline>({
    queryKey: ["pipelines", id],
    queryFn: async () => {
      if (!id) throw new Error("Pipeline ID required");
      const { data } = await apiClient.get<any>(`/pipelines/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useCreatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePipelinePayload) => {
      const { data } = await apiClient.post<any>("/pipelines", payload);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
};

export const useUpdatePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePipelinePayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/pipelines/${id}`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.id] });
    },
  });
};

export const useDeletePipeline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/pipelines/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
};

export const useAddPipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      ...payload
    }: CreateStagePayload & { pipelineId: string }) => {
      const { data } = await apiClient.post<any>(
        `/pipelines/${pipelineId}/stages`,
        payload
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.pipelineId] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useUpdatePipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageId,
      ...payload
    }: UpdateStagePayload & { pipelineId: string; stageId: string }) => {
      const { data } = await apiClient.patch<any>(
        `/pipelines/${pipelineId}/stages/${stageId}`,
        payload
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.pipelineId] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useDeletePipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageId,
    }: {
      pipelineId: string;
      stageId: string;
    }) => {
      const { data } = await apiClient.delete<any>(
        `/pipelines/${pipelineId}/stages/${stageId}`
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.pipelineId] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useReorderPipelineStages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageIds,
    }: ReorderStagesPayload & { pipelineId: string }) => {
      const { data } = await apiClient.patch<any>(
        `/pipelines/${pipelineId}/stages/reorder`,
        { stageIds }
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.pipelineId] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

// ==================== DEAL HOOKS ====================

export const useDeals = (params?: DealQueryParams) => {
  return useQuery<Deal[]>({
    queryKey: ["deals", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/deals", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.deals)) return data.deals;
      return [];
    },
  });
};

export const useDeal = (id?: string) => {
  return useQuery<Deal>({
    queryKey: ["deals", id],
    queryFn: async () => {
      if (!id) throw new Error("Deal ID required");
      const { data } = await apiClient.get<any>(`/deals/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useDealsKanban = (pipelineId?: string) => {
  return useQuery<KanbanStageColumn[]>({
    queryKey: ["deals", "kanban", pipelineId],
    queryFn: async () => {
      if (!pipelineId) throw new Error("Pipeline ID required");

      const [dealsResponse, pipelineResponse] = await Promise.all([
        apiClient.get<any>("/deals", { params: { pipelineId } }),
        apiClient.get<any>(`/pipelines/${pipelineId}`),
      ]);
      const dealsPayload = dealsResponse.data;
      const deals: Deal[] = Array.isArray(dealsPayload)
        ? dealsPayload
        : Array.isArray(dealsPayload?.data)
          ? dealsPayload.data
          : Array.isArray(dealsPayload?.data?.data)
            ? dealsPayload.data.data
            : Array.isArray(dealsPayload?.data?.deals)
              ? dealsPayload.data.deals
              : Array.isArray(dealsPayload?.deals)
                ? dealsPayload.deals
                : [];
      const pipeline: Pipeline = pipelineResponse.data?.data || pipelineResponse.data;
      const stages = [...(pipeline?.stages || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );

      return stages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stageId === stage.id);
        return {
          stage,
          deals: stageDeals,
          count: stageDeals.length,
          totalValue: stageDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),
        };
      });
    },
    enabled: !!pipelineId,
  });
};

export const useDealTimeline = (id?: string) => {
  return useQuery<DealTimelineEvent[]>({
    queryKey: ["deals", id, "timeline"],
    queryFn: async () => {
      if (!id) throw new Error("Deal ID required");
      const { data } = await apiClient.get<any>(`/deals/${id}/timeline`);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    enabled: !!id,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDealPayload) => {
      const { data } = await apiClient.post<any>("/deals", payload);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateDealPayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/deals/${id}`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/deals/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useMoveDealStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      stageId,
    }: MoveDealStagePayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/deals/${id}/stage`, {
        stageId,
      });
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useMarkDealWon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/deals/${id}/mark-won`);
      return data?.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", id] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};

export const useMarkDealLost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/deals/${id}/mark-lost`);
      return data?.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", id] });
      queryClient.invalidateQueries({ queryKey: ["deals", "kanban"] });
    },
  });
};
