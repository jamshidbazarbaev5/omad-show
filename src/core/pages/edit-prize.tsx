import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useGetPrize, useUpdatePrize } from "../api/prize";
import { useGetGames } from "../api/game";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Prize } from "../api/types";

export default function EditPrizePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: prize, isLoading: prizeLoading } = useGetPrize(id!);
  const { data: gamesData, isLoading: gamesLoading } = useGetGames();

  // Handle games data structure (could be array or paginated response)
  const games = Array.isArray(gamesData) ? gamesData : gamesData?.results || [];

  const { mutate: updatePrize, isPending: isUpdating } = useUpdatePrize();

  // Check if user is authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [currentUser, userLoading, navigate]);

  // Don't render if data is still loading
  if (userLoading || prizeLoading || !currentUser || !prize) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const isSuperAdmin = currentUser.role === "superadmin";
  const userStoreId = currentUser.store;

  // Filter games based on user role
  const availableGames = isSuperAdmin
    ? games
    : games.filter((game) => game.store === userStoreId);

  // Create field configuration
  const getPrizeFields = () => {
    return [
      {
        name: "game",
        label: t("forms.game") || "Game",
        type: "select" as const,
        options: availableGames.map((game) => ({
          value: game.id,
          label: game.name,
        })),
        placeholder: t("placeholders.select_game") || "Select a game",
        required: true,
      },
      {
        name: "name",
        label: t("forms.prize_name") || "Prize Name",
        type: "text" as const,
        placeholder: t("placeholders.enter_prize_name") || "Enter prize name",
        required: true,
      },
      {
        name: "quantity",
        label: t("forms.quantity") || "Quantity",
        type: "number" as const,
        placeholder: t("placeholders.enter_quantity") || "Enter quantity",
        required: true,
      },
      {
        name: "image",
        label: t("forms.image") || "Prize Image",
        type: "file" as const,
        placeholder: t("placeholders.select_image") || "Select an image",
        required: false,
        existingImage:
          typeof prize.image === "string" ? prize.image : undefined,
      },
    ];
  };

  const fields = getPrizeFields();

  const handleSubmit = (data: Partial<Prize>) => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add text fields
    if (data.game) {
      formData.append("game", data.game.toString());
    }
    if (data.name) {
      formData.append("name", data.name);
    }
    if (data.quantity) {
      formData.append("quantity", data.quantity.toString());
    }

    // Add image file if a new one is provided
    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }

    updatePrize(
      { formData, id: parseInt(id!) },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.prize_updated") || "Prize updated successfully",
          );
          navigate("/prizes");
        },
        onError: (error) => {
          console.error("Error updating prize:", error);
          toast.error(
            t("messages.error.update_prize") || "Failed to update prize",
          );
        },
      },
    );
  };

  // Set default values from existing prize
  const defaultValues: Partial<Prize> = {
    game: prize.game,
    name: prize.name,
    quantity: prize.quantity,
  };

  // If no games are available, show message
  if (availableGames.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {t("messages.error.no_games_available") || "No Games Available"}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("messages.error.no_games_edit_prize") ||
              "No games are available for editing this prize."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {t("buttons.go_back") || "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>

        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          {t("buttons.cancel") || "Cancel"}
        </button>
      </div>

      <div>
        {gamesLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading games...</div>
          </div>
        ) : (
          <ResourceForm
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isSubmitting={isUpdating}
            title={t("messages.prize_details") || "Prize Details"}
          />
        )}
      </div>
    </div>
  );
}
