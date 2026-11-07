import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmployeeFormFields from './EmployeeFormFields';
import { getErrorMessage } from '../../utils/apiError';

function EditEmployeeForm({ employee, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    dateOfJoining: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setForm({
        employeeCode: employee.employeeCode ?? '',
        firstName: employee.firstName ?? '',
        lastName: employee.lastName ?? '',
        email: employee.email ?? '',
        phone: employee.phone ?? '',
        department: employee.department ?? '',
        designation: employee.designation ?? '',
        dateOfJoining: employee.dateOfJoining ?? '',
      });
    }
  }, [employee]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to update employee.'));
    }
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Edit Employee"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-employee-form" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id="edit-employee-form" className="stack-form form-grid" onSubmit={handleSubmit}>
        <EmployeeFormFields form={form} onChange={handleChange} />

        {error ? (
          <p className="form-error form-grid__full" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export default EditEmployeeForm;
