import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserCog, X } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import CreateEmployeeForm from '../../components/admin/CreateEmployeeForm';
import CreateManagerForm from '../../components/admin/CreateManagerForm';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { ADMIN_ROUTES } from '../../constants/routes';
import {
  createEmployee,
  createProjectManager,
  getAllEmployees,
} from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { getEmployeeFullName } from '../../utils/formatters';

function AdminEmployeesPage() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (loadError) {
      setEmployees([]);
      setError(getErrorMessage(loadError, 'Failed to load employees.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const fullName = getEmployeeFullName(e).toLowerCase();
      const dept = (e.department ?? '').toLowerCase();
      const code = (e.employeeCode ?? '').toLowerCase();
      const email = (e.email ?? '').toLowerCase();
      const designation = (e.designation ?? '').toLowerCase();
      const phone = (e.phone ?? '').toLowerCase();
      return (
        fullName.includes(q) ||
        dept.includes(q) ||
        code.includes(q) ||
        email.includes(q) ||
        designation.includes(q) ||
        phone.includes(q)
      );
    });
  }, [employees, search]);

  async function handleCreateEmployee(formData) {
    setSubmitting(true);
    try {
      await createEmployee(formData);
      toast.success('Employee created successfully.');
      setShowCreateForm(false);
      await loadEmployees();
    } catch (createError) {
      throw createError;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateManager(formData) {
    setSubmitting(true);
    try {
      await createProjectManager(formData);
      toast.success('Project Manager created successfully.');
      setShowManagerForm(false);
      await loadEmployees();
    } catch (createError) {
      throw createError;
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'employeeCode', header: 'Code' },
    {
      key: 'name',
      header: 'Name',
      render: (employee) => getEmployeeFullName(employee) || '—',
    },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (e) => e.department || '—' },
    { key: 'designation', header: 'Designation', render: (e) => e.designation || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to={`${ADMIN_ROUTES.EMPLOYEES}/${employee.id}`}
            className="text-link"
          >
            Details
          </Link>
          <Link
            to={`${ADMIN_ROUTES.EMPLOYEES}/${employee.id}/analytics`}
            className="text-link"
          >
            Analytics
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Employees" description="Manage employee records.">
        <Button variant="secondary" icon={UserCog} onClick={() => setShowManagerForm(true)}>
          Create Manager
        </Button>
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create Employee
        </Button>
      </PageHeader>

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            id="employees-search"
            type="text"
            className="search-input"
            placeholder="Search by name, department, code, email or designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search employees"
          />
          {search ? (
            <button
              className="search-clear-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        {!loading && (
          <span className="search-result-count">
            {filtered.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <LoadingState title="Loading employees" description="Fetching employee records." />
      ) : error && !employees.length ? (
        <ErrorState description={error} onRetry={loadEmployees} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No employees found"
          emptyDescription={search ? 'No employees match your search.' : 'Create an employee to get started.'}
        />
      )}

      {showCreateForm ? (
        <CreateEmployeeForm
          title="Create Employee"
          submitLabel="Create Employee"
          onSubmit={handleCreateEmployee}
          onCancel={() => setShowCreateForm(false)}
          submitting={submitting}
        />
      ) : null}

      {showManagerForm ? (
        <CreateManagerForm
          onSubmit={handleCreateManager}
          onCancel={() => setShowManagerForm(false)}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}

export default AdminEmployeesPage;
