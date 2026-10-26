import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { CalendarDays, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const EmployeeLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({ leaveType: "ANNUAL", startDate: "", endDate: "", reason: "" });

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves/my");
      if (res.success) setLeaves(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      await api.post("/leaves", formData);
      setMessage({ text: "Leave application submitted successfully! Awaiting manager approval.", type: "success" });
      setShowForm(false);
      setFormData({ leaveType: "ANNUAL", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      setMessage({ text: err.message || "Failed to submit leave request", type: "error" });
    } finally {
      setSubmitting(false);
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const pendingCount = leaves.filter(l => l.status === "PENDING").length;
  const approvedCount = leaves.filter(l => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter(l => l.status === "REJECTED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="title-xl">My Leave Applications</h1>
          <p className="text-sub">Apply for leave, track approvals, and manage your time off</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? "Cancel" : "Apply for Leave"}
        </button>
      </div>

      {message.text && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: 8, backgroundColor: message.type === "success" ? "var(--accent-success-soft)" : "var(--accent-danger-soft)", color: message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)", border: `1px solid ${message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)"}`, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <motion.div className="ems-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>New Leave Application</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Leave Type</label>
              <select className="input-field" value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
            <div />
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Start Date</label>
              <input type="date" className="input-field" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>End Date</label>
              <input type="date" className="input-field" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required min={formData.startDate || new Date().toISOString().split("T")[0]} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Reason</label>
              <textarea className="input-field" rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Describe reason for your leave request..." required style={{ resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? "Submitting..." : "Submit Application"}</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Applications", value: leaves.length, color: "#3b82f6" },
          { label: "Pending Review", value: pendingCount, color: "#f59e0b" },
          { label: "Approved", value: approvedCount, color: "#10b981" },
          { label: "Rejected", value: rejectedCount, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="ems-card" style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</h3>
            <p className="text-sub" style={{ fontSize: "0.8rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Leave History */}
      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">Leave History</h3>
          <span className="badge badge-info">{leaves.length} Applications</span>
        </div>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <CalendarDays size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No leave applications yet. Apply for your first leave!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {leaves.map((l) => (
              <div key={l.id} style={{ padding: "1rem 1.25rem", border: "1px solid var(--border-color)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{l.leaveType} Leave</span>
                    <span className={`badge ${l.status === "APPROVED" ? "badge-success" : l.status === "PENDING" ? "badge-warning" : "badge-danger"}`}>{l.status}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>{l.startDate} to {l.endDate} • {l.totalDays} Day(s)</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>{l.reason}</p>
                </div>
                {l.reviewComment && (
                  <div style={{ maxWidth: "240px", padding: "0.5rem 0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: 8, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <strong>Review:</strong> {l.reviewComment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeavePage;
