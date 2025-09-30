import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import type { Client } from "./types";

// API endpoints
const ENDPOINTS = {
  CLIENTS: "/clients/",
  CLIENT_DETAIL: (id: number) => `/clients/${id}/`,
  CLEAR_BONUSES: "/clients/clear-bonuses/",
};

// API functions
export const getClients = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.page_size)
    searchParams.append("page_size", params.page_size.toString());
  if (params?.search) searchParams.append("search", params.search);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${ENDPOINTS.CLIENTS}?${queryString}`
    : ENDPOINTS.CLIENTS;

  const response = await api.get(url);
  return response.data;
};

export const getClient = async (id: number) => {
  const response = await api.get(ENDPOINTS.CLIENT_DETAIL(id));
  return response.data;
};

export const createClient = async (client: Omit<Client, "id">) => {
  const response = await api.post(ENDPOINTS.CLIENTS, client);
  return response.data;
};

export const updateClient = async (id: number, client: Partial<Client>) => {
  const response = await api.patch(ENDPOINTS.CLIENT_DETAIL(id), client);
  return response.data;
};

export const deleteClient = async (id: number) => {
  const response = await api.delete(ENDPOINTS.CLIENT_DETAIL(id));
  return response.data;
};

export const clearClientBonuses = async (storeId: number) => {
  const response = await api.post(ENDPOINTS.CLEAR_BONUSES, {
    store_id: storeId,
  });
  return response.data;
};

// React Query hooks
export const useGetClients = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetClient = (id: number) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...client }: { id: number } & Partial<Client>) =>
      updateClient(id, client),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useClearClientBonuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearClientBonuses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
