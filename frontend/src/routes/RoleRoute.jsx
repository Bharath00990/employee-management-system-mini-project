import { Navigate, Outlet } from 'react-router-dom';
import { getRoleHomePath } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';

function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const redirectPath = user ? getRoleHomePath(user.role) : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
