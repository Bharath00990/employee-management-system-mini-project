import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, BarChart2 } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import EditEmployeeForm from '../../components/admin/EditEmployeeForm';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { ADMIN_ROUTES } from '../../constants/routes';
import { getEmployeeById, updateEmployee } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime, getEmployeeFullName } from '../../utils/formatters';

function AdminEmployeeDetailsPage() {
  const toast = useToast();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployee = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getEmployeeById(employeeId);
      setEmployee(data);
    } catch (loadError) {
      setEmployee(null);
      setError(getErrorMessage(loadError, 'Failed to load employee details.'));
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  async function handleUpdateEmployee(formData) {
    setSubmitting(true);
    try {
      const updated = await updateEmployee(employeeId, formData);
      setEmployee(updated);
      toast.success('Employee updated successfully.');
      setShowEditForm(false);
    } catch (updateError) {
      throw updateError;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Employee Details" description="View and manage employee information.">
        <Link to={ADMIN_ROUTES.EMPLOYEES}>
          <Button variant="secondary" icon={ArrowLeft} size="sm">
            Back to employees
          </Button>
        </Link>
        {employee ? (
          <>
            <Link to={`${ADMIN_ROUTES.EMPLOYEES}/${employeeId}/analytics`}>
              <Button variant="secondary" icon={BarChart2} size="sm">
                Analytics
              </Button>
            </Link>
            <Button icon={Pencil} size="sm" onClick={() => setShowEditForm(true)}>
              Edit
            </Button>
          </>
        ) : null}
      </PageHeader>

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading employee" description="Fetching employee details." />
      ) : error ? (
        <ErrorState description={error} onRetry={loadEmployee} />
      ) : employee ? (
        <Card>
          <dl className="detail-list">
            <div className="detail-list__item">
              <dt>Full Name</dt>
              <dd>{getEmployeeFullName(employee)}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Employee Code</dt>
              <dd>{employee.employeeCode}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Email</dt>
              <dd>{employee.email}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Phone</dt>
              <dd>{employee.phone || '—'}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Department</dt>
              <dd>{employee.department || '—'}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Designation</dt>
              <dd>{employee.designation || '—'}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Date of Joining</dt>
              <dd>{formatDate(employee.dateOfJoining)}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Created</dt>
              <dd>{formatDateTime(employee.createdAt)}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Last Updated</dt>
              <dd>{formatDateTime(employee.updatedAt)}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      {showEditForm && employee ? (
        <EditEmployeeForm
          employee={employee}
          onSubmit={handleUpdateEmployee}
          onCancel={() => setShowEditForm(false)}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}

export default AdminEmployeeDetailsPage;
