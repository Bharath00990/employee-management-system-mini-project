import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, Users } from 'lucide-react';
import ProjectDetailsView from '../../components/projects/ProjectDetailsView';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import ProjectFormModal from '../../components/admin/ProjectFormModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { ADMIN_ROUTES } from '../../constants/routes';
import {
  getAdminProjectById,
  updateAdminProject,
  getAdminProjectTeam,
  adminAssignEmployeeToProject,
  adminRemoveEmployeeFromProject,
} from '../../services/projectService';
import { getAllEmployees } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, getEmployeeFullName } from '../../utils/formatters';

function AdminProjectDetailsPage() {
  const toast = useToast();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [projectManagers, setProjectManagers] = useState([]);
  const [team, setTeam] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Assign employee
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Remove confirmation
  const [removeAction, setRemoveAction] = useState(null);
  const [removing, setRemoving] = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [data, employees, teamData] = await Promise.all([
        getAdminProjectById(projectId),
        getAllEmployees().catch(() => []),
        getAdminProjectTeam(projectId).catch(() => []),
      ]);
      setProject(data);
      setProjectManagers(employees);
      setAllEmployees(employees);
      setTeam(teamData);
    } catch (loadError) {
      setProject(null);
      setError(getErrorMessage(loadError, 'Failed to load project details.'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  async function handleUpdateProject(formData) {
    setSubmitting(true);
    try {
      const updated = await updateAdminProject(projectId, formData);
      setProject(updated);
      toast.success('Project updated successfully.');
      setShowEditForm(false);
    } catch (updateError) {
      throw updateError;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignEmployee(event) {
    event.preventDefault();
    setAssignError('');
    setAssigning(true);
    try {
      const newAssignment = await adminAssignEmployeeToProject(projectId, {
        employeeId: Number(assignEmployeeId),
        assignedDate: assignDate || undefined,
      });
      setTeam((prev) => [...prev, newAssignment]);
      toast.success('Employee assigned to project.');
      setShowAssignModal(false);
      setAssignEmployeeId('');
      setAssignDate('');
    } catch (err) {
      setAssignError(getErrorMessage(err, 'Failed to assign employee.'));
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemoveEmployee() {
    if (!removeAction) return;
    setRemoving(true);
    try {
      await adminRemoveEmployeeFromProject(projectId, removeAction.employeeId);
      setTeam((prev) => prev.filter((a) => a.employeeId !== removeAction.employeeId));
      toast.success('Employee removed from project.');
      setRemoveAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove employee.'));
      setRemoveAction(null);
    } finally {
      setRemoving(false);
    }
  }

  // Employees not already on the team
  const assignedIds = new Set(team.map((a) => a.employeeId));
  const availableEmployees = allEmployees.filter((e) => !assignedIds.has(e.id));

  const teamColumns = [
    { key: 'employeeName', header: 'Name', render: (a) => a.employeeName ?? '—' },
    { key: 'assignedDate', header: 'Assigned Date', render: (a) => formatDate(a.assignedDate) },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={() => setRemoveAction({ employeeId: a.employeeId, name: a.employeeName })}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Project Details" description="View and manage project information.">
        <Link to={ADMIN_ROUTES.PROJECTS}>
          <Button variant="secondary" icon={ArrowLeft} size="sm">
            Back to projects
          </Button>
        </Link>
        {project ? (
          <Button icon={Pencil} size="sm" onClick={() => setShowEditForm(true)}>
            Edit
          </Button>
        ) : null}
      </PageHeader>

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState title="Loading project" description="Fetching project details." />
      ) : error ? (
        <ErrorState description={error} onRetry={loadProject} />
      ) : project ? (
        <>
          <ProjectDetailsView project={project} />

          {/* Team Management Section */}
          <div className="section-card" style={{ marginTop: '24px' }}>
            <div className="section-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  Project Team ({team.length})
                </h2>
              </div>
              <Button icon={Plus} size="sm" onClick={() => setShowAssignModal(true)}>
                Assign Employee
              </Button>
            </div>

            <DataTable
              columns={teamColumns}
              data={team}
              emptyTitle="No team members"
              emptyDescription="Assign employees to this project to build the team."
            />
          </div>
        </>
      ) : null}

      {showEditForm && project ? (
        <ProjectFormModal
          title="Edit Project"
          submitLabel="Save Changes"
          initialValues={project}
          projectManagers={projectManagers}
          includeStatus
          onSubmit={handleUpdateProject}
          onCancel={() => setShowEditForm(false)}
          submitting={submitting}
        />
      ) : null}

      {/* Assign Employee Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignError(''); }}
        title="Assign Employee to Project"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button type="submit" form="assign-employee-form" disabled={assigning}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </>
        }
      >
        <form id="assign-employee-form" className="stack-form" onSubmit={handleAssignEmployee}>
          <div className="ui-input">
            <label htmlFor="assign-emp">Employee</label>
            <select
              id="assign-emp"
              className="ui-input__field"
              value={assignEmployeeId}
              onChange={(e) => setAssignEmployeeId(e.target.value)}
              required
            >
              <option value="">Select an employee</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {getEmployeeFullName(emp)} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
          <div className="ui-input">
            <label htmlFor="assign-date">Assigned Date</label>
            <input
              id="assign-date"
              type="date"
              className="ui-input__field"
              value={assignDate}
              onChange={(e) => setAssignDate(e.target.value)}
            />
          </div>
          {assignError ? <p className="form-error" role="alert">{assignError}</p> : null}
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(removeAction)}
        title="Remove Employee"
        message={removeAction ? `Remove "${removeAction.name}" from this project?` : ''}
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removing}
        onConfirm={handleRemoveEmployee}
        onCancel={() => setRemoveAction(null)}
      />
    </div>
  );
}

export default AdminProjectDetailsPage;
