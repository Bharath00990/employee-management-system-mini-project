import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Users, ShieldCheck, ToggleLeft, ToggleRight, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", roles: ["ROLE_EMPLOYEE"] });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      if (res.success) setUsers(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/status`, { active: !currentStatus });
      setMessage({ text: `User ${!currentStatus ? "activated" : "deactivated"} successfully.`, type: "success" });
      fetchUsers();
    } catch (e) {
      setMessage({ text: e.message || "Failed to update status", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", formData);
      setMessage({ text: "User created successfully!", type: "success" });
      setShowForm(false);
      setFormData({ username: "", email: "", password: "", roles: ["ROLE_EMPLOYEE"] });
      fetchUsers();
    } catch (e) {
      setMessage({ text: e.message || "Failed to create user", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const roleColors = {
    ROLE_ADMIN: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    ROLE_MANAGER: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    ROLE_EMPLOYEE: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="title-xl">User & Role Management</h1>
          <p className="text-sub">Manage system user accounts, roles, and access policies</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? "Cancel" : "Create User"}
        </button>
      </div>

      {message.text && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: 8, backgroundColor: message.type === "success" ? "var(--accent-success-soft)" : "var(--accent-danger-soft)", color: message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)", border: `1px solid ${message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)"}`, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <motion.div className="ems-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Create New User</h3>
          <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Username</label>
              <input className="input-field" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required placeholder="e.g. john.doe" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Email</label>
              <input className="input-field" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="user@company.com" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Password</label>
              <input className="input-field" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Min 8 chars" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Role</label>
              <select className="input-field" value={formData.roles[0]} onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}>
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Users", value: users.length, color: "#3b82f6" },
          { label: "Active", value: users.filter(u => u.active).length, color: "#10b981" },
          { label: "Inactive", value: users.filter(u => !u.active).length, color: "#ef4444" },
          { label: "Admins", value: users.filter(u => u.roles?.some(r => r.name === "ROLE_ADMIN")).length, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="ems-card" style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</h3>
            <p className="text-sub" style={{ fontSize: "0.8rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">System User Accounts</h3>
          <span className="badge badge-info">{users.length} Total</span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading users...</div>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Roles</th><th>Status</th><th>Created</th><th>Toggle Active</th></tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleList = u.roles?.map(r => r.name) || [];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--accent-primary-soft)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.username}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {roleList.map((r) => {
                          const rc = roleColors[r] || { color: "#64748b", bg: "rgba(100,116,139,0.1)" };
                          return (
                            <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: 9999, backgroundColor: rc.bg, color: rc.color, fontSize: "0.7rem", fontWeight: 700, marginRight: "4px" }}>
                              <ShieldCheck size={10} /> {r.replace("ROLE_", "")}
                            </span>
                          );
                        })}
                      </td>
                      <td><span className={`badge ${u.active ? "badge-success" : "badge-danger"}`}>{u.active ? "Active" : "Inactive"}</span></td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button onClick={() => handleToggle(u.id, u.active)} style={{ background: "none", border: "none", cursor: "pointer", color: u.active ? "#10b981" : "#94a3b8" }}>
                          {u.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
