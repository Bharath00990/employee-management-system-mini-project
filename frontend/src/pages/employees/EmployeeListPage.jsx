import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Card, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Chip, Avatar, Button, Tooltip, Stack, InputAdornment, Paper,
} from "@mui/material";
import { Search, Add, Edit, Delete, Visibility, FilterAlt, Clear, Sort } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import employeeService from "../../services/employeeService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import PageTransition from "../../components/common/PageTransition";
import { TableSkeleton } from "../../components/common/SkeletonLoader";
import { formatDate, getStatusColor, getInitials, DEPARTMENTS, STATUSES } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll({ search, department, status, page: page + 1, limit: rowsPerPage });
      setEmployees(res.data.data.employees);
      setTotal(res.data.data.total);
    } catch { enqueueSnackbar("Failed to load employees", { variant: "error" }); }
    finally { setLoading(false); }
  }, [search, department, status, page, rowsPerPage]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeService.delete(deleteId);
      enqueueSnackbar("Employee deleted successfully", { variant: "success" });
      setDeleteId(null);
      fetchEmployees();
    } catch (e) { enqueueSnackbar(e.response?.data?.message || "Delete failed", { variant: "error" }); }
    finally { setDeleting(false); }
  };

  const clearFilters = () => { setSearchInput(""); setDepartment("all"); setStatus("all"); setPage(0); };

  return (
    <PageTransition>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Employees</Typography>
          <Typography color="text.secondary">{total} total employees</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/employees/add")} sx={{ borderRadius: 2 }}>
            Add Employee
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search employees..." size="small" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} sx={{ minWidth: 240 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Department</InputLabel>
            <Select value={department} label="Department" onChange={(e) => { setDepartment(e.target.value); setPage(0); }}>
              <MenuItem value="all">All Departments</MenuItem>
              {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <MenuItem value="all">All Statuses</MenuItem>
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          {(searchInput || department !== "all" || status !== "all") && (
            <Button startIcon={<Clear />} onClick={clearFilters} size="small" color="inherit">Clear Filters</Button>
          )}
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>ID</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Department</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Position</TableCell>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>Joining Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 0, border: "none" }}><TableSkeleton rows={5} /></TableCell></TableRow>
              ) : employees.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ border: "none" }}>
                  <EmptyState title="No employees found" subtitle="Try adjusting your search or filters" action={clearFilters} actionLabel="Clear Filters" />
                </TableCell></TableRow>
              ) : (
                <AnimatePresence>
                  {employees.map((emp, i) => (
                    <motion.tr key={emp._id} component={TableRow}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.03 }} style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/employees/${emp._id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar src={emp.profileImage} sx={{ width: 38, height: 38, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}>
                            {!emp.profileImage && getInitials(emp.firstName, emp.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{emp.firstName} {emp.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary" fontFamily="monospace">{emp.employeeId}</Typography></TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        <Chip label={emp.department} size="small" sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.72rem" }} />
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        <Typography variant="body2">{emp.position}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                        <Typography variant="body2" color="text.secondary">{formatDate(emp.joiningDate)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={emp.status} size="small" color={getStatusColor(emp.status)} sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.72rem" }} />
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/employees/${emp._id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                          {isAdmin && <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/employees/edit/${emp._id}`)}><Edit fontSize="small" /></IconButton></Tooltip>}
                          {isAdmin && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(emp._id)}><Delete fontSize="small" /></IconButton></Tooltip>}
                        </Stack>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={total} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      <ConfirmDialog open={!!deleteId} title="Delete Employee"
        message="This action cannot be undone. Are you sure you want to delete this employee?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting}
      />
    </PageTransition>
  );
};

export default EmployeeListPage;
