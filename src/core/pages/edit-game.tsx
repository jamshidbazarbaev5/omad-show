import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { PrizeForm } from "../components/PrizeForm";
import { toast } from "sonner";
import {
  useGetGame,
  useUpdateGame,
  useGetGameParticipants,
  useGetGameWinners,
} from "../api/game";
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
  all_clients: boolean;
  from_bonus?: number;
  to_bonus?: number;
}

export default function EditGamePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: storesData, isLoading: storesLoading } = useGetStores();
  const { data: gameData, isLoading: gameLoading } = useGetGame(Number(id));
  const [participantsPage, setParticipantsPage] = useState<number>(1);
  const { data: participantsData, isLoading: participantsLoading } =
    useGetGameParticipants(Number(id), participantsPage);
  const [winnersPage, setWinnersPage] = useState<number>(1);
  const { data: winnersData, isLoading: winnersLoading } = useGetGameWinners(
    Number(id),
    winnersPage,
  );
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // Handle stores data structure (could be array or paginated response)
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const { mutate: updateGame, isPending: isUpdating } = useUpdateGame();

  const isSuperAdmin = currentUser?.role === "superadmin";
  const userStore = currentUser?.store.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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

  // Set form data when game loads
  useEffect(() => {
    if (gameData) {
      // @ts-ignore
      reset({
        name: gameData?.name,
        description: gameData?.description,
        store: gameData?.store.id,
        all_clients: gameData?.all_clients ?? true,
        from_bonus: gameData?.from_bonus ?? 10,
        to_bonus: gameData?.to_bonus ?? 20,
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

    // Add client selection data
    const allClientsValue = data.all_clients === true;
    formData.append("all_clients", allClientsValue.toString());
    if (!allClientsValue) {
      formData.append("from_bonus", (data.from_bonus || 10).toString());
      formData.append("to_bonus", (data.to_bonus || 20).toString());
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
                checked={watchAllClients === true}
                onChange={() => setValue("all_clients", true)}
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
                checked={watchAllClients === false}
                onChange={() => setValue("all_clients", false)}
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

      {/* Data Sections */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8"
      >



        {/* Participants Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {t("forms.participants") || "Game Participants"}
            </h3>
          </div>

          {participantsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">
                  {t("forms.loading") || "Loading participants..."}
                </span>
              </div>
            </div>
          ) : participantsData && participantsData.participants.length > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap gap-4 text-sm">

                <div className="bg-green-100 px-3 py-1 rounded">
                  <span className="font-medium">
                    {t("status.total_participants") || "Total Participants"}:
                  </span>
                  <span className="ml-1">
                    {participantsData.participants_count}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto relative">
                {participantsLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600">
                        {t("forms.loading") || "Loading..."}
                      </span>
                    </div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.id") || "ID"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.full_name") || "Full Name"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.phone_number") || "Phone Number"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.total_bonuses") || "Total Bonuses"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participantsData.participants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {participant.total_bonuses}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(participantsData.previous !== null ||
                participantsData.next !== null) && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setParticipantsPage(participantsPage - 1)}
                      disabled={
                        participantsData.previous === null ||
                        participantsLoading
                      }
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        participantsData.previous !== null &&
                        !participantsLoading
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {t("pagination.previous") || "← Previous"}
                    </button>
                    {participantsPage > 1 && (
                      <button
                        onClick={() => setParticipantsPage(1)}
                        className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        {t("pagination.first_page") || "First"}
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span>
                      {t("pagination.showing_participants", {
                        start:
                          (participantsPage - 1) *
                            participantsData.participants.length +
                          1,
                        end:
                          (participantsPage - 1) *
                            participantsData.participants.length +
                          participantsData.participants.length,
                        total: participantsData.participants_count,
                      }) ||
                        `Showing ${(participantsPage - 1) * participantsData.participants.length + 1}-${(participantsPage - 1) * participantsData.participants.length + participantsData.participants.length} of ${participantsData.participants_count}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {t("pagination.page") || "Page"}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={participantsPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1) {
                            setParticipantsPage(page);
                          }
                        }}
                        className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="capitalize text-xs">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participantsData.game_status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {participantsData.game_status}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => setParticipantsPage(participantsPage + 1)}
                    disabled={
                      participantsData.next === null || participantsLoading
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      participantsData.next !== null && !participantsLoading
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {t("pagination.next") || "Next →"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="text-6xl mb-4">👥</div>
                <div className="text-gray-500 mb-2 text-lg font-medium">
                  {t("messages.no_participants") || "No participants found"}
                </div>
                <p className="text-sm text-gray-400">
                  {t("messages.participants_info") ||
                    "Participants will appear here once they join the game"}
                </p>
                {participantsData?.game_status === "active" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {t("messages.game_active_hint") ||
                        "The game is active and ready to accept participants"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Winners Section */}
        <div>
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {t("forms.winners") || "Game Winners"}
            </h3>
          </div>

          {winnersLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">
                  {t("forms.loading") || "Loading winners..."}
                </span>
              </div>
            </div>
          ) : winnersData && winnersData.winners.length > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap gap-4 text-sm">
                <div className="bg-purple-100 px-3 py-1 rounded">
                  <span className="font-medium">
                    {t("status.game_name") || "Game"}:
                  </span>
                  <span className="ml-1">{winnersData.game}</span>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded">
                  <span className="font-medium">
                    {t("status.total_winners") || "Total Winners"}:
                  </span>
                  <span className="ml-1">{winnersData.total_winners}</span>
                </div>
              </div>

              <div className="overflow-x-auto relative">
                {winnersLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600">
                        {t("forms.loading") || "Loading..."}
                      </span>
                    </div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.id") || "ID"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.winner") || "Winner"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.phone_number") || "Phone Number"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.prize") || "Prize"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.prize_type") || "Prize Type"}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("table.awarded_at") || "Awarded At"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {winnersData.winners.map((winner) => (
                      <tr key={winner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {winner.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {winner.client.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {winner.client.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {winner.prize.image && (
                              <img
                                src={winner.prize.image}
                                alt={winner.prize.name}
                                className="w-8 h-8 rounded-full mr-3 object-cover"
                              />
                            )}
                            <span>{winner.prize.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              winner.prize.type === "money"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {winner.prize.type === "money"
                              ? t("prize_types.money") || "Money"
                              : t("prize_types.item") || "Item"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(winner.awarded_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Winners Pagination Controls */}
              {(winnersData.previous !== null || winnersData.next !== null) && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWinnersPage(winnersPage - 1)}
                      disabled={winnersData.previous === null || winnersLoading}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        winnersData.previous !== null && !winnersLoading
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {t("pagination.previous") || "← Previous"}
                    </button>
                    {winnersPage > 1 && (
                      <button
                        onClick={() => setWinnersPage(1)}
                        className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        {t("pagination.first_page") || "First"}
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span>
                      {t("pagination.showing_winners", {
                        start:
                          (winnersPage - 1) * winnersData.winners.length + 1,
                        end:
                          (winnersPage - 1) * winnersData.winners.length +
                          winnersData.winners.length,
                        total: winnersData.total_winners,
                      }) ||
                        `Showing ${(winnersPage - 1) * winnersData.winners.length + 1}-${(winnersPage - 1) * winnersData.winners.length + winnersData.winners.length} of ${winnersData.total_winners}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {t("pagination.page") || "Page"}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={winnersPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1) {
                            setWinnersPage(page);
                          }
                        }}
                        className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                      {winnersData.game}
                    </span>
                  </div>

                  <button
                    onClick={() => setWinnersPage(winnersPage + 1)}
                    disabled={winnersData.next === null || winnersLoading}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      winnersData.next !== null && !winnersLoading
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {t("pagination.next") || "Next →"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-gray-500 mb-2 text-lg font-medium">
                  {t("messages.no_winners") || "No winners found"}
                </div>
                <p className="text-sm text-gray-400">
                  {t("messages.winners_info") ||
                    "Winners will appear here once the game draws are completed"}
                </p>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    {t("messages.draw_hint") ||
                      "Complete the game draw to see winners here"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
