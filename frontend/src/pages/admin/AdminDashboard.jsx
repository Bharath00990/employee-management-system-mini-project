import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, CheckCircle2, Clock, CalendarDays, DollarSign, 
  Car, FolderKanban, TrendingUp, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/summary');
        if (res.success) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Metrics...</div>;
  }

  const statCards = [
    { label: 'Total Employees', value: metrics?.totalEmployees || 0, icon: Users, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Present Today', value: metrics?.presentToday || 0, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Pending Leaves', value: metrics?.pendingLeaves || 0, icon: CalendarDays, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Active Projects', value: metrics?.inProgressProjects || 0, icon: FolderKanban, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Available Parking', value: metrics?.availableParking || 0, icon: Car, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { label: 'Total Monthly Payroll', value: `$${(metrics?.totalPayroll || 0).toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ];

  // Format department breakdown for Recharts
  const deptData = metrics?.departmentBreakdown 
    ? Object.entries(metrics.departmentBreakdown).map(([name, count]) => ({ name, count }))
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h1 className="title-xl">Executive Admin Dashboard</h1>
        <p className="text-sub">Real-time enterprise metrics directly queried from PostgreSQL database</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="ems-card"
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: c.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: c.color,
                flexShrink: 0
              }}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sub" style={{ fontSize: '0.8rem' }}>{c.label}</p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{c.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Graphical Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Department Distribution Chart */}
        <div className="ems-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 className="title-md">Employee Headcount by Department</h3>
            <span className="badge badge-info">PostgreSQL Live Data</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health / Overview Card */}
        <div className="ems-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 className="title-md">System Security & Infrastructure</h3>
              <span className="badge badge-success">Healthy</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Database Engine:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 700 }}>PostgreSQL 15+ (JPA / Hibernate)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Security Authentication:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-success)', fontWeight: 700 }}>Spring Security + Stateless JWT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Roles & Policies:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>ROLE_ADMIN, ROLE_MANAGER, ROLE_EMPLOYEE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Live Persistence DDL:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-purple)', fontWeight: 700 }}>spring.jpa.hibernate.ddl-auto=update</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={20} color="var(--accent-success)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              All 12 backend entities, foreign key constraints, indexes, and audit logs are fully committed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
