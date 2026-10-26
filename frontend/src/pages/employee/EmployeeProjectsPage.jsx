import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { FolderKanban, Calendar, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

const EmployeeProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects/my").then(res => { if (res.success) setProjects(res.data || []); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusColors = {
    IN_PROGRESS: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "In Progress" },
    COMPLETED: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Completed" },
    PLANNED: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Planned" },
    ON_HOLD: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "On Hold" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="title-xl">My Assigned Projects</h1>
        <p className="text-sub">View projects you are assigned to and track their progress</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Projects", value: projects.length, color: "#3b82f6" },
          { label: "In Progress", value: projects.filter(p => p.status === "IN_PROGRESS").length, color: "#f59e0b" },
          { label: "Completed", value: projects.filter(p => p.status === "COMPLETED").length, color: "#10b981" },
          { label: "Avg Progress", value: `${projects.length ? Math.round(projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / projects.length) : 0}%`, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="ems-card" style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</h3>
            <p className="text-sub" style={{ fontSize: "0.8rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="ems-card" style={{ textAlign: "center", padding: "3rem" }}>
          <FolderKanban size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <h3 style={{ marginBottom: "0.5rem" }}>No Projects Assigned</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>You have not been assigned to any projects yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "1.5rem" }}>
          {projects.map((p, i) => {
            const sc = statusColors[p.status] || statusColors.PLANNED;
            return (
              <motion.div key={p.id} className="ems-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>{p.projectName}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.description?.substring(0, 80)}...</p>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 9999, backgroundColor: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, flexShrink: 0, marginLeft: "0.75rem" }}>
                    {sc.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Progress</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: sc.color }}>{p.progressPercentage}%</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-tertiary)", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progressPercentage}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} style={{ height: "100%", background: sc.color, borderRadius: 4 }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} /> Start: {p.startDate}
                  </div>
                  {p.endDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <TrendingUp size={13} /> End: {p.endDate}
                    </div>
                  )}
                  {p.projectManager && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={13} /> PM: {p.projectManager.firstName}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeProjectsPage;
