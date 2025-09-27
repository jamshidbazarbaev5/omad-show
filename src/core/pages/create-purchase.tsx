import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useCreatePurchase } from "../api/purchases";
import { useGetClients } from "../api/client";
import { useGetStores } from "../api/store";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { CreatePurchaseData } from "../api/purchases";
import type { Client, Store } from "../api/types";

export default function CreatePurchasePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: clientsData, isLoading: isLoadingClients } = useGetClients({
    page_size: 100, // Get more clients for the dropdown
  });
  const { data: storesData, isLoading: isLoadingStores } = useGetStores({
    params: { page_size: 100 }, // Get more stores for the dropdown
  });
  const { mutate: createPurchase } = useCreatePurchase();

  // Check if user has permission to create purchases
  const canCreatePurchases =
    currentUser?.role === "store_admin" ||
    currentUser?.role === "seller" ||
    currentUser?.role === "superadmin";

  const [formData, setFormData] = useState<CreatePurchaseData>({
    client: 0,
    amount: 0,
    store: 0,
  });

  const [errors, setErrors] = useState<Partial<CreatePurchaseData>>({});

  if (!canCreatePurchases) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t("messages.error.unauthorized") || "Unauthorized access"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clients = Array.isArray(clientsData)
    ? clientsData
    : clientsData?.results || [];

  const stores = Array.isArray(storesData)
    ? storesData
    : storesData?.results || [];

  const validateForm = (): boolean => {
    const newErrors: Partial<CreatePurchaseData> = {};

    if (!formData.client || formData.client === 0) {
      newErrors.client = 0; // Use 0 to indicate error for number field
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 0;
    }

    if (
      currentUser?.role === "superadmin" &&
      (!formData.store || formData.store === 0)
    ) {
      newErrors.store = 0;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        t("messages.error.validation") || "Please fill all required fields",
      );
      return;
    }

    setIsSubmitting(true);

    // Prepare payload - only include store for superadmin
    const payload: CreatePurchaseData = {
      client: formData.client,
      amount: formData.amount,
    };

    if (currentUser?.role === "superadmin" && formData.store) {
      payload.store = formData.store;
    }

    createPurchase(payload, {
      onSuccess: () => {
        toast.success(
          t("messages.success.created", { item: t("navigation.purchase") }) ||
            "Purchase created successfully",
        );
        navigate("/purchases");
      },
      onError: (error: unknown) => {
        console.error("Create purchase error:", error);
        toast.error(
          t("messages.error.create", { item: t("navigation.purchase") }) ||
            "Failed to create purchase",
        );
        setIsSubmitting(false);
      },
    });
  };

  const handleInputChange = (
    field: keyof CreatePurchaseData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/purchases")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {t("actions.create") || "Create Purchase"}
          </h1>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {t("forms.purchase_details") || "Purchase Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="client">
                  {t("forms.client") || "Client"} *
                </Label>
                <Select
                  value={formData.client ? formData.client.toString() : ""}
                  onValueChange={(value) =>
                    handleInputChange("client", parseInt(value))
                  }
                  disabled={isLoadingClients}
                >
                  <SelectTrigger
                    className={errors.client ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingClients
                          ? t("forms.loading") || "Loading clients..."
                          : t("placeholders.select_client") || "Select a client"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: Client) => (
                      <SelectItem key={client.id} value={client.id!.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {client.full_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {client.phone_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && (
                  <p className="text-sm text-red-500">
                    {t("forms.errors.client_required") || "Client is required"}
                  </p>
                )}
              </div>

              {/* Store Selection - Only for superadmin */}
              {currentUser?.role === "superadmin" && (
                <div className="space-y-2">
                  <Label htmlFor="store">{t("forms.store") || "Store"} *</Label>
                  <Select
                    value={formData.store ? formData.store.toString() : ""}
                    onValueChange={(value) =>
                      handleInputChange("store", parseInt(value))
                    }
                    disabled={isLoadingStores}
                  >
                    <SelectTrigger
                      className={errors.store ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          isLoadingStores
                            ? t("forms.loading") || "Loading stores..."
                            : t("placeholders.select_store") || "Select a store"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store: Store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{store.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {store.address}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.store && (
                    <p className="text-sm text-red-500">
                      {t("forms.errors.store_required") || "Store is required"}
                    </p>
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {t("forms.amount") || "Amount"} *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    handleInputChange("amount", parseFloat(e.target.value) || 0)
                  }
                  placeholder={
                    t("placeholders.enter_amount") || "Enter purchase amount"
                  }
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {t("forms.errors.amount_required") ||
                      "Valid amount is required"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/purchases")}
                disabled={isSubmitting}
              >
                {t("actions.cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("actions.creating") || "Creating..."
                  : t("actions.create") || "Create Purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
