import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { useCreatePurchase } from "../api/purchases";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Client } from "../api/types";

interface CreatePurchaseDialogProps {
  client: Client;
  onSuccess?: () => void;
}

export function CreatePurchaseDialog({
  client,
  onSuccess,
}: CreatePurchaseDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { mutate: createPurchase } = useCreatePurchase();

  // Fetch stores for superadmin and store_admin
  const { data: storesData, isLoading: storesLoading } = useGetStores({
    params: { page_size: 100 }, // Get all stores
  });

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];
  const isSuperAdmin = currentUser?.role === "superadmin";
  const isStoreAdmin = currentUser?.role === "store_admin";

  // Check if purchase button should be shown
  const canShowPurchaseButton =
    currentUser?.role === "superadmin" || currentUser?.role === "store_admin";

  // Filter available stores based on role and can_purchase
  const availableStores = stores.filter((store) => {
    if (isSuperAdmin) {
      // Superadmin can see all stores but should disable ones where can_purchase is false
      return true;
    } else if (isStoreAdmin) {
      // Store admin can only see their own store if it has can_purchase true
      return store.id === currentUser?.store?.id && store.can_purchase;
    }
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !client.id) return;

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error(
        t("messages.error.invalid_amount") || "Please enter a valid amount",
      );
      return;
    }

    // For superadmin and store_admin, store selection is required
    if ((isSuperAdmin || isStoreAdmin) && !selectedStore) {
      toast.error(
        t("messages.error.store_required") || "Please select a store",
      );
      return;
    }

    setIsSubmitting(true);

    const purchaseData: {
      client: number;
      amount: number;
      store?: number;
    } = {
      client: client.id,
      amount: amountNumber,
    };

    // Add store to the request based on user role
    if ((isSuperAdmin || isStoreAdmin) && selectedStore) {
      purchaseData.store = parseInt(selectedStore);
    } else if (currentUser?.store) {
      // For non-superadmin users, use their assigned store
      purchaseData.store = currentUser.store.id;
    }

    createPurchase(purchaseData, {
      onSuccess: () => {
        toast.success(
          t("messages.success.purchase_created") ||
            `Purchase created successfully for ${client.full_name}`,
        );
        setAmount("");
        setSelectedStore("");
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        console.error("Create purchase error:", error);
        toast.error(
          t("messages.error.create_purchase") || "Failed to create purchase",
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
      setAmount("");
      setSelectedStore("");
    }
  };

  // Don't show purchase button if user doesn't have permission
  if (!canShowPurchaseButton) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {t("actions.add_purchase") || "Add Purchase"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("actions.create_purchase") || "Create Purchase"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                {t("forms.client") || "Client"}
              </Label>
              <div className="col-span-3">
                <Input
                  id="client"
                  value={`${client.full_name} (${client.phone_number})`}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {(isSuperAdmin || isStoreAdmin) && (
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
                          disabled={isSuperAdmin && !store.can_purchase}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{store.name}</span>
                            {isSuperAdmin && !store.can_purchase && (
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
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                {t("forms.amount") || "Amount"} *
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("placeholders.enter_amount") || "Enter amount"}
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(e.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
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
              type="submit"
              disabled={
                isSubmitting ||
                !amount ||
                ((isSuperAdmin || isStoreAdmin) && !selectedStore) ||
                storesLoading
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting
                ? t("actions.creating") || "Creating..."
                : t("actions.create_purchase") || "Create Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
