import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut } from 'lucide-react';
import { getNavigationItems } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { formatRole } from '../../utils/formatters';
import ConfirmationDialog from '../common/ConfirmationDialog';
import SidebarNavLink from './SidebarNavLink';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navigationItems = getNavigationItems(user?.role);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const userInitial = user?.username?.charAt(0)?.toUpperCase() ?? '?';

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <>
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="Main navigation">
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <Building2 size={20} />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-title">EMS</span>
            <span className="sidebar__brand-subtitle">Management</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navigationItems.map((item) => (
            <SidebarNavLink key={item.path} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">{userInitial}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user?.username}</div>
              <div className="sidebar__user-role">{formatRole(user?.role)}</div>
            </div>
            <button
              type="button"
              className="sidebar__logout-btn"
              onClick={() => setShowLogoutDialog(true)}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmationDialog
        isOpen={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </>
  );
}

export default Sidebar;
