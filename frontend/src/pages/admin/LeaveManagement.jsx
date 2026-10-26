import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarDays, Check, X, Clock, Filter, AlertCircle, CheckCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves', { params: { status: statusFilter || undefined } });
      if (res.success) {
        setLeaves(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleAction = async (id, action) => {
    setActionMessage({ text: '', type: '' });
    try {
      if (action === 'approve') {
        await api.patch(`/leaves/${id}/approve`, { comment: 'Approved through Manager Portal' });
        setActionMessage({ text: 'Leave request approved successfully.', type: 'success' });
      } else {
        const comment = prompt('Provide rejection reason (optional):');
        await api.patch(`/leaves/${id}/reject`, { comment: comment || 'Declined due to scheduling constraints' });
        setActionMessage({ text: 'Leave request rejected.', type: 'success' });
      }
      fetchLeaves();
    } catch (err) {
      setActionMessage({ text: err.message || 'Operation failed', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="title-xl">Leave Requests & Approvals</h1>
        <p className="text-sub">Review employee leave applications and allocate off-time</p>
      </div>

      {actionMessage.text && (
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: actionMessage.type === 'success' ? 'var(--accent-success-soft)' : 'var(--accent-danger-soft)',
          color: actionMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${actionMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          {actionMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter */}
      <div className="ems-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Status:</span>
        <select 
          className="input-field" 
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Applications</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="ems-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading leaves...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No leave records found.</td></tr>
            ) : (
              leaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.employee?.firstName} {l.employee?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.employee?.employeeId} • {l.employee?.department}</div>
                  </td>
                  <td><span className="badge badge-purple">{l.leaveType}</span></td>
                  <td>{l.startDate} to {l.endDate}</td>
                  <td><strong>{l.totalDays}</strong> Days</td>
                  <td style={{ maxWidth: '240px' }}>{l.reason}</td>
                  <td>
                    <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {l.status === 'PENDING' ? (
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleAction(l.id, 'approve')} 
                          className="btn btn-success" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(l.id, 'reject')} 
                          className="btn btn-danger" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement;
