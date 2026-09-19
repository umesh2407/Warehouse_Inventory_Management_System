export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;

  const apiMessage = error.response?.data?.message;
  if (apiMessage) return apiMessage;

  if (typeof error.message === 'string' && error.message) {
    return error.message;
  }

  return fallback;
};

export const getFieldErrors = (error) => {
  const errors = error?.response?.data?.errors;
  return Array.isArray(errors) ? errors : [];
};
