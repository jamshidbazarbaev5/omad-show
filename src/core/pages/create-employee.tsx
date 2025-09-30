import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useCreateEmployee } from "../api/employee";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Employee } from "../api/types";

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { data: storesData } = useGetStores({});

  // Check if user has permission to create employees
  const canCreateEmployees =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "superadmin" ||
    currentUser?.role === "store_admin";

  // Redirect if not authorized
  if (!canCreateEmployees) {
    toast.error(t("messages.error.unauthorized"));
    navigate("/employees");
    return null;
  }

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const getEmployeeFields = () => {
    const roleOptions = [];

    // Role options based on current user role
    if (currentUser?.role === "superadmin") {
      roleOptions.push(
        { value: "superadmin", label: t("roles.superadmin") || "Super Admin" },
        {
          value: "store_admin",
          label: t("roles.store_admin") || "Store Admin",
        },
        { value: "seller", label: t("roles.seller") || "Seller" },
      );
    } else if (currentUser?.role === "store_admin") {
      roleOptions.push({
        value: "seller",
        label: t("roles.seller") || "Seller",
      });
    }

    const fields = [
      {
        name: "phone_number",
        label: t("forms.phone_number") || "Phone Number",
        type: "text" as const,
        placeholder:
          t("placeholders.enter_phone_number") || "Enter phone number",
        required: true,
      },
      {
        name: "full_name",
        label: t("forms.full_name") || "Full Name",
        type: "text" as const,
        placeholder: t("placeholders.enter_full_name") || "Enter full name",
        required: true,
      },
      {
        name: "role",
        label: t("forms.role") || "Role",
        type: "select" as const,
        options: roleOptions,
        required: true,
      },
      {
        name: "password",
        label: t("forms.password") || "Password",
        type: "text" as const,
        placeholder: t("placeholders.enter_password") || "Enter password",
        required: true,
      },
    ];

    // Add store field only for superadmin
    if (currentUser?.role === "superadmin") {
      fields.splice(3, 0, {
        name: "store",
        label: t("forms.store") || "Store",
        type: "select" as const,
        options: stores.map((store: any) => ({
          value: store.id,
          label: store.name,
        })),
        required: false,
      });
    }

    return fields;
  };

  const fields = getEmployeeFields();

  const handleSubmit = (data: Partial<Employee>) => {
    // If store_admin, automatically set store to current user's store
    if (currentUser?.role === "store_admin") {
      // @ts-ignore
      data.store.id = currentUser.store.id;
    }

    // Validate store requirement based on role
    if (data.role === "store_admin" || data.role === "seller") {
      if (!data.store) {
        if (currentUser?.role === "superadmin") {
          toast.error(
            t("messages.error.store_required") ||
              "Store is required for this role",
          );
          return;
        }
      }
    }

    createEmployee(data as Employee, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", { item: t("navigation.employees") }) ||
            "Employee created successfully",
        );
        navigate("/employees");
      },
      onError: (error: unknown) => {
        console.error("Create employee error:", error);
        toast.error(
          t("messages.error.create", { item: t("navigation.employees") }) ||
            "Failed to create employee",
        );
      },
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("messages.create")}{" "}
          {t("navigation.employees") || "Create Employee"}
        </h1>
      </div>

      <div>
        <ResourceForm
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={{}}
          isSubmitting={isCreating}
          title={t("messages.create") || "Create"}
        />
      </div>
    </div>
  );
}
