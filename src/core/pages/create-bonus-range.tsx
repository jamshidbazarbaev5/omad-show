// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ResourceForm } from "../helpers/ResourceForm";
// import { toast } from "sonner";
// import { useCreateBonusRange } from "../api/bonus-range";
// import { useGetStores } from "../api/store";
// import { useCurrentUser } from "../hooks/useCurrentUser";
// import type { BonusRange } from "../api/types";
//
// export default function CreateBonusRangePage() {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const { data: currentUser, isLoading: userLoading } = useCurrentUser();
//   const { data: storesData, isLoading: storesLoading } = useGetStores();
//
//   // Handle stores data structure (could be array or paginated response)
//   const stores = Array.isArray(storesData)
//     ? storesData
//     : storesData?.results || [];
//
//   const { mutate: createBonusRange, isPending: isCreating } =
//     useCreateBonusRange();
//
//   // Check if user is authenticated
//   useEffect(() => {
//     if (!userLoading && !currentUser) {
//       toast.error("Please log in to access this page");
//       navigate("/login");
//     }
//   }, [currentUser, userLoading, navigate]);
//
//   // Don't render if user data is still loading
//   if (userLoading || !currentUser) {
//     return (
//       <div className="flex justify-center items-center h-64">Loading...</div>
//     );
//   }
//
//   const isSuperAdmin = currentUser.role === "superadmin";
//   const userStore = currentUser.store;
//
//   // Create field configuration based on user role
//   const getBonusRangeFields = () => {
//     const baseFields = [
//       {
//         name: "min_amount",
//         label: t("forms.min_amount") || "Min Amount",
//         type: "number" as const,
//         placeholder:
//           t("placeholders.enter_min_amount") || "Enter minimum amount",
//         required: true,
//         min: 0,
//       },
//       {
//         name: "max_amount",
//         label: t("forms.max_amount") || "Max Amount",
//         type: "number" as const,
//         placeholder:
//           t("placeholders.enter_max_amount") || "Enter maximum amount",
//         required: true,
//         min: 0,
//       },
//       {
//         name: "bonus_points",
//         label: t("forms.bonus_points") || "Bonus Points",
//         type: "number" as const,
//         placeholder:
//           t("placeholders.enter_bonus_points") || "Enter bonus points",
//         required: true,
//         min: 0,
//       },
//     ];
//
//     // Add store selection field only for superadmin
//     if (isSuperAdmin) {
//       return [
//         {
//           name: "store",
//           label: t("forms.store") || "Store",
//           type: "select" as const,
//           options: stores.map((store) => ({
//             value: store.id,
//             label: store.name,
//           })),
//           placeholder: t("placeholders.select_store") || "Select a store",
//           required: true,
//         },
//         ...baseFields,
//       ];
//     }
//
//     // For non-superadmin users, store field is not shown (will be set automatically)
//     return baseFields;
//   };
//
//   const fields = getBonusRangeFields();
//
//   const handleSubmit = (data: Partial<BonusRange>) => {
//     // Prepare the data for submission
//     const bonusRangeData: Partial<BonusRange> = {
//       ...data,
//     };
//
//     // If user is not superadmin, automatically set their store
//     if (!isSuperAdmin && userStore) {
//       bonusRangeData.store = userStore;
//     }
//
//     // Validate that max_amount is greater than min_amount
//     if (bonusRangeData.min_amount && bonusRangeData.max_amount) {
//       if (bonusRangeData.max_amount <= bonusRangeData.min_amount) {
//         toast.error(
//           t("messages.error.invalid_amount_range") ||
//             "Maximum amount must be greater than minimum amount",
//         );
//         return;
//       }
//     }
//
//     createBonusRange(bonusRangeData as BonusRange, {
//       onSuccess: () => {
//         toast.success(
//           t("messages.success.bonus_range_created") ||
//             "Bonus range created successfully",
//         );
//         navigate("/bonus-ranges");
//       },
//       onError: (error) => {
//         console.error("Error creating bonus range:", error);
//         toast.error(
//           t("messages.error.create_bonus_range") ||
//             "Failed to create bonus range",
//         );
//       },
//     });
//   };
//
//   // Set default values
//   const defaultValues: Partial<BonusRange> = {
//     min_amount: 100,
//     max_amount: 199,
//     bonus_points: 1,
//   };
//
//   // If user is not superadmin and has no store, show error
//   if (!isSuperAdmin && !userStore) {
//     return (
//       <div className="container mx-auto py-6">
//         <div className="max-w-md mx-auto text-center">
//           <h2 className="text-xl font-semibold text-red-600 mb-4">
//             {t("messages.error.no_store_assigned") || "No Store Assigned"}
//           </h2>
//           <p className="text-gray-600 mb-4">
//             {t("messages.error.contact_admin") ||
//               "You need to be assigned to a store to create bonus ranges. Please contact your administrator."}
//           </p>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             {t("buttons.go_back") || "Go Back"}
//           </button>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">
//             {t("messages.create_bonus_range") || "Create New Bonus Range"}
//           </h1>
//
//         </div>
//         <button
//           onClick={() => navigate(-1)}
//           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//         >
//           {t("buttons.cancel") || "Cancel"}
//         </button>
//       </div>
//
//       <div>
//         {storesLoading && isSuperAdmin ? (
//           <div className="flex justify-center items-center h-32">
//             <div className="text-gray-500">Loading stores...</div>
//           </div>
//         ) : (
//           <ResourceForm
//             fields={fields}
//             onSubmit={handleSubmit}
//             defaultValues={defaultValues}
//             isSubmitting={isCreating}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
