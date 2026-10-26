import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { BarChart3, Users, DollarSign, CalendarDays, Car, FolderKanban, TrendingUp, Download } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/reports/summary");
        if (res.success) setSummary(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading Reports...</div>;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];
  const deptData = summary?.departmentBreakdown
    ? Object.entries(summary.departmentBreakdown).map(([name, count]) => ({ name: name.split(" ")[0], count }))
    : [];

  const attendanceData = [
    { name: "Present", value: summary?.presentToday || 0, color: "#10b981" },
    { name: "Absent", value: Math.max(0, (summary?.totalEmployees || 0) - (summary?.presentToday || 0)), color: "#ef4444" },
  ];

  const projectData = [
    { name: "In Progress", value: summary?.inProgressProjects || 0, color: "#3b82f6" },
    { name: "Completed", value: (summary?.totalProjects || 0) - (summary?.inProgressProjects || 0), color: "#10b981" },
    { name: "Planned", value: 0, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const kpiCards = [
    { label: "Total Employees", value: summary?.totalEmployees || 0, sub: `${summary?.activeEmployees || 0} Active`, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Present Today", value: summary?.presentToday || 0, sub: `${summary?.totalEmployees ? Math.round(((summary?.presentToday || 0) / summary.totalEmployees) * 100) : 0}% rate`, icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Pending Leaves", value: summary?.pendingLeaves || 0, sub: "Awaiting approval", icon: CalendarDays, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Active Projects", value: summary?.inProgressProjects || 0, sub: `${summary?.totalProjects || 0} Total`, icon: FolderKanban, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Available Parking", value: summary?.availableParking || 0, sub: "Open slots", icon: Car, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Monthly Payroll", value: `$${((summary?.totalPayroll || 0) / 1000).toFixed(0)}K`, sub: "Total disbursed", icon: DollarSign, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="title-xl">Reports & Analytics</h1>
          <p className="text-sub">Comprehensive enterprise metrics and data analysis from PostgreSQL</p>
        </div>
        <button className="btn btn-primary" style={{ gap: "0.5rem" }}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        {kpiCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} className="ems-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sub" style={{ fontSize: "0.75rem" }}>{c.label}</p>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>{c.value}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{c.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Headcount by Department</h3>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Today Attendance Distribution</h3>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {attendanceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Project Status Overview</h3>
          <div style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={3}>
                  {projectData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.25rem" }}>System Summary Report</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {[
              ["Database Engine", "PostgreSQL 15+ / JPA Hibernate", "#3b82f6"],
              ["Security Layer", "Spring Security + Stateless JWT", "#10b981"],
              ["Backend", "Spring Boot 3.2 / Java 17", "#8b5cf6"],
              ["Frontend", "React 18 + Vite", "#f59e0b"],
              ["Active Sessions", "Stateless JWT Auth", "#06b6d4"],
              ["DDL Mode", "spring.jpa.hibernate.ddl-auto=update", "#ec4899"],
            ].map(([label, val, c]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 1rem", background: "var(--bg-tertiary)", borderRadius: 8 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: c }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
