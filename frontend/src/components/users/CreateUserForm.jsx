import { useState } from 'react';
import { ROLES } from '../../constants/roles';
import { formatRole, getErrorMessage } from '../../utils/formatters';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ROLE_OPTIONS = [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.EMPLOYEE];

function CreateUserForm({ onSubmit, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({ username, password, role });
      setUsername('');
      setPassword('');
      setRole(ROLES.EMPLOYEE);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to create user.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <Input
        label="Username"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        minLength={3}
        maxLength={50}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />

      <div className="ui-input">
        <label htmlFor="create-user-role">Role</label>
        <select
          id="create-user-role"
          className="ui-input__field"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatRole(option)}
            </option>
          ))}
        </select>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

export default CreateUserForm;
