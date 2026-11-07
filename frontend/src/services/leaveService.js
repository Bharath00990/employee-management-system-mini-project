import api from './api';

export async function getAdminLeaves() {
  const { data } = await api.get('/admin/leaves');
  return data;
}

export async function getAdminEmployeeLeaves(employeeId) {
  const { data } = await api.get(`/admin/leaves/employee/${employeeId}`);
  return data;
}

export async function getAdminLeaveById(leaveId) {
  const { data } = await api.get(`/admin/leaves/${leaveId}`);
  return data;
}

export async function approveAdminLeave(leaveId) {
  const { data } = await api.patch(`/admin/leaves/${leaveId}/approve`);
  return data;
}

export async function rejectAdminLeave(leaveId) {
  const { data } = await api.patch(`/admin/leaves/${leaveId}/reject`);
  return data;
}

export async function getManagerLeaves() {
  const { data } = await api.get('/manager/leaves');
  return data;
}

export async function approveManagerLeave(leaveId) {
  const { data } = await api.patch(`/manager/leaves/${leaveId}/approve`);
  return data;
}

export async function rejectManagerLeave(leaveId, reason) {
  const { data } = await api.patch(`/manager/leaves/${leaveId}/reject`, reason ? { reason } : {});
  return data;
}

export async function applyEmployeeLeave(payload) {
  const { data } = await api.post('/employee/leaves', payload);
  return data;
}

export async function getEmployeeLeaves() {
  const { data } = await api.get('/employee/leaves');
  return data;
}

export async function cancelEmployeeLeave(leaveId) {
  const { data } = await api.patch(`/employee/leaves/${leaveId}/cancel`);
  return data;
}
