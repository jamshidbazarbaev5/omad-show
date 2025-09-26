import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useGetPurchase, useUpdatePurchase } from "../api/purchases";
import { useGetClients } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { UpdatePurchaseData } from "../api/purchases";
import type { Client } from "../api/types";

export default function EditPurchasePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purchaseId = id ? parseInt(id) : 0;

  const { data: currentUser } = useCurrentUser();
  const {
    data: purchase,
    isLoading: isLoadingPurchase,
    isError,
  } = useGetPurchase(purchaseId);
  const { data: clientsData, isLoading: isLoadingClients } = useGetClients({
    page_size: 100, // Get more clients for the dropdown
  });
  const { mutate: updatePurchase } = useUpdatePurchase();

  // Check if user has permission to edit purchases
  const canEditPurchases =
    currentUser?.role === "store_admin" || currentUser?.role === "seller";

  const [formData, setFormData] = useState<UpdatePurchaseData>({
    client: 0,
    amount: 0,
  });

  const [errors, setErrors] = useState<Partial<UpdatePurchaseData>>({});

  // Get clients array from the API response
  const clients = Array.isArray(clientsData)
    ? clientsData
    : clientsData?.results || [];

  // Debug logs
  console.log("Purchase data:", purchase);
  console.log("Clients data:", clients);
  console.log("Form data:", formData);

  // Initialize form data when purchase is loaded
  useEffect(() => {
    console.log("useEffect triggered, purchase:", purchase);
    console.log("purchase exists:", !!purchase);

    // Try direct assignment approach
    if (purchase?.id) {
      console.log("Purchase ID exists:", purchase.id);
      console.log("Purchase client:", purchase.client);

      const newFormData = {
        client: 0,
        amount: 0,
      };

      // Set client ID
      if (purchase.client && purchase.client.id) {
        newFormData.client = Number(purchase.client.id);
        console.log("Setting client to:", newFormData.client);
      }

      // Set amount
      if (purchase.amount) {
        newFormData.amount = parseFloat(String(purchase.amount));
        console.log("Setting amount to:", newFormData.amount);
      }

      console.log("Final form data before setting:", newFormData);
      setFormData(newFormData);

      // Force update after a short delay to ensure state is set
      setTimeout(() => {
        console.log("Current form data after timeout:", formData);
      }, 100);
    }
  }, [purchase]);

  if (!canEditPurchases) {
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

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              {t("messages.error.load", { item: t("navigation.purchase") }) ||
                "Failed to load purchase"}
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/purchases")} variant="outline">
                {t("actions.back") || "Back to Purchases"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdatePurchaseData> = {};

    if (!formData.client || formData.client === 0) {
      newErrors.client = 0; // Use 0 to indicate error for number field
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 0;
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

    updatePurchase(
      { id: purchaseId, data: formData },
      {
        onSuccess: () => {
          toast.success(
            t("messages.success.updated", { item: t("navigation.purchase") }) ||
              "Purchase updated successfully",
          );
          navigate("/purchases");
        },
        onError: (error: unknown) => {
          console.error("Update purchase error:", error);
          toast.error(
            t("messages.error.update", { item: t("navigation.purchase") }) ||
              "Failed to update purchase",
          );
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleInputChange = (
    field: keyof UpdatePurchaseData,
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

  if (isLoadingPurchase) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <Card className="max-w-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            {t("actions.edit") || "Edit Purchase"}
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
                  value={
                    formData.client &&
                    clients.length > 0 &&
                    clients.some((c: Client) => c.id === formData.client)
                      ? formData.client.toString()
                      : ""
                  }
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

              {/* Purchase Info */}
              {purchase?.created_at && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    {t("forms.purchase_info") || "Purchase Information"}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">
                        {t("forms.created") || "Created"}:
                      </span>{" "}
                      {new Date(purchase.created_at).toLocaleDateString(
                        "ru-RU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                    {purchase.updated_at &&
                      purchase.updated_at !== purchase.created_at && (
                        <p>
                          <span className="font-medium">
                            {t("forms.updated") || "Updated"}:
                          </span>{" "}
                          {new Date(purchase.updated_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                  </div>
                </div>
              )}
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
                  ? t("actions.updating") || "Updating..."
                  : t("actions.update") || "Update Purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
