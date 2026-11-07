export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_HOME_PATH = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.PROJECT_MANAGER]: '/manager',
  [ROLES.EMPLOYEE]: '/employee',
};

export function getRoleHomePath(role) {
  return ROLE_HOME_PATH[role] ?? '/login';
}
