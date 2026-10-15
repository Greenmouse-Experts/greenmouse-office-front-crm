import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type { Category } from "./crmApi";

export type { Category } from "./crmApi";

// ==================== PRODUCTS ====================

export interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  description?: string;
  categoryId?: string;
  category?: Category;
  type?: "product" | "service" | string;
  currency?: string;
  stock?: number;
  quantity?: number;
  inStock?: boolean;
  trackInventory?: boolean;
  images?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  type?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  type: "manual_adjustment" | "order" | "return" | "import" | string;
  reason?: string;
  actorId?: string;
  actor?: any;
  createdAt: string;
}

export interface StockMovementsQueryParams {
  page?: number;
  limit?: number;
}

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Product[]>("/products", {
        params,
      });
      return data;
    },
  });
};

export const useProduct = (id?: string) => {
  return useQuery<Product>({
    queryKey: ["products", id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID required");
      const { data } = await apiClient.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data } = await apiClient.post<Product>("/products", product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data } = await apiClient.patch<Product>(`/products/${id}`, product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adjustment }: { id: string; adjustment: number }) => {
      const { data } = await apiClient.patch(`/products/${id}/stock`, { adjustment });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.id, "stock-movements"],
      });
    },
  });
};

export const useProductStockMovements = (
  productId?: string,
  params?: StockMovementsQueryParams
) => {
  return useQuery<StockMovement[]>({
    queryKey: ["products", productId, "stock-movements", params],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID required");
      const { data } = await apiClient.get<any>(
        `/products/${productId}/stock-movements`,
        { params }
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.movements)) return data.movements;
      return [];
    },
    enabled: !!productId,
  });
};

// ==================== SERVICES ====================

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  category?: Category;
  description?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceQueryParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const useServices = (params?: ServiceQueryParams) => {
  return useQuery<ServiceItem[]>({
    queryKey: ["services", params],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ServiceItem[]>("/services", {
          params,
        });
        return data;
      } catch (err: any) {
        // Fallback to /products?type=service if /services is not configured
        if (err?.response?.status === 404) {
          const { data } = await apiClient.get<any[]>("/products", {
            params: { ...params, type: "service" },
          });
          return data;
        }
        throw err;
      }
    },
  });
};

export const useService = (id?: string) => {
  return useQuery<ServiceItem>({
    queryKey: ["services", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID required");
      try {
        const { data } = await apiClient.get<ServiceItem>(`/services/${id}`);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const { data } = await apiClient.get<any>(`/products/${id}`);
          return data;
        }
        throw err;
      }
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service: Partial<ServiceItem>) => {
      try {
        const { data } = await apiClient.post<ServiceItem>("/services", service);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const { data } = await apiClient.post<any>("/products", {
            ...service,
            type: "service",
          });
          return data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...service }: Partial<ServiceItem> & { id: string }) => {
      try {
        const { data } = await apiClient.patch<ServiceItem>(`/services/${id}`, service);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const { data } = await apiClient.patch<any>(`/products/${id}`, service);
          return data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.delete(`/services/${id}`);
        return data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          const { data } = await apiClient.delete(`/products/${id}`);
          return data;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useToggleServiceActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/services/${id}/toggle-active`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// ==================== PRODUCT IMPORT & EXPORT ====================

export const useExportProducts = () => {
  return useMutation({
    mutationFn: async (params?: ProductQueryParams) => {
      const response = await apiClient.get('/products/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useImportProductsAsync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post('/products/import/async', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// ==================== SERVICE IMPORT & EXPORT ====================

export const useExportServices = () => {
  return useMutation({
    mutationFn: async (params?: ServiceQueryParams) => {
      const response = await apiClient.get('/services/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'services_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    },
  });
};

export const useImportServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post('/services/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useImportServicesAsync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post('/services/import/async', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

