import api from './api';

export async function getAdminProjects() {
  const { data } = await api.get('/admin/projects');
  return data;
}

export async function getAdminProjectById(id) {
  const { data } = await api.get(`/admin/projects/${id}`);
  return data;
}

export async function createAdminProject(payload) {
  const { data } = await api.post('/admin/projects', payload);
  return data;
}

export async function updateAdminProject(id, payload) {
  const { data } = await api.put(`/admin/projects/${id}`, payload);
  return data;
}

export async function changeAdminProjectStatus(id, status) {
  const { data } = await api.patch(`/admin/projects/${id}/status`, { status });
  return data;
}

export async function changeAdminProjectManager(id, managerId) {
  const { data } = await api.patch(`/admin/projects/${id}/manager`, { managerId });
  return data;
}

// Admin team management
export async function getAdminProjectTeam(projectId) {
  const { data } = await api.get(`/admin/projects/${projectId}/employees`);
  return data;
}

export async function adminAssignEmployeeToProject(projectId, payload) {
  const { data } = await api.post(`/admin/projects/${projectId}/employees`, payload);
  return data;
}

export async function adminRemoveEmployeeFromProject(projectId, employeeId) {
  const { data } = await api.delete(`/admin/projects/${projectId}/employees/${employeeId}`);
  return data;
}

export async function getManagerProjects() {
  const { data } = await api.get('/manager/projects');
  return data;
}

export async function getManagerProjectById(id) {
  const { data } = await api.get(`/manager/projects/${id}`);
  return data;
}

export async function getEmployeeProjects() {
  const { data } = await api.get('/employee/projects');
  return data;
}

export async function getEmployeeProjectById(id) {
  const { data } = await api.get(`/employee/projects/${id}`);
  return data;
}

export async function getManagerProjectTeam(projectId) {
  const { data } = await api.get(`/manager/projects/${projectId}/employees`);
  return data;
}

export async function assignEmployeeToProject(projectId, payload) {
  const { data } = await api.post(`/manager/projects/${projectId}/employees`, payload);
  return data;
}

export async function removeEmployeeFromProject(projectId, employeeId) {
  const { data } = await api.delete(`/manager/projects/${projectId}/employees/${employeeId}`);
  return data;
}
