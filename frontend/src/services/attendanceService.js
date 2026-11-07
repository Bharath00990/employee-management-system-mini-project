import api from './api';

function normalizeAttendanceList(data) {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}

export async function getAdminAttendance(date) {
  const { data } = await api.get('/admin/attendance', {
    params: date ? { date } : undefined,
  });
  return normalizeAttendanceList(data);
}

export async function getAdminEmployeeAttendance(employeeId, date) {
  const { data } = await api.get(`/admin/attendance/employee/${employeeId}`, {
    params: date ? { date } : undefined,
  });
  return normalizeAttendanceList(data);
}

export async function updateAdminAttendanceStatus(attendanceId, status) {
  const { data } = await api.patch(`/admin/attendance/${attendanceId}/status`, { status });
  return data;
}

export async function getManagerAttendance(date) {
  const { data } = await api.get('/manager/attendance', {
    params: date ? { date } : undefined,
  });
  return data;
}

export async function markEmployeeAttendance(payload) {
  const { data } = await api.post('/employee/attendance', payload);
  return data;
}

export async function checkInEmployee(workMode = 'OFFICE') {
  const { data } = await api.post('/employee/attendance/check-in', null, {
    params: { workMode },
  });
  return data;
}

export async function updateTodayWorkMode(workMode) {
  const { data } = await api.put('/employee/attendance/today/work-mode', null, {
    params: { workMode },
  });
  return data;
}

export async function addTodayBreak(payload) {
  const { data } = await api.post('/employee/attendance/today/breaks', payload);
  return data;
}

export async function deleteTodayBreak(breakId) {
  const { data } = await api.delete(`/employee/attendance/today/breaks/${breakId}`);
  return data;
}

export async function checkOutEmployee() {
  const { data } = await api.post('/employee/attendance/check-out');
  return data;
}

export async function getTodayEmployeeAttendance() {
  const { data } = await api.get('/employee/attendance/today');
  return data;
}

export async function getEmployeeAttendance() {
  const { data } = await api.get('/employee/attendance');
  return data;
}

export async function getEmployeeAttendanceByDate(date) {
  const { data } = await api.get(`/employee/attendance/${date}`);
  return data;
}
