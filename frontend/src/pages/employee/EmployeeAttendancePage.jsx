import { useCallback, useEffect, useState } from 'react';
import {
  Clock, LogIn, LogOut, CheckCircle2, Calendar,
  Home, Building, Utensils, Coffee, Cookie, Plus, Trash2,
} from 'lucide-react';
import AttendanceStatusBadge from '../../components/attendance/AttendanceStatusBadge';
import { AttendanceBreaksCell, WorkModeBadge } from '../../components/attendance/AttendanceBreaksCell';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { ATTENDANCE_STATUSES } from '../../constants/attendanceStatus';
import { BREAK_TYPES } from '../../constants/breakTypes';
import {
  addTodayBreak,
  checkInEmployee,
  checkOutEmployee,
  deleteTodayBreak,
  getEmployeeAttendance,
  getEmployeeAttendanceByDate,
  getTodayEmployeeAttendance,
  markEmployeeAttendance,
  updateTodayWorkMode,
} from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiError';
import { formatDate, formatDateTime, formatTime } from '../../utils/formatters';

const BREAK_ICON_MAP = {
  LUNCH: Utensils,
  BREAKFAST: Coffee,
  SNACKS: Cookie,
  TEA_COFFEE: Coffee,
  OTHER: Clock,
};

function EmployeeAttendancePage() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookupDate, setLookupDate] = useState('');
  const [lookupRecord, setLookupRecord] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [form, setForm] = useState({
    date: '',
    status: 'PRESENT',
    workMode: 'OFFICE',
    checkInTime: '',
    checkOutTime: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Check In / Check Out State
  const [todayRecord, setTodayRecord] = useState(null);
  const [selectedWorkMode, setSelectedWorkMode] = useState('OFFICE');
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Break Schedule Form State
  const [breakForm, setBreakForm] = useState({
    breakType: 'LUNCH',
    startTime: '13:00',
    endTime: '14:00',
    notes: '',
  });
  const [breakSubmitting, setBreakSubmitting] = useState(false);
  const [breakFormError, setBreakFormError] = useState('');

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [history, today] = await Promise.all([
        getEmployeeAttendance(),
        getTodayEmployeeAttendance().catch(() => null),
      ]);
      setRecords(history);
      setTodayRecord(today);
      if (today?.workMode) {
        setSelectedWorkMode(today.workMode);
      }
    } catch (loadError) {
      setRecords([]);
      setError(getErrorMessage(loadError, 'Failed to load attendance history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  async function handleCheckIn() {
    setPunchLoading(true);
    try {
      const updated = await checkInEmployee(selectedWorkMode);
      setTodayRecord(updated);
      toast.success(`Check-in recorded (${selectedWorkMode === 'WORK_FROM_HOME' ? 'WFH' : 'Office'})!`);
      await loadAttendance();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to record check-in.'));
    } finally {
      setPunchLoading(false);
    }
  }

  async function handleCheckOut() {
    setPunchLoading(true);
    try {
      const updated = await checkOutEmployee();
      setTodayRecord(updated);
      toast.success('Check-out recorded successfully!');
      await loadAttendance();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to record check-out.'));
    } finally {
      setPunchLoading(false);
    }
  }

  async function handleWorkModeSwitch(mode) {
    setSelectedWorkMode(mode);
    if (todayRecord) {
      try {
        const updated = await updateTodayWorkMode(mode);
        setTodayRecord(updated);
        toast.success(`Today's mode set to ${mode === 'WORK_FROM_HOME' ? 'Work From Home' : 'Office'}`);
        await loadAttendance();
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update work mode.'));
      }
    }
  }

  function handleBreakChange(event) {
    const { name, value } = event.target;
    setBreakForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddBreak(event) {
    event.preventDefault();
    setBreakFormError('');

    if (!breakForm.startTime || !breakForm.endTime) {
      setBreakFormError('Both start time and end time are required.');
      return;
    }

    setBreakSubmitting(true);
    try {
      const payload = {
        breakType: breakForm.breakType,
        startTime: breakForm.startTime,
        endTime: breakForm.endTime,
        notes: breakForm.notes || undefined,
      };

      const updated = await addTodayBreak(payload);
      setTodayRecord(updated);
      toast.success('Break timing logged successfully!');
      setBreakForm({
        breakType: 'SNACKS',
        startTime: '16:30',
        endTime: '17:00',
        notes: '',
      });
      await loadAttendance();
    } catch (err) {
      setBreakFormError(getErrorMessage(err, 'Failed to add break timing.'));
    } finally {
      setBreakSubmitting(false);
    }
  }

  async function handleDeleteBreak(breakId) {
    try {
      const updated = await deleteTodayBreak(breakId);
      setTodayRecord(updated);
      toast.success('Break removed.');
      await loadAttendance();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove break.'));
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleMarkAttendance(event) {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        date: form.date,
        status: form.status,
        workMode: form.workMode,
      };

      if (form.checkInTime) {
        payload.checkIn = `${form.date}T${form.checkInTime}:00`;
      }
      if (form.checkOutTime) {
        payload.checkOut = `${form.date}T${form.checkOutTime}:00`;
      }

      await markEmployeeAttendance(payload);
      toast.success('Attendance marked successfully.');
      setForm({
        date: '',
        status: 'PRESENT',
        workMode: 'OFFICE',
        checkInTime: '',
        checkOutTime: '',
      });
      await loadAttendance();
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Failed to mark attendance.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookup(event) {
    event.preventDefault();

    if (!lookupDate) {
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    setLookupRecord(null);

    try {
      const data = await getEmployeeAttendanceByDate(lookupDate);
      setLookupRecord(data);
    } catch (lookupErr) {
      setLookupRecord(null);
      setLookupError(getErrorMessage(lookupErr, 'No attendance found for this date.'));
    } finally {
      setLookupLoading(false);
    }
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (record) => formatDate(record.date),
    },
    {
      key: 'status',
      header: 'Status',
      render: (record) => <AttendanceStatusBadge status={record.status} />,
    },
    {
      key: 'workMode',
      header: 'Work Mode',
      render: (record) => <WorkModeBadge mode={record.workMode} />,
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (record) => record.checkInTime ?? formatTime(record.checkIn),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (record) => record.checkOutTime ?? formatTime(record.checkOut),
    },
    {
      key: 'totalHours',
      header: 'Total Hours',
      render: (record) => (record.totalHours ? `${record.totalHours} hrs` : '—'),
    },
    {
      key: 'breaks',
      header: 'Break Timings',
      render: (record) => (
        <AttendanceBreaksCell
          breaks={record.breaks}
          employeeName="You"
          date={record.date}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Marked At',
      render: (record) => formatDateTime(record.createdAt),
    },
  ];

  const hasCheckedIn = Boolean(todayRecord?.checkIn);
  const hasCheckedOut = Boolean(todayRecord?.checkOut);
  const isWfhToday = (todayRecord?.workMode ?? selectedWorkMode) === 'WORK_FROM_HOME';
  const todayBreaks = todayRecord?.breaks || [];
  const totalBreakMins = todayRecord?.totalBreakMinutes || 0;

  return (
    <div className="page">
      <PageHeader
        title="My Attendance"
        description="Record check-in/out, declare WFH break timings (lunch, breakfast, snacks), and track history."
      />

      {error ? (
        <Alert variant="error" title="Error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {/* ── Today's Punch Card with Work Mode Toggle ── */}
      <div className="punch-clock-card">
        <div className="punch-clock-card__header">
          <div className="punch-clock-card__meta">
            <span className="punch-clock-card__label">
              <Calendar size={16} />
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="punch-clock-card__time">
              <Clock size={18} />
              {currentTime}
            </span>
          </div>

          <div className="punch-clock-card__badge-row">
            {!hasCheckedIn ? (
              <span className="punch-status-badge punch-status-badge--pending">Not Checked In Today</span>
            ) : !hasCheckedOut ? (
              <span className="punch-status-badge punch-status-badge--active">
                Checked In at {todayRecord.checkInTime ?? formatTime(todayRecord.checkIn)}
              </span>
            ) : (
              <span className="punch-status-badge punch-status-badge--completed">
                <CheckCircle2 size={15} /> Completed Today ({todayRecord.totalHours ? `${todayRecord.totalHours} hrs` : 'Finished'})
              </span>
            )}
            <WorkModeBadge mode={todayRecord?.workMode ?? selectedWorkMode} />
          </div>
        </div>

        <div className="punch-clock-card__actions">
          {/* Mode Switcher */}
          <div className="work-mode-toggle" aria-label="Work mode selector">
            <button
              type="button"
              className={`work-mode-btn ${selectedWorkMode === 'OFFICE' ? 'work-mode-btn--active' : ''}`}
              onClick={() => handleWorkModeSwitch('OFFICE')}
            >
              <Building size={15} /> Office
            </button>
            <button
              type="button"
              className={`work-mode-btn ${selectedWorkMode === 'WORK_FROM_HOME' ? 'work-mode-btn--active' : ''}`}
              onClick={() => handleWorkModeSwitch('WORK_FROM_HOME')}
            >
              <Home size={15} /> WFH
            </button>
          </div>

          {!hasCheckedIn ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheckIn}
              loading={punchLoading}
              className="punch-btn punch-btn--in"
            >
              <LogIn size={20} />
              Check In ({selectedWorkMode === 'WORK_FROM_HOME' ? 'WFH' : 'Office'})
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              variant="warning"
              size="lg"
              onClick={handleCheckOut}
              loading={punchLoading}
              className="punch-btn punch-btn--out"
            >
              <LogOut size={20} />
              Check Out Now
            </Button>
          ) : (
            <div className="punch-summary-chips">
              <div className="punch-chip">
                <span className="punch-chip__label">Check In</span>
                <span className="punch-chip__val">{todayRecord.checkInTime ?? formatTime(todayRecord.checkIn)}</span>
              </div>
              <div className="punch-chip">
                <span className="punch-chip__label">Check Out</span>
                <span className="punch-chip__val">{todayRecord.checkOutTime ?? formatTime(todayRecord.checkOut)}</span>
              </div>
              <div className="punch-chip punch-chip--highlight">
                <span className="punch-chip__label">Total Time</span>
                <span className="punch-chip__val">{todayRecord.totalHours ? `${todayRecord.totalHours} hrs` : '—'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── WFH Break Timings Management Card ── */}
      <div className={`wfh-breaks-panel ${isWfhToday ? 'wfh-breaks-panel--active' : ''}`}>
        <div className="wfh-breaks-panel__header">
          <div className="wfh-breaks-panel__title-box">
            <div className="wfh-breaks-panel__icon">
              <Utensils size={20} />
            </div>
            <div>
              <h3 className="wfh-breaks-panel__title">Work From Home (WFH) Break Timings</h3>
              <p className="wfh-breaks-panel__desc">
                Mention your planned/taken break intervals (lunch, breakfast, snacks) so managers and admins stay informed.
              </p>
            </div>
          </div>
          {totalBreakMins > 0 && (
            <span className="wfh-breaks-total-pill">
              Total Breaks: <strong>{totalBreakMins} mins</strong> ({todayBreaks.length} scheduled)
            </span>
          )}
        </div>

        <div className="wfh-breaks-grid">
          {/* Break submission form */}
          <div className="wfh-break-form-card">
            <h4 className="wfh-card-heading">Add Break Timing</h4>
            <form onSubmit={handleAddBreak} className="wfh-break-form">
              <div className="ui-input">
                <label htmlFor="breakType">Break Type</label>
                <select
                  id="breakType"
                  name="breakType"
                  className="ui-input__field"
                  value={breakForm.breakType}
                  onChange={handleBreakChange}
                  required
                >
                  {BREAK_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="two-col-inputs">
                <Input
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={breakForm.startTime}
                  onChange={handleBreakChange}
                  required
                />
                <Input
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={breakForm.endTime}
                  onChange={handleBreakChange}
                  required
                />
              </div>

              <Input
                label="Note (optional)"
                name="notes"
                placeholder="e.g. Lunch with family, quick tea break..."
                value={breakForm.notes}
                onChange={handleBreakChange}
              />

              {breakFormError ? <p className="form-error">{breakFormError}</p> : null}

              <Button type="submit" size="sm" loading={breakSubmitting} className="wfh-add-break-btn">
                <Plus size={16} /> Add Break Timing
              </Button>
            </form>
          </div>

          {/* List of today's breaks */}
          <div className="wfh-break-list-card">
            <h4 className="wfh-card-heading">
              Today's Scheduled Breaks ({todayBreaks.length})
            </h4>

            {todayBreaks.length === 0 ? (
              <div className="wfh-breaks-empty">
                <Coffee size={32} className="wfh-breaks-empty__icon" />
                <p>No breaks declared for today yet.</p>
                <span>Add your Lunch, Breakfast, or Snacks timing using the form.</span>
              </div>
            ) : (
              <div className="wfh-breaks-cards-list">
                {todayBreaks.map((b) => {
                  const Icon = BREAK_ICON_MAP[b.breakType] || Clock;
                  return (
                    <div key={b.id || b.startTime} className="wfh-break-card">
                      <div className="wfh-break-card__icon">
                        <Icon size={16} />
                      </div>
                      <div className="wfh-break-card__body">
                        <div className="wfh-break-card__title">
                          <strong>{b.breakTypeLabel || b.breakType}</strong>
                          {b.durationMinutes ? (
                            <span className="wfh-break-duration">{b.durationMinutes}m</span>
                          ) : null}
                        </div>
                        <div className="wfh-break-card__time">
                          {b.formattedStartTime || b.startTime} – {b.formattedEndTime || b.endTime}
                        </div>
                        {b.notes ? <div className="wfh-break-card__notes">{b.notes}</div> : null}
                      </div>
                      {b.id && (
                        <button
                          type="button"
                          className="wfh-break-del-btn"
                          title="Remove this break"
                          onClick={() => handleDeleteBreak(b.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <Card title="Mark Manual Attendance" description="Record attendance with work mode and optional times.">
          <form className="stack-form" onSubmit={handleMarkAttendance}>
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
            <div className="two-col-inputs">
              <div className="ui-input">
                <label htmlFor="manual-status">Status</label>
                <select
                  id="manual-status"
                  name="status"
                  className="ui-input__field"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  {ATTENDANCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ui-input">
                <label htmlFor="manual-workMode">Work Mode</label>
                <select
                  id="manual-workMode"
                  name="workMode"
                  className="ui-input__field"
                  value={form.workMode}
                  onChange={handleFormChange}
                  required
                >
                  <option value="OFFICE">Office</option>
                  <option value="WORK_FROM_HOME">Work From Home (WFH)</option>
                </select>
              </div>
            </div>

            <div className="two-col-inputs">
              <Input
                label="Check In Time (optional)"
                name="checkInTime"
                type="time"
                value={form.checkInTime}
                onChange={handleFormChange}
              />
              <Input
                label="Check Out Time (optional)"
                name="checkOutTime"
                type="time"
                value={form.checkOutTime}
                onChange={handleFormChange}
              />
            </div>
            {formError ? <p className="form-error" role="alert">{formError}</p> : null}
            <Button type="submit" loading={submitting}>
              {submitting ? 'Submitting...' : 'Mark Attendance'}
            </Button>
          </form>
        </Card>

        <Card title="Lookup by Date" description="View attendance, work mode, and break timings for any date.">
          <form className="stack-form" onSubmit={handleLookup}>
            <Input
              label="Date"
              name="lookupDate"
              type="date"
              value={lookupDate}
              onChange={(event) => setLookupDate(event.target.value)}
              required
            />
            <Button type="submit" variant="secondary" loading={lookupLoading}>
              {lookupLoading ? 'Searching...' : 'Lookup'}
            </Button>
          </form>
          {lookupError ? (
            <p className="form-error" role="alert" style={{ marginTop: '12px' }}>
              {lookupError}
            </p>
          ) : null}
          {lookupRecord ? (
            <dl className="detail-list lookup-result">
              <div className="detail-list__item">
                <dt>Date</dt>
                <dd>{formatDate(lookupRecord.date)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Status</dt>
                <dd>
                  <AttendanceStatusBadge status={lookupRecord.status} />
                </dd>
              </div>
              <div className="detail-list__item">
                <dt>Work Mode</dt>
                <dd>
                  <WorkModeBadge mode={lookupRecord.workMode} />
                </dd>
              </div>
              <div className="detail-list__item">
                <dt>Check In</dt>
                <dd>{lookupRecord.checkInTime ?? formatTime(lookupRecord.checkIn)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Check Out</dt>
                <dd>{lookupRecord.checkOutTime ?? formatTime(lookupRecord.checkOut)}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Total Hours</dt>
                <dd>{lookupRecord.totalHours ? `${lookupRecord.totalHours} hrs` : '—'}</dd>
              </div>
              <div className="detail-list__item">
                <dt>Breaks</dt>
                <dd>
                  <AttendanceBreaksCell
                    breaks={lookupRecord.breaks}
                    employeeName="You"
                    date={lookupRecord.date}
                  />
                </dd>
              </div>
            </dl>
          ) : null}
        </Card>
      </div>

      {loading ? (
        <LoadingState title="Loading attendance" description="Fetching your attendance history." />
      ) : error && !records.length ? (
        <ErrorState description={error} onRetry={loadAttendance} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          emptyTitle="No attendance records"
          emptyDescription="Mark your attendance or check in to see history here."
        />
      )}
    </div>
  );
}

export default EmployeeAttendancePage;
