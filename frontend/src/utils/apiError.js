export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data.message === 'string' && data.message !== 'Validation failed') {
    return data.message;
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors).find(Boolean);
    if (firstError) {
      return firstError;
    }
  }

  return data.message ?? fallback;
}
