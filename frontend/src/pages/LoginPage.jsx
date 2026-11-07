import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Users, FolderKanban } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import LoadingState from '../components/common/LoadingState';
import { getRoleHomePath } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = location.state?.from?.pathname;

  if (loading) {
    return <LoadingState title="Checking session" />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={redirectPath ?? getRoleHomePath(user.role)} replace />;
  }

  function handleSuccess(nextUser) {
    navigate(redirectPath ?? getRoleHomePath(nextUser.role), { replace: true });
  }

  return (
    <main className="login-page">
      <div className="login-page__branding">
        <div className="login-page__branding-icon">
          <Building2 size={32} />
        </div>
        <h2>Employee Management System</h2>
        <p>
          Streamline your workforce management with a comprehensive solution for
          employees, projects, attendance, and more.
        </p>
        <div style={{ display: 'flex', gap: '24px', marginTop: '40px', opacity: 0.8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Users size={24} />
            <span style={{ fontSize: '13px' }}>Team Management</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={24} />
            <span style={{ fontSize: '13px' }}>Project Tracking</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} />
            <span style={{ fontSize: '13px' }}>Secure Access</span>
          </div>
        </div>
      </div>
      <div className="login-page__form-side">
        <section className="login-card">
          <div className="login-card__logo">
            <div className="login-card__logo-icon">
              <Building2 size={20} />
            </div>
            <span className="login-card__logo-text">EMS</span>
          </div>
          <h1>Welcome back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
          <LoginForm onSuccess={handleSuccess} />
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
