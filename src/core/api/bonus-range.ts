import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import type { BonusRange } from "./types";

const BONUS_RANGE_URL = "bonus-ranges/";

export const {
  useGetResources: useGetBonusRanges,
  useGetResource: useGetBonusRange,
  useCreateResource: useCreateBonusRange,
  useUpdateResource: useUpdateBonusRange,
  useDeleteResource: useDeleteBonusRange,
} = createResourceApiHooks<BonusRange>(BONUS_RANGE_URL, "bonus-ranges");
