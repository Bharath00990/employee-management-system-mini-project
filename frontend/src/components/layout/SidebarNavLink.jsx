import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';

function SidebarNavLink({ item, onNavigate }) {
  const isDashboard = item.path.split('/').filter(Boolean).length === 1;
  const IconComponent = Icons[item.icon] ?? Icons.Circle;

  return (
    <NavLink
      to={item.path}
      end={isDashboard}
      className={({ isActive }) =>
        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
      }
      onClick={onNavigate}
    >
      <IconComponent size={18} className="sidebar__link-icon" />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default SidebarNavLink;
