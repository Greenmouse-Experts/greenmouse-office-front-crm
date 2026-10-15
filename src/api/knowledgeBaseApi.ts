import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== KNOWLEDGE BASE TYPES ====================

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  sortOrder?: number;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  bodyMarkdown: string;
  categoryId: string;
  category?: KnowledgeBaseCategory;
  tags?: string[];
  status: "draft" | "published" | "archived" | string;
  sortOrder?: number;
  isFeatured?: boolean;
  viewCount?: number;
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFeedbackPayload {
  helpful: boolean;
  voterKey?: string;
}

export interface AdminCreateKBCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface AdminUpdateKBCategoryPayload extends Partial<AdminCreateKBCategoryPayload> {}

export interface AdminCreateKBArticlePayload {
  title: string;
  bodyMarkdown: string;
  slug?: string;
  summary?: string;
  categoryId: string;
  tags?: string[];
  status?: "draft" | "published" | "archived" | string;
  sortOrder?: number;
  isFeatured?: boolean;
}

export interface AdminUpdateKBArticlePayload extends Partial<AdminCreateKBArticlePayload> {}

export interface KBArticlesQueryParams {
  featured?: boolean;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== PUBLIC HOOKS ====================

export const useKnowledgeBaseCategories = () => {
  return useQuery<KnowledgeBaseCategory[]>({
    queryKey: ["knowledge-base", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/knowledge-base/categories");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.categories)) return data.categories;
      return [];
    },
  });
};

export const useKnowledgeBaseArticles = (params?: KBArticlesQueryParams) => {
  return useQuery<KnowledgeBaseArticle[]>({
    queryKey: ["knowledge-base", "articles", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/knowledge-base/articles", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.articles)) return data.articles;
      return [];
    },
  });
};

export const useKnowledgeBaseArticle = (slug?: string) => {
  return useQuery<KnowledgeBaseArticle>({
    queryKey: ["knowledge-base", "articles", "slug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Article slug required");
      const { data } = await apiClient.get<any>(`/knowledge-base/articles/${slug}`);
      return data?.data || data;
    },
    enabled: !!slug,
  });
};

export const useArticleFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ArticleFeedbackPayload & { id: string }) => {
      const { data } = await apiClient.post<any>(
        `/knowledge-base/articles/${id}/feedback`,
        payload
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};

// ==================== ADMIN HOOKS ====================

export const useAdminKBCategories = () => {
  return useQuery<KnowledgeBaseCategory[]>({
    queryKey: ["admin", "knowledge-base", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/knowledge-base/categories"
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminCreateKBCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminCreateKBCategoryPayload) => {
      const { data } = await apiClient.post<any>(
        "/admins/knowledge-base/categories",
        payload
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "categories"] });
    },
  });
};

export const useAdminUpdateKBCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: AdminUpdateKBCategoryPayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(
        `/admins/knowledge-base/categories/${id}`,
        payload
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "categories"] });
    },
  });
};

export const useAdminDeleteKBCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(
        `/admins/knowledge-base/categories/${id}`
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "categories"] });
    },
  });
};

export const useAdminKBArticles = (params?: KBArticlesQueryParams) => {
  return useQuery<KnowledgeBaseArticle[]>({
    queryKey: ["admin", "knowledge-base", "articles", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/admins/knowledge-base/articles",
        { params }
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useAdminKBArticle = (id?: string) => {
  return useQuery<KnowledgeBaseArticle>({
    queryKey: ["admin", "knowledge-base", "articles", id],
    queryFn: async () => {
      if (!id) throw new Error("Article ID required");
      const { data } = await apiClient.get<any>(
        `/admins/knowledge-base/articles/${id}`
      );
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useAdminCreateKBArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminCreateKBArticlePayload) => {
      const { data } = await apiClient.post<any>(
        "/admins/knowledge-base/articles",
        payload
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};

export const useAdminUpdateKBArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: AdminUpdateKBArticlePayload & { id: string }) => {
      const { data } = await apiClient.patch<any>(
        `/admins/knowledge-base/articles/${id}`,
        payload
      );
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};

export const useAdminDeleteKBArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(
        `/admins/knowledge-base/articles/${id}`
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};

export const useAdminPublishKBArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(
        `/admins/knowledge-base/articles/${id}/publish`
      );
      return data?.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles", id] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};

export const useAdminArchiveKBArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(
        `/admins/knowledge-base/articles/${id}/archive`
      );
      return data?.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge-base", "articles", id] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", "articles"] });
    },
  });
};
