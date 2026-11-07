import { useCallback, useEffect, useState } from 'react';
import LeaveStatusBadge from '../../components/leave/LeaveStatusBadge';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { LEAVE_TYPES } from '../../constants/leaveType';
import {
  applyEmployeeLeave,
  cancelEmployeeLeave,
  getEmployeeLeaves,
} from '../../services/leaveService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime, formatEnumLabel } from '../../utils/formatters';

function EmployeeLeavePage() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelAction, setCancelAction] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployeeLeaves();
      setLeaves(data);
    } catch (loadError) {
      setLeaves([]);
      setError(getErrorMessage(loadError, 'Failed to load leave history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleApplyLeave(event) {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await applyEmployeeLeave({
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
      });
      toast.success('Leave request submitted successfully.');
      setForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      await loadLeaves();
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Failed to submit leave request.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelAction) {
      return;
    }

    setCancelling(true);

    try {
      const updated = await cancelEmployeeLeave(cancelAction.leaveId);
      setLeaves((current) =>
        current.map((leave) => (leave.id === updated.id ? updated : leave)),
      );
      toast.success('Leave request cancelled.');
      setCancelAction(null);
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError, 'Failed to cancel leave request.'));
      setCancelAction(null);
    } finally {
      setCancelling(false);
    }
  }

  const columns = [
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
      key: 'createdAt',
      header: 'Applied',
      render: (leave) => formatDateTime(leave.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (leave) =>
        leave.status === 'PENDING' ? (
          <Button variant="danger" size="sm" onClick={() => setCancelAction({ leaveId: leave.id })}>
            Cancel
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="My Leave" description="Apply for leave and track your requests." />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <Card title="Apply for Leave" description="Submit a new leave request.">
        <form className="stack-form form-grid" onSubmit={handleApplyLeave}>
          <div className="ui-input">
            <label htmlFor="leaveType">Leave Type</label>
            <select
              id="leaveType"
              name="leaveType"
              className="ui-input__field"
              value={form.leaveType}
              onChange={handleFormChange}
              required
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatEnumLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleFormChange}
            required
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleFormChange}
            required
          />
          <div className="ui-input form-grid__full">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              className="ui-input__field ui-textarea"
              value={form.reason}
              onChange={handleFormChange}
              rows={3}
            />
          </div>
          {formError ? (
            <p className="form-error form-grid__full" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="form-grid__full">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Submitting...' : 'Apply for Leave'}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <LoadingState title="Loading leaves" description="Fetching your leave history." />
      ) : error && !leaves.length ? (
        <ErrorState description={error} onRetry={loadLeaves} />
      ) : (
        <DataTable
          columns={columns}
          data={leaves}
          emptyTitle="No leave requests"
          emptyDescription="Apply for leave to see your history here."
        />
      )}

      <ConfirmationDialog
        isOpen={Boolean(cancelAction)}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave request?"
        confirmLabel="Cancel Leave"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelAction(null)}
      />
    </div>
  );
}

export default EmployeeLeavePage;
