import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EmployeeAnalyticsDashboard from '../../components/analytics/EmployeeAnalyticsDashboard';
import { getEmployeeById } from '../../services/employeeService';
import { getAdminEmployeeAttendance } from '../../services/attendanceService';
import { getAdminEmployeeLeaves } from '../../services/leaveService';
import { getAdminEmployeeSalaries } from '../../services/salaryService';
import { getAdminProjects, getAdminProjectTeam } from '../../services/projectService';
import { ADMIN_ROUTES } from '../../constants/routes';
import { getErrorMessage } from '../../utils/apiError';

function AdminEmployeeAnalyticsPage() {
  const { employeeId } = useParams();
  const numericId = Number(employeeId);

  const [employee, setEmployee] = useState(null);
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
      // Parallel fetch of employee info + attendance + leaves + salaries + all projects
      const [empData, attData, leaveData, salaryData, allProjects] = await Promise.all([
        getEmployeeById(employeeId).catch(() => null),
        getAdminEmployeeAttendance(employeeId).catch(() => []),
        getAdminEmployeeLeaves(employeeId).catch(() => []),
        getAdminEmployeeSalaries(employeeId).catch(() => []),
        getAdminProjects().catch(() => []),
      ]);

      setEmployee(empData);
      setAttendance(Array.isArray(attData) ? attData : [attData].filter(Boolean));
      setLeaves(Array.isArray(leaveData) ? leaveData : []);
      setSalaries(Array.isArray(salaryData) ? salaryData : []);

      // Determine which projects include this employee in their team
      const empProjects = [];
      for (const proj of (allProjects ?? [])) {
        try {
          const team = await getAdminProjectTeam(proj.id);
          const isMember = (Array.isArray(team) ? team : [])
            .some((m) => m.employeeId === numericId || m.id === numericId);
          if (isMember) empProjects.push(proj);
        } catch {
          // skip inaccessible projects
        }
      }
      setProjects(empProjects);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load employee analytics data.'));
    } finally {
      setLoading(false);
    }
  }, [employeeId, numericId]);

  useEffect(() => { loadData(); }, [loadData]);

  const empName = employee
    ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      || employee.email
      || `Employee #${employeeId}`
    : `Employee #${employeeId}`;

  return (
    <>
      <div style={{ padding: '0 0 8px' }}>
        <Link
          to={ADMIN_ROUTES.EMPLOYEES}
          className="text-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}
        >
          <ArrowLeft size={14} /> Back to Employees
        </Link>
      </div>
      <EmployeeAnalyticsDashboard
        employeeName={empName}
        attendance={attendance}
        projects={projects}
        leaves={leaves}
        salaries={salaries}
        loading={loading}
        error={error}
        onRefresh={loadData}
        headerTitle={`${empName} — Analytics`}
        headerDescription={`Attendance, projects, leaves & salary insights for ${empName}.`}
      />
    </>
  );
}

export default AdminEmployeeAnalyticsPage;
