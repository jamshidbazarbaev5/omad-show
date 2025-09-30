import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourceTable";
import {
  useGetGames,
  useDeleteGame,
  useActivateGame,
  useLockGame,
} from "../api/game";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Game } from "../api/types";
import { Play, Lock, Unlock, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {useState} from "react";

export default function GamesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: currentUser } = useCurrentUser();
  const { data: gamesData, isLoading, refetch } = useGetGames({params:{
    page:page
    }});
  const { mutate: deleteGame } = useDeleteGame();
  const { mutate: activateGame } = useActivateGame();
  const { mutate: lockGame } = useLockGame();

  const totalCount = Array.isArray(gamesData) ? gamesData.length : gamesData?.count || 0;
  const handleActivateGame = (gameId: number) => {
    activateGame(gameId, {
      onSuccess: () => {
        toast.success("Game activated successfully");
        refetch();
      },
      onError: () => {
        toast.error("Failed to activate game");
      },
    });
  };

  const handleLockGame = (gameId: number) => {
    lockGame(gameId, {
      onSuccess: () => {
        toast.success("Game locked successfully");
        refetch();
      },
      onError: () => {
        toast.error("Failed to lock game");
      },
    });
  };

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
            header: t("forms.store_name") || "Store",
            accessorKey: (row:any) => row.store.name,
          },
        ]
      : []),
    {
      header: t("forms.status") || "Status",
      accessorKey: "status",
      cell: (row: Game) => {
        const status = row.status || "draft";
        const statusClass =
          {
            draft: "bg-gray-100 text-gray-800",
            active: "bg-green-100 text-green-800",
            locked: "bg-orange-100 text-orange-800",
            finished: "bg-blue-100 text-blue-800",
          }[status] || "bg-gray-100 text-gray-800";

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
          >
            {t(`status.${status}`) || status}
          </span>
        );
      },
    },
    {
      header: t("forms.prizes") || "Prizes",
      accessorKey: "prizes",
      cell: (row: Game) => {
        const prizeCount = row.prizes?.length || 0;
        const itemPrizes =
          row.prizes?.filter((p) => p.type === "item").length || 0;
        const moneyPrizes =
          row.prizes?.filter((p) => p.type === "money").length || 0;

        if (prizeCount === 0) {
          return <span className="text-gray-400">No prizes</span>;
        }

        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 mb-2">
              {prizeCount} призы
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {row.prizes?.slice(0, 3).map((prize, index) => (
                <div
                  key={prize.id || index}
                  className="flex items-center gap-1"
                >
                  {prize.image && typeof prize.image === "string" && (
                    <img
                      src={prize.image}
                      alt={prize.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  <span
                    className="text-xs text-gray-600 truncate max-w-20"
                    title={prize.name}
                  >
                    {prize.name}
                  </span>
                </div>
              ))}
              {prizeCount > 3 && (
                <span className="text-xs text-gray-400">
                  +{prizeCount - 3} more
                </span>
              )}
            </div>
            <div className="text-gray-500">
              {itemPrizes > 0 && <span>🎁 {itemPrizes}</span>}
              {itemPrizes > 0 && moneyPrizes > 0 && (
                <span className="mx-1">•</span>
              )}
              {moneyPrizes > 0 && <span>💰 {moneyPrizes}</span>}
            </div>
          </div>
        );
      },
    },
  ];

  const handleEdit = (game: Game) => {
    navigate(`/games/${game.id}/edit`);
  };

  const handleDelete = (id: number) => {
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
  };

  const handleCreate = () => {
    navigate("/games/create");
  };

  const handleStartGame = (game: Game) => {
    // Navigate to the new game draw page

    navigate(`/games/${game.id}/play`);
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

  // @ts-ignore
  // @ts-ignore
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("navigation.games") || "Games"}
          </h1>
        </div>
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
          totalCount={totalCount}
          pageSize={10}
          currentPage={page}
          onPageChange={(newPage) => setPage(newPage)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleCreate}
          actions={(game) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {game.status !== 'finished' && (
                    <DropdownMenuItem onClick={() => handleStartGame(game)}>
                      <Play className="h-4 w-4 mr-2" />
                      {t('status.play')}
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => handleEdit(game)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('status.edit')}
                </DropdownMenuItem>
                {game.status !== 'finished' && (
                    <DropdownMenuItem
                        onClick={() => game.id && handleActivateGame(game.id)}
                        className="text-green-600 hover:text-green-700"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {t('status.activate')}
                    </DropdownMenuItem>
                )}
                {game.status !== 'finished' && (
                    <DropdownMenuItem
                        onClick={() => game.id && handleLockGame(game.id)}
                        className="text-orange-600 hover:text-orange-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {t('status.lock')}
                    </DropdownMenuItem>
                )
                }

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => game.id && handleDelete(game.id)}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('status.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}
    </div>
  );
}
