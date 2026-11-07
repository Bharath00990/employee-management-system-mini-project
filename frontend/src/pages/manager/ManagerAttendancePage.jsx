import { useCallback, useEffect, useState } from 'react';
import AttendanceStatusBadge from '../../components/attendance/AttendanceStatusBadge';
import { AttendanceBreaksCell, WorkModeBadge } from '../../components/attendance/AttendanceBreaksCell';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getManagerAttendance } from '../../services/attendanceService';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime, formatTime } from '../../utils/formatters';

function ManagerAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getManagerAttendance(filterDate || undefined);
      setRecords(data);
    } catch (loadError) {
      setRecords([]);
      setError(getErrorMessage(loadError, 'Failed to load team attendance.'));
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const columns = [
    { key: 'employeeCode', header: 'Code' },
    { key: 'employeeName', header: 'Employee' },
    {
      key: 'date',
      header: 'Date',
      render: (record) => formatDate(record.date),
    },
    {
      key: 'status',
      header: 'Status',
      render: (record) => <AttendanceStatusBadge status={record.status} />,
    },
    {
      key: 'workMode',
      header: 'Mode',
      render: (record) => <WorkModeBadge mode={record.workMode} />,
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (record) => record.checkInTime ?? formatTime(record.checkIn),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (record) => record.checkOutTime ?? formatTime(record.checkOut),
    },
    {
      key: 'totalHours',
      header: 'Total Hours',
      render: (record) => (record.totalHours ? `${record.totalHours} hrs` : '—'),
    },
    {
      key: 'breaks',
      header: 'Break Timings',
      render: (record) => (
        <AttendanceBreaksCell
          breaks={record.breaks}
          employeeName={record.employeeName}
          date={record.date}
        />
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (record) => formatDateTime(record.updatedAt),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Team Attendance" description="Monitor attendance for your project team members." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className="filter-bar">
        <Input
          label="Filter by date"
          name="filterDate"
          type="date"
          value={filterDate}
          onChange={(event) => setFilterDate(event.target.value)}
          wrapperClassName="toolbar"
        />
        {filterDate ? (
          <Button variant="secondary" size="sm" onClick={() => setFilterDate('')}>
            Clear filter
          </Button>
        ) : null}
      </div>

      {loading ? (
        <LoadingState title="Loading attendance" description="Fetching team attendance records." />
      ) : error && !records.length ? (
        <ErrorState description={error} onRetry={loadAttendance} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          emptyTitle="No attendance records"
          emptyDescription="No team attendance records match the selected date."
        />
      )}
    </div>
  );
}

export default ManagerAttendancePage;
