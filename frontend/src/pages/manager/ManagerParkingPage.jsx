import { useCallback, useEffect, useState } from 'react';
import ParkingAllocationStatusBadge from '../../components/parking/ParkingAllocationStatusBadge';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getManagerParking } from '../../services/parkingService';
import { getErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/formatters';

function ManagerParkingPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadParking = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getManagerParking();
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setAllocations(list);
    } catch (loadError) {
      setAllocations([]);
      setError(getErrorMessage(loadError, 'Failed to load parking information.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParking();
  }, [loadParking]);

  const columns = [
    { key: 'employeeName', header: 'Employee', render: (a) => a.employeeName ?? `Employee #${a.employeeId}` },
    { key: 'slotNumber', header: 'Slot', render: (a) => a.slotNumber ?? `Slot #${a.slotId}` },
    { key: 'location', header: 'Location', render: (a) => a.location || '—' },
    { key: 'status', header: 'Status', render: (a) => <ParkingAllocationStatusBadge status={a.status} /> },
    { key: 'createdAt', header: 'Allocated', render: (a) => formatDateTime(a.createdAt) },
  ];

  return (
    <div className="page">
      <PageHeader title="Team Parking" description="View parking allocations for your team." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading parking" description="Fetching team parking data." />
      ) : error && !allocations.length ? (
        <ErrorState description={error} onRetry={loadParking} />
      ) : (
        <DataTable
          columns={columns}
          data={allocations}
          emptyTitle="No parking allocations"
          emptyDescription="No parking allocations for your team."
        />
      )}
    </div>
  );
}

export default ManagerParkingPage;
