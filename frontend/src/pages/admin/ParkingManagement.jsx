import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Car, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const ParkingManagement = () => {
  const [slots, setSlots] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotRes, allocRes] = await Promise.all([
        api.get('/parking/slots'),
        api.get('/parking/allocations'),
      ]);
      if (slotRes.success) setSlots(slotRes.data || []);
      if (allocRes.success) setAllocations(allocRes.data || []);
    } catch (err) {
      console.error('Error fetching parking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/parking/allocations/${id}/approve`);
      setMessage('Parking slot approved and allocated successfully!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleRelease = async (id) => {
    try {
      await api.patch(`/parking/allocations/${id}/release`);
      setMessage('Parking slot released and available for booking.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="title-xl">Parking Facility Management</h1>
        <p className="text-sub">Real-time slot occupancy visualization and employee allocation requests</p>
      </div>

      {message && (
        <div style={{ padding: '0.85rem', backgroundColor: 'var(--accent-success-soft)', color: 'var(--accent-success)', borderRadius: '8px', border: '1px solid var(--accent-success)', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {/* Visual Parking Lot Matrix */}
      <div className="ems-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 className="title-md">Corporate Parking Lot Matrix (Ground & Basement)</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-success)' }} />
              Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-warning)' }} />
              Reserved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-danger)' }} />
              Occupied
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
        }}>
          {slots.map((slot) => {
            const isAvail = slot.status === 'AVAILABLE';
            const isRes = slot.status === 'RESERVED';
            const isOcc = slot.status === 'OCCUPIED';

            return (
              <div
                key={slot.id}
                style={{
                  border: `2px dashed ${isAvail ? 'var(--accent-success)' : isRes ? 'var(--accent-warning)' : 'var(--accent-danger)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: isAvail ? 'var(--accent-success-soft)' : isRes ? 'var(--accent-warning-soft)' : 'var(--accent-danger-soft)',
                }}
              >
                <Car size={24} color={isAvail ? 'var(--accent-success)' : isRes ? 'var(--accent-warning)' : 'var(--accent-danger)'} />
                <strong style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{slot.slotNumber}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{slot.floor}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isAvail ? 'var(--accent-success)' : isRes ? 'var(--accent-warning)' : 'var(--accent-danger)'
                }}>
                  {slot.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requests & Allocations Table */}
      <div className="table-container">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1rem' }}>
          Parking Request Queue & Active Allocations
        </div>
        <table className="ems-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Employee</th>
              <th>Vehicle Number</th>
              <th>Type</th>
              <th>Request Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocations.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No parking requests recorded.</td></tr>
            ) : (
              allocations.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.slot?.slotNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.employee?.firstName} {a.employee?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.employee?.employeeId}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.vehicleNumber}</td>
                  <td>{a.vehicleType}</td>
                  <td>{a.requestDate}</td>
                  <td>
                    <span className={`badge ${a.status === 'ALLOCATED' ? 'badge-success' : a.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {a.status === 'PENDING' && (
                      <button onClick={() => handleApprove(a.id)} className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                        Approve & Allocate
                      </button>
                    )}
                    {a.status === 'ALLOCATED' && (
                      <button onClick={() => handleRelease(a.id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                        Release Slot
                      </button>
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

export default ParkingManagement;
