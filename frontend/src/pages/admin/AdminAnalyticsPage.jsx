import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart2, Users, FolderKanban, CalendarCheck, CalendarOff, TrendingUp, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/common/LoadingState';
import { getAllEmployees } from '../../services/employeeService';
import { getAdminProjects } from '../../services/projectService';
import { getAdminAttendance } from '../../services/attendanceService';
import { getAdminLeaves } from '../../services/leaveService';
import { getErrorMessage } from '../../utils/apiError';

/* ─── tiny chart primitives ─── */

function PieChart({ slices, size = 160 }) {
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (!total) return <div className="an-empty-chart">No data</div>;

  let angle = -90;
  const paths = slices.map((slice) => {
    const pct = slice.value / total;
    const deg = pct * 360;
    const start = angle;
    const end = angle + deg;
    angle = end;
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = deg > 180 ? 1 : 0;
    return (
      <path
        key={slice.label}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={slice.color}
        stroke="var(--bg-surface)"
        strokeWidth="2"
        opacity={0.9}
      >
        <title>{slice.label}: {slice.value} ({Math.round(pct * 100)}%)</title>
      </path>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Pie chart">
      {paths}
    </svg>
  );
}

function DonutChart({ slices, size = 160, label }) {
  const r = size / 2 - 14;
  const inner = r * 0.58;
  const cx = size / 2;
  const cy = size / 2;
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (!total) return <div className="an-empty-chart">No data</div>;

  let angle = -90;
  const paths = slices.map((slice) => {
    const pct = slice.value / total;
    const deg = pct * 360;
    const start = angle;
    const end = angle + deg;
    angle = end;
    const toRad = (d) => (d * Math.PI) / 180;
    const x1o = cx + r * Math.cos(toRad(start));
    const y1o = cy + r * Math.sin(toRad(start));
    const x2o = cx + r * Math.cos(toRad(end));
    const y2o = cy + r * Math.sin(toRad(end));
    const x1i = cx + inner * Math.cos(toRad(end));
    const y1i = cy + inner * Math.sin(toRad(end));
    const x2i = cx + inner * Math.cos(toRad(start));
    const y2i = cy + inner * Math.sin(toRad(start));
    const large = deg > 180 ? 1 : 0;
    return (
      <path
        key={slice.label}
        d={`M${x1o},${y1o} A${r},${r} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${inner},${inner} 0 ${large},0 ${x2i},${y2i} Z`}
        fill={slice.color}
        stroke="var(--bg-surface)"
        strokeWidth="2"
        opacity={0.9}
      >
        <title>{slice.label}: {slice.value} ({Math.round(pct * 100)}%)</title>
      </path>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Donut chart">
      {paths}
      {label && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text-heading)">{label.value}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{label.text}</text>
        </>
      )}
    </svg>
  );
}

function BarChart({ bars, maxValue, height = 160 }) {
  if (!bars.length || !maxValue) return <div className="an-empty-chart">No data</div>;
  const barW = Math.max(24, Math.min(48, Math.floor(280 / bars.length) - 8));
  const gap = Math.max(6, Math.floor(280 / bars.length) - barW);
  const totalW = bars.length * (barW + gap) - gap + 32;

  return (
    <svg width="100%" height={height + 32} viewBox={`0 0 ${totalW} ${height + 32}`} preserveAspectRatio="xMidYMid meet" aria-label="Bar chart">
      {bars.map((bar, i) => {
        const bh = Math.max(2, Math.round((bar.value / maxValue) * height));
        const x = 16 + i * (barW + gap);
        const y = height - bh;
        return (
          <g key={bar.label}>
            <rect x={x} y={y} width={barW} height={bh} rx="4" fill={bar.color} opacity={0.85}>
              <title>{bar.label}: {bar.value}</title>
            </rect>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-heading)">
              {bar.value}
            </text>
            <text x={x + barW / 2} y={height + 18} textAnchor="middle" fontSize="9" fill="var(--text-muted)" style={{ wordBreak: 'break-word' }}>
              {bar.label.length > 8 ? bar.label.slice(0, 7) + '…' : bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ items }) {
  return (
    <div className="an-legend">
      {items.map((item) => (
        <div key={item.label} className="an-legend__item">
          <span className="an-legend__dot" style={{ background: item.color }} />
          <span className="an-legend__label">{item.label}</span>
          <span className="an-legend__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="an-stat-pill" style={{ '--pill-color': color }}>
      <span className="an-stat-pill__value">{value}</span>
      <span className="an-stat-pill__label">{label}</span>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, pills }) {
  return (
    <div className="an-card">
      <div className="an-card__header">
        <div className="an-card__title-row">
          {Icon && <Icon size={16} className="an-card__icon" />}
          <h3 className="an-card__title">{title}</h3>
        </div>
        {pills && <div className="an-card__pills">{pills}</div>}
      </div>
      <div className="an-card__body">{children}</div>
    </div>
  );
}

/* ─── colour palette ─── */
const COLORS = {
  present:   '#22c55e',
  absent:    '#ef4444',
  late:      '#f59e0b',
  halfDay:   '#8b5cf6',
  active:    '#3b82f6',
  planning:  '#a78bfa',
  completed: '#10b981',
  onHold:    '#f97316',
  pending:   '#f59e0b',
  approved:  '#22c55e',
  rejected:  '#ef4444',
  cancelled: '#94a3b8',
  annual:    '#6366f1',
  sick:      '#ec4899',
  personal:  '#14b8a6',
  maternity: '#f43f5e',
  emergency: '#ef4444',
  dept1: '#6366f1', dept2: '#3b82f6', dept3: '#10b981',
  dept4: '#f59e0b', dept5: '#ec4899', dept6: '#8b5cf6',
  dept7: '#f97316', dept8: '#14b8a6', dept9: '#64748b',
};

const DEPT_COLORS = [
  COLORS.dept1, COLORS.dept2, COLORS.dept3, COLORS.dept4,
  COLORS.dept5, COLORS.dept6, COLORS.dept7, COLORS.dept8, COLORS.dept9,
];

/* ─── main page ─── */
function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves]       = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [empData, projData, attData, leaveData] = await Promise.all([
        getAllEmployees().catch(() => []),
        getAdminProjects().catch(() => []),
        getAdminAttendance().catch(() => []),
        getAdminLeaves().catch(() => []),
      ]);
      setEmployees(empData);
      setProjects(projData);
      setAttendance(attData);
      setLeaves(leaveData);
      setLastRefresh(new Date());
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load analytics data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── derived data ── */
  const attendanceStats = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0 };
    attendance.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });
    return counts;
  }, [attendance]);

  const projectStats = useMemo(() => {
    const counts = { ACTIVE: 0, PLANNING: 0, COMPLETED: 0, ON_HOLD: 0 };
    projects.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return counts;
  }, [projects]);

  const leaveStats = useMemo(() => {
    const byStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    const byType   = {};
    leaves.forEach((l) => {
      if (byStatus[l.status] !== undefined) byStatus[l.status]++;
      byType[l.leaveType] = (byType[l.leaveType] ?? 0) + 1;
    });
    return { byStatus, byType };
  }, [leaves]);

  const deptStats = useMemo(() => {
    const counts = {};
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned';
      counts[dept] = (counts[dept] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9);
  }, [employees]);

  const designationStats = useMemo(() => {
    const counts = {};
    employees.forEach((e) => {
      const d = e.designation || 'Unassigned';
      counts[d] = (counts[d] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [employees]);

  /* ── attendance slices ── */
  const attSlices = [
    { label: 'Present',  value: attendanceStats.PRESENT,  color: COLORS.present },
    { label: 'Absent',   value: attendanceStats.ABSENT,   color: COLORS.absent },
    { label: 'Late',     value: attendanceStats.LATE,     color: COLORS.late },
    { label: 'Half Day', value: attendanceStats.HALF_DAY, color: COLORS.halfDay },
  ].filter((s) => s.value > 0);

  const totalAtt = attendance.length;
  const attRate = totalAtt ? Math.round((attendanceStats.PRESENT / totalAtt) * 100) : 0;

  /* ── project slices ── */
  const projSlices = [
    { label: 'Active',    value: projectStats.ACTIVE,    color: COLORS.active },
    { label: 'Planning',  value: projectStats.PLANNING,  color: COLORS.planning },
    { label: 'Completed', value: projectStats.COMPLETED, color: COLORS.completed },
    { label: 'On Hold',   value: projectStats.ON_HOLD,   color: COLORS.onHold },
  ].filter((s) => s.value > 0);

  /* ── leave status slices ── */
  const leaveStatusSlices = [
    { label: 'Approved',  value: leaveStats.byStatus.APPROVED,  color: COLORS.approved },
    { label: 'Pending',   value: leaveStats.byStatus.PENDING,   color: COLORS.pending },
    { label: 'Rejected',  value: leaveStats.byStatus.REJECTED,  color: COLORS.rejected },
    { label: 'Cancelled', value: leaveStats.byStatus.CANCELLED, color: COLORS.cancelled },
  ].filter((s) => s.value > 0);

  /* ── leave type bars ── */
  const leaveTypeBars = Object.entries(leaveStats.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, val], i) => ({
      label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: val,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
    }));

  /* ── dept bars ── */
  const deptBars = deptStats.map(([dept, count], i) => ({
    label: dept,
    value: count,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  const maxDeptVal = deptBars.length ? Math.max(...deptBars.map((b) => b.value)) : 1;
  const maxLeaveTypeVal = leaveTypeBars.length ? Math.max(...leaveTypeBars.map((b) => b.value)) : 1;

  /* ── designation bars ── */
  const designBars = designationStats.map(([d, count], i) => ({
    label: d,
    value: count,
    color: DEPT_COLORS[(i + 3) % DEPT_COLORS.length],
  }));
  const maxDesignVal = designBars.length ? Math.max(...designBars.map((b) => b.value)) : 1;

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Analytics" description="Workforce insights and reports." />
        <LoadingState title="Loading analytics" description="Aggregating all data…" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Analytics & Reports" description="Interactive workforce insights — attendance, projects, leaves and more.">
        <Button variant="secondary" icon={RefreshCw} onClick={loadData}>Refresh</Button>
      </PageHeader>

      {error && (
        <div className="an-error-banner">
          <span>⚠ {error}</span>
          <button type="button" onClick={loadData} className="an-error-retry">Retry</button>
        </div>
      )}

      {lastRefresh && (
        <p className="an-refresh-time">Last updated: {lastRefresh.toLocaleTimeString()}</p>
      )}

      {/* ── KPI row ── */}
      <div className="an-kpi-row">
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#eef2ff', color: '#6366f1' }}><Users size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{employees.length}</div>
            <div className="an-kpi__label">Total Employees</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FolderKanban size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{projects.length}</div>
            <div className="an-kpi__label">Total Projects</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><CalendarCheck size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{attRate}%</div>
            <div className="an-kpi__label">Attendance Rate</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><CalendarOff size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{leaveStats.byStatus.PENDING}</div>
            <div className="an-kpi__label">Pending Leaves</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#f0fdf4', color: '#10b981' }}><TrendingUp size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{projectStats.ACTIVE}</div>
            <div className="an-kpi__label">Active Projects</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#fdf4ff', color: '#a855f7' }}><BarChart2 size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{leaves.length}</div>
            <div className="an-kpi__label">Total Leave Requests</div>
          </div>
        </div>
      </div>

      {/* ── row 1: Attendance + Projects ── */}
      <div className="an-grid an-grid--2">
        <ChartCard
          title="Attendance Overview"
          icon={CalendarCheck}
          pills={
            <>
              <StatPill label="Present" value={attendanceStats.PRESENT} color={COLORS.present} />
              <StatPill label="Absent" value={attendanceStats.ABSENT} color={COLORS.absent} />
              <StatPill label="Late" value={attendanceStats.LATE} color={COLORS.late} />
            </>
          }
        >
          <div className="an-chart-row">
            <DonutChart
              slices={attSlices}
              size={170}
              label={{ value: `${attRate}%`, text: 'present' }}
            />
            <Legend items={attSlices} />
          </div>
        </ChartCard>

        <ChartCard
          title="Project Status Breakdown"
          icon={FolderKanban}
          pills={
            <>
              <StatPill label="Active" value={projectStats.ACTIVE} color={COLORS.active} />
              <StatPill label="Done" value={projectStats.COMPLETED} color={COLORS.completed} />
            </>
          }
        >
          <div className="an-chart-row">
            <PieChart slices={projSlices} size={170} />
            <Legend items={projSlices} />
          </div>
        </ChartCard>
      </div>

      {/* ── row 2: Leave Status + Leave Types ── */}
      <div className="an-grid an-grid--2">
        <ChartCard
          title="Leave Request Status"
          icon={CalendarOff}
          pills={
            <>
              <StatPill label="Approved" value={leaveStats.byStatus.APPROVED} color={COLORS.approved} />
              <StatPill label="Pending" value={leaveStats.byStatus.PENDING} color={COLORS.pending} />
              <StatPill label="Rejected" value={leaveStats.byStatus.REJECTED} color={COLORS.rejected} />
            </>
          }
        >
          <div className="an-chart-row">
            <DonutChart
              slices={leaveStatusSlices}
              size={170}
              label={{ value: leaves.length, text: 'requests' }}
            />
            <Legend items={leaveStatusSlices} />
          </div>
        </ChartCard>

        <ChartCard title="Leave by Type" icon={CalendarOff}>
          <div className="an-bar-wrap">
            <BarChart bars={leaveTypeBars} maxValue={maxLeaveTypeVal} height={130} />
          </div>
        </ChartCard>
      </div>

      {/* ── row 3: Department + Designation ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="Employees by Department" icon={Users}>
          <div className="an-bar-wrap">
            <BarChart bars={deptBars} maxValue={maxDeptVal} height={140} />
          </div>
          <Legend
            items={deptBars.map((b) => ({ label: b.label, value: b.value, color: b.color }))}
          />
        </ChartCard>

        <ChartCard title="Employees by Designation" icon={Users}>
          <div className="an-bar-wrap">
            <BarChart bars={designBars} maxValue={maxDesignVal} height={140} />
          </div>
          <Legend
            items={designBars.map((b) => ({ label: b.label, value: b.value, color: b.color }))}
          />
        </ChartCard>
      </div>

      {/* ── row 4: Attendance detail table ── */}
      <ChartCard title="Recent Attendance Records" icon={CalendarCheck}>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 15).map((a, i) => (
                <tr key={a.id ?? i}>
                  <td>{a.employeeName ?? `Employee #${a.employeeId}`}</td>
                  <td>{a.date ?? '—'}</td>
                  <td>
                    <span
                      className="an-status-badge"
                      style={{ '--badge-color': COLORS[a.status?.toLowerCase()] ?? '#94a3b8' }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>{a.checkInTime ?? '—'}</td>
                  <td>{a.checkOutTime ?? '—'}</td>
                </tr>
              ))}
              {!attendance.length && (
                <tr><td colSpan="5" className="an-table__empty">No attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* ── row 5: Project table ── */}
      <ChartCard title="Projects Overview" icon={FolderKanban}>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id ?? i}>
                  <td>{p.name}</td>
                  <td>
                    <span
                      className="an-status-badge"
                      style={{ '--badge-color': COLORS[p.status?.toLowerCase()] ?? '#94a3b8' }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.managerName ?? '—'}</td>
                  <td>{p.startDate ?? '—'}</td>
                  <td>{p.endDate ?? '—'}</td>
                </tr>
              ))}
              {!projects.length && (
                <tr><td colSpan="5" className="an-table__empty">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default AdminAnalyticsPage;
