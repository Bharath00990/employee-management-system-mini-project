import Badge from '../ui/Badge';
import { formatEnumLabel } from '../../utils/formatters';

const STATUS_VARIANTS = {
  AVAILABLE: 'success',
  OCCUPIED: 'danger',
  INACTIVE: 'default',
};

function ParkingSlotStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>
      {formatEnumLabel(status)}
    </Badge>
  );
}

export default ParkingSlotStatusBadge;
