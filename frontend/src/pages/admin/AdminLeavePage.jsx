import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import LeaveStatusBadge from '../../components/leave/LeaveStatusBadge';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import {
  approveAdminLeave,
  getAdminLeaves,
  rejectAdminLeave,
} from '../../services/leaveService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatEnumLabel } from '../../utils/formatters';

function AdminLeavePage() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approveAction, setApproveAction] = useState(null);
  const [rejectAction, setRejectAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminLeaves();
      setLeaves(data);
    } catch (loadError) {
      setLeaves([]);
      setError(getErrorMessage(loadError, 'Failed to load leave requests.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaves;
    return leaves.filter((l) => {
      const name = (l.employeeName ?? '').toLowerCase();
      const code = (l.employeeCode ?? '').toLowerCase();
      const type = (l.leaveType ?? '').toLowerCase();
      const status = (l.status ?? '').toLowerCase();
      return name.includes(q) || code.includes(q) || type.includes(q) || status.includes(q);
    });
  }, [leaves, search]);

  async function handleApprove() {
    if (!approveAction) return;
    setProcessing(true);

    try {
      const updated = await approveAdminLeave(approveAction.leaveId);
      setLeaves((current) =>
        current.map((leave) => (leave.id === updated.id ? updated : leave)),
      );
      toast.success('Leave request approved.');
      setApproveAction(null);
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to approve leave request.'));
      setApproveAction(null);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectAction) return;
    setProcessing(true);

    try {
      const updated = await rejectAdminLeave(rejectAction.leaveId, rejectReason || undefined);
      setLeaves((current) =>
        current.map((leave) => (leave.id === updated.id ? updated : leave)),
      );
      toast.success('Leave request rejected.');
      setRejectAction(null);
      setRejectReason('');
    } catch (actionError) {
      toast.error(getErrorMessage(actionError, 'Failed to reject leave request.'));
      setRejectAction(null);
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'employeeCode', header: 'Code' },
    {
      key: 'leaveType',
      header: 'Type',
      render: (leave) => formatEnumLabel(leave.leaveType),
    },
    {
      key: 'startDate',
      header: 'Start',
      render: (leave) => formatDate(leave.startDate),
    },
    {
      key: 'endDate',
      header: 'End',
      render: (leave) => formatDate(leave.endDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (leave) => <LeaveStatusBadge status={leave.status} />,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (leave) => leave.reason ?? '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (leave) =>
        leave.status === 'PENDING' ? (
          <div className="table-actions">
            <Button
              size="sm"
              onClick={() =>
                setApproveAction({ leaveId: leave.id, employeeName: leave.employeeName })
              }
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                setRejectAction({ leaveId: leave.id, employeeName: leave.employeeName })
              }
            >
              Reject
            </Button>
          </div>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Leave Requests" description="Review and process employee leave requests." />

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
            placeholder="Search by employee name, code, type or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search ? (
          <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
            Clear
          </Button>
        ) : null}
      </div>

      {loading ? (
        <LoadingState title="Loading leaves" description="Fetching leave requests." />
      ) : error && !leaves.length ? (
        <ErrorState description={error} onRetry={loadLeaves} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No leave requests"
          emptyDescription={search ? 'No leave requests match your search.' : 'No leave requests to display.'}
        />
      )}

      <ConfirmationDialog
        isOpen={Boolean(approveAction)}
        title="Approve Leave"
        message={
          approveAction
            ? `Approve the leave request for "${approveAction.employeeName}"?`
            : ''
        }
        confirmLabel="Approve"
        loading={processing}
        onConfirm={handleApprove}
        onCancel={() => setApproveAction(null)}
      />

      <Modal
        isOpen={Boolean(rejectAction)}
        onClose={() => {
          setRejectAction(null);
          setRejectReason('');
        }}
        title="Reject Leave"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectAction(null);
                setRejectReason('');
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Reject'}
            </Button>
          </>
        }
      >
        <p>
          Reject the leave request for &quot;{rejectAction?.employeeName}&quot;?
        </p>
        <Input
          label="Reason (optional)"
          name="rejectReason"
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
        />
      </Modal>
    </div>
  );
}

export default AdminLeavePage;
