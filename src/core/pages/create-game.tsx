import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useCreateGame } from "../api/game";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Game } from "../api/types";

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: storesData, isLoading: storesLoading } = useGetStores();

  // Handle stores data structure (could be array or paginated response)
  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const { mutate: createGame, isPending: isCreating } = useCreateGame();

  // Check if user is authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Please log in to access this page");
      navigate("/login");
    }
  }, [currentUser, userLoading, navigate]);

  // Don't render if user data is still loading
  if (userLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const isSuperAdmin = currentUser.role === "superadmin";
  const userStore = currentUser.store;

  // Create field configuration based on user role
  const getGameFields = () => {
    const baseFields = [
      {
        name: "name",
        label: t("forms.game_name") || "Game Name",
        type: "text" as const,
        placeholder: t("forms.game_name") || "Enter game name",
        required: true,
      },
      {
        name: "description",
        label: t("forms.game_description") || "Game Description",
        type: "textarea" as const,
        placeholder:
          t("forms.game_description") || "Enter game description",
        required: true,
      },
      {
        name: "start_date",
        label: t("forms.start_date") || "Start Date",
        type: "date",
        placeholder: "YYYY-MM-DD HH:MM (e.g., 2025-12-25 10:00)",
        required: true,
      },
      {
        name: "end_date",
        label: t("forms.end_date") || "End Date",
        type: "date",
        placeholder: "YYYY-MM-DD HH:MM (e.g., 2025-12-31 23:59)",
        required: true,
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

  const fields = getGameFields();

  const handleSubmit = (data: Partial<Game>) => {
    // Prepare the data for submission
    const gameData: Partial<Game> = {
      ...data,
    };

    // If user is not superadmin, automatically set their store
    if (!isSuperAdmin && userStore) {
      gameData.store = userStore;
    }

    // Convert date strings to ISO format for API
    if (gameData.start_date) {
      const startDate = new Date(gameData.start_date);
      if (isNaN(startDate.getTime())) {
        toast.error(
          t("messages.error.invalid_start_date") || "Invalid start date format",
        );
        return;
      }
      gameData.start_date = startDate.toISOString();
    }
    if (gameData.end_date) {
      const endDate = new Date(gameData.end_date);
      if (isNaN(endDate.getTime())) {
        toast.error(
          t("messages.error.invalid_end_date") || "Invalid end date format",
        );
        return;
      }
      gameData.end_date = endDate.toISOString();
    }

    // Validate that end date is after start date
    if (gameData.start_date && gameData.end_date) {
      const startDate = new Date(gameData.start_date);
      const endDate = new Date(gameData.end_date);

      if (endDate <= startDate) {
        toast.error(
          t("messages.error.invalid_date_range") ||
            "End date must be after start date",
        );
        return;
      }
    }

    createGame(gameData as Game, {
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

  // Set default values
  const defaultValues: Partial<Game> = {
    // Set default dates (today to next week) in readable format
    start_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16)
      .replace("T", " "),
  };

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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("messages.create_game") || "Create New Game"}
          </h1>

        </div>
        <button
          onClick={() => navigate(-1)}
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
            isSubmitting={isCreating}
          />
        )}
      </div>
    </div>
  );
}
