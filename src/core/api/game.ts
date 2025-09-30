import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";
import type { Game, GameParticipants, GameWinners } from "./types";

const GAME_URL = "games/";

export const {
  useGetResources: useGetGames,
  useGetResource: useGetGame,
  useCreateResource: useCreateGame,
  useUpdateResource: useUpdateGame,
  useDeleteResource: useDeleteGame,
} = createResourceApiHooks<Game>(GAME_URL, "games");

// Lottery Game API Types
export interface GameStartResponse {
  game: {
    id: number;
    store: {
      id: number;
      name: string;
      address: string;
      created_at: string;
    };
    name: string;
    description: string;
    status: string;
    all_clients: boolean;
    from_bonus: number | null;
    to_bonus: number | null;
    eligible_clients_count: number;
    prizes: Array<{
      id: number;
      name: string;
      type: "item" | "money";
      quantity: number;
      ordering: number;
      image: string;
    }>;
  };
  current_prize?: {
    id: number;
    name: string;
    type: "item" | "money";
    image: string;
  };
  participating_clients_count: number;
  eligible_clients_count?: number;
  clients?: Array<{
    id: number;
    full_name: string;
    phone_number: string;
    total_bonuses: number;
  }>;
  winners?: Array<{
    id: number;
    prize: {
      id: number;
      name: string;
      type: "item" | "money";
      image: string;
    };
    client: {
      id: number;
      full_name: string;
      phone_number: string;
    };
    awarded_at: string;
  }>;
  message?: string;
}

export interface GameDrawResponse {
  winner?: {
    store_client_id: number;
    full_name: string;
    phone_number: string;
    total_bonuses: number;
  };
  current_prize?: {
    id: number;
    name: string;
    type: "item" | "money";
    image: string;
  };
  winners?: Array<{
    id: number;
    prize: {
      id: number;
      name: string;
      type: "item" | "money";
      image: string;
    };
    client: {
      id: number;
      full_name: string;
      phone_number: string;
    };
    awarded_at: string;
  }>;
  message?: string;
}

export interface GameNextResponse {
  current_prize: {
    id: number;
    name: string;
    type: "item" | "money";
    image: string;
  };
}

// Start Game API
export const useStartGame = () => {
  return useMutation<GameStartResponse, Error, number>({
    mutationFn: async (gameId: number) => {
      const response = await api.post(`${GAME_URL}${gameId}/start/`);
      return response.data;
    },
  });
};

// Draw Winner API
export const useDrawGame = () => {
  return useMutation<GameDrawResponse, Error, number>({
    mutationFn: async (gameId: number) => {
      const response = await api.post(`${GAME_URL}${gameId}/draw/`);
      return response.data;
    },
  });
};

// Next Prize API
export const useNextPrize = () => {
  return useMutation<GameNextResponse, Error, number>({
    mutationFn: async (gameId: number) => {
      const response = await api.post(`${GAME_URL}${gameId}/next/`);
      return response.data;
    },
  });
};

// Activate Game API
export const useActivateGame = () => {
  return useMutation<void, Error, number>({
    mutationFn: async (gameId: number) => {
      const response = await api.post(`${GAME_URL}${gameId}/activate/`);
      return response.data;
    },
  });
};

// Lock Game API
export const useLockGame = () => {
  return useMutation<void, Error, number>({
    mutationFn: async (gameId: number) => {
      const response = await api.post(`${GAME_URL}${gameId}/lock/`);
      return response.data;
    },
  });
};

// Get Game Participants API
export const useGetGameParticipants = (gameId: number, page?: number) => {
  return useQuery<GameParticipants, Error>({
    queryKey: ["game-participants", gameId, page],
    queryFn: async () => {
      const params = page ? `?page=${page}` : "";
      const url = `${GAME_URL}${gameId}/participants/${params}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!gameId,
  });
};

// Get Game Winners API
export const useGetGameWinners = (gameId: number, page?: number) => {
  return useQuery<GameWinners, Error>({
    queryKey: ["game-winners", gameId, page],
    queryFn: async () => {
      const params = page ? `?page=${page}` : "";
      const url = `${GAME_URL}${gameId}/winners/${params}`;
      const response = await api.get(url);
      return response.data;
    },
    enabled: !!gameId,
  });
};
