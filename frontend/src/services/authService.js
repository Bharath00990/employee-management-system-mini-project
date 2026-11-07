import api from './api';

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  const { data } = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return data;
}
