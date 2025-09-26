import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useCreateClient } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Client } from "../api/types";

export default function CreateClientPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const { mutate: createClient, isPending: isCreating } = useCreateClient();

  // Check if user has permission to create clients
  const canCreateClients =
    currentUser?.role === "store_admin" || currentUser?.role === "seller";

  // Redirect if not authorized
  if (!canCreateClients) {
    toast.error(t("messages.error.unauthorized"));
    navigate("/clients");
    return null;
  }

  const fields = [
    {
      name: "phone_number",
      label: t("forms.phone_number") || "Phone Number",
      type: "text" as const,
      placeholder: t("placeholders.enter_phone_number") || "Enter phone number",
      required: true,
    },
    {
      name: "full_name",
      label: t("forms.full_name") || "Full Name",
      type: "text" as const,
      placeholder: t("placeholders.enter_full_name") || "Enter full name",
      required: true,
    },
  ];

  const handleSubmit = (data: Partial<Client>) => {
    createClient(data as Omit<Client, "id">, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", { item: t("navigation.clients") }) ||
            "Client created successfully"
        );
        navigate("/clients");
      },
      onError: (error: unknown) => {
        console.error("Create client error:", error);
        toast.error(
          t("messages.error.create", { item: t("navigation.clients") }) ||
            "Failed to create client"
        );
      },
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("navigation.clients") }
        </h1>
      </div>

      <div>
        <ResourceForm
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={{}}
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
}
