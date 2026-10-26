import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import LeaveManagement from "./pages/admin/LeaveManagement";
import PayrollManagement from "./pages/admin/PayrollManagement";
import ParkingManagement from "./pages/admin/ParkingManagement";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import ReportsPage from "./pages/admin/ReportsPage";
import UsersPage from "./pages/admin/UsersPage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAttendancePage from "./pages/employee/EmployeeAttendancePage";
import EmployeeLeavePage from "./pages/employee/EmployeeLeavePage";
import EmployeeSalaryPage from "./pages/employee/EmployeeSalaryPage";
import EmployeeParkingPage from "./pages/employee/EmployeeParkingPage";
import EmployeeProjectsPage from "./pages/employee/EmployeeProjectsPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, hasRole, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/employees" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><EmployeeManagement /></ProtectedRoute>} />
            <Route path="admin/attendance" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AttendanceManagement /></ProtectedRoute>} />
            <Route path="admin/leaves" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><LeaveManagement /></ProtectedRoute>} />
            <Route path="admin/payroll" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><PayrollManagement /></ProtectedRoute>} />
            <Route path="admin/parking" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ParkingManagement /></ProtectedRoute>} />
            <Route path="admin/projects" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ProjectsManagement /></ProtectedRoute>} />
            <Route path="admin/reports" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ReportsPage /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><UsersPage /></ProtectedRoute>} />
            <Route path="admin/audit-logs" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AuditLogs /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="manager/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="manager/leaves" element={<ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}><LeaveManagement /></ProtectedRoute>} />
            <Route path="manager/projects" element={<ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}><ProjectsManagement /></ProtectedRoute>} />
            <Route path="manager/attendance" element={<ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}><AttendanceManagement /></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="employee/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="employee/attendance" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeAttendancePage /></ProtectedRoute>} />
            <Route path="employee/leaves" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeLeavePage /></ProtectedRoute>} />
            <Route path="employee/salary" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeSalaryPage /></ProtectedRoute>} />
            <Route path="employee/parking" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeParkingPage /></ProtectedRoute>} />
            <Route path="employee/projects" element={<ProtectedRoute allowedRoles={["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_ADMIN"]}><EmployeeProjectsPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
