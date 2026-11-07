import { useCallback, useEffect, useState } from 'react';
import { Key } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { getMe, changePassword } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatRole } from '../../utils/formatters';

function EmployeeProfilePage() {
  const toast = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setProfile(data);
    } catch {
      // fallback to auth context user
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwordForm);
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to change password.'));
    } finally {
      setChangingPassword(false);
    }
  }

  const displayUser = profile ?? user;
  const userInitial = displayUser?.username?.charAt(0)?.toUpperCase() ?? '?';

  if (loading) {
    return (
      <div className="page">
        <LoadingState title="Loading profile" description="Fetching your profile information." />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Profile" description="View your account details and change your password." />

      <div className="profile-header">
        <div className="profile-header__avatar">{userInitial}</div>
        <div className="profile-header__info">
          <div className="profile-header__name">{displayUser?.username}</div>
          <div className="profile-header__meta">
            <Badge variant="accent">{formatRole(displayUser?.role)}</Badge>
            {displayUser?.id ? <span>ID: {displayUser.id}</span> : null}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card title="Account Information">
          <dl className="detail-list">
            <div className="detail-list__item">
              <dt>Username</dt>
              <dd>{displayUser?.username}</dd>
            </div>
            <div className="detail-list__item">
              <dt>Role</dt>
              <dd>{formatRole(displayUser?.role)}</dd>
            </div>
            {displayUser?.id ? (
              <div className="detail-list__item">
                <dt>User ID</dt>
                <dd>{displayUser.id}</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        <Card title="Change Password">
          <form className="stack-form" onSubmit={handleChangePassword}>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            {passwordError ? (
              <p className="form-error" role="alert">
                {passwordError}
              </p>
            ) : null}
            <Button type="submit" icon={Key} loading={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default EmployeeProfilePage;
