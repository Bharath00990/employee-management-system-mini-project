import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign, 
  Car, FolderKanban, Bell, ShieldAlert, BarChart3, Settings, LogOut,
  ChevronRight, Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, hasRole, logout } = useAuth();

  const isAdmin = hasRole('ROLE_ADMIN');
  const isManager = hasRole('ROLE_MANAGER');
  const isEmployee = hasRole('ROLE_EMPLOYEE') && !isAdmin && !isManager;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance', path: '/admin/attendance', icon: Clock },
    { name: 'Leave Requests', path: '/admin/leaves', icon: CalendarDays },
    { name: 'Payroll', path: '/admin/payroll', icon: DollarSign },
    { name: 'Parking Slots', path: '/admin/parking', icon: Car },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const managerLinks = [
    { name: 'Manager Overview', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Team Attendance', path: '/manager/attendance', icon: Clock },
    { name: 'Leave Approvals', path: '/manager/leaves', icon: CalendarDays },
    { name: 'Active Projects', path: '/manager/projects', icon: FolderKanban },
  ];

  const employeeLinks = [
    { name: 'My Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', path: '/employee/attendance', icon: Clock },
    { name: 'My Leaves', path: '/employee/leaves', icon: CalendarDays },
    { name: 'Payslips & Salary', path: '/employee/salary', icon: DollarSign },
    { name: 'Parking Request', path: '/employee/parking', icon: Car },
    { name: 'My Projects', path: '/employee/projects', icon: FolderKanban },
  ];

  const activeLinks = isAdmin ? adminLinks : isManager ? managerLinks : employeeLinks;

  return (
    <aside style={{
      width: '270px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid var(--border-color)',
      minHeight: '100vh',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}>
          <Building2 size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>SECUREX EMS</h2>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise System</span>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div style={{
        margin: '1rem 1.25rem 0.5rem',
        padding: '0.6rem 0.85rem',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Access Portal:</span>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : isManager ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: isAdmin ? '#f87171' : isManager ? '#fbbf24' : '#34d399',
        }}>
          {isAdmin ? 'ADMIN' : isManager ? 'MANAGER' : 'EMPLOYEE'}
        </span>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {activeLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 150ms ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.fullName || user?.username}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{user?.employeeCode || 'ID: ' + user?.id}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
