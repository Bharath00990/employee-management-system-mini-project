import { useMemo } from 'react';
import {
  BarChart2, CalendarCheck, CalendarOff, FolderKanban,
  TrendingUp, Clock, Award, RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/common/LoadingState';

/* ─── tiny SVG chart primitives (reusable) ─── */

function DonutChart({ slices, size = 150, label }) {
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
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-heading)">{label.value}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{label.text}</text>
        </>
      )}
    </svg>
  );
}

function BarChart({ bars, maxValue, height = 140 }) {
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
            <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
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
  present: '#22c55e', absent: '#ef4444', late: '#f59e0b', halfDay: '#8b5cf6',
  active: '#3b82f6', planning: '#a78bfa', completed: '#10b981', onHold: '#f97316',
  pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444', cancelled: '#94a3b8',
};

const TYPE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#14b8a6'];

/**
 * Reusable Employee Analytics Dashboard component.
 *
 * Props:
 * - employeeName: string – display name
 * - attendance: array – attendance records
 * - projects: array – project records
 * - leaves: array – leave records
 * - salaries: array – salary records (optional)
 * - loading: bool
 * - error: string
 * - onRefresh: function
 * - showHeader: bool (default true)
 * - headerTitle: string override
 * - headerDescription: string override
 */
export default function EmployeeAnalyticsDashboard({
  employeeName = 'Employee',
  attendance = [],
  projects = [],
  leaves = [],
  salaries = [],
  loading = false,
  error = '',
  onRefresh,
  showHeader = true,
  headerTitle,
  headerDescription,
}) {
  /* ── attendance stats ── */
  const attStats = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0 };
    attendance.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });
    return counts;
  }, [attendance]);

  const totalAtt = attendance.length;
  const attRate = totalAtt ? Math.round((attStats.PRESENT / totalAtt) * 100) : 0;
  const lateRate = totalAtt ? Math.round((attStats.LATE / totalAtt) * 100) : 0;

  const attSlices = [
    { label: 'Present', value: attStats.PRESENT, color: COLORS.present },
    { label: 'Absent', value: attStats.ABSENT, color: COLORS.absent },
    { label: 'Late', value: attStats.LATE, color: COLORS.late },
    { label: 'Half Day', value: attStats.HALF_DAY, color: COLORS.halfDay },
  ].filter((s) => s.value > 0);

  /* ── project stats ── */
  const projStats = useMemo(() => {
    const counts = { ACTIVE: 0, PLANNING: 0, COMPLETED: 0, ON_HOLD: 0 };
    projects.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return counts;
  }, [projects]);

  const projSlices = [
    { label: 'Active', value: projStats.ACTIVE, color: COLORS.active },
    { label: 'Planning', value: projStats.PLANNING, color: COLORS.planning },
    { label: 'Completed', value: projStats.COMPLETED, color: COLORS.completed },
    { label: 'On Hold', value: projStats.ON_HOLD, color: COLORS.onHold },
  ].filter((s) => s.value > 0);

  /* ── leave stats ── */
  const leaveStats = useMemo(() => {
    const byStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    const byType = {};
    leaves.forEach((l) => {
      if (byStatus[l.status] !== undefined) byStatus[l.status]++;
      const type = l.leaveType || 'OTHER';
      byType[type] = (byType[type] ?? 0) + 1;
    });
    return { byStatus, byType };
  }, [leaves]);

  const leaveStatusSlices = [
    { label: 'Approved', value: leaveStats.byStatus.APPROVED, color: COLORS.approved },
    { label: 'Pending', value: leaveStats.byStatus.PENDING, color: COLORS.pending },
    { label: 'Rejected', value: leaveStats.byStatus.REJECTED, color: COLORS.rejected },
    { label: 'Cancelled', value: leaveStats.byStatus.CANCELLED, color: COLORS.cancelled },
  ].filter((s) => s.value > 0);

  const leaveTypeBars = Object.entries(leaveStats.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, val], i) => ({
      label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: val,
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    }));
  const maxLeaveTypeVal = leaveTypeBars.length ? Math.max(...leaveTypeBars.map((b) => b.value)) : 1;

  /* ── salary stats ── */
  const salaryInfo = useMemo(() => {
    if (!salaries.length) return null;
    const sorted = [...salaries].sort((a, b) => {
      const da = `${a.year}-${String(a.month).padStart(2, '0')}`;
      const db = `${b.year}-${String(b.month).padStart(2, '0')}`;
      return da.localeCompare(db);
    });
    const recent = sorted.slice(-6);
    const totalPaid = sorted.reduce((s, r) => s + (r.netSalary ?? r.basicSalary ?? 0), 0);
    return { recent, totalPaid };
  }, [salaries]);

  const salaryBars = (salaryInfo?.recent ?? []).map((s, i) => ({
    label: `${s.month}/${s.year}`,
    value: s.netSalary ?? s.basicSalary ?? 0,
    color: TYPE_COLORS[i % TYPE_COLORS.length],
  }));
  const maxSalaryVal = salaryBars.length ? Math.max(...salaryBars.map((b) => b.value)) : 1;

  /* ── monthly attendance trend ── */
  const monthlyAttendance = useMemo(() => {
    const months = {};
    attendance.forEach((a) => {
      if (!a.date) return;
      const month = a.date.substring(0, 7); // YYYY-MM
      if (!months[month]) months[month] = { present: 0, absent: 0, total: 0 };
      months[month].total++;
      if (a.status === 'PRESENT') months[month].present++;
      if (a.status === 'ABSENT') months[month].absent++;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        label: month,
        value: data.total ? Math.round((data.present / data.total) * 100) : 0,
        color: '#3b82f6',
      }));
  }, [attendance]);
  const maxMonthlyVal = monthlyAttendance.length ? Math.max(...monthlyAttendance.map((b) => b.value), 100) : 100;

  if (loading) {
    return (
      <div className="page">
        {showHeader && <PageHeader title={headerTitle || 'Analytics'} description={headerDescription || 'Loading analytics data…'} />}
        <LoadingState title="Loading analytics" description="Aggregating data…" />
      </div>
    );
  }

  return (
    <div className="page">
      {showHeader && (
        <PageHeader
          title={headerTitle || `${employeeName}'s Analytics`}
          description={headerDescription || `Interactive dashboard showing attendance, project, leave & salary insights for ${employeeName}.`}
        >
          {onRefresh && <Button variant="secondary" icon={RefreshCw} onClick={onRefresh}>Refresh</Button>}
        </PageHeader>
      )}

      {error && (
        <div className="an-error-banner">
          <span>⚠ {error}</span>
          {onRefresh && <button type="button" onClick={onRefresh} className="an-error-retry">Retry</button>}
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="an-kpi-row">
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><CalendarCheck size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{attRate}%</div>
            <div className="an-kpi__label">Attendance Rate</div>
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
          <div className="an-kpi__icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><CalendarOff size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{leaves.length}</div>
            <div className="an-kpi__label">Leave Requests</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Clock size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{lateRate}%</div>
            <div className="an-kpi__label">Late Arrivals</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#f0fdf4', color: '#10b981' }}><Award size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{projStats.COMPLETED}</div>
            <div className="an-kpi__label">Completed Projects</div>
          </div>
        </div>
        <div className="an-kpi">
          <div className="an-kpi__icon" style={{ background: '#fdf4ff', color: '#a855f7' }}><TrendingUp size={20} /></div>
          <div className="an-kpi__body">
            <div className="an-kpi__value">{projStats.ACTIVE}</div>
            <div className="an-kpi__label">Active Projects</div>
          </div>
        </div>
      </div>

      {/* ── Row 1: Attendance + Monthly Trend ── */}
      <div className="an-grid an-grid--2">
        <ChartCard
          title="Attendance Breakdown"
          icon={CalendarCheck}
          pills={
            <>
              <StatPill label="Present" value={attStats.PRESENT} color={COLORS.present} />
              <StatPill label="Absent" value={attStats.ABSENT} color={COLORS.absent} />
              <StatPill label="Late" value={attStats.LATE} color={COLORS.late} />
            </>
          }
        >
          <div className="an-chart-row">
            <DonutChart
              slices={attSlices}
              size={150}
              label={{ value: `${attRate}%`, text: 'present' }}
            />
            <Legend items={attSlices} />
          </div>
        </ChartCard>

        <ChartCard title="Monthly Attendance %" icon={TrendingUp}>
          <div className="an-bar-wrap">
            <BarChart bars={monthlyAttendance} maxValue={maxMonthlyVal} height={130} />
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Projects + Leave Status ── */}
      <div className="an-grid an-grid--2">
        <ChartCard
          title="Project Status"
          icon={FolderKanban}
          pills={
            <>
              <StatPill label="Active" value={projStats.ACTIVE} color={COLORS.active} />
              <StatPill label="Done" value={projStats.COMPLETED} color={COLORS.completed} />
            </>
          }
        >
          <div className="an-chart-row">
            <DonutChart
              slices={projSlices}
              size={150}
              label={{ value: projects.length, text: 'projects' }}
            />
            <Legend items={projSlices} />
          </div>
        </ChartCard>

        <ChartCard
          title="Leave Request Status"
          icon={CalendarOff}
          pills={
            <>
              <StatPill label="Approved" value={leaveStats.byStatus.APPROVED} color={COLORS.approved} />
              <StatPill label="Pending" value={leaveStats.byStatus.PENDING} color={COLORS.pending} />
            </>
          }
        >
          <div className="an-chart-row">
            <DonutChart
              slices={leaveStatusSlices}
              size={150}
              label={{ value: leaves.length, text: 'requests' }}
            />
            <Legend items={leaveStatusSlices} />
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Leave Types + Salary Trend ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="Leave by Type" icon={CalendarOff}>
          <div className="an-bar-wrap">
            <BarChart bars={leaveTypeBars} maxValue={maxLeaveTypeVal} height={120} />
          </div>
        </ChartCard>

        {salaryInfo ? (
          <ChartCard
            title="Salary Trend (Last 6 months)"
            icon={BarChart2}
            pills={
              <StatPill
                label="Total Paid"
                value={`₹${salaryInfo.totalPaid.toLocaleString()}`}
                color="#eef2ff"
              />
            }
          >
            <div className="an-bar-wrap">
              <BarChart bars={salaryBars} maxValue={maxSalaryVal} height={120} />
            </div>
          </ChartCard>
        ) : (
          <ChartCard title="Salary Trend" icon={BarChart2}>
            <div className="an-empty-chart">No salary records available.</div>
          </ChartCard>
        )}
      </div>

      {/* ── Attendance detail table ── */}
      <ChartCard title="Recent Attendance Records" icon={CalendarCheck}>
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 15).map((a, i) => (
                <tr key={a.id ?? i}>
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
                <tr><td colSpan="4" className="an-table__empty">No attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* ── Projects table ── */}
      <ChartCard title="Projects Assigned" icon={FolderKanban}>
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
                <tr><td colSpan="5" className="an-table__empty">No projects assigned.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
