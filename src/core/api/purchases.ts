import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import type { Purchase } from "./types";

export interface PurchasesQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface PurchasesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Purchase[];
}

export interface CreatePurchaseData {
  client: number;
  amount: number;
}

export interface UpdatePurchaseData {
  client?: number;
  amount?: number;
}

// Get all purchases
export function useGetPurchases(params: PurchasesQueryParams = {}) {
  return useQuery({
    queryKey: ["purchases", params],
    queryFn: async (): Promise<Purchase[] | PurchasesResponse> => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append("page", params.page.toString());
      if (params.page_size) searchParams.append("page_size", params.page_size.toString());
      if (params.search) searchParams.append("search", params.search);

      const response = await api.get(`/purchases/?${searchParams.toString()}`);
      return response.data;
    },
  });
}

// Get single purchase
export function useGetPurchase(id: number) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: async (): Promise<Purchase> => {
      const response = await api.get(`/purchases/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create purchase
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseData): Promise<Purchase> => {
      const response = await api.post("/purchases/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}

// Update purchase
export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePurchaseData }): Promise<Purchase> => {
      const response = await api.patch(`/purchases/${id}/`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
    },
  });
}

// Delete purchase
export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/purchases/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
}
