import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LayoutDashboard, Users, CheckSquare, Clock, FolderKanban, Check, X } from 'lucide-react';

const ManagerDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const [leavesRes, projRes, empRes] = await Promise.all([
        api.get('/leaves', { params: { status: 'PENDING' } }),
        api.get('/projects'),
        api.get('/employees'),
      ]);

      if (leavesRes.success) setPendingLeaves(leavesRes.data || []);
      if (projRes.success) setProjects(projRes.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
    } catch (err) {
      console.error('Error fetching manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const handleApproveLeave = async (id) => {
    try {
      await api.patch(`/leaves/${id}/approve`, { comment: 'Approved by Project Manager' });
      setMessage('Leave approved successfully!');
      fetchManagerData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      await api.patch(`/leaves/${id}/reject`, { comment: 'Rejected by Project Manager' });
      setMessage('Leave rejected.');
      fetchManagerData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="title-xl">Project Manager Operations Portal</h1>
        <p className="text-sub">Supervise project deliverables, team capacity, and off-time approvals</p>
      </div>

      {message && (
        <div style={{ padding: '0.85rem', backgroundColor: 'var(--accent-success-soft)', color: 'var(--accent-success)', borderRadius: '8px', border: '1px solid var(--accent-success)', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="ems-card">
          <p className="text-sub">Total Department Staff</p>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{employees.length}</h3>
        </div>
        <div className="ems-card">
          <p className="text-sub">Pending Leave Requests</p>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '2px' }}>
            {pendingLeaves.length}
          </h3>
        </div>
        <div className="ems-card">
          <p className="text-sub">Active Managed Projects</p>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
            {projects.length}
          </h3>
        </div>
      </div>

      {/* Pending Leave Approvals Queue */}
      <div className="ems-card">
        <h3 className="title-md" style={{ marginBottom: '1rem' }}>Pending Leave Approvals Queue</h3>
        {pendingLeaves.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending leave requests requiring review.</p>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.employee?.firstName} {l.employee?.lastName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.employee?.department}</div>
                    </td>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td>{l.totalDays} Days</td>
                    <td style={{ maxWidth: '200px' }}>{l.reason}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button onClick={() => handleApproveLeave(l.id)} className="btn btn-success" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleRejectLeave(l.id)} className="btn btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
