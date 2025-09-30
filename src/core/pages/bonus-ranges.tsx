// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ResourceTable } from "../helpers/ResourceTable";
// import { useGetBonusRanges, useDeleteBonusRange } from "../api/bonus-range";
// import { useCurrentUser } from "../hooks/useCurrentUser";
// import { toast } from "sonner";
// import type { BonusRange } from "../api/types";
//
// export default function BonusRangesPage() {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const { data: currentUser } = useCurrentUser();
//   const { data: bonusRangesData, isLoading, refetch } = useGetBonusRanges();
//   const { mutate: deleteBonusRange } = useDeleteBonusRange();
//
//   const isSuperAdmin = currentUser?.role === "superadmin";
//
//   const columns = [
//     {
//       header: t("forms.min_amount") || "Min Amount",
//       accessorKey: "min_amount",
//       cell: (row: BonusRange) => `${row.min_amount.toLocaleString()}`,
//     },
//     {
//       header: t("forms.max_amount") || "Max Amount",
//       accessorKey: "max_amount",
//       cell: (row: BonusRange) => `${row.max_amount.toLocaleString()}`,
//     },
//     {
//       header: t("forms.bonus_points") || "Bonus Points",
//       accessorKey: "bonus_points",
//       cell: (row: BonusRange) => `${row.bonus_points}`,
//     },
//     ...(isSuperAdmin
//       ? [
//           {
//             header: t("forms.store") || "Store",
//             accessorKey: "store_read.name" as keyof BonusRange,
//             cell: (row: BonusRange) =>
//               row.store_read?.name || `Store #${row.store}`,
//           },
//         ]
//       : []),
//   ];
//
//   const handleEdit = (bonusRange: BonusRange) => {
//     navigate(`/bonus-ranges/${bonusRange.id}/edit`);
//   };
//
//   const handleDelete = (id: number) => {
//     if (
//       window.confirm(
//         t("messages.confirm_delete") ||
//           "Are you sure you want to delete this bonus range?",
//       )
//     ) {
//       deleteBonusRange(id, {
//         onSuccess: () => {
//           toast.success(
//             t("messages.success.deleted") || "Bonus range deleted successfully",
//           );
//           refetch();
//         },
//         onError: () => {
//           toast.error(
//             t("messages.error.delete") || "Failed to delete bonus range",
//           );
//         },
//       });
//     }
//   };
//
//   const handleCreate = () => {
//     navigate("/bonus-ranges/create");
//   };
//
//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-gray-500">Loading bonus ranges...</div>
//         </div>
//       </div>
//     );
//   }
//
//   const bonusRanges = Array.isArray(bonusRangesData)
//     ? bonusRangesData
//     : bonusRangesData?.results || [];
//
//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">
//             {t("navigation.bonus_ranges") || "Bonus Ranges"}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {isSuperAdmin
//               ? t("messages.all_bonus_ranges") ||
//                 "Manage bonus ranges across all stores"
//               : t("messages.store_bonus_ranges") ||
//                 `Bonus ranges for store #${currentUser?.store || "your store"}`}
//           </p>
//         </div>
//         <button
//           onClick={handleCreate}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
//         >
//           <span>➕</span>
//           {t("actions.create_bonus_range") || "Create Bonus Range"}
//         </button>
//       </div>
//
//       {bonusRanges.length === 0 ? (
//         <div className="text-center py-12">
//           <div className="text-gray-500 text-lg mb-4">
//             {t("messages.no_bonus_ranges") || "No bonus ranges found"}
//           </div>
//           <button
//             onClick={handleCreate}
//             className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
//           >
//             {t("actions.create_first_bonus_range") ||
//               "Create Your First Bonus Range"}
//           </button>
//         </div>
//       ) : (
//         <ResourceTable
//           data={bonusRanges}
//           columns={columns}
//           isLoading={isLoading}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onAdd={handleCreate}
//         />
//       )}
//     </div>
//   );
// }
