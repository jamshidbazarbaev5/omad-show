import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./core/context/AuthContext";
import { LoginPage } from "./core/pages/login";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "../src/core/layout/layout.tsx";
import { Toaster } from "sonner";
import ColorsPage from "./core/pages/color";
import CreateColorPage from "./core/pages/create-color";
import StoresPage from "./core/pages/store";
import CreateStorePage from "./core/pages/create-store";
import EmployeesPage from "./core/pages/employees";
import CreateEmployeePage from "./core/pages/create-employee";
import GamesPage from "./core/pages/games";
import CreateGamePage from "./core/pages/create-game";
import EditGamePage from "./core/pages/edit-game";
import PrizesPage from "./core/pages/prizes";
import CreatePrizePage from "./core/pages/create-prize";
import EditPrizePage from "./core/pages/edit-prize";
import BonusRangesPage from "./core/pages/bonus-ranges";
import CreateBonusRangePage from "./core/pages/create-bonus-range";
import EditBonusRangePage from "./core/pages/edit-bonus-range";
import Dashboard from "./core/pages/dashboard";
import ClientsPage from "./core/pages/clients";
import CreateClientPage from "./core/pages/create-client";
import EditClientPage from "./core/pages/edit-client";
import PurchasesPage from "./core/pages/purchases";
import CreatePurchasePage from "./core/pages/create-purchase";
import EditPurchasePage from "./core/pages/edit-purchase";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/" element={<Navigate to="/stores" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/create-color" element={<CreateColorPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/create-store" element={<CreateStorePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/create-employee" element={<CreateEmployeePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/create" element={<CreateGamePage />} />
            <Route path="/games/:id/edit" element={<EditGamePage />} />
            <Route path="/prizes" element={<PrizesPage />} />
            <Route path="/prizes/create" element={<CreatePrizePage />} />
            <Route path="/prizes/:id/edit" element={<EditPrizePage />} />
            <Route path="/bonus-ranges" element={<BonusRangesPage />} />
            <Route
              path="/bonus-ranges/create"
              element={<CreateBonusRangePage />}
            />
            <Route
              path="/bonus-ranges/:id/edit"
              element={<EditBonusRangePage />}
            />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/create" element={<CreateClientPage />} />
            <Route path="/clients/:id/edit" element={<EditClientPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/purchases/create" element={<CreatePurchasePage />} />
            <Route path="/purchases/:id/edit" element={<EditPurchasePage />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
