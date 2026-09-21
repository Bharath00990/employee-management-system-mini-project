import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Grid, Typography, Avatar, Chip, Button,
  Divider, CircularProgress, Alert, Stack, Paper,
} from "@mui/material";
import { ArrowBack, Edit, Email, Phone, Business, Work, CalendarToday, LocationOn, AttachMoney, Badge } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";
import employeeService from "../../services/employeeService";
import { formatDate, formatSalary, getInitials, getStatusColor, getDeptColor } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 1.5 }}>
    <Box sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>{label}</Typography>
      <Typography variant="body1" fontWeight={600}>{value || "N/A"}</Typography>
    </Box>
  </Box>
);

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await employeeService.getOne(id);
        setEmployee(res.data.data);
      } catch { setError("Employee not found"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!employee) return null;

  return (
    <PageTransition>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/employees")} variant="outlined" size="small">Back to Employees</Button>
        {isAdmin && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/employees/edit/${employee._id}`)}>Edit Employee</Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Avatar
                    src={employee.profileImage}
                    sx={{ width: 100, height: 100, fontSize: 32, fontWeight: 700, mx: "auto",
                      bgcolor: getDeptColor(employee.department), border: 4, borderColor: "background.paper",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    }}
                  >
                    {!employee.profileImage && getInitials(employee.firstName, employee.lastName)}
                  </Avatar>
                </Box>
                <Typography variant="h5" fontWeight={800} mb={0.5}>{employee.firstName} {employee.lastName}</Typography>
                <Typography color="text.secondary" mb={2}>{employee.position}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                  <Chip label={employee.status} color={getStatusColor(employee.status)} fontWeight={700} />
                  <Chip label={employee.department} variant="outlined" sx={{ fontWeight: 700 }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" fontFamily="monospace" sx={{ bgcolor: "action.hover", px: 2, py: 0.5, borderRadius: 2, display: "inline-block" }}>
                  {employee.employeeId}
                </Typography>
              </CardContent>
            </Card>

            {/* Salary Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Paper sx={{ mt: 2, p: 3, borderRadius: 3, background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "white" }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Annual Salary</Typography>
                <Typography variant="h4" fontWeight={800} mt={0.5}>{formatSalary(employee.salary)}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>As of {formatDate(employee.joiningDate)}</Typography>
              </Paper>
            </motion.div>
          </motion.div>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>Contact Information</Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow icon={<Email />} label="Email" value={employee.email} />
                <InfoRow icon={<Phone />} label="Phone" value={employee.phone} />
                <InfoRow icon={<LocationOn />} label="Address" value={employee.address} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>Employment Details</Typography>
                <Divider sx={{ mb: 1 }} />
                <Grid container>
                  <Grid item xs={12} sm={6}><InfoRow icon={<Business />} label="Department" value={employee.department} /></Grid>
                  <Grid item xs={12} sm={6}><InfoRow icon={<Work />} label="Position" value={employee.position} /></Grid>
                  <Grid item xs={12} sm={6}><InfoRow icon={<CalendarToday />} label="Joining Date" value={formatDate(employee.joiningDate)} /></Grid>
                  <Grid item xs={12} sm={6}><InfoRow icon={<Badge />} label="Employee ID" value={employee.employeeId} /></Grid>
                  <Grid item xs={12} sm={6}><InfoRow icon={<CalendarToday />} label="Date of Birth" value={formatDate(employee.dateOfBirth)} /></Grid>
                  <Grid item xs={12} sm={6}><InfoRow icon={<Person />} label="Gender" value={employee.gender} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </PageTransition>
  );
};

export default EmployeeDetailPage;
