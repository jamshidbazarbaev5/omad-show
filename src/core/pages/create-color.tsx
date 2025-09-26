import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useCreateColor } from "../api/color";
import type { Color } from "../api/types";

const colorFields = (t: (key: string) => string) => [
  {
    name: "name",
    label: t("forms.color_name"),
    type: "text",
    placeholder: t("placeholders.enter_name"),
    required: true,
  },
];

export default function CreateColorPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: createColor, isPending: isCreating } = useCreateColor();

  const fields = colorFields(t);

  const handleSubmit = (data: Partial<Color>) => {
    createColor(data as Color, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", { item: t("navigation.colors") }),
        );
        navigate("/colors");
      },
      onError: () => {
        toast.error(
          t("messages.error.create", { item: t("navigation.colors") }),
        );
      },
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("messages.create")} {t("navigation.colors")}
        </h1>
      </div>

      <div className="max-w-md mx-auto">
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
