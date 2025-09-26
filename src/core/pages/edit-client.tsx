import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useGetClient, useUpdateClient } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Client } from "../api/types";
import { Card, CardContent } from "../../components/ui/card";

export default function EditClientPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const clientId = id ? parseInt(id, 10) : 0;

  const { data: client, isLoading, isError } = useGetClient(clientId);
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  // Check if user has permission to edit clients
  const canEditClients =
    currentUser?.role === "store_admin" || currentUser?.role === "seller";

  // Redirect if not authorized
  if (!canEditClients) {
    toast.error(t("messages.error.unauthorized"));
    navigate("/clients");
    return null;
  }

  // Redirect if invalid ID
  if (!clientId) {
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
    updateClient(
      { id: clientId, ...data },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.updated", { item: t("navigation.clients") }) ||
              "Client updated successfully"
          );
          navigate("/clients");
        },
        onError: (error: unknown) => {
          console.error("Update client error:", error);
          toast.error(
            t("messages.error.update", { item: t("navigation.clients") }) ||
              "Failed to update client"
          );
        },
      }
    );
  };

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              {t("messages.error.load", { item: t("navigation.clients") }) ||
                "Failed to load client"}
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => navigate("/clients")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {t("actions.back") || "Back to Clients"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">

      </div>

      <div>
        <ResourceForm
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={{
            phone_number: client.phone_number,
            full_name: client.full_name,
          }}
          isSubmitting={isUpdating}
          title={t("messages.update") || "Update"}
        />
      </div>
    </div>
  );
}
