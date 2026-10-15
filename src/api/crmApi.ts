import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "./simpleApi";

// ==================== COMPANIES ====================\n
export interface Company {
  id: string;
  name: string;
  industry?: string;
  federalIdNumber?: string;
  groupName?: string;
  workPhone?: string;
  email?: string;
  website?: string;
  dateJoined?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCompanies = (params?: { search?: string }) => {
  return useQuery<Company[]>({
    queryKey: ["companies", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/companies", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.companies)) return data.companies;
      return [];
    },
  });
};

export const useCompany = (id?: string) => {
  return useQuery<Company>({
    queryKey: ["companies", id],
    queryFn: async () => {
      if (!id) throw new Error("Company ID required");
      const { data } = await apiClient.get<any>(`/companies/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<Company>) => {
      const { data } = await apiClient.post<any>("/companies", company);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...company
    }: Partial<Company> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/companies/${id}`, company);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/companies/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

// ==================== CONTACTS / CUSTOMERS ====================\n
export interface ContactNote {
  id?: string;
  content: string;
  createdAt?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  type?: "individual" | "business" | string;
  companyName?: string;
  companyId?: string;
  company?: Company;
  email: string;
  phone?: string;
  workPhone?: string;
  cellPhone?: string;
  address?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  tags?: string[];
  assignedTo?: string;
  assignedStaffId?: string;
  source?: string;
  status?: "lead" | "customer" | "active" | "inactive" | string;
  notes?: ContactNote[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

// Backward compatibility alias
export type Customer = Contact;

type CreateContactInput = Pick<Contact, "firstName" | "lastName" | "email"> &
  Partial<
    Pick<
      Contact,
      | "type"
      | "companyName"
      | "phone"
      | "address"
      | "city"
      | "state"
      | "zipCode"
      | "country"
      | "tags"
      | "assignedTo"
      | "source"
      | "status"
    >
  >;

export const useContacts = (params?: { search?: string; status?: string }) => {
  return useQuery<Contact[]>({
    queryKey: ["contacts", params],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<any>("/contacts", { params });
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.contacts)) return data.contacts;
        return [];
      } catch {
        const { data } = await apiClient.get<any>("/customers", { params });
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
      }
    },
  });
};

// Backward compatibility alias
export const useCustomers = useContacts;

export const useContact = (id?: string) => {
  return useQuery<Contact>({
    queryKey: ["contacts", id],
    queryFn: async () => {
      if (!id) throw new Error("Contact ID required");
      try {
        const { data } = await apiClient.get<any>(`/contacts/${id}`);
        return data?.data || data;
      } catch {
        const { data } = await apiClient.get<any>(`/customers/${id}`);
        return data?.data || data;
      }
    },
    enabled: !!id,
  });
};

// Backward compatibility alias
export const useCustomer = useContact;

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: CreateContactInput) => {
      try {
        const { data } = await apiClient.post<any>("/contacts", contact);
        return data?.data || data;
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) {
          throw error;
        }
        const { data } = await apiClient.post<any>("/customers", contact);
        return data?.data || data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// Backward compatibility alias
export const useCreateCustomer = useCreateContact;

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...contact
    }: Partial<Contact> & { id: string }) => {
      try {
        const { data } = await apiClient.patch<any>(`/contacts/${id}`, contact);
        return data?.data || data;
      } catch {
        const { data } = await apiClient.patch<any>(
          `/customers/${id}`,
          contact,
        );
        return data?.data || data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// Backward compatibility alias
export const useUpdateCustomer = useUpdateContact;

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.delete(`/contacts/${id}`);
        return data?.data || data;
      } catch {
        const { data } = await apiClient.delete(`/customers/${id}`);
        return data?.data || data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// Backward compatibility alias
export const useDeleteCustomer = useDeleteContact;

export const useAddContactNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data } = await apiClient.post<any>(`/contacts/${id}/notes`, {
        content,
      });
      return data?.data || data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", variables.id] });
    },
  });
};

// ==================== CATEGORIES ====================\n
export interface Category {
  id: string;
  name: string;
  description?: string;
  type?: "product" | "service" | string;
  createdAt?: string;
}

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/categories");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.categories)) return data.categories;
      return [];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data } = await apiClient.post<any>("/categories", category);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...category
    }: Partial<Category> & { id: string }) => {
      const { data } = await apiClient.patch<any>(
        `/categories/${id}`,
        category,
      );
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/categories/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
