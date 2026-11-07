import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmployeeFormFields from './EmployeeFormFields';
import { getErrorMessage } from '../../utils/apiError';

const INITIAL_FORM = {
  username: '',
  password: '',
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  dateOfJoining: '',
};

function CreateEmployeeForm({ title, submitLabel, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await onSubmit(form);
      setForm(INITIAL_FORM);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to save employee.'));
    }
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-employee-form" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </>
      }
    >
      <form id="create-employee-form" className="stack-form form-grid" onSubmit={handleSubmit}>
        <EmployeeFormFields form={form} onChange={handleChange} includeAuthFields />

        {error ? (
          <p className="form-error form-grid__full" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export default CreateEmployeeForm;
