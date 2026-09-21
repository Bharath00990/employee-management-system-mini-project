import api from "./api";

const employeeService = {
  getAll: (params) => api.get("/employees", { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getDashboardStats: () => api.get("/dashboard/stats"),
  getDepartmentDistribution: () => api.get("/dashboard/department-distribution"),
  getEmployeeGrowth: () => api.get("/dashboard/employee-growth"),
  getStatusBreakdown: () => api.get("/dashboard/status-breakdown"),
};

export default employeeService;
