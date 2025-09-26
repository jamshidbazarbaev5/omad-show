import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

interface BaseResource {
    id?: string | number;
}

interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next?: string | null;
    previous?: string | null;
}

export function createResourceApiHooks<
    T extends BaseResource,
    R = T[] | PaginatedResponse<T>,
>(baseUrl: string, queryKey: string) {
    const useGetResources = (options?: {
        params?: Record<string, any>;
        search?: string;
    }) => {
        return useQuery({
            queryKey: [queryKey, options?.params, options?.search],
            queryFn: async () => {
                const params = {
                    ...options?.params,
                    ...(options?.search ? { search: options.search } : {}),
                };
                const response = await api.get<R>(baseUrl, { params });
                return response.data;
            },
        });
    };

    const useGetResource = (id: string | number) => {
        return useQuery({
            queryKey: [queryKey, id],
            queryFn: async () => {
                const response = await api.get<T>(`${baseUrl}${id}/`);
                return response.data;
            },
            enabled: !!id,
        });
    };

    const useCreateResource = () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (newResource: T | FormData) => {
                const isFormData = newResource instanceof FormData;
                const config = isFormData
                    ? { headers: { "Content-Type": "multipart/form-data" } }
                    : {};

                const response = await api.post<T>(baseUrl, newResource, config);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
            },
        });
    };

    const useUpdateResource = () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (
                payload: { formData: FormData; id: string | number } | T,
            ) => {
                if ("formData" in payload && payload.id) {
                    const response = await api.put<T>(
                        `${baseUrl}${payload.id}/`,
                        payload.formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data", // Add this header
                            },
                        },
                    );

                    return response.data;
                }

                const updatedResource = payload as T;
                if (!updatedResource.id)
                    throw new Error(`${queryKey} ID is required for update`);

                const response = await api.put<T>(
                    `${baseUrl}${updatedResource.id}/`,
                    updatedResource,
                );
                return response.data;
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
                if (data.id) {
                    queryClient.invalidateQueries({ queryKey: [queryKey, data.id] });
                }
            },
        });
    };

    const useDeleteResource = () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (id: string | number) => {
                await api.delete(`${baseUrl}${id}/`);
                return id;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
            },
        });
    };

    return {
        useGetResources,
        useGetResource,
        useCreateResource,
        useUpdateResource,
        useDeleteResource,
    };
}
