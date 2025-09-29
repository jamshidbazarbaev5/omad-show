import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, DollarSign, Store, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useGetClientPurchases } from "../api/purchases";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function ClientHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: currentUser } = useCurrentUser();
  const {
    data: purchasesData,
    isLoading,
    isError,
    refetch,
  } = useGetClientPurchases(Number(clientId), {
  });

  // Check if user has permission to view client history
  const canViewHistory =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "store_admin" ||
    currentUser?.role === "seller";

  if (!canViewHistory) {
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

  const purchases = purchasesData?.results || [];
  const totalCount = purchasesData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const clientName = purchases.length > 0 ? purchases[0].client.full_name : "";
  const clientPhone =
    purchases.length > 0 ? purchases[0].client.phone_number : "";

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              {t("messages.error.load", { item: "Purchase History" }) ||
                "Failed to load purchase history"}
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

  const totalAmount = purchases.reduce(
    (sum, purchase) => sum + parseFloat(purchase.amount),
    0,
  );
  const totalBonuses = purchases.reduce(
    (sum, purchase) => sum + purchase.bonus_awarded,
    0,
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("actions.back") || "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t("pages.purchase_history") || "Purchase History"}
          </h1>
          {clientName && (
            <p className="text-muted-foreground">
              {clientName} ({clientPhone})
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.total_amount") || "Total Amount"}
                </p>
                <p className="text-2xl font-bold">
                  {totalAmount.toLocaleString()} UZS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.total_purchases") || "Total Purchases"}
                </p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.total_bonuses") || "Total Bonuses"}
                </p>
                <p className="text-2xl font-bold">{totalBonuses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("labels.purchase_history") || "Purchase History"}</span>
            <Badge variant="secondary">{totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t("messages.no_purchase_history") ||
                  "No purchase history found"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("labels.date") || "Date"}</TableHead>
                    <TableHead>{t("labels.amount") || "Amount"}</TableHead>
                    <TableHead>
                      {t("labels.bonus_awarded") || "Bonus Awarded"}
                    </TableHead>
                    <TableHead>{t("labels.store") || "Store"}</TableHead>
                    <TableHead>
                      {t("labels.created_by") || "Created By"}
                    </TableHead>
                    <TableHead>{t("labels.status") || "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {new Date(purchase.created_at).toLocaleDateString(
                          "ru-RU",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(purchase.amount).toLocaleString()} UZS
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            purchase.bonus_awarded > 0 ? "default" : "secondary"
                          }
                        >
                          {purchase.bonus_awarded}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{purchase.store.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {purchase.store.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {purchase.created_by.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {purchase.created_by.phone_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={purchase.is_active ? "default" : "secondary"}
                        >
                          {purchase.is_active
                            ? t("labels.active") || "Active"
                            : t("labels.inactive") || "Inactive"}
                        </Badge>
                      </TableCell>
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
