import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { PrizeForm } from "../components/PrizeForm";
import { toast } from "sonner";
import { useGetGame, useUpdateGame } from "../api/game";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Prize } from "../api/types";

/**
 * Game Edit Form Data Structure
 *
 * Similar to create, but includes existing data and updates:
 *
 * Basic game fields:
 * - name: string
 * - description: string
 * - store: number (store ID)
 *
 * Prize fields (array format):
 * - prizes[0]name: string
 * - prizes[0]type: "item" | "money"
 * - prizes[0]quantity: number
 * - prizes[0]ordering: number (1-based)
 * - prizes[0]image: File (optional, only if changed)
 */

interface GameFormData {
  name: string;
  description: string;
  store?: number;
}

export default function EditGamePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: storesData, isLoading: storesLoading } = useGetStores();
  const { data: gameData, isLoading: gameLoading } = useGetGame(Number(id));
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // Handle stores data structure (could be array or paginated response)
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const { mutate: updateGame, isPending: isUpdating } = useUpdateGame();

  const isSuperAdmin = currentUser?.role === "superadmin";
  const userStore = currentUser?.store;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GameFormData>({
    defaultValues: {
      name: "",
      description: "",
      store: isSuperAdmin ? undefined : userStore,
    },
  });

  // Set form data when game loads
  useEffect(() => {
    if (gameData) {
      reset({
        name: gameData.name,
        description: gameData.description,
        store: gameData.store,
      });

      // Set prizes data
      if (gameData.prizes) {
        setPrizes(gameData.prizes);
      }
    }
  }, [gameData, reset]);

  const onSubmit = (data: GameFormData) => {
    // Validate prizes
    if (prizes.length === 0) {
      toast.error(
        t("messages.error.no_prizes") || "At least one prize is required",
      );
      return;
    }

    // Validate each prize
    for (let i = 0; i < prizes.length; i++) {
      const prize = prizes[i];
      if (!prize.name.trim()) {
        toast.error(
          t("messages.error.prize_name_required", { index: i + 1 }) ||
            `Prize #${i + 1} name is required`,
        );
        return;
      }
      if (prize.quantity < 1) {
        toast.error(
          t("messages.error.prize_quantity_invalid", { index: i + 1 }) ||
            `Prize #${i + 1} quantity must be at least 1`,
        );
        return;
      }
    }

    // Prepare FormData for submission
    const formData = new FormData();

    // Add basic game data
    formData.append("name", data.name);
    formData.append("description", data.description);

    // Add store ID
    const storeId = isSuperAdmin ? data.store : userStore;
    if (storeId) {
      formData.append("store", storeId.toString());
    }

    // Add prizes data
    prizes.forEach((prize, index) => {
      // Include prize ID if it exists (for updating existing prizes)
      if (prize.id) {
        formData.append(`prizes[${index}]id`, prize.id.toString());
      }

      formData.append(`prizes[${index}]name`, prize.name);
      formData.append(`prizes[${index}]type`, prize.type);
      formData.append(`prizes[${index}]quantity`, prize.quantity.toString());
      formData.append(`prizes[${index}]ordering`, prize.ordering.toString());

      // Only append image if it's a new File (not a URL string)
      if (prize.image && prize.image instanceof File) {
        formData.append(`prizes[${index}]image`, prize.image);
      }
    });

    updateGame(
      { formData, id: Number(id) },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.game_updated") || "Game updated successfully",
          );
          navigate("/games");
        },
        onError: (error) => {
          console.error("Error updating game:", error);
          toast.error(
            t("messages.error.update_game") || "Failed to update game",
          );
        },
      },
    );
  };

  if (userLoading || gameLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">
          {t("forms.loading") || "Loading..."}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  if (!gameData) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-600 mb-4">
            {t("messages.error.game_not_found") || "Game not found"}
          </p>
          <button
            onClick={() => navigate("/games")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t("buttons.go_back") || "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  // If user is not superadmin and has no store, show error
  if (!isSuperAdmin && !userStore) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-600 mb-4">
            {t("messages.contact_admin") ||
              "You need to be assigned to a store to edit games. Please contact your administrator."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t("buttons.go_back") || "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("messages.edit_game") || "Edit Game"}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {t("buttons.cancel") || "Cancel"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Game Details Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("forms.game_details") || "Game Details"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Selection (Super Admin Only) */}
            {isSuperAdmin && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("forms.store") || "Store"} *
                </label>
                {storesLoading ? (
                  <div className="flex justify-center items-center h-10">
                    <div className="text-gray-500">
                      {t("forms.loading") || "Loading stores..."}
                    </div>
                  </div>
                ) : (
                  <select
                    {...register("store", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("placeholders.select_store") || "Select a store"}
                    </option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.store && (
                  <p className="mt-1 text-sm text-red-600">
                    {t("validation.store_required") || "Store is required"}
                  </p>
                )}
              </div>
            )}

            {/* Game Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.game_name") || "Game Name"} *
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                placeholder={t("placeholders.game_name") || "Enter game name"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {t("validation.game_name_required") ||
                    "Game name is required"}
                </p>
              )}
            </div>

            {/* Game Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("forms.game_description") || "Game Description"} *
              </label>
              <textarea
                {...register("description", { required: true })}
                rows={4}
                placeholder={
                  t("placeholders.game_description") || "Enter game description"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {t("validation.description_required") ||
                    "Description is required"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prizes Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <PrizeForm prizes={prizes} onPrizesChange={setPrizes} />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            disabled={isUpdating}
          >
            {t("buttons.cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isUpdating || prizes.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("buttons.saving") || "Saving..."}
              </>
            ) : (
              <>
                <span>💾</span>
                {t("buttons.update") || "Update Game"}
              </>
            )}
          </button>
        </div>

        {/* Form Summary */}
        {prizes.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              {t("forms.summary") || "Summary"}
            </h3>
            <div className="text-sm text-blue-800">
              <p>
                {t("summary.total_prizes", { count: prizes.length }) ||
                  `Total Prizes: ${prizes.length}`}
              </p>
              <p>
                {t("summary.prize_breakdown") || "Prize Types: "}
                {prizes.filter((p) => p.type === "item").length}{" "}
                {t("prize_types.items") || "items"},{" "}
                {prizes.filter((p) => p.type === "money").length}{" "}
                {t("prize_types.money_prizes") || "money prizes"}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
