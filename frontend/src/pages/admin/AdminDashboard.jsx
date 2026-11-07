import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, FolderKanban, CalendarOff, Plus } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_ROUTES } from '../../constants/routes';
import { getAllUsers } from '../../services/userService';
import { getAllEmployees } from '../../services/employeeService';
import { getAdminProjects } from '../../services/projectService';
import { getAdminLeaves } from '../../services/leaveService';
import { formatDate, formatRole } from '../../utils/formatters';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, employees, projects, leaves] = await Promise.all([
        getAllUsers().catch(() => []),
        getAllEmployees().catch(() => []),
        getAdminProjects().catch(() => []),
        getAdminLeaves().catch(() => []),
      ]);

      const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
      const pending = leaves.filter((l) => l.status === 'PENDING');

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        activeProjects: activeProjects.length,
        pendingLeaves: pending.length,
      });

      setRecentProjects(projects.slice(0, 5));
      setPendingLeaves(pending.slice(0, 5));
    } catch {
      // stats remain null, gracefully degrade
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const greeting = getGreeting();

  const projectColumns = [
    { key: 'name', header: 'Project' },
    { key: 'status', header: 'Status', render: (p) => <Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'COMPLETED' ? 'default' : 'info'}>{p.status}</Badge> },
    { key: 'managerName', header: 'Manager', render: (p) => p.managerName ?? '—' },
    { key: 'actions', header: '', render: (p) => <Link to={`${ADMIN_ROUTES.PROJECTS}/${p.id}`} className="text-link">View</Link> },
  ];

  const leaveColumns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'leaveType', header: 'Type' },
    { key: 'startDate', header: 'Start', render: (l) => formatDate(l.startDate) },
    { key: 'endDate', header: 'End', render: (l) => formatDate(l.endDate) },
  ];

  if (loading) {
    return (
      <div className="page">
        <LoadingState title="Loading dashboard" description="Fetching your dashboard data..." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard-greeting">
        <h2>{greeting}, {user?.username}</h2>
        <p>Here's an overview of your organization.</p>
      </div>

      {stats ? (
        <div className="stats-grid">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} variant="primary" />
          <StatCard icon={UserCheck} label="Total Employees" value={stats.totalEmployees} variant="info" />
          <StatCard icon={FolderKanban} label="Active Projects" value={stats.activeProjects} variant="success" />
          <StatCard icon={CalendarOff} label="Pending Leaves" value={stats.pendingLeaves} variant="warning" />
        </div>
      ) : null}

      <div className="page__actions">
        <Link to={ADMIN_ROUTES.USERS}>
          <Button variant="secondary" size="sm" icon={Plus}>Create User</Button>
        </Link>
        <Link to={ADMIN_ROUTES.EMPLOYEES}>
          <Button variant="secondary" size="sm" icon={Plus}>Create Employee</Button>
        </Link>
        <Link to={ADMIN_ROUTES.PROJECTS}>
          <Button variant="secondary" size="sm" icon={Plus}>Create Project</Button>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Recent Projects</h3>
            <Link to={ADMIN_ROUTES.PROJECTS} className="text-link">View all</Link>
          </div>
          <DataTable
            columns={projectColumns}
            data={recentProjects}
            emptyTitle="No projects yet"
            emptyDescription="Create a project to get started."
          />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Pending Leave Requests</h3>
            <Link to={ADMIN_ROUTES.LEAVE} className="text-link">View all</Link>
          </div>
          <DataTable
            columns={leaveColumns}
            data={pendingLeaves}
            emptyTitle="No pending requests"
            emptyDescription="All leave requests have been processed."
          />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default AdminDashboard;
