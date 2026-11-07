export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  MANAGER: '/manager',
  EMPLOYEE: '/employee',
};

export const ADMIN_ROUTES = {
  DASHBOARD: ROUTES.ADMIN,
  USERS: `${ROUTES.ADMIN}/users`,
  EMPLOYEES: `${ROUTES.ADMIN}/employees`,
  PROJECTS: `${ROUTES.ADMIN}/projects`,
  ATTENDANCE: `${ROUTES.ADMIN}/attendance`,
  LEAVE: `${ROUTES.ADMIN}/leave`,
  SALARY: `${ROUTES.ADMIN}/salary`,
  PARKING: `${ROUTES.ADMIN}/parking`,
  ANALYTICS: `${ROUTES.ADMIN}/analytics`,
};

export const MANAGER_ROUTES = {
  DASHBOARD: ROUTES.MANAGER,
  PROJECTS: `${ROUTES.MANAGER}/projects`,
  TEAM: `${ROUTES.MANAGER}/team`,
  ATTENDANCE: `${ROUTES.MANAGER}/attendance`,
  LEAVE: `${ROUTES.MANAGER}/leave`,
  PARKING: `${ROUTES.MANAGER}/parking`,
  TEAM_ANALYTICS: `${ROUTES.MANAGER}/team`,
};

export const EMPLOYEE_ROUTES = {
  DASHBOARD: ROUTES.EMPLOYEE,
  PROFILE: `${ROUTES.EMPLOYEE}/profile`,
  PROJECTS: `${ROUTES.EMPLOYEE}/projects`,
  ATTENDANCE: `${ROUTES.EMPLOYEE}/attendance`,
  LEAVE: `${ROUTES.EMPLOYEE}/leave`,
  SALARY: `${ROUTES.EMPLOYEE}/salary`,
  PARKING: `${ROUTES.EMPLOYEE}/parking`,
  ANALYTICS: `${ROUTES.EMPLOYEE}/analytics`,
};
