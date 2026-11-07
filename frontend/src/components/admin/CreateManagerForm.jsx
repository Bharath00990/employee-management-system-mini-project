import { useState } from 'react';
import { UserCog } from 'lucide-react';
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

function CreateManagerForm({ onSubmit, onCancel, submitting }) {
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
      setError(getErrorMessage(submitError, 'Failed to create manager.'));
    }
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Create Project Manager"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-manager-form" icon={UserCog} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Manager'}
          </Button>
        </>
      }
    >
      <div className="create-manager-role-banner">
        <UserCog size={16} className="create-manager-role-banner__icon" />
        <span>
          This account will have <strong>Project Manager</strong> role — able to manage
          team attendance, leave approvals, and assigned projects.
        </span>
      </div>

      <form id="create-manager-form" className="stack-form form-grid" onSubmit={handleSubmit}>
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

export default CreateManagerForm;

