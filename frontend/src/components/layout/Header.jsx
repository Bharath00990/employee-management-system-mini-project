import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatRole } from '../../utils/formatters';
import Badge from '../ui/Badge';

function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const userInitial = user?.username?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu-button"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="app-header__welcome">Welcome back</p>
          <h1 className="app-header__username">{user?.username}</h1>
        </div>
      </div>

      <div className="app-header__right">
        <Badge variant="accent">{formatRole(user?.role)}</Badge>
        <div className="app-header__avatar" title={user?.username}>
          {userInitial}
        </div>
      </div>
    </header>
  );
}

export default Header;
