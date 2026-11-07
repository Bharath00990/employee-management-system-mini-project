import Card from '../ui/Card';
import ProjectStatusBadge from './ProjectStatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

function ProjectDetailsView({ project }) {
  return (
    <div className="project-details">
      <Card title={project.name} description={project.description || 'No description provided.'}>
        <dl className="detail-list">
          <div className="detail-list__item">
            <dt>Status</dt>
            <dd>
              <ProjectStatusBadge status={project.status} />
            </dd>
          </div>
          <div className="detail-list__item">
            <dt>Start Date</dt>
            <dd>{formatDate(project.startDate)}</dd>
          </div>
          <div className="detail-list__item">
            <dt>End Date</dt>
            <dd>{formatDate(project.endDate)}</dd>
          </div>
          <div className="detail-list__item">
            <dt>Manager</dt>
            <dd>{project.managerName ?? '—'}</dd>
          </div>
          <div className="detail-list__item">
            <dt>Created</dt>
            <dd>{formatDateTime(project.createdAt)}</dd>
          </div>
          <div className="detail-list__item">
            <dt>Last Updated</dt>
            <dd>{formatDateTime(project.updatedAt)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

export default ProjectDetailsView;
