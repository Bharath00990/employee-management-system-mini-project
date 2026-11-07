import Badge from '../ui/Badge';
import { formatEnumLabel } from '../../utils/formatters';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
};

function LeaveStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>
      {formatEnumLabel(status)}
    </Badge>
  );
}

export default LeaveStatusBadge;
