import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourceTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import {
  useGetEmployees,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../api/employee";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Employee } from "../api/types";

const employeeFields = (
  t: (key: string) => string,
  currentUser: any,
  stores: any[],
) => {
  const roleOptions = [];

  // Role options based on current user role
  if (currentUser?.role === "superadmin" || currentUser?.is_superuser) {
    roleOptions.push(
      { value: "superadmin", label: t("roles.superadmin") },
      { value: "store_admin", label: t("roles.store_admin") },
      { value: "seller", label: t("roles.seller") },
    );
  } else if (currentUser?.role === "store_admin") {
    roleOptions.push({ value: "seller", label: t("roles.seller") });
  }

  const fields = [
    {
      name: "phone_number",
      label: t("forms.phone_number"),
      type: "text" as const,
      placeholder: t("placeholders.enter_phone_number"),
      required: true,
    },
    {
      name: "full_name",
      label: t("forms.full_name"),
      type: "text" as const,
      placeholder: t("placeholders.enter_full_name"),
      required: true,
    },
    {
      name: "role",
      label: t("forms.role"),
      type: "select" as const,
      options: roleOptions,
      required: true,
    },
    {
      name: "password",
      label: t("forms.password"),
      type: "text" as const,
      placeholder: t("placeholders.enter_password"),
      required: true,
    },
  ];

  // Add store field only for superadmin and only when creating store_admin or seller
  if (currentUser?.role === "superadmin" || currentUser?.is_superuser) {
    fields.splice(3, 0, {
      name: "store",
      label: t("forms.store"),
      type: "select" as const,
      options: stores.map((store) => ({ value: store.id, label: store.name })),
      required: false,
    });
  }

  return fields;
};

const columns = (t: (key: string) => string) => [
  {
    header: t("forms.phone_number"),
    accessorKey: "phone_number",
  },
  {
    header: t("forms.full_name"),
    accessorKey: "full_name",
  },
  {
    header: t("forms.role"),
    accessorKey: "role",
  },
  {
    header: t("forms.store"),
    accessorKey: "store_read.name",
  },
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  // Check if user has permission to manage employees
  const canManageEmployees =
    currentUser?.role === "superadmin" || currentUser?.role === "store_admin";

  const { data: employeesData, isLoading } = useGetEmployees({});

  const { data: storesData } = useGetStores({});

  const employees = Array.isArray(employeesData)
    ? employeesData
    : employeesData?.results || [];
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  // Filter employees based on current user role
  let filteredEmployees = employees;
  if (currentUser?.role === "store_admin") {
    // Store admin can only see employees from their store
    filteredEmployees = employees.filter(
      (emp) => emp.store === currentUser.store,
    );
  }

  const enhancedEmployees = filteredEmployees.map(
    (employee: Employee, index: number) => ({
      ...employee,
      displayId: index + 1,
    }),
  );

  const fields = employeeFields(t, currentUser, stores);

  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
  const { mutate: deleteEmployee } = useDeleteEmployee();
  const totalCount = Array.isArray(employeesData) ? employeesData.length : employeesData?.count || 0;
  const handleEdit = (employee: Employee) => {
    if (!canManageEmployees) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }

    // Store admin can only edit sellers from their store
    if (
      currentUser?.role === "store_admin" &&
      (employee.role !== "seller" || employee.store !== currentUser.store)
    ) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }

    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleUpdateSubmit = (data: Partial<Employee>) => {
    if (!editingEmployee?.id) return;

    // Prepare data for update
    const updateData = { ...data, id: editingEmployee.id };

    // If store_admin, automatically set store to current user's store
    if (currentUser?.role === "store_admin") {
      updateData.store = currentUser.store;
    }

    updateEmployee(updateData as Employee, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", { item: t("navigation.employees") }),
        );
        setIsFormOpen(false);
        setEditingEmployee(null);
      },
      onError: () =>
        toast.error(
          t("messages.error.update", { item: t("navigation.employees") }),
        ),
    });
  };

  const handleDelete = (id: number) => {
    if (!canManageEmployees) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }

    const employee = employees.find((emp: any) => emp.id === id);

    // Store admin can only delete sellers from their store
    if (
      currentUser?.role === "store_admin" &&
      (employee?.role !== "seller" || employee?.store !== currentUser.store)
    ) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }

    deleteEmployee(id, {
      onSuccess: () =>
        toast.success(
          t("messages.success.deleted", { item: t("navigation.employees") }),
        ),
      onError: () =>
        toast.error(
          t("messages.error.delete", { item: t("navigation.employees") }),
        ),
    });
  };

  const handleAdd = () => {
    if (!canManageEmployees) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }
    navigate("/create-employee");
  };

  if (!canManageEmployees) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {t("messages.error.unauthorized")}
          </h1>
          <p>{t("messages.error.no_permission")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.employees")}</h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={t("placeholders.search_employee")}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedEmployees}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        totalCount={totalCount}
        pageSize={30}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={fields}
            onSubmit={handleUpdateSubmit}
            defaultValues={editingEmployee || {}}
            isSubmitting={isUpdating}
            title={t("messages.edit")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
