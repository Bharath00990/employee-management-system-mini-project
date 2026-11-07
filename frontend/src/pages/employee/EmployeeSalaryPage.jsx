import { useCallback, useEffect, useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import Alert from '../../components/ui/Alert';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getEmployeeSalaries } from '../../services/salaryService';
import { getErrorMessage } from '../../utils/apiError';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';

function EmployeeSalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSalaries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployeeSalaries();
      setSalaries(data);
    } catch (loadError) {
      setSalaries([]);
      setError(getErrorMessage(loadError, 'Failed to load salary records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  const columns = [
    { key: 'period', header: 'Period', render: (s) => formatMonthYear(s.month, s.year) },
    { key: 'basicSalary', header: 'Basic', render: (s) => formatCurrency(s.basicSalary) },
    { key: 'allowances', header: 'Allowances', render: (s) => formatCurrency(s.allowances) },
    { key: 'deductions', header: 'Deductions', render: (s) => formatCurrency(s.deductions) },
    {
      key: 'netSalary',
      header: 'Net Salary',
      render: (s) => {
        const net = (Number(s.basicSalary) || 0) + (Number(s.allowances) || 0) - (Number(s.deductions) || 0);
        return <strong>{formatCurrency(net)}</strong>;
      },
    },
  ];

  return (
    <div className="page">
      <PageHeader title="My Salary" description="View your salary history." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading salary" description="Fetching your salary records." />
      ) : error && !salaries.length ? (
        <ErrorState description={error} onRetry={loadSalaries} />
      ) : (
        <DataTable
          columns={columns}
          data={salaries}
          emptyTitle="No salary records"
          emptyDescription="Your salary records will appear here."
        />
      )}
    </div>
  );
}

export default EmployeeSalaryPage;
