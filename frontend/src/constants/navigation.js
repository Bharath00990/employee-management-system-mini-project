import { ROLES } from './roles';
import { ADMIN_ROUTES, EMPLOYEE_ROUTES, MANAGER_ROUTES } from './routes';

export const NAVIGATION_ITEMS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: ADMIN_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Users', path: ADMIN_ROUTES.USERS, icon: 'Users' },
    { label: 'Employees', path: ADMIN_ROUTES.EMPLOYEES, icon: 'UserCheck' },
    { label: 'Projects', path: ADMIN_ROUTES.PROJECTS, icon: 'FolderKanban' },
    { label: 'Attendance', path: ADMIN_ROUTES.ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Leave', path: ADMIN_ROUTES.LEAVE, icon: 'CalendarOff' },
    { label: 'Salary', path: ADMIN_ROUTES.SALARY, icon: 'Wallet' },
    { label: 'Parking', path: ADMIN_ROUTES.PARKING, icon: 'Car' },
    { label: 'Analytics', path: ADMIN_ROUTES.ANALYTICS, icon: 'BarChart2' },
  ],
  [ROLES.PROJECT_MANAGER]: [
    { label: 'Dashboard', path: MANAGER_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Projects', path: MANAGER_ROUTES.PROJECTS, icon: 'FolderKanban' },
    { label: 'Team', path: MANAGER_ROUTES.TEAM, icon: 'UsersRound' },
    { label: 'Attendance', path: MANAGER_ROUTES.ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Leave', path: MANAGER_ROUTES.LEAVE, icon: 'CalendarOff' },
    { label: 'Parking', path: MANAGER_ROUTES.PARKING, icon: 'Car' },
  ],
  [ROLES.EMPLOYEE]: [
    { label: 'Dashboard', path: EMPLOYEE_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Profile', path: EMPLOYEE_ROUTES.PROFILE, icon: 'UserCircle' },
    { label: 'Projects', path: EMPLOYEE_ROUTES.PROJECTS, icon: 'FolderKanban' },
    { label: 'Attendance', path: EMPLOYEE_ROUTES.ATTENDANCE, icon: 'CalendarCheck' },
    { label: 'Leave', path: EMPLOYEE_ROUTES.LEAVE, icon: 'CalendarOff' },
    { label: 'Salary', path: EMPLOYEE_ROUTES.SALARY, icon: 'Wallet' },
    { label: 'Parking', path: EMPLOYEE_ROUTES.PARKING, icon: 'Car' },
    { label: 'Analytics', path: EMPLOYEE_ROUTES.ANALYTICS, icon: 'BarChart2' },
  ],
};

export function getNavigationItems(role) {
  return NAVIGATION_ITEMS[role] ?? [];
}
