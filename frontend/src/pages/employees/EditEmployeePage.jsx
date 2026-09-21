import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import EmployeeFormPage from "./EmployeeFormPage";
import employeeService from "../../services/employeeService";

const EditEmployeePage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await employeeService.getOne(id);
        const emp = res.data.data;
        // Format dates for input fields
        setEmployee({
          ...emp,
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
          joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
          salary: emp.salary || "",
        });
      } catch { setError("Failed to load employee data"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return <EmployeeFormPage mode="edit" initialData={employee} employeeId={id} />;
};

export default EditEmployeePage;
