import { useCallback, useEffect, useState } from 'react';
import ParkingAllocationStatusBadge from '../../components/parking/ParkingAllocationStatusBadge';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getEmployeeParking } from '../../services/parkingService';
import { getErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/formatters';

function EmployeeParkingPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadParking = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployeeParking();
      setAllocations(data);
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
    { key: 'slotNumber', header: 'Slot', render: (a) => a.slotNumber ?? `Slot #${a.slotId}` },
    { key: 'location', header: 'Location', render: (a) => a.location || '—' },
    { key: 'status', header: 'Status', render: (a) => <ParkingAllocationStatusBadge status={a.status} /> },
    { key: 'createdAt', header: 'Allocated', render: (a) => formatDateTime(a.createdAt) },
  ];

  return (
    <div className="page">
      <PageHeader title="My Parking" description="View your parking allocation." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading parking" description="Fetching your parking information." />
      ) : error && !allocations.length ? (
        <ErrorState description={error} onRetry={loadParking} />
      ) : (
        <DataTable
          columns={columns}
          data={allocations}
          emptyTitle="No parking allocation"
          emptyDescription="You do not have a parking slot allocated yet."
        />
      )}
    </div>
  );
}

export default EmployeeParkingPage;
