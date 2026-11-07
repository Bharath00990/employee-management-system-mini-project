import api from './api';

export async function getAdminSalaries() {
  const { data } = await api.get('/admin/salaries');
  return data;
}

export async function getAdminEmployeeSalaries(employeeId) {
  const { data } = await api.get(`/admin/salaries/employee/${employeeId}`);
  return data;
}

export async function getAdminSalaryById(salaryId) {
  const { data } = await api.get(`/admin/salaries/${salaryId}`);
  return data;
}

export async function createAdminSalary(payload) {
  const { data } = await api.post('/admin/salaries', payload);
  return data;
}

export async function updateAdminSalary(salaryId, payload) {
  const { data } = await api.put(`/admin/salaries/${salaryId}`, payload);
  return data;
}

export async function getEmployeeSalaries() {
  const { data } = await api.get('/employee/salary');
  return data;
}
