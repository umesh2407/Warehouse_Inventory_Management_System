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

export const isValidationError = (error) => error?.response?.status === 422;

/**
 * For mutation thunks: only return a message for 422 so forms can show inline Alerts.
 * Non-422 errors are toasted by the axios interceptor.
 */
export const rejectMutationError = (error, fallback) => {
  if (isValidationError(error)) {
    return getErrorMessage(error, fallback);
  }
  return null;
};
