import Badge from '../ui/Badge';
import { formatEnumLabel } from '../../utils/formatters';

const STATUS_VARIANTS = {
  PRESENT: 'success',
  ABSENT: 'danger',
  INCOMPLETE: 'warning',
};

function AttendanceStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>
      {formatEnumLabel(status)}
    </Badge>
  );
}

export default AttendanceStatusBadge;
