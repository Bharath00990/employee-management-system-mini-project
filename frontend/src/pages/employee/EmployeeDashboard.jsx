import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CalendarOff, BarChart2 } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { EMPLOYEE_ROUTES } from '../../constants/routes';
import { getEmployeeProjects } from '../../services/projectService';
import { getEmployeeLeaves } from '../../services/leaveService';
import { formatDate, formatEnumLabel } from '../../utils/formatters';

function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projects, leaves] = await Promise.all([
        getEmployeeProjects().catch(() => []),
        getEmployeeLeaves().catch(() => []),
      ]);

      const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

      setStats({
        assignedProjects: projects.length,
        pendingLeaves: pendingLeaves.length,
      });
      setRecentProjects(projects.slice(0, 5));
      setRecentLeaves(leaves.slice(0, 5));
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const greeting = getGreeting();

  const projectColumns = [
    { key: 'name', header: 'Project' },
    { key: 'status', header: 'Status', render: (p) => <Badge variant={p.status === 'ACTIVE' ? 'success' : 'info'}>{p.status}</Badge> },
    { key: 'managerName', header: 'Manager', render: (p) => p.managerName ?? '—' },
    { key: 'actions', header: '', render: (p) => <Link to={`${EMPLOYEE_ROUTES.PROJECTS}/${p.id}`} className="text-link">View</Link> },
  ];

  const leaveColumns = [
    { key: 'leaveType', header: 'Type', render: (l) => formatEnumLabel(l.leaveType) },
    { key: 'startDate', header: 'Start', render: (l) => formatDate(l.startDate) },
    { key: 'endDate', header: 'End', render: (l) => formatDate(l.endDate) },
    { key: 'status', header: 'Status', render: (l) => <Badge variant={l.status === 'APPROVED' ? 'success' : l.status === 'PENDING' ? 'warning' : 'default'}>{l.status}</Badge> },
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
        <p>Here's a snapshot of your work.</p>
      </div>

      {stats ? (
        <div className="stats-grid">
          <StatCard icon={FolderKanban} label="Assigned Projects" value={stats.assignedProjects} variant="primary" />
          <StatCard icon={CalendarOff} label="Pending Leaves" value={stats.pendingLeaves} variant="warning" />
          <Link to={EMPLOYEE_ROUTES.ANALYTICS} style={{ textDecoration: 'none' }}>
            <StatCard icon={BarChart2} label="My Analytics" value="View" variant="info" />
          </Link>
        </div>
      ) : null}

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">My Projects</h3>
            <Link to={EMPLOYEE_ROUTES.PROJECTS} className="text-link">View all</Link>
          </div>
          <DataTable columns={projectColumns} data={recentProjects} emptyTitle="No projects" emptyDescription="You have no projects assigned." />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Recent Leave Requests</h3>
            <Link to={EMPLOYEE_ROUTES.LEAVE} className="text-link">View all</Link>
          </div>
          <DataTable columns={leaveColumns} data={recentLeaves} emptyTitle="No leave requests" emptyDescription="Apply for leave to see your history." />
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

export default EmployeeDashboard;
