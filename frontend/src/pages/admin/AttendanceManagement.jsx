import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Clock, CheckCircle2, Users, TrendingUp, Filter, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [attRes, statsRes] = await Promise.all([
        api.get("/attendance", { params: { date: selectedDate } }),
        api.get("/attendance/stats"),
      ]);
      if (attRes.success) setAttendance(attRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [selectedDate]);

  const statusColor = (s) => {
    if (s === "PRESENT") return "badge-success";
    if (s === "LATE") return "badge-warning";
    if (s === "ABSENT") return "badge-danger";
    return "badge-info";
  };

  const chartData = stats
    ? [
        { label: "Present", count: stats.presentCount || 0, fill: "#10b981" },
        { label: "Late", count: stats.lateCount || 0, fill: "#f59e0b" },
        { label: "Absent", count: Math.max(0, (stats.totalEmployees || 0) - (stats.presentCount || 0) - (stats.lateCount || 0)), fill: "#ef4444" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="title-xl">Attendance Management</h1>
        <p className="text-sub">Monitor daily employee attendance, check-in/out records, and punctuality metrics</p>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {[
            { label: "Present Today", value: stats.presentCount || 0, color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
            { label: "Late Arrivals", value: stats.lateCount || 0, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
            { label: "Total Employees", value: stats.totalEmployees || 0, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: Users },
            { label: "Attendance Rate", value: `${stats.totalEmployees ? Math.round(((stats.presentCount || 0) / stats.totalEmployees) * 100) : 0}%`, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", icon: TrendingUp },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} className="ems-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sub" style={{ fontSize: "0.8rem" }}>{c.label}</p>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: c.color }}>{c.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Today Breakdown</h3>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ems-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Filter size={18} color="var(--text-muted)" />
            <h3 className="title-md">Filter by Date</h3>
          </div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Select Date</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" style={{ marginBottom: "1rem" }} />
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Showing: <strong>{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Records found: <strong style={{ color: "var(--accent-primary)" }}>{attendance.length}</strong>
          </p>
        </div>
      </div>

      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">Attendance Records</h3>
          <span className="badge badge-info">{attendance.length} Records</span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading attendance data...</div>
        ) : attendance.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No attendance records for this date.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.employee?.firstName} {a.employee?.lastName}</strong><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{a.employee?.employeeId}</div></td>
                    <td>{a.employee?.department}</td>
                    <td style={{ fontWeight: 600 }}>{a.checkIn || "—"}</td>
                    <td>{a.checkOut || <span style={{ color: "var(--text-muted)" }}>Not yet</span>}</td>
                    <td><span className={`badge ${statusColor(a.status)}`}>{a.status}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.remarks || "—"}</td>
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

export default AttendanceManagement;
