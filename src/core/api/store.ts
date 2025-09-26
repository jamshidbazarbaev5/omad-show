import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import type { Store } from "./types";

const STORE_URL = "stores/";

export const {
  useGetResources: useGetStores,
  useGetResource: useGetStore,
  useCreateResource: useCreateStore,
  useUpdateResource: useUpdateStore,
  useDeleteResource: useDeleteStore,
} = createResourceApiHooks<Store>(STORE_URL, "stores");
