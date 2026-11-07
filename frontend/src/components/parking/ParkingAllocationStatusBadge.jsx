import Badge from '../ui/Badge';
import { formatEnumLabel } from '../../utils/formatters';

const STATUS_VARIANTS = {
  REQUESTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  RELEASED: 'default',
};

function ParkingAllocationStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>
      {formatEnumLabel(status)}
    </Badge>
  );
}

export default ParkingAllocationStatusBadge;
