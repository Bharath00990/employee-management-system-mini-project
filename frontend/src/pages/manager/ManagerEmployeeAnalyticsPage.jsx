import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EmployeeAnalyticsDashboard from '../../components/analytics/EmployeeAnalyticsDashboard';
import { getManagerAttendance } from '../../services/attendanceService';
import { getManagerLeaves } from '../../services/leaveService';
import { getManagerProjects, getManagerProjectTeam } from '../../services/projectService';
import { MANAGER_ROUTES } from '../../constants/routes';
import { getErrorMessage } from '../../utils/apiError';

function ManagerEmployeeAnalyticsPage() {
  const { employeeId } = useParams();
  const numericId = Number(employeeId);
  const [employeeName, setEmployeeName] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch team-level data and filter by employee
      const [attData, leaveData, projData] = await Promise.all([
        getManagerAttendance().catch(() => []),
        getManagerLeaves().catch(() => []),
        getManagerProjects().catch(() => []),
      ]);

      // Filter attendance for this employee
      const empAttendance = (Array.isArray(attData) ? attData : [])
        .filter((a) => a.employeeId === numericId);

      // Filter leaves for this employee
      const empLeaves = (Array.isArray(leaveData) ? leaveData : [])
        .filter((l) => l.employeeId === numericId);

      // Determine employee name from attendance or leave data
      const nameFromAtt = empAttendance.find((a) => a.employeeName)?.employeeName;
      const nameFromLeave = empLeaves.find((l) => l.employeeName)?.employeeName;
      setEmployeeName(nameFromAtt || nameFromLeave || `Employee #${employeeId}`);

      // Find projects where this employee is a team member
      const empProjects = [];
      for (const proj of projData) {
        try {
          const team = await getManagerProjectTeam(proj.id);
          const isMember = (Array.isArray(team) ? team : [])
            .some((m) => m.employeeId === numericId || m.id === numericId);
          if (isMember) {
            empProjects.push(proj);
          }
        } catch {
          // skip projects where we can't fetch team
        }
      }

      setAttendance(empAttendance);
      setLeaves(empLeaves);
      setProjects(empProjects);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load employee analytics.'));
    } finally {
      setLoading(false);
    }
  }, [employeeId, numericId]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <>
      <div style={{ padding: '0 0 8px' }}>
        <Link to={MANAGER_ROUTES.TEAM} className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ArrowLeft size={14} /> Back to Team
        </Link>
      </div>
      <EmployeeAnalyticsDashboard
        employeeName={employeeName}
        attendance={attendance}
        projects={projects}
        leaves={leaves}
        salaries={[]}
        loading={loading}
        error={error}
        onRefresh={loadData}
        headerTitle={`${employeeName} — Analytics`}
        headerDescription={`Attendance, project & leave insights for ${employeeName}.`}
      />
    </>
  );
}

export default ManagerEmployeeAnalyticsPage;
