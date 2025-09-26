import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourceTable";
import { useGetGames, useDeleteGame } from "../api/game";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Game } from "../api/types";

export default function GamesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { data: gamesData, isLoading, refetch } = useGetGames();
  const { mutate: deleteGame } = useDeleteGame();

  const isSuperAdmin = currentUser?.role === "superadmin";
  // const userStoreId = currentUser?.store_read?.id;

  const columns = [
    {
      header: t("forms.game_name") || "Game Name",
      accessorKey: "name",
    },

    ...(isSuperAdmin
      ? [
          {
            header: t("forms.store") || "Store",
            accessorKey: "store",
          },
        ]
      : []),
    {
      header: t("forms.start_date") || "Start Date",
      accessorKey: "start_date",
      cell: (row: Game) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      header: t("forms.end_date") || "End Date",
      accessorKey: "end_date",
      cell: (row: Game) => new Date(row.end_date).toLocaleDateString(),
    },
  ];

  const handleEdit = (game: Game) => {
    navigate(`/games/${game.id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        t("messages.confirm_delete") ||
          "Are you sure you want to delete this game?",
      )
    ) {
      deleteGame(id, {
        onSuccess: () => {
          toast.success(
            t("messages.success.deleted") || "Game deleted successfully",
          );
          refetch();
        },
        onError: () => {
          toast.error(t("messages.error.delete") || "Failed to delete game");
        },
      });
    }
  };

  const handleCreate = () => {
    navigate("/games/create");
  };

  // Debug logging

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading games...</div>
        </div>
      </div>
    );
  }
  const games = Array.isArray(gamesData) ? gamesData : gamesData?.results || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("navigation.games") || "Games"}
          </h1>

        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>➕</span>
          {t("actions.create_game") || "Create Game"}
        </button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {t("messages.no_games") || "No games found"}
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            {t("actions.create_first_game") || "Create Your First Game"}
          </button>
        </div>
      ) : (
        <ResourceTable
          data={games}
          columns={columns}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleCreate}
        />
      )}
    </div>
  );
}
