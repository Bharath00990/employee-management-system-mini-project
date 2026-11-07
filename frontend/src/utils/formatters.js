export function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

export function formatTime(value) {
  if (!value) {
    return '—';
  }

  if (typeof value === 'string' && (value.includes('AM') || value.includes('PM'))) {
    return value;
  }

  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // fallback
  }

  return String(value);
}

export function formatRole(role) {
  const labels = {
    ADMIN: 'Admin',
    PROJECT_MANAGER: 'Project Manager',
    EMPLOYEE: 'Employee',
  };

  return labels[role] ?? role;
}

export function getEmployeeFullName(employee) {
  if (!employee) {
    return '';
  }

  return `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
}

export function formatEnumLabel(value) {
  if (!value) {
    return '—';
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatMonthYear(month, year) {
  if (!month || !year) {
    return '—';
  }

  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatProjectStatus(status) {
  return formatEnumLabel(status);
}
