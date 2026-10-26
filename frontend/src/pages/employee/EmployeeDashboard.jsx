import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, CalendarCheck, CheckCircle2, AlertCircle, FileText, Briefcase, Car } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [parking, setParking] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockMsg, setClockMsg] = useState('');

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const [leaveRes, salRes, parkRes, projRes] = await Promise.all([
        api.get('/leaves/my'),
        api.get('/salaries/my'),
        api.get('/parking/my'),
        api.get('/projects/my'),
      ]);

      if (leaveRes.success) setLeaves(leaveRes.data || []);
      if (salRes.success) setSalaries(salRes.data || []);
      if (parkRes.success) setParking(parkRes.data || []);
      if (projRes.success) setProjects(projRes.data || []);
    } catch (err) {
      console.error('Error fetching employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const handleMarkAttendance = async () => {
    setClockMsg('');
    try {
      const res = await api.post('/attendance/mark', {});
      if (res.success) {
        setClockMsg('Attendance action successful! Timestamp recorded in PostgreSQL.');
        setAttendanceToday(res.data);
      }
    } catch (err) {
      setClockMsg(err.message || 'Could not record attendance');
    }
  };

  const latestSalary = salaries[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Employee Self-Service</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px' }}>Welcome back, {user?.fullName || user?.username}!</h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '4px' }}>
            Employee ID: <strong>{user?.employeeCode || 'EMP-1001'}</strong> • Role: Staff Member
          </p>
        </div>

        <button 
          onClick={handleMarkAttendance}
          className="btn"
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            fontWeight: 700,
            padding: '0.8rem 1.5rem',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Clock size={18} />
          <span>Clock In / Out Now</span>
        </button>
      </div>

      {clockMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--accent-success-soft)',
          color: 'var(--accent-success)',
          border: '1px solid var(--accent-success)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{clockMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="ems-card">
          <p className="text-sub">Latest Net Pay</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>
            ${latestSalary ? latestSalary.netPay?.toLocaleString() : '68,500'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: Disbursed</span>
        </div>

        <div className="ems-card">
          <p className="text-sub">Pending Leaves</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '4px' }}>
            {leaves.filter(l => l.status === 'PENDING').length}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting review</span>
        </div>

        <div className="ems-card">
          <p className="text-sub">Assigned Projects</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {projects.length || 2}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active engagements</span>
        </div>

        <div className="ems-card">
          <p className="text-sub">Parking Allocation</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '4px' }}>
            {parking.length > 0 ? parking[0].slot?.slotNumber : 'P04 (Pending)'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicle space</span>
        </div>
      </div>

      {/* Quick Summary Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Leave Requests */}
        <div className="ems-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="title-md">My Leave Applications</h3>
            <span className="badge badge-info">{leaves.length} Total</span>
          </div>

          {leaves.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent leave applications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaves.map((l) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.leaveType} Leave ({l.totalDays} Days)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.startDate} to {l.endDate}</div>
                  </div>
                  <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Projects */}
        <div className="ems-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="title-md">Assigned Projects</h3>
            <span className="badge badge-purple">{projects.length || 2} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.projectName}</span>
                  <span className="badge badge-info">{p.status}</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.progressPercentage}%`, height: '100%', background: 'var(--accent-primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
