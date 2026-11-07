import { useState } from 'react';
import { ROLES } from '../../constants/roles';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { getErrorMessage } from '../../utils/apiError';

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.PROJECT_MANAGER, label: 'Project Manager' },
  { value: ROLES.EMPLOYEE, label: 'Employee' },
];

const INITIAL_FORM = {
  username: '',
  password: '',
  role: ROLES.EMPLOYEE,
};

function CreateUserForm({ onSubmit, onCancel, submitting }) {
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
      setError(getErrorMessage(submitError, 'Failed to create user.'));
    }
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title="Create User"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-user-form" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </>
      }
    >
      <form id="create-user-form" className="stack-form" onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          minLength={3}
          maxLength={50}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
          autoComplete="new-password"
        />

        <div className="ui-input">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            className="ui-input__field"
            value={form.role}
            onChange={handleChange}
            required
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export default CreateUserForm;
