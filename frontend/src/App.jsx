import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import EmployeeListPage from "./pages/employees/EmployeeListPage";
import AddEmployeePage from "./pages/employees/AddEmployeePage";
import EditEmployeePage from "./pages/employees/EditEmployeePage";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";

const App = () => (
  <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    autoHideDuration={3500}
    style={{ borderRadius: 12 }}
  >
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/add" element={<ProtectedRoute adminOnly><AddEmployeePage /></ProtectedRoute>} />
        <Route path="employees/edit/:id" element={<ProtectedRoute adminOnly><EditEmployeePage /></ProtectedRoute>} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </SnackbarProvider>
);

export default App;
