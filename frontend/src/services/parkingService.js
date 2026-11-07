import api from './api';

export async function getAdminParkingSlots() {
  const { data } = await api.get('/admin/parking/slots');
  return data;
}

export async function getAdminParkingSlotById(slotId) {
  const { data } = await api.get(`/admin/parking/slots/${slotId}`);
  return data;
}

export async function createAdminParkingSlot(payload) {
  const { data } = await api.post('/admin/parking/slots', payload);
  return data;
}

export async function getAdminParkingAllocations() {
  const { data } = await api.get('/admin/parking/allocations');
  return data;
}

export async function getAdminParkingAllocationById(allocationId) {
  const { data } = await api.get(`/admin/parking/allocations/${allocationId}`);
  return data;
}

export async function createAdminParkingAllocation(payload) {
  // Backend DTO expects `parkingSlotId`, not `slotId`
  const { data } = await api.post('/admin/parking/allocations', {
    employeeId: payload.employeeId,
    parkingSlotId: payload.slotId ?? payload.parkingSlotId,
  });
  return data;
}

export async function releaseAdminParkingAllocation(allocationId) {
  const { data } = await api.patch(`/admin/parking/allocations/${allocationId}/release`);
  return data;
}

export async function getManagerParking() {
  try {
    const { data } = await api.get('/manager/parking');
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
}

export async function getEmployeeParking() {
  try {
    const { data } = await api.get('/employee/parking');
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    throw err;
  }
}
