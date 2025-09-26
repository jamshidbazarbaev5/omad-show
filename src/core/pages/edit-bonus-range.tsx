import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useGetBonusRange, useUpdateBonusRange } from "../api/bonus-range";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { BonusRange } from "../api/types";

export default function EditBonusRangePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: storesData, isLoading: storesLoading } = useGetStores();
  const { data: bonusRange, isLoading: bonusRangeLoading } = useGetBonusRange(
    id!,
  );
  const { mutate: updateBonusRange, isPending: isUpdating } =
    useUpdateBonusRange();

  // Handle stores data structure (could be array or paginated response)
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  // Check if user is authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [currentUser, userLoading, navigate]);

  // Check if bonus range exists
  useEffect(() => {
    if (!bonusRangeLoading && !bonusRange && id) {
      toast.error("Bonus range not found");
      navigate("/bonus-ranges");
    }
  }, [bonusRange, bonusRangeLoading, id, navigate]);

  // Don't render if data is still loading
  if (userLoading || bonusRangeLoading || !currentUser || !bonusRange) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading bonus range...
      </div>
    );
  }

  const isSuperAdmin = currentUser.role === "superadmin";
  const userStore = currentUser.store;

  // Check permissions - users can only edit their own store's bonus ranges
  if (!isSuperAdmin && userStore && bonusRange.store !== userStore) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {t("messages.error.access_denied") || "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("messages.error.cannot_edit_bonus_range") ||
              "You can only edit bonus ranges for your assigned store."}
          </p>
          <button
            onClick={() => navigate("/bonus-ranges")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t("buttons.back_to_bonus_ranges") || "Back to Bonus Ranges"}
          </button>
        </div>
      </div>
    );
  }

  // Create field configuration based on user role
  const getBonusRangeFields = () => {
    const baseFields = [
      {
        name: "min_amount",
        label: t("forms.min_amount") || "Min Amount",
        type: "number" as const,
        placeholder:
          t("placeholders.enter_min_amount") || "Enter minimum amount",
        required: true,
        min: 0,
      },
      {
        name: "max_amount",
        label: t("forms.max_amount") || "Max Amount",
        type: "number" as const,
        placeholder:
          t("placeholders.enter_max_amount") || "Enter maximum amount",
        required: true,
        min: 0,
      },
      {
        name: "bonus_points",
        label: t("forms.bonus_points") || "Bonus Points",
        type: "number" as const,
        placeholder:
          t("placeholders.enter_bonus_points") || "Enter bonus points",
        required: true,
        min: 0,
      },
    ];

    // Add store selection field only for superadmin
    if (isSuperAdmin) {
      return [
        {
          name: "store",
          label: t("forms.store") || "Store",
          type: "select" as const,
          options: stores.map((store) => ({
            value: store.id,
            label: store.name,
          })),
          placeholder: t("placeholders.select_store") || "Select a store",
          required: true,
        },
        ...baseFields,
      ];
    }

    // For non-superadmin users, store field is not shown (will be set automatically)
    return baseFields;
  };

  const fields = getBonusRangeFields();

  const handleSubmit = (data: Partial<BonusRange>) => {
    // Prepare the data for submission
    const bonusRangeData: Partial<BonusRange> = {
      ...data,
      id: bonusRange.id,
    };

    // If user is not superadmin, automatically set their store
    if (!isSuperAdmin && userStore) {
      bonusRangeData.store = userStore;
    }

    // Validate that max_amount is greater than min_amount
    if (bonusRangeData.min_amount && bonusRangeData.max_amount) {
      if (bonusRangeData.max_amount <= bonusRangeData.min_amount) {
        toast.error(
          t("messages.error.invalid_amount_range") ||
            "Maximum amount must be greater than minimum amount",
        );
        return;
      }
    }

    updateBonusRange(bonusRangeData as BonusRange, {
      onSuccess: () => {
        toast.success(
          t("messages.success.bonus_range_updated") ||
            "Bonus range updated successfully",
        );
        navigate("/bonus-ranges");
      },
      onError: (error) => {
        console.error("Error updating bonus range:", error);
        toast.error(
          t("messages.error.update_bonus_range") ||
            "Failed to update bonus range",
        );
      },
    });
  };

  // Set default values from existing bonus range data
  const defaultValues: Partial<BonusRange> = {
    store: bonusRange.store,
    min_amount: bonusRange.min_amount,
    max_amount: bonusRange.max_amount,
    bonus_points: bonusRange.bonus_points,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">

        <button
          onClick={() => navigate("/bonus-ranges")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {t("buttons.cancel") || "Cancel"}
        </button>
      </div>

      <div>
        {storesLoading && isSuperAdmin ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading stores...</div>
          </div>
        ) : (
          <ResourceForm
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isSubmitting={isUpdating}
            title={t("messages.bonus_range_details") || "Bonus Range Details"}
          />
        )}
      </div>
    </div>
  );
}
