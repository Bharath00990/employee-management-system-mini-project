import api from './api';

export async function getAllUsers() {
  const { data } = await api.get('/admin/users');
  return data;
}

export async function createUser(payload) {
  const { data } = await api.post('/admin/users', payload);
  return data;
}

export async function updateUserStatus(id, enabled) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { enabled });
  return data;
}
