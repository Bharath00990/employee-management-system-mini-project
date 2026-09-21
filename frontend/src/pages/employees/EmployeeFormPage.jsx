import React, { useState } from "react";
import {
  Box, Card, CardContent, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Typography, Divider, Alert,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";
import employeeService from "../../services/employeeService";
import { DEPARTMENTS, STATUSES, GENDERS } from "../../utils/helpers";

const initialForm = {
  firstName: "", lastName: "", email: "", phone: "", gender: "Prefer not to say",
  dateOfBirth: "", department: "", position: "", salary: "", joiningDate: "",
  status: "Active", address: "", profileImage: "",
};

const EmployeeFormPage = ({ mode = "add", initialData, employeeId }) => {
  const [form, setForm] = useState(initialData || initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.department) e.department = "Department is required";
    if (!form.position.trim()) e.position = "Position is required";
    if (!form.joiningDate) e.joiningDate = "Joining date is required";
    if (!form.status) e.status = "Status is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true); setApiError("");
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : undefined };
      if (mode === "add") {
        await employeeService.create(payload);
        enqueueSnackbar("Employee created successfully!", { variant: "success" });
      } else {
        await employeeService.update(employeeId, payload);
        enqueueSnackbar("Employee updated successfully!", { variant: "success" });
      }
      navigate("/employees");
    } catch (err) { setApiError(err.response?.data?.message || "Operation failed"); }
    finally { setLoading(false); }
  };

  const fieldProps = (name, label, required = false, extra = {}) => ({
    name, label: required ? `${label} *` : label, value: form[name],
    onChange: handleChange, error: !!errors[name], helperText: errors[name] || "",
    fullWidth: true, size: "small", ...extra,
  });

  return (
    <PageTransition>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/employees")} variant="outlined" size="small">Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={800}>{mode === "add" ? "Add Employee" : "Edit Employee"}</Typography>
          <Typography color="text.secondary">{mode === "add" ? "Create a new employee record" : "Update employee information"}</Typography>
        </Box>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{apiError}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Personal Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><TextField {...fieldProps("firstName", "First Name", true)} /></Grid>
              <Grid item xs={12} sm={6}><TextField {...fieldProps("lastName", "Last Name", true)} /></Grid>
              <Grid item xs={12} sm={6}><TextField {...fieldProps("email", "Email", true, { type: "email" })} /></Grid>
              <Grid item xs={12} sm={6}><TextField {...fieldProps("phone", "Phone", true)} /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select name="gender" value={form.gender} label="Gender" onChange={handleChange}>
                    {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...fieldProps("dateOfBirth", "Date of Birth", false, { type: "date", InputLabelProps: { shrink: true } })} />
              </Grid>
              <Grid item xs={12}>
                <TextField {...fieldProps("address", "Address", false, { multiline: true, rows: 2 })} />
              </Grid>
              <Grid item xs={12}>
                <TextField {...fieldProps("profileImage", "Profile Image URL")} placeholder="https://..." />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Employment Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Employment Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.department}>
                  <InputLabel>Department *</InputLabel>
                  <Select name="department" value={form.department} label="Department *" onChange={handleChange}>
                    {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                  {errors.department && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{errors.department}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><TextField {...fieldProps("position", "Position", true)} /></Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...fieldProps("salary", "Salary (USD)", false, { type: "number", InputProps: { inputProps: { min: 0 } } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...fieldProps("joiningDate", "Joining Date", true, { type: "date", InputLabelProps: { shrink: true } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select name="status" value={form.status} label="Status *" onChange={handleChange}>
                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/employees")} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading} sx={{ minWidth: 160 }}>
            {loading ? (mode === "add" ? "Creating..." : "Updating...") : (mode === "add" ? "Create Employee" : "Save Changes")}
          </Button>
        </Box>
      </form>
    </PageTransition>
  );
};

export default EmployeeFormPage;
