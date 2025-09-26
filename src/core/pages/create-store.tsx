import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useCreateStore } from "../api/store";
import type { Store } from "../api/types";
import { useCurrentUser } from "@/core/hooks/useCurrentUser.tsx";

const storeFields = (t: (key: string) => string) => [
  {
    name: "name",
    label: t("forms.store_name"),
    type: "text",
    placeholder: t("forms.store_name"),
    required: true,
  },
  {
    name: "address",
    label: t("forms.store_address"),
    type: "text",
    placeholder: t("forms.store_address"),
    required: true,
  },
];

export default function CreateStorePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { mutate: createStore, isPending: isCreating } = useCreateStore();

  // Check if user is superadmin (this should be replaced with actual auth check)
  const isSuperAdmin = currentUser?.role === "superadmin";

  // Redirect if not superadmin
  if (!isSuperAdmin) {
    toast.error(t("messages.error.unauthorized"));
    navigate("/stores");
    return null;
  }

  const fields = storeFields(t);

  const handleSubmit = (data: Partial<Store>) => {
    createStore(data as Store, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", { item: t("navigation.stores") }),
        );
        navigate("/stores");
      },
      onError: () => {
        toast.error(
          t("messages.error.create", { item: t("navigation.stores") }),
        );
      },
    });
  };

  return (
    <div className="container mx-auto py-6">


      <div >
        <ResourceForm
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={{}}
          isSubmitting={isCreating}
          title={t("messages.create")}
        />
      </div>
    </div>
  );
}
