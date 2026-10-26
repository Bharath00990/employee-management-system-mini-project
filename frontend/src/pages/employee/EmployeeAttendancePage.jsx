import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

const EmployeeAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockMsg, setClockMsg] = useState({ text: "", type: "" });
  const [clocking, setClocking] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await api.get("/attendance/my");
      if (res.success) setRecords(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleClock = async () => {
    setClocking(true);
    setClockMsg({ text: "", type: "" });
    try {
      const res = await api.post("/attendance/mark", {});
      if (res.success) {
        setClockMsg({ text: "Attendance recorded successfully! Timestamp stored in PostgreSQL.", type: "success" });
        fetchRecords();
      }
    } catch (e) {
      setClockMsg({ text: e.message || "Failed to record attendance", type: "error" });
    } finally {
      setClocking(false);
    }
  };

  const statusColor = (s) => {
    if (s === "PRESENT") return "badge-success";
    if (s === "LATE") return "badge-warning";
    return "badge-danger";
  };

  const presentCount = records.filter(r => r.status === "PRESENT").length;
  const lateCount = records.filter(r => r.status === "LATE").length;
  const avgHours = records.filter(r => r.checkIn && r.checkOut).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="title-xl">My Attendance</h1>
        <p className="text-sub">Clock in/out and review your personal attendance records</p>
      </div>

      {/* Clock In/Out Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", color: "#fff", padding: "2rem", borderRadius: "var(--radius-xl)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "0.8rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>Today</p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h2>
          <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: 4 }}>Current Time: {new Date().toLocaleTimeString()}</p>
        </div>
        <button onClick={handleClock} disabled={clocking} className="btn" style={{ backgroundColor: "#fff", color: "#1e3a8a", fontWeight: 700, padding: "0.85rem 1.75rem" }}>
          <Clock size={18} />
          {clocking ? "Recording..." : "Clock In / Clock Out"}
        </button>
      </div>

      {clockMsg.text && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: 8, backgroundColor: clockMsg.type === "success" ? "var(--accent-success-soft)" : "var(--accent-danger-soft)", color: clockMsg.type === "success" ? "var(--accent-success)" : "var(--accent-danger)", border: `1px solid ${clockMsg.type === "success" ? "var(--accent-success)" : "var(--accent-danger)"}`, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          {clockMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {clockMsg.text}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Records", value: records.length, color: "#3b82f6" },
          { label: "Present Days", value: presentCount, color: "#10b981" },
          { label: "Late Arrivals", value: lateCount, color: "#f59e0b" },
          { label: "Full Days", value: avgHours, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="ems-card" style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</h3>
            <p className="text-sub" style={{ fontSize: "0.8rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">Attendance History</h3>
          <span className="badge badge-info">{records.length} Records</span>
        </div>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No attendance records yet. Use the Clock In button to start!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead><tr><th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{r.date ? new Date(r.date).toLocaleDateString("en-US", { weekday: "long" }) : "—"}</td>
                    <td>{r.checkIn || "—"}</td>
                    <td>{r.checkOut || <span style={{ color: "var(--text-muted)" }}>Not checked out</span>}</td>
                    <td><span className={`badge ${statusColor(r.status)}`}>{r.status}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.remarks || "—"}</td>
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

export default EmployeeAttendancePage;
