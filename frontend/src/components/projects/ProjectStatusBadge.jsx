import Badge from '../ui/Badge';
import { formatProjectStatus } from '../../utils/formatters';

const STATUS_VARIANTS = {
  PLANNED: 'info',
  ACTIVE: 'success',
  COMPLETED: 'default',
  CANCELLED: 'danger',
};

function ProjectStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>
      {formatProjectStatus(status)}
    </Badge>
  );
}

export default ProjectStatusBadge;
