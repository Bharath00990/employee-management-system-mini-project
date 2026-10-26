import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, CheckCircle2, TrendingUp, Download, Plus } from 'lucide-react';

const PayrollManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPayroll: 0, activeEmployeesCount: 0 });

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const [salRes, statRes] = await Promise.all([
        api.get('/salaries'),
        api.get('/salaries/stats'),
      ]);
      if (salRes.success) setSalaries(salRes.data || []);
      if (statRes.success) setStats(statRes.data || { totalPayroll: 0, activeEmployeesCount: 0 });
    } catch (err) {
      console.error('Error fetching payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="title-xl">Payroll & Compensation</h1>
        <p className="text-sub">Manage salary structures, deductions, allowances, and PostgreSQL pay slips</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="ems-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', color: 'var(--accent-primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sub">Total Disbursed Payroll</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>${(stats.totalPayroll || 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="ems-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sub">Active Payroll Records</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{salaries.length} Employees</h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="ems-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Period</th>
              <th>Basic Pay</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Disbursed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading payroll records...</td></tr>
            ) : salaries.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payroll records found.</td></tr>
            ) : (
              salaries.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.employee?.employeeId}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.employee?.firstName} {s.employee?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.employee?.department}</div>
                  </td>
                  <td>{s.month} {s.year}</td>
                  <td>${(s.basicPay || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-success)' }}>+${(s.allowances || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--accent-danger)' }}>-${(s.deductions || 0).toLocaleString()}</td>
                  <td>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                      ${(s.netPay || 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-success">{s.paymentStatus}</span>
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

export default PayrollManagement;
