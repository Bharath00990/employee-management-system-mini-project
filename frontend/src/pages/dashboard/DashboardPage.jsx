import React, { useState, useEffect } from "react";
import { Grid, Typography, Box, Card, CardContent, useTheme } from "@mui/material";
import { People, CheckCircle, Business, PersonAdd } from "@mui/icons-material";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import StatCard from "../../components/common/StatCard";
import PageTransition from "../../components/common/PageTransition";
import { StatCardSkeleton } from "../../components/common/SkeletonLoader";
import employeeService from "../../services/employeeService";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

const FALLBACK_GROWTH = [
  { month: "Apr", employees: 8, new: 2 }, { month: "May", employees: 10, new: 2 },
  { month: "Jun", employees: 11, new: 1 }, { month: "Jul", employees: 12, new: 1 },
  { month: "Aug", employees: 13, new: 1 }, { month: "Sep", employees: 15, new: 2 },
];

const FALLBACK_DEPT = [
  { name: "Engineering", value: 5 }, { name: "HR", value: 2 },
  { name: "Finance", value: 2 }, { name: "Marketing", value: 2 }, { name: "Sales", value: 2 },
  { name: "Design", value: 1 }, { name: "Operations", value: 1 },
];

const FALLBACK_STATUS = [
  { status: "Active", count: 13 }, { status: "Inactive", count: 1 }, { status: "On Leave", count: 1 },
];

const DashboardPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [statusBreak, setStatusBreak] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, g, d, sb] = await Promise.all([
          employeeService.getDashboardStats(),
          employeeService.getEmployeeGrowth(),
          employeeService.getDepartmentDistribution(),
          employeeService.getStatusBreakdown(),
        ]);
        setStats(s.data.data);
        setGrowth(g.data.data?.length ? g.data.data : FALLBACK_GROWTH);
        setDeptDist(d.data.data?.length ? d.data.data : FALLBACK_DEPT);
        setStatusBreak(sb.data.data?.length
          ? sb.data.data.map(s => ({ status: s.status, count: s.count }))
          : FALLBACK_STATUS);
      } catch {
        setStats({ totalEmployees: 15, activeEmployees: 13, departments: 7, newEmployees: 3, totalChange: 8, activePercentage: 86 });
        setGrowth(FALLBACK_GROWTH);
        setDeptDist(FALLBACK_DEPT);
        setStatusBreak(FALLBACK_STATUS);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const chartColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;

  return (
    <PageTransition>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
        <Typography color="text.secondary">Employee Management Overview</Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          [0,1,2,3].map(i => <Grid item xs={12} sm={6} lg={3} key={i}><StatCardSkeleton /></Grid>)
        ) : (
          <>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Total Employees" value={stats?.totalEmployees} subtitle="All registered employees" icon={<People />} color="#6366f1" change={stats?.totalChange} index={0} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Active Employees" value={stats?.activeEmployees} subtitle={`${stats?.activePercentage}% active rate`} icon={<CheckCircle />} color="#10b981" index={1} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Departments" value={stats?.departments} subtitle="Across all teams" icon={<Business />} color="#f59e0b" index={2} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="New This Month" value={stats?.newEmployees} subtitle="Recently joined" icon={<PersonAdd />} color="#ec4899" index={3} /></Grid>
          </>
        )}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: "100%", p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>Employee Growth</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>Cumulative headcount over the last 6 months</Typography>
                <ResponsiveContainer width="100%" height="75%">
                  <LineChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" tick={{ fill: chartColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: chartColor, fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
                    <Legend />
                    <Line type="monotone" dataKey="employees" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1" }} name="Total Employees" />
                    <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="New Hires" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: "100%", p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>By Department</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>Distribution across teams</Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={deptDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                      {deptDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
                    <Legend formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Status Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card sx={{ height: 300 }}>
              <CardContent sx={{ height: "100%", p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>Employee Status</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>Active vs Inactive vs On Leave</Typography>
                <ResponsiveContainer width="100%" height="75%">
                  <BarChart data={statusBreak} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="status" tick={{ fill: chartColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: chartColor, fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
                    <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]}>
                      {statusBreak.map((entry, i) => (
                        <Cell key={i} fill={entry.status === "Active" ? "#10b981" : entry.status === "Inactive" ? "#ef4444" : "#f59e0b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card sx={{ height: 300 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Quick Stats</Typography>
                {deptDist.slice(0, 5).map((dept, i) => {
                  const total = deptDist.reduce((s, d) => s + d.value, 0);
                  const pct = ((dept.value / total) * 100).toFixed(0);
                  return (
                    <Box key={dept.name} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{dept.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{dept.value} ({pct}%)</Typography>
                      </Box>
                      <Box sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                          style={{ height: "100%", borderRadius: 12, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </PageTransition>
  );
};

export default DashboardPage;
