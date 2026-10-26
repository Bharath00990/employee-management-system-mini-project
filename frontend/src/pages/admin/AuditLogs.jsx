import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldCheck, User, Clock, Terminal } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit-logs');
        if (res.success) setLogs(res.data || []);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="title-xl">System Audit Logs & Security History</h1>
        <p className="text-sub">Immutable audit trail of authentication events, approvals, and employee operations</p>
      </div>

      <div className="table-container">
        <table className="ems-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Triggered By</th>
              <th>Target Entity</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading audit logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No audit logs recorded yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <span className="badge badge-purple">{log.action}</span>
                  </td>
                  <td>
                    <strong>{log.username}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.userRole || 'USER'}</div>
                  </td>
                  <td>{log.entityName} {log.entityId ? `#${log.entityId}` : ''}</td>
                  <td style={{ maxWidth: '300px', fontSize: '0.82rem' }}>{log.details}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '0:0:0:0'}
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

export default AuditLogs;
