import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UsersRound, UserPlus, Trash2, BarChart2 } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatters';
import { MANAGER_ROUTES } from '../../constants/routes';
import {
  getManagerProjects,
  getManagerProjectTeam,
  assignEmployeeToProject,
  removeEmployeeFromProject,
} from '../../services/projectService';

function ManagerTeamPage() {
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [errorTeam, setErrorTeam] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addEmployeeId, setAddEmployeeId] = useState('');
  const [addAssignedDate, setAddAssignedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setErrorProjects('');
    try {
      const data = await getManagerProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id.toString());
      }
    } catch (err) {
      setErrorProjects(getErrorMessage(err, 'Failed to load projects.'));
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadTeam = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoadingTeam(true);
    setErrorTeam('');
    try {
      const data = await getManagerProjectTeam(projectId);
      setTeamMembers(data);
    } catch (err) {
      setErrorTeam(getErrorMessage(err, 'Failed to load team members.'));
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  useEffect(() => {
    loadTeam(selectedProjectId);
  }, [selectedProjectId, loadTeam]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);
    try {
      await assignEmployeeToProject(selectedProjectId, {
        employeeId: Number(addEmployeeId),
        assignedDate: addAssignedDate,
      });
      toast.success('Employee assigned successfully');
      setIsAddModalOpen(false);
      setAddEmployeeId('');
      setAddAssignedDate('');
      loadTeam(selectedProjectId);
    } catch (err) {
      setAddError(getErrorMessage(err, 'Failed to assign employee.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (employeeId) => {
    if (!window.confirm('Are you sure you want to remove this employee from the project?')) {
      return;
    }
    try {
      await removeEmployeeFromProject(selectedProjectId, employeeId);
      toast.success('Employee removed successfully');
      loadTeam(selectedProjectId);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove employee.'));
    }
  };

  const columns = [
    { key: 'employeeName', header: 'Name' },
    { key: 'employeeId', header: 'Employee ID' },
    {
      key: 'status',
      header: 'Status',
      render: (member) => (
        <Badge variant={member.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
          {member.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      key: 'assignedDate',
      header: 'Assigned Date',
      render: (member) => formatDate(member.assignedDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link
            to={`${MANAGER_ROUTES.TEAM_ANALYTICS}/${member.employeeId}/analytics`}
            className="text-link"
            title="View analytics"
          >
            <BarChart2 size={16} />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => handleRemove(member.employeeId)}
            title="Remove employee"
            aria-label="Remove employee"
            className="text-error"
          />
        </div>
      ),
    },
  ];

  if (loadingProjects) {
    return (
      <div className="page">
        <PageHeader title="Team" description="Manage your project team assignments." />
        <LoadingState title="Loading projects" description="Fetching your assigned projects." />
      </div>
    );
  }

  if (errorProjects && !projects.length) {
    return (
      <div className="page">
        <PageHeader title="Team" description="Manage your project team assignments." />
        <ErrorState description={errorProjects} onRetry={loadProjects} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Team" description="Manage your project team assignments." />
        <EmptyState
          icon={UsersRound}
          title="No projects assigned"
          description="You do not have any projects assigned to you yet."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Team" description="Manage your project team assignments.">
        <Button icon={UserPlus} onClick={() => setIsAddModalOpen(true)} disabled={!selectedProjectId}>
          Add Employee
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <Select
          label="Select Project"
          id="projectSelect"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Card>

      {loadingTeam ? (
        <LoadingState title="Loading team" description="Fetching team members for this project." />
      ) : errorTeam ? (
        <ErrorState description={errorTeam} onRetry={() => loadTeam(selectedProjectId)} />
      ) : (
        <DataTable
          columns={columns}
          data={teamMembers}
          emptyTitle="No team members"
          emptyDescription="This project has no employees assigned yet."
        />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Employee to Project"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="addEmployeeForm" loading={isSubmitting}>
              Add Employee
            </Button>
          </div>
        }
      >
        <form id="addEmployeeForm" onSubmit={handleAssignSubmit} className="space-y-4">
          {addError ? (
            <Alert variant="error" onDismiss={() => setAddError('')}>
              {addError}
            </Alert>
          ) : null}
          <Input
            label="Employee ID"
            type="number"
            required
            value={addEmployeeId}
            onChange={(e) => setAddEmployeeId(e.target.value)}
            placeholder="Enter employee ID"
          />
          <Input
            label="Assignment Date"
            type="date"
            required
            value={addAssignedDate}
            onChange={(e) => setAddAssignedDate(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

export default ManagerTeamPage;
