import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, UserCog, X } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import CreateUserForm from '../../components/admin/CreateUserForm';
import CreateManagerForm from '../../components/admin/CreateManagerForm';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { createUser, getAllUsers, updateUserStatus } from '../../services/userService';
import { createProjectManager } from '../../services/employeeService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatRole, formatDateTime } from '../../utils/formatters';

function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (loadError) {
      setUsers([]);
      setError(getErrorMessage(loadError, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const username = (u.username ?? '').toLowerCase();
      const role = (u.role ?? '').toLowerCase();
      const roleLabel = formatRole(u.role).toLowerCase();
      const statusText = (u.enabled !== false ? 'active' : 'disabled');
      const idStr = String(u.id ?? '');
      return (
        username.includes(q) ||
        role.includes(q) ||
        roleLabel.includes(q) ||
        statusText.includes(q) ||
        idStr.includes(q)
      );
    });
  }, [users, search]);

  async function handleCreateUser(formData) {
    setSubmitting(true);
    try {
      await createUser(formData);
      toast.success('User created successfully.');
      setShowCreateForm(false);
      await loadUsers();
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
      await loadUsers();
    } catch (createError) {
      throw createError;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(user) {
    try {
      const updated = await updateUserStatus(user.id, !user.enabled);
      setUsers((current) =>
        current.map((u) => (u.id === updated.id ? updated : u)),
      );
      toast.success(
        updated.enabled ? 'User enabled.' : 'User disabled.',
      );
    } catch (statusError) {
      toast.error(getErrorMessage(statusError, 'Failed to update user status.'));
    }
  }

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'username', header: 'Username' },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge variant={u.role === 'ADMIN' ? 'accent' : u.role === 'PROJECT_MANAGER' ? 'info' : 'default'}>
          {formatRole(u.role)}
        </Badge>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (u) => (
        <Badge variant={u.enabled !== false ? 'success' : 'danger'} dot>
          {u.enabled !== false ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <Button
          variant={u.enabled !== false ? 'danger' : 'primary'}
          size="sm"
          onClick={() => handleToggleStatus(u)}
        >
          {u.enabled !== false ? 'Disable' : 'Enable'}
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Users" description="Manage system user accounts.">
        <Button variant="secondary" icon={UserCog} onClick={() => setShowManagerForm(true)}>
          Create Manager
        </Button>
        <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
          Create User
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
            id="users-search"
            type="text"
            className="search-input"
            placeholder="Search by username, role, status or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
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
            {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <LoadingState title="Loading users" description="Fetching user accounts." />
      ) : error && !users.length ? (
        <ErrorState description={error} onRetry={loadUsers} />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No users found"
          emptyDescription={search ? 'No users match your search.' : 'Create a user to get started.'}
        />
      )}

      {showCreateForm ? (
        <CreateUserForm
          onSubmit={handleCreateUser}
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

export default AdminUsersPage;
