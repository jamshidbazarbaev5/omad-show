import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResourceTable } from "../helpers/ResourceTable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ResourceForm } from "../helpers/ResourceForm";
import { toast } from "sonner";
import { useGetStores, useUpdateStore, useDeleteStore } from "../api/store";
import type { Store } from "../api/types";
import { useCurrentUser } from "@/core/hooks/useCurrentUser.tsx";

const storeFields = (t: any) => [
  {
    name: "name",
    label: t("forms.store_name"),
    type: "text",
    placeholder: t("placeholders.enter_store_name"),
    required: true,
  },
  {
    name: "address",
    label: t("forms.store_address"),
    type: "text",
    placeholder: t("placeholders.enter_store_address"),
    required: true,
  },
];

const columns = (t: any) => [
  {
    header: t("forms.store_name"),
    accessorKey: "name",
  },
  {
    header: t("forms.store_address"),
    accessorKey: "address",
  },
];

export default function StoresPage() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const { data: storesData, isLoading } = useGetStores({});

  const fields = storeFields(t);

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];
  const enhancedStores = stores.map((store: Store, index: number) => ({
    ...store,
    displayId: index + 1,
  }));

  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();
  const { mutate: deleteStore } = useDeleteStore();
  const { data: currentUser } = useCurrentUser();

  // Check if user is superadmin (this should be replaced with actual auth check)
  const isSuperAdmin = currentUser?.role === "superadmin";

  const handleEdit = (store: Store) => {
    if (!isSuperAdmin) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }
    setEditingStore(store);
    setIsFormOpen(true);
  };

  const handleUpdateSubmit = (data: Partial<Store>) => {
    if (!editingStore?.id) return;

    updateStore({ ...data, id: editingStore.id } as Store, {
      onSuccess: () => {
        toast.success(
          t("messages.success.updated", { item: t("navigation.stores") }),
        );
        setIsFormOpen(false);
        setEditingStore(null);
      },
      onError: () =>
        toast.error(
          t("messages.error.update", { item: t("navigation.stores") }),
        ),
    });
  };

  const handleDelete = (id: number) => {
    if (!isSuperAdmin) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }
    deleteStore(id, {
      onSuccess: () =>
        toast.success(
          t("messages.success.deleted", { item: t("navigation.stores") }),
        ),
      onError: () =>
        toast.error(
          t("messages.error.delete", { item: t("navigation.stores") }),
        ),
    });
  };

  const handleAdd = () => {
    if (!isSuperAdmin) {
      toast.error(t("messages.error.unauthorized"));
      return;
    }
    navigate("/create-store");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("navigation.stores")}</h1>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("placeholders.search_store")}
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResourceTable
        data={enhancedStores}
        columns={columns(t)}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={fields}
            onSubmit={handleUpdateSubmit}
            defaultValues={editingStore || {}}
            isSubmitting={isUpdating}
            title={t("messages.edit")}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
