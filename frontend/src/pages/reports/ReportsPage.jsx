import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Grid, Typography, useTheme } from "@mui/material";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";
import employeeService from "../../services/employeeService";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

const ReportsPage = () => {
  const theme = useTheme();
  const [growth, setGrowth] = useState([]);
  const [deptDist, setDeptDist] = useState([]);
  const [statusBreak, setStatusBreak] = useState([]);
  const chartColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [g, d, s] = await Promise.all([
          employeeService.getEmployeeGrowth(),
          employeeService.getDepartmentDistribution(),
          employeeService.getStatusBreakdown(),
        ]);
        setGrowth(g.data.data);
        setDeptDist(d.data.data);
        setStatusBreak(s.data.data.map(x => ({ name: x.status, value: x.count })));
      } catch {}
    };
    fetch();
  }, []);

  const charts = [
    {
      title: "Employee Growth Trend", subtitle: "Monthly headcount over 6 months",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={growth}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fill: chartColor, fontSize: 12 }} />
            <YAxis tick={{ fill: chartColor, fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
            <Legend />
            <Line type="monotone" dataKey="employees" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} name="Total" />
            <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="New Hires" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Department Distribution", subtitle: "Headcount by department",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deptDist} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fill: chartColor, fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: chartColor, fontSize: 11 }} width={90} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
            <Bar dataKey="value" name="Employees" radius={[0, 6, 6, 0]}>
              {deptDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Status Breakdown", subtitle: "Active vs Inactive vs On Leave",
      chart: (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={statusBreak} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" paddingAngle={4} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
              {statusBreak.map((entry, i) => (
                <Cell key={i} fill={entry.name === "Active" ? "#10b981" : entry.name === "Inactive" ? "#ef4444" : "#f59e0b"} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />
          </PieChart>
        </ResponsiveContainer>
      )
    },
  ];

  return (
    <PageTransition>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Reports & Analytics</Typography>
        <Typography color="text.secondary">Visual insights into employee data</Typography>
      </Box>
      <Grid container spacing={3}>
        {charts.map((c, i) => (
          <Grid item xs={12} lg={i === 0 ? 12 : 6} key={c.title}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700}>{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{c.subtitle}</Typography>
                  {c.chart}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </PageTransition>
  );
};

export default ReportsPage;
