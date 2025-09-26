import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import type { Prize } from "./types";

const PRIZE_URL = "prizes/";

export const {
  useGetResources: useGetPrizes,
  useGetResource: useGetPrize,
  useCreateResource: useCreatePrize,
  useUpdateResource: useUpdatePrize,
  useDeleteResource: useDeletePrize,
} = createResourceApiHooks<Prize>(PRIZE_URL, "prizes");
