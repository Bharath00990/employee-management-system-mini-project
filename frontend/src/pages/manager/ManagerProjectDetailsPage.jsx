import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProjectDetailsView from '../../components/projects/ProjectDetailsView';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { MANAGER_ROUTES } from '../../constants/routes';
import { getManagerProjectById } from '../../services/projectService';
import { getErrorMessage } from '../../utils/apiError';

function ManagerProjectDetailsPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getManagerProjectById(projectId);
      setProject(data);
    } catch (loadError) {
      setProject(null);
      setError(getErrorMessage(loadError, 'Failed to load project details.'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return (
    <div className="page">
      <PageHeader title="Project Details" description="Review project information and timeline.">
        <Link to={MANAGER_ROUTES.PROJECTS}>
          <Button variant="secondary" icon={ArrowLeft} size="sm">
            Back to projects
          </Button>
        </Link>
      </PageHeader>

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading project" description="Fetching project details." />
      ) : error ? (
        <ErrorState description={error} onRetry={loadProject} />
      ) : project ? (
        <ProjectDetailsView project={project} />
      ) : null}
    </div>
  );
}

export default ManagerProjectDetailsPage;
