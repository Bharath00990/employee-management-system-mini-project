import api from './api';

export async function getAllEmployees() {
  const { data } = await api.get('/admin/employees');
  return data;
}

export async function getEmployeeById(id) {
  const { data } = await api.get(`/admin/employees/${id}`);
  return data;
}

export async function createEmployee(payload) {
  const { data } = await api.post('/admin/employees', payload);
  return data;
}

export async function createProjectManager(payload) {
  const { data } = await api.post('/admin/project-managers', payload);
  return data;
}

export async function updateEmployee(id, payload) {
  const { data } = await api.put(`/admin/employees/${id}`, payload);
  return data;
}
