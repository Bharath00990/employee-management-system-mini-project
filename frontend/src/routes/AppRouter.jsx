import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import AdminAttendancePage from '../pages/admin/AdminAttendancePage';
import AdminLeavePage from '../pages/admin/AdminLeavePage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminEmployeesPage from '../pages/admin/AdminEmployeesPage';
import AdminEmployeeDetailsPage from '../pages/admin/AdminEmployeeDetailsPage';
import AdminProjectsPage from '../pages/admin/AdminProjectsPage';
import AdminProjectDetailsPage from '../pages/admin/AdminProjectDetailsPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminSalaryPage from '../pages/admin/AdminSalaryPage';
import AdminParkingPage from '../pages/admin/AdminParkingPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminEmployeeAnalyticsPage from '../pages/admin/AdminEmployeeAnalyticsPage';
import EmployeeAttendancePage from '../pages/employee/EmployeeAttendancePage';
import EmployeeLeavePage from '../pages/employee/EmployeeLeavePage';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeProfilePage from '../pages/employee/EmployeeProfilePage';
import EmployeeProjectDetailsPage from '../pages/employee/EmployeeProjectDetailsPage';
import EmployeeProjectsPage from '../pages/employee/EmployeeProjectsPage';
import EmployeeSalaryPage from '../pages/employee/EmployeeSalaryPage';
import EmployeeParkingPage from '../pages/employee/EmployeeParkingPage';
import EmployeeAnalyticsPage from '../pages/employee/EmployeeAnalyticsPage';
import ManagerAttendancePage from '../pages/manager/ManagerAttendancePage';
import ManagerLeavePage from '../pages/manager/ManagerLeavePage';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerProjectDetailsPage from '../pages/manager/ManagerProjectDetailsPage';
import ManagerProjectsPage from '../pages/manager/ManagerProjectsPage';
import ManagerTeamPage from '../pages/manager/ManagerTeamPage';
import ManagerParkingPage from '../pages/manager/ManagerParkingPage';
import ManagerEmployeeAnalyticsPage from '../pages/manager/ManagerEmployeeAnalyticsPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoadingState from '../components/common/LoadingState';

function RootRedirect() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingState title="Restoring session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role === ROLES.ADMIN) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (user?.role === ROLES.PROJECT_MANAGER) {
    return <Navigate to={ROUTES.MANAGER} replace />;
  }

  if (user?.role === ROLES.EMPLOYEE) {
    return <Navigate to={ROUTES.EMPLOYEE} replace />;
  }

  return <Navigate to={ROUTES.LOGIN} replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.ROOT} element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN} element={<AppLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="employees" element={<AdminEmployeesPage />} />
              <Route path="employees/:employeeId" element={<AdminEmployeeDetailsPage />} />
              <Route path="employees/:employeeId/analytics" element={<AdminEmployeeAnalyticsPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="projects/:projectId" element={<AdminProjectDetailsPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="leave" element={<AdminLeavePage />} />
              <Route path="salary" element={<AdminSalaryPage />} />
              <Route path="parking" element={<AdminParkingPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.PROJECT_MANAGER]} />}>
            <Route path={ROUTES.MANAGER} element={<AppLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="projects" element={<ManagerProjectsPage />} />
              <Route path="projects/:projectId" element={<ManagerProjectDetailsPage />} />
              <Route path="team" element={<ManagerTeamPage />} />
              <Route path="team/:employeeId/analytics" element={<ManagerEmployeeAnalyticsPage />} />
              <Route path="attendance" element={<ManagerAttendancePage />} />
              <Route path="leave" element={<ManagerLeavePage />} />
              <Route path="parking" element={<ManagerParkingPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
            <Route path={ROUTES.EMPLOYEE} element={<AppLayout />}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="profile" element={<EmployeeProfilePage />} />
              <Route path="projects" element={<EmployeeProjectsPage />} />
              <Route path="projects/:projectId" element={<EmployeeProjectDetailsPage />} />
              <Route path="attendance" element={<EmployeeAttendancePage />} />
              <Route path="leave" element={<EmployeeLeavePage />} />
              <Route path="salary" element={<EmployeeSalaryPage />} />
              <Route path="parking" element={<EmployeeParkingPage />} />
              <Route path="analytics" element={<EmployeeAnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
