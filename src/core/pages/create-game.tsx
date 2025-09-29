import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { PrizeForm } from "../components/PrizeForm";
import { toast } from "sonner";
import { useCreateGame } from "../api/game";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Prize } from "../api/types";

/**
 * Game Creation Form Data Structure
 *
 * When submitted, this form creates a FormData object with the following structure:
 *
 * Basic game fields:
 * - name: string (required, empty string if not provided)
 * - description: string (required)
 * - store: number (store ID)
 *
 * Prize fields (array format):
 * - prizes[0]name: string
 * - prizes[0]type: "item" | "money"
 * - prizes[0]quantity: number
 * - prizes[0]ordering: number (1-based)
 * - prizes[0]image: File (optional)
 * - prizes[1]name: string
 * - prizes[1]type: "item" | "money"
 * - etc...
 *
 * Example FormData entries:
 * name: "Summer Contest"
 * description: "Exciting summer game for customers"
 * store: "1"
 * prizes[0]name: "iPhone 15"
 * prizes[0]type: "item"
 * prizes[0]quantity: "1"
 * prizes[0]ordering: "1"
 * prizes[0]image: [File object]
 * prizes[1]name: "Cash Prize"
 * prizes[1]type: "money"
 * prizes[1]quantity: "5"
 * prizes[1]ordering: "2"
 *
 * Features:
 * - No start/end dates (removed as requested)
 * - Full translation support (Russian & Karakalpak)
 * - Drag-and-drop prize reordering
 * - File upload for prize images
 * - Real-time form validation
 * - Prize type selection (item/money)
 */

interface GameFormData {
  name: string;
  description: string;
  store?: number;
  all_clients: boolean;
  from_bonus?: number;
  to_bonus?: number;
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: storesData, isLoading: storesLoading } = useGetStores();
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // Handle stores data structure (could be array or paginated response)
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const { mutate: createGame, isPending: isCreating } = useCreateGame();

  const isSuperAdmin = currentUser?.role === "superadmin";
  const userStore = currentUser?.store;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GameFormData>({
    defaultValues: {
      name: "",
      description: "",
      store: isSuperAdmin ? undefined : userStore,
      all_clients: true,
      from_bonus: 10,
      to_bonus: 20,
    },
  });

  const watchAllClients = watch("all_clients");
  const showBonusFields = watchAllClients === false;

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

    // Add client selection data
    const allClientsValue = data.all_clients === true;
    formData.append("all_clients", allClientsValue.toString());
    if (!allClientsValue) {
      formData.append("from_bonus", (data.from_bonus || 10).toString());
      formData.append("to_bonus", (data.to_bonus || 20).toString());
    }

    // Add prizes data
    prizes.forEach((prize, index) => {
      formData.append(`prizes[${index}]name`, prize.name);
      formData.append(`prizes[${index}]type`, prize.type);
      formData.append(`prizes[${index}]quantity`, prize.quantity.toString());
      formData.append(`prizes[${index}]ordering`, prize.ordering.toString());

      if (prize.image && prize.image instanceof File) {
        formData.append(`prizes[${index}]image`, prize.image);
      }
    });

    createGame(formData, {
      onSuccess: () => {
        toast.success(
          t("messages.success.game_created") || "Game created successfully",
        );
        navigate("/games");
      },
      onError: (error) => {
        console.error("Error creating game:", error);
        toast.error(t("messages.error.create_game") || "Failed to create game");
      },
    });
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // If user is not superadmin and has no store, show error
  if (!isSuperAdmin && !userStore) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-600 mb-4">
            {t("messages.error.contact_admin") ||
              "You need to be assigned to a store to create games. Please contact your administrator."}
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
          {t("messages.create_game") || "Create New Game"}
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
                    <div className="text-gray-500">Loading stores...</div>
                  </div>
                ) : (
                  <select
                    {...register("store", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t("placeholders.select_store") || "Выберите магазин"}
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
                placeholder={
                  t("placeholders.game_name") || "Введите название игры"
                }
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
                {...register("description")}
                rows={4}
                placeholder={
                  t("placeholders.game_description") || "Введите описание игры"
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

        {/* Client Selection Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("forms.client_selection") || "Client Selection"}
          </h2>

          <div className="space-y-4">
            {/* All Clients Radio Button */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="all_clients_true"
                {...register("all_clients")}
                value="true"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="all_clients_true"
                className="text-sm font-medium text-gray-700"
              >
                {t("forms.all_clients") || "All Clients"}
              </label>
            </div>

            {/* Specific Bonus Range Radio Button */}
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="all_clients_false"
                {...register("all_clients")}
                value="false"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor="all_clients_false"
                className="text-sm font-medium text-gray-700"
              >
                {t("forms.bonus_range_clients") || "Clients with Bonus Range"}
              </label>
            </div>

            {/* Bonus Range Fields - Only show when all_clients is false */}
            {showBonusFields && (
              <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("forms.from_bonus") || "From Bonus"} *
                  </label>
                  <input
                    type="number"
                    {...register("from_bonus", {
                      required: showBonusFields,
                      min: 1,
                      max: 999,
                    })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.from_bonus && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("validation.from_bonus_required") ||
                        "From bonus is required"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("forms.to_bonus") || "To Bonus"} *
                  </label>
                  <input
                    type="number"
                    {...register("to_bonus", {
                      required: showBonusFields,
                      min: 1,
                      max: 999,
                    })}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.to_bonus && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("validation.to_bonus_required") ||
                        "To bonus is required"}
                    </p>
                  )}
                </div>
              </div>
            )}
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
            disabled={isCreating}
          >
            {t("buttons.cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={isCreating || prizes.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("buttons.creating") || "Creating..."}
              </>
            ) : (
              <>
                <span>✓</span>
                {t("buttons.create_game") || "Create Game"}
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
