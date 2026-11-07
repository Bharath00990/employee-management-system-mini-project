import { useCallback, useEffect, useState } from 'react';
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
  approveManagerLeave,
  getManagerLeaves,
  rejectManagerLeave,
} from '../../services/leaveService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatEnumLabel } from '../../utils/formatters';

function ManagerLeavePage() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approveAction, setApproveAction] = useState(null);
  const [rejectAction, setRejectAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getManagerLeaves();
      setLeaves(data);
    } catch (loadError) {
      setLeaves([]);
      setError(getErrorMessage(loadError, 'Failed to load team leave requests.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  async function handleApprove() {
    if (!approveAction) return;
    setProcessing(true);

    try {
      const updated = await approveManagerLeave(approveAction.leaveId);
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
      const updated = await rejectManagerLeave(rejectAction.leaveId, rejectReason || undefined);
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
      <PageHeader title="Team Leave Requests" description="Review and process leave requests from your team." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading leaves" description="Fetching team leave requests." />
      ) : error && !leaves.length ? (
        <ErrorState description={error} onRetry={loadLeaves} />
      ) : (
        <DataTable
          columns={columns}
          data={leaves}
          emptyTitle="No leave requests"
          emptyDescription="No leave requests from your team at the moment."
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

export default ManagerLeavePage;
