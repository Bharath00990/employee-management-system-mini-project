import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AttendanceStatusBadge from '../../components/attendance/AttendanceStatusBadge';
import { AttendanceBreaksCell, WorkModeBadge } from '../../components/attendance/AttendanceBreaksCell';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getAdminAttendance } from '../../services/attendanceService';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime, formatTime } from '../../utils/formatters';

function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminAttendance(filterDate || undefined);
      setRecords(data);
    } catch (loadError) {
      setRecords([]);
      setError(getErrorMessage(loadError, 'Failed to load attendance.'));
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const name = (r.employeeName ?? '').toLowerCase();
      const code = (r.employeeCode ?? '').toLowerCase();
      const status = (r.status ?? '').toLowerCase();
      return name.includes(q) || code.includes(q) || status.includes(q);
    });
  }, [records, search]);

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
      <PageHeader title="Attendance" description="View attendance records across the organization." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by employee name, code or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          label="Filter by date"
          name="filterDate"
          type="date"
          value={filterDate}
          onChange={(event) => setFilterDate(event.target.value)}
          wrapperClassName="toolbar"
        />
        {(filterDate || search) ? (
          <Button variant="secondary" size="sm" onClick={() => { setFilterDate(''); setSearch(''); }}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {loading ? (
        <LoadingState title="Loading attendance" description="Fetching attendance records." />
      ) : error && !records.length ? (
        <ErrorState description={error} onRetry={loadAttendance} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No attendance records"
          emptyDescription="No attendance records match the selected filter."
        />
      )}
    </div>
  );
}

export default AdminAttendancePage;
