import { useEffect, useState } from 'react';
import { PROJECT_STATUSES } from '../../constants/projectStatus';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { getErrorMessage } from '../../utils/apiError';

const EMPTY_CREATE_FORM = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  managerId: '',
};

function ProjectFormModal({
  title,
  submitLabel,
  initialValues,
  projectManagers,
  includeStatus = false,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY_CREATE_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name ?? '',
        description: initialValues.description ?? '',
        startDate: initialValues.startDate ?? '',
        endDate: initialValues.endDate ?? '',
        managerId: initialValues.managerId ? String(initialValues.managerId) : '',
        status: initialValues.status ?? 'PLANNED',
      });
    } else {
      setForm(EMPTY_CREATE_FORM);
    }
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      description: form.description || null,
      startDate: form.startDate,
      endDate: form.endDate,
      managerId: form.managerId ? Number(form.managerId) : null,
    };

    if (includeStatus) {
      payload.status = form.status;
    }

    try {
      await onSubmit(payload);
      if (!initialValues) {
        setForm(EMPTY_CREATE_FORM);
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Failed to save project.'));
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
          <Button type="submit" form="project-form" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </>
      }
    >
      <form id="project-form" className="stack-form form-grid" onSubmit={handleSubmit}>
        <Input label="Project Name" name="name" value={form.name} onChange={handleChange} required />
        <div className="ui-input form-grid__full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="ui-input__field ui-textarea"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        <Input
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          required
        />
        <div className="ui-input">
          <label htmlFor="managerId">Project Manager</label>
          <select
            id="managerId"
            name="managerId"
            className="ui-input__field"
            value={form.managerId}
            onChange={handleChange}
          >
            <option value="">No manager assigned</option>
            {projectManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName} ({manager.employeeCode})
              </option>
            ))}
          </select>
        </div>

        {includeStatus ? (
          <div className="ui-input">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="ui-input__field"
              value={form.status}
              onChange={handleChange}
              required
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {error ? (
          <p className="form-error form-grid__full" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export default ProjectFormModal;
