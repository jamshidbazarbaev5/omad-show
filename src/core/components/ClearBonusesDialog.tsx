import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useClearClientBonuses } from "../api/client";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";

interface ClearBonusesDialogProps {
  onSuccess?: () => void;
}

export function ClearBonusesDialog({ onSuccess }: ClearBonusesDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { mutate: clearBonuses } = useClearClientBonuses();

  // Check if user has permission to clear bonuses
  const canClearBonuses =
    currentUser?.role === "superadmin" || currentUser?.role === "store_admin";

  // Fetch stores data
  const { data: storesData, isLoading: storesLoading } = useGetStores({
    params: { page_size: 100 }, // Get all stores
  });

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  // Filter stores based on user role and permissions
  const availableStores = stores.filter((store) => {
    if (currentUser?.role === "superadmin") {
      // Superadmin can see all stores but should disable ones where can_purchase is false
      return true;
    } else if (currentUser?.role === "store_admin") {
      // Store admin can only see their own store if it has can_purchase true
      return store.id === currentUser?.store?.id && store.can_purchase;
    }
    return false;
  });

  const handleClearBonuses = () => {
    if (!selectedStore) {
      toast.error(
        t("messages.error.store_required") || "Please select a store",
      );
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmClear = () => {
    if (!selectedStore) return;

    setIsSubmitting(true);
    const storeId = parseInt(selectedStore);

    clearBonuses(storeId, {
      onSuccess: () => {
        toast.success(
          t("messages.success.bonuses_cleared") ||
            "Client bonuses cleared successfully",
        );
        setSelectedStore("");
        setOpen(false);
        setShowConfirmDialog(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        console.error("Clear bonuses error:", error);
        toast.error(
          t("messages.error.clear_bonuses") || "Failed to clear bonuses",
        );
        setShowConfirmDialog(false);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      setSelectedStore("");
      setShowConfirmDialog(false);
    }
  };

  const selectedStoreData = stores.find(
    (store) => store.id.toString() === selectedStore,
  );

  // Don't render if user doesn't have permission
  if (!canClearBonuses) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t("actions.clear_bonuses") || "Clear Bonuses"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>

          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="store" className="text-right">
                {t("forms.store") || "Store"} *
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedStore}
                  onValueChange={setSelectedStore}
                  disabled={isSubmitting || storesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        storesLoading
                          ? t("placeholders.loading") || "Loading..."
                          : t("placeholders.select_store") || "Select a store"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map((store) => (
                      <SelectItem
                        key={store.id}
                        value={store.id.toString()}
                        disabled={
                          currentUser?.role === "superadmin" &&
                          !store.can_purchase
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{store.name}</span>
                          {currentUser?.role === "superadmin" &&
                            !store.can_purchase && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Disabled)
                              </span>
                            )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedStoreData && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("forms.store_details") || "Store Details"}:
                </p>
                <p className="text-sm">
                  <strong>{t("forms.name") || "Name"}:</strong>{" "}
                  {selectedStoreData.name}
                </p>
                <p className="text-sm">
                  <strong>{t("forms.address") || "Address"}:</strong>{" "}
                  {selectedStoreData.address}
                </p>
                {selectedStoreData.can_purchase !== undefined && (
                  <p className="text-sm">
                    <strong>{t("forms.can_purchase") || "Can Purchase"}:</strong>{" "}
                    <span
                      className={
                        selectedStoreData.can_purchase
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {selectedStoreData.can_purchase
                        ? t("common.yes") || "Yes"
                        : t("common.no") || "No"}
                    </span>
                  </p>
                )}
              </div>
            )}


          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("actions.cancel") || "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearBonuses}
              disabled={
                isSubmitting ||
                !selectedStore ||
                storesLoading ||
                (currentUser?.role === "superadmin" &&
                  selectedStoreData &&
                  !selectedStoreData.can_purchase)
              }
            >
              {t("actions.clear_bonuses") || "Clear Bonuses"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialogs.confirm_clear.title") || "Are you absolutely sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.confirm_clear.bonuses") ||
                `This will permanently clear all client bonuses for "${selectedStoreData?.name}". This action cannot be undone and will affect all clients who have bonuses at this store.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t("actions.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting
                ? t("actions.clearing") || "Clearing..."
                : t("actions.clear_bonuses") || "Clear Bonuses"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
