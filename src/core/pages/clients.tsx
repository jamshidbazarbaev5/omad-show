import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, Trash2, Edit } from "lucide-react";
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
import { useGetClients, useDeleteClient } from "../api/client";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { toast } from "sonner";
import type { Client } from "../api/types";
import { CreatePurchaseDialog } from "../components/CreatePurchaseDialog";

export default function ClientsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: currentUser } = useCurrentUser();
  const {
    data: clientsData,
    isLoading,
    isError,
    refetch,
  } = useGetClients({
    page: currentPage,
    page_size: pageSize,
    search: searchQuery,
  });

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  // Check if user has permission to view clients
  const canViewClients =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "store_admin" ||
    currentUser?.role === "seller";

  // Check if user has permission to create clients
  const canCreateClients =
    currentUser?.role === "store_admin" || currentUser?.role === "seller";

  // Check if user has permission to edit/delete clients
  const canManageClients =
    currentUser?.role === "store_admin" || currentUser?.role === "seller"  || currentUser?.role === "superadmin";

  if (!canViewClients) {
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
  const totalCount = clientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDelete = (client: Client) => {
    if (!client.id) return;

    deleteClient(client.id, {
      onSuccess: () => {
        toast.success(
          t("messages.success.deleted", { item: t("navigation.clients") }) ||
            "Client deleted successfully",
        );
        refetch();
      },
      onError: (error: unknown) => {
        console.error("Delete client error:", error);
        toast.error(
          t("messages.error.delete", { item: t("navigation.clients") }) ||
            "Failed to delete client",
        );
      },
    });
  };

  const handleEdit = (client: Client) => {
    if (client.id) {
      navigate(`/clients/${client.id}/edit`);
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              {t("messages.error.load", { item: t("navigation.clients") }) ||
                "Failed to load clients"}
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
          <h1 className="text-2xl font-bold">
            {t("navigation.clients") || "Clients"}
          </h1>
        </div>
        {canCreateClients && (
          <Button onClick={() => navigate("/clients/create")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.create") || "Create Client"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("navigation.clients") || "Clients"}</span>
            <Badge variant="secondary">{totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  t("placeholders.search_clients") || "Search clients..."
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
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? t("messages.no_results") || "No clients found"
                  : t("messages.no_clients") || "No clients available"}
              </p>
              {canCreateClients && !searchQuery && (
                <Button
                  onClick={() => navigate("/clients/create")}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.create_first") || "Create your first client"}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("forms.full_name") || "Full Name"}</TableHead>
                    <TableHead>
                      {t("forms.phone_number") || "Phone Number"}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("forms.actions") || "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client: Client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.full_name}
                      </TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <CreatePurchaseDialog
                            client={client}
                            onSuccess={() => refetch()}
                          />
                          {canManageClients && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(client)}
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
                                      {t("dialogs.confirm_delete.client") ||
                                        `This will permanently delete the client "${client.full_name}". This action cannot be undone.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {t("actions.cancel") || "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(client)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("actions.delete") || "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
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
