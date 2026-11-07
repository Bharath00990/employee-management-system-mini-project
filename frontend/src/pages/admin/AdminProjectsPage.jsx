import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import ProjectStatusBadge from '../../components/projects/ProjectStatusBadge';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import ProjectFormModal from '../../components/admin/ProjectFormModal';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { ADMIN_ROUTES } from '../../constants/routes';
import {
  createAdminProject,
  getAdminProjects,
} from '../../services/projectService';
import { getAllEmployees } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatters';

function AdminProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [projectsData, employees] = await Promise.all([
        getAdminProjects(),
        getAllEmployees().catch(() => []),
      ]);
      setProjects(projectsData);
      setProjectManagers(employees);
    } catch (loadError) {
      setProjects([]);
      setError(getErrorMessage(loadError, 'Failed to load projects.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const name = (p.name ?? '').toLowerCase();
      const manager = (p.managerName ?? '').toLowerCase();
      const status = (p.status ?? '').toLowerCase();
      const description = (p.description ?? '').toLowerCase();
      return (
        name.includes(q) ||
        manager.includes(q) ||
        status.includes(q) ||
        description.includes(q)
      );
    });
  }, [projects, search]);

  async function handleCreateProject(formData) {
    setSubmitting(true);
    try {
      await createAdminProject(formData);
      toast.success('Project created successfully.');
      setShowCreateForm(false);
      await loadProjects();
    } catch (createError) {
      throw createError;
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Project' },
    {
      key: 'status',
      header: 'Status',
      render: (project) => <ProjectStatusBadge status={project.status} />,
    },
    {
      key: 'managerName',
      header: 'Manager',
      render: (project) => project.managerName ?? '—',
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
        <Link
          to={`${ADMIN_ROUTES.PROJECTS}/${project.id}`}
          className="text-link"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Projects" description="Manage organization projects.">
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create Project
        </Button>
      </PageHeader>

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            id="projects-search"
            type="text"
            className="search-input"
            placeholder="Search by project name, manager, status or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search projects"
          />
          {search ? (
            <button
              className="search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        {!loading && (
          <span className="search-result-count">
            {filtered.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <LoadingState title="Loading projects" description="Fetching projects." />
      ) : error && !projects.length ? (
        <ErrorState description={error} onRetry={loadProjects} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No projects found"
          emptyDescription={search ? 'No projects match your search.' : 'Create a project to get started.'}
        />
      )}

      {showCreateForm ? (
        <ProjectFormModal
          title="Create Project"
          submitLabel="Create Project"
          projectManagers={projectManagers}
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}

export default AdminProjectsPage;
