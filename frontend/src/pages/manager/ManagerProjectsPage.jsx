import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { MANAGER_ROUTES } from '../../constants/routes';
import { getManagerProjects } from '../../services/projectService';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatters';

function ManagerProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getManagerProjects();
      setProjects(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load projects.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const columns = [
    { key: 'name', header: 'Project' },
    {
      key: 'status',
      header: 'Status',
      render: (project) => <ProjectStatusBadge status={project.status} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (project) => formatDate(project.startDate),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (project) => formatDate(project.endDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (project) => (
        <Link to={`${MANAGER_ROUTES.PROJECTS}/${project.id}`} className="text-link">
          View details
        </Link>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Projects" description="View projects assigned to you as project manager." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading projects" description="Fetching your assigned projects." />
      ) : error && !projects.length ? (
        <ErrorState description={error} onRetry={loadProjects} />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          emptyTitle="No projects assigned"
          emptyDescription="You do not have any projects assigned yet."
        />
      )}
    </div>
  );
}

export default ManagerProjectsPage;
