import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, Trash2, Edit, ShoppingCart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useGetPurchases, useDeletePurchase } from "../api/purchases";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Purchase } from "../api/types";

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: currentUser } = useCurrentUser();
  const {
    data: purchasesData,
    isLoading,
    isError,
    refetch,
  } = useGetPurchases({
    page: currentPage,
    page_size: pageSize,
    search: searchQuery,
  });

  const { mutate: deletePurchase, isPending: isDeleting } = useDeletePurchase();

  // Check if user has permission to view purchases
  const canViewPurchases =
    currentUser?.role === "store_admin" || currentUser?.role === "seller" || currentUser?.role==='superadmin';

  // Check if user has permission to create purchases
  const canCreatePurchases =
    currentUser?.role === "store_admin" || currentUser?.role === "seller" || currentUser?.role==='superadmin';

  // Check if user has permission to edit/delete purchases
  const canManagePurchases =
    currentUser?.role === "store_admin" || currentUser?.role === "seller"|| currentUser?.role==='superadmin';
  if (!canViewPurchases) {
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

  const purchases = Array.isArray(purchasesData)
    ? purchasesData
    : purchasesData?.results || [];
  const totalCount = Array.isArray(purchasesData)
    ? purchasesData.length
    : purchasesData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDelete = (purchase: Purchase) => {
    if (!purchase.id) return;

    deletePurchase(purchase.id, {
      onSuccess: () => {
        toast.success(
          t("messages.success.deleted", { item: t("navigation.purchases") }) ||
            "Purchase deleted successfully",
        );
        refetch();
      },
      onError: (error: unknown) => {
        console.error("Delete purchase error:", error);
        toast.error(
          t("messages.error.delete", { item: t("navigation.purchases") }) ||
            "Failed to delete purchase",
        );
      },
    });
  };

  const handleEdit = (purchase: Purchase) => {
    if (purchase.id) {
      navigate(`/purchases/${purchase.id}/edit`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-Uz", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              {t("messages.error.load", { item: t("navigation.purchases") }) ||
                "Failed to load purchases"}
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => refetch()} variant="outline">
                {t("actions.retry") || "Retry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {t("navigation.purchases") || "Purchases"}
          </h1>

        </div>
        {canCreatePurchases && (
          <Button onClick={() => navigate("/purchases/create")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.create") || "Create Purchase"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("navigation.purchases") || "Purchases"}</span>
            <Badge variant="secondary">{totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  t("placeholders.search_purchases") || "Search purchases..."
                }
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? t("messages.no_results") || "No purchases found"
                  : t("messages.no_purchases") || "No purchases available"}
              </p>
              {canCreatePurchases && !searchQuery && (
                <Button
                  onClick={() => navigate("/purchases/create")}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.create_first") || "Create your first purchase"}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("forms.client") || "Client"}</TableHead>
                    <TableHead>{t("forms.amount") || "Amount"}</TableHead>
                    <TableHead>{t("forms.date") || "Date"}</TableHead>
                    {canManagePurchases && (
                      <TableHead className="text-right">
                        {t("forms.actions") || "Actions"}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: Purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.client?.full_name ||
                          `Client #${purchase.client}`}
                        <div className="text-sm text-muted-foreground">
                          {purchase.client?.phone_number}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(purchase.amount)}
                      </TableCell>
                      <TableCell>
                        {purchase.created_at && formatDate(purchase.created_at)}
                      </TableCell>
                      {canManagePurchases && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(purchase)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("dialogs.confirm_delete.title") ||
                                      "Are you sure?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("dialogs.confirm_delete.purchase") ||
                                      `This will permanently delete the purchase of ${formatCurrency(purchase.amount)}. This action cannot be undone.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t("actions.cancel") || "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(purchase)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t("actions.delete") || "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <p className="text-sm text-muted-foreground">
                {t("pagination.showing", {
                  from: (currentPage - 1) * pageSize + 1,
                  to: Math.min(currentPage * pageSize, totalCount),
                  total: totalCount,
                }) ||
                  `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                    currentPage * pageSize,
                    totalCount,
                  )} of ${totalCount} results`}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  {t("pagination.previous") || "Previous"}
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  {t("pagination.next") || "Next"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
