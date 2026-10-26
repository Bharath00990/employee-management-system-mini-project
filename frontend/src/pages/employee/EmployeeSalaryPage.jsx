import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EmployeeSalaryPage = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/salaries/my").then(res => { if (res.success) setSalaries(res.data || []); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const latest = salaries[0];
  const chartData = salaries.slice(0, 6).reverse().map(s => ({ month: `${s.month?.substring(0, 3)} ${s.year}`, netPay: s.netPay, basicPay: s.basicPay }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="title-xl">Payslips & Salary History</h1>
        <p className="text-sub">View your salary breakdown, allowances, deductions, and payment history</p>
      </div>

      {latest && (
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "#fff", padding: "2rem", borderRadius: "var(--radius-xl)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.8rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>Latest Payslip — {latest.month} {latest.year}</p>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: 4 }}>${latest.netPay?.toLocaleString()}</h2>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>Net Pay Disbursed • Status: <strong>{latest.paymentStatus}</strong></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>Basic: <strong>${latest.basicPay?.toLocaleString()}</strong></div>
            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>Allowances: <strong style={{ color: "#86efac" }}>+${latest.allowances?.toLocaleString()}</strong></div>
            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>Deductions: <strong style={{ color: "#fca5a5" }}>-${latest.deductions?.toLocaleString()}</strong></div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="ems-card">
          <h3 className="title-md" style={{ marginBottom: "1.5rem" }}>Salary Trend (Last 6 Months)</h3>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                <Tooltip formatter={(v) => `$${v?.toLocaleString()}`} contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Bar dataKey="basicPay" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Basic Pay" />
                <Bar dataKey="netPay" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Pay" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="ems-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 className="title-md">Payslip History</h3>
          <span className="badge badge-info">{salaries.length} Records</span>
        </div>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : salaries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <DollarSign size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
            <p>No salary records available yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="ems-table">
              <thead><tr><th>Period</th><th>Basic Pay</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.month} {s.year}</strong></td>
                    <td>${s.basicPay?.toLocaleString()}</td>
                    <td style={{ color: "var(--accent-success)" }}>+${s.allowances?.toLocaleString()}</td>
                    <td style={{ color: "var(--accent-danger)" }}>-${s.deductions?.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: "var(--accent-success)", fontSize: "1rem" }}>${s.netPay?.toLocaleString()}</td>
                    <td><span className={`badge ${s.paymentStatus === "PAID" ? "badge-success" : "badge-warning"}`}>{s.paymentStatus}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.remarks || "—"}</td>
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

export default EmployeeSalaryPage;
