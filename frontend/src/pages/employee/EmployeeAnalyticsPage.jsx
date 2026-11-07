import { useCallback, useEffect, useState } from 'react';
import EmployeeAnalyticsDashboard from '../../components/analytics/EmployeeAnalyticsDashboard';
import { useAuth } from '../../hooks/useAuth';
import { getEmployeeAttendance } from '../../services/attendanceService';
import { getEmployeeProjects } from '../../services/projectService';
import { getEmployeeLeaves } from '../../services/leaveService';
import { getEmployeeSalaries } from '../../services/salaryService';
import { getErrorMessage } from '../../utils/apiError';

function EmployeeAnalyticsPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [attData, projData, leaveData, salaryData] = await Promise.all([
        getEmployeeAttendance().catch(() => []),
        getEmployeeProjects().catch(() => []),
        getEmployeeLeaves().catch(() => []),
        getEmployeeSalaries().catch(() => []),
      ]);
      setAttendance(Array.isArray(attData) ? attData : [attData].filter(Boolean));
      setProjects(Array.isArray(projData) ? projData : []);
      setLeaves(Array.isArray(leaveData) ? leaveData : []);
      setSalaries(Array.isArray(salaryData) ? salaryData : []);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load analytics data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <EmployeeAnalyticsDashboard
      employeeName={user?.username ?? 'You'}
      attendance={attendance}
      projects={projects}
      leaves={leaves}
      salaries={salaries}
      loading={loading}
      error={error}
      onRefresh={loadData}
      headerTitle="My Analytics"
      headerDescription="Your personal attendance, project, leave & salary insights."
    />
  );
}

export default EmployeeAnalyticsPage;
