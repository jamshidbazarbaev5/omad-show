import { createResourceApiHooks } from "../helpers/createResourceApi.ts";
import type { Employee } from "./types";

const EMPLOYEE_URL = "employees/";

export const {
  useGetResources: useGetEmployees,
  useGetResource: useGetEmployee,
  useCreateResource: useCreateEmployee,
  useUpdateResource: useUpdateEmployee,
  useDeleteResource: useDeleteEmployee,
} = createResourceApiHooks<Employee>(EMPLOYEE_URL, "employees");
