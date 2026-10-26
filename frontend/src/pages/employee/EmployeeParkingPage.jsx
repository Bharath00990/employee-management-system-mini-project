import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Car, MapPin, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const EmployeeParkingPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ slotId: "", vehicleNumber: "", vehicleType: "4-Wheeler (Car)" });
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchData = async () => {
    try {
      const [myRes, slotsRes] = await Promise.all([api.get("/parking/my"), api.get("/parking/slots")]);
      if (myRes.success) setAllocations(myRes.data || []);
      if (slotsRes.success) setSlots(slotsRes.data?.filter(s => s.status === "AVAILABLE") || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post("/parking/request", { slotId: parseInt(formData.slotId), vehicleNumber: formData.vehicleNumber, vehicleType: formData.vehicleType });
      setMessage({ text: "Parking request submitted! Awaiting admin approval.", type: "success" });
      setShowForm(false);
      setFormData({ slotId: "", vehicleNumber: "", vehicleType: "4-Wheeler (Car)" });
      fetchData();
    } catch (e) {
      setMessage({ text: e.message || "Failed to request parking", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const statusColor = (s) => {
    if (s === "ALLOCATED") return "badge-success";
    if (s === "PENDING") return "badge-warning";
    if (s === "RELEASED") return "badge-info";
    return "badge-danger";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="title-xl">Parking Management</h1>
          <p className="text-sub">Request parking slots and track your vehicle allocations</p>
        </div>
        {allocations.filter(a => a.status === "ALLOCATED" || a.status === "PENDING").length === 0 && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> {showForm ? "Cancel" : "Request Parking"}
          </button>
        )}
      </div>

      {message.text && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: 8, backgroundColor: message.type === "success" ? "var(--accent-success-soft)" : "var(--accent-danger-soft)", color: message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)", border: `1px solid ${message.type === "success" ? "var(--accent-success)" : "var(--accent-danger)"}`, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <motion.div className="ems-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Request Parking Slot</h3>
          <form onSubmit={handleRequest} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Available Slot</label>
              <select className="input-field" value={formData.slotId} onChange={(e) => setFormData({ ...formData, slotId: e.target.value })} required>
                <option value="">— Select Slot —</option>
                {slots.map(s => <option key={s.id} value={s.id}>{s.slotNumber} ({s.floor})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Vehicle Type</label>
              <select className="input-field" value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
                <option>4-Wheeler (Car)</option>
                <option>2-Wheeler (Bike)</option>
                <option>EV (Electric Vehicle)</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Vehicle Number</label>
              <input className="input-field" placeholder="e.g. KA-01-AB-1234" value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} required />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Request</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Available Slots Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {[
          { label: "My Allocations", value: allocations.length, color: "#3b82f6" },
          { label: "Currently Allocated", value: allocations.filter(a => a.status === "ALLOCATED").length, color: "#10b981" },
          { label: "Pending Requests", value: allocations.filter(a => a.status === "PENDING").length, color: "#f59e0b" },
          { label: "Available Slots", value: slots.length, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="ems-card" style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</h3>
            <p className="text-sub" style={{ fontSize: "0.8rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">My Parking Allocations</h3>
          <span className="badge badge-info">{allocations.length} Records</span>
        </div>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : allocations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <Car size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No parking allocations. Request a slot to get started!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead><tr><th>Slot</th><th>Floor</th><th>Vehicle</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id}>
                    <td><strong style={{ fontSize: "1rem" }}>{a.slot?.slotNumber}</strong></td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{a.slot?.floor}</td>
                    <td><strong>{a.vehicleNumber}</strong></td>
                    <td>{a.vehicleType}</td>
                    <td><span className={`badge ${statusColor(a.status)}`}>{a.status}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.allocatedDate || a.requestDate}</td>
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

export default EmployeeParkingPage;
