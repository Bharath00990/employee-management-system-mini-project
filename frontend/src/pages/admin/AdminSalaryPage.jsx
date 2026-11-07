import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { getAdminSalaries, createAdminSalary } from '../../services/salaryService';
import { getAllEmployees } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatCurrency, formatMonthYear, getEmployeeFullName } from '../../utils/formatters';

function AdminSalaryPage() {
  const toast = useToast();
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    month: '',
    year: '',
    basicSalary: '',
    allowances: '0',
    deductions: '0',
  });
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [salaryData, empData] = await Promise.all([
        getAdminSalaries(),
        getAllEmployees().catch(() => []),
      ]);
      setSalaries(salaryData);
      setEmployees(empData);
    } catch (loadError) {
      setSalaries([]);
      setError(getErrorMessage(loadError, 'Failed to load salary records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return salaries;
    return salaries.filter((s) => {
      const name = (s.employeeName ?? '').toLowerCase();
      const period = formatMonthYear(s.month, s.year).toLowerCase();
      return name.includes(q) || period.includes(q);
    });
  }, [salaries, search]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await createAdminSalary({
        employeeId: Number(form.employeeId),
        month: Number(form.month),
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
      });
      toast.success('Salary record created successfully.');
      setShowCreateForm(false);
      setForm({ employeeId: '', month: '', year: '', basicSalary: '', allowances: '0', deductions: '0' });
      await loadData();
    } catch (createError) {
      setFormError(getErrorMessage(createError, 'Failed to create salary record.'));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'employeeName', header: 'Employee', render: (s) => s.employeeName ?? `Employee #${s.employeeId}` },
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
      <PageHeader title="Salary Management" description="Manage employee salary records.">
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create Salary
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
            type="text"
            className="search-input"
            placeholder="Search by employee name or period…"
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
        <LoadingState title="Loading salaries" description="Fetching salary records." />
      ) : error && !salaries.length ? (
        <ErrorState description={error} onRetry={loadData} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No salary records"
          emptyDescription={search ? 'No salary records match your search.' : 'Create a salary record to get started.'}
        />
      )}

      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Salary Record"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateForm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-salary-form" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="create-salary-form" className="stack-form form-grid" onSubmit={handleCreate}>
          <div className="ui-input form-grid__full">
            <label htmlFor="employeeId">Employee</label>
            <select
              id="employeeId"
              name="employeeId"
              className="ui-input__field"
              value={form.employeeId}
              onChange={handleFormChange}
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {getEmployeeFullName(emp)} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
          <Input label="Month (1-12)" name="month" type="number" min="1" max="12" value={form.month} onChange={handleFormChange} required />
          <Input label="Year" name="year" type="number" min="2000" max="2099" value={form.year} onChange={handleFormChange} required />
          <Input label="Basic Salary" name="basicSalary" type="number" step="0.01" value={form.basicSalary} onChange={handleFormChange} required />
          <Input label="Allowances" name="allowances" type="number" step="0.01" value={form.allowances} onChange={handleFormChange} />
          <Input label="Deductions" name="deductions" type="number" step="0.01" value={form.deductions} onChange={handleFormChange} />
          {formError ? (
            <p className="form-error form-grid__full" role="alert">
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>
    </div>
  );
}

export default AdminSalaryPage;
