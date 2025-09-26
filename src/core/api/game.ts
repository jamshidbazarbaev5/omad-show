import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import type { Game } from "./types";

const GAME_URL = "games/";

export const {
  useGetResources: useGetGames,
  useGetResource: useGetGame,
  useCreateResource: useCreateGame,
  useUpdateResource: useUpdateGame,
  useDeleteResource: useDeleteGame,
} = createResourceApiHooks<Game>(GAME_URL, "games");
