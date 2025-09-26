import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourceTable";
import { useGetPrizes, useDeletePrize } from "../api/prize";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Prize } from "../api/types";

export default function PrizesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: prizesData, isLoading, refetch } = useGetPrizes();
  const { mutate: deletePrize } = useDeletePrize();
  const { data: currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role == "superadmin";

  const columns = [
    {
      header: t("forms.prize_name") || "Prize Name",
      accessorKey: "name",
    },
    {
      header: t("forms.quantity") || "Quantity",
      accessorKey: "quantity",
    },
    {
      header: t("forms.game") || "Game",
      accessorKey: "game_read.name" as keyof Prize,
      cell: (row: Prize) => row.game_read?.name || `Game #${row.game}`,
    },
    ...(isSuperAdmin
      ? [
          {
            header: t("forms.store") || "Store",
            accessorKey: "game_read.store" as keyof Prize,
            cell: (row: Prize) => `Store #${row.game_read?.store || row.game}`,
          },
        ]
      : []),
    {
      header: t("forms.image") || "Image",
      accessorKey: "image",
      cell: (row: Prize) =>
        row.image ? (
          <img
            src={
              typeof row.image === "string"
                ? row.image
                : URL.createObjectURL(row.image)
            }
            alt={row.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        ),
    },
  ];

  const handleEdit = (prize: Prize) => {
    navigate(`/prizes/${prize.id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        t("messages.confirm_delete") ||
          "Are you sure you want to delete this prize?",
      )
    ) {
      deletePrize(id, {
        onSuccess: () => {
          toast.success(
            t("messages.success.deleted") || "Prize deleted successfully",
          );
          refetch();
        },
        onError: () => {
          toast.error(t("messages.error.delete") || "Failed to delete prize");
        },
      });
    }
  };

  const handleCreate = () => {
    navigate("/prizes/create");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading prizes...</div>
        </div>
      </div>
    );
  }

  const prizes = Array.isArray(prizesData)
    ? prizesData
    : prizesData?.results || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {t("navigation.prizes") || "Prizes"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? t("messages.all_prizes") || "Manage all prizes across games"
              : t("messages.store_prizes") ||
                `Prizes for store #${currentUser?.store || "your store"}`}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <span>➕</span>
          {t("actions.create_prize") || "Create Prize"}
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {t("messages.no_prizes") || "No prizes found"}
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            {t("actions.create_first_prize") || "Create Your First Prize"}
          </button>
        </div>
      ) : (
        <ResourceTable
          data={prizes}
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
