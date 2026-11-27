export class ApiError extends Error {
  constructor(code, message, status = null, fields = null, extra = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.extra = extra;
  }
}

export function errorFromPayload(status, payload) {
  const error = payload && typeof payload === 'object' ? payload.error : null;
  const extra = payload && typeof payload === 'object' ? { ...payload } : {};
  if (extra.error) delete extra.error;

  return new ApiError(
    error?.code || (status === 500 ? 'server_error' : 'unexpected'),
    error?.message || 'Something went wrong. Try again.',
    status,
    error?.fields || null,
    extra,
  );
}

export function isApiError(error, code) {
  return error instanceof ApiError && error.code === code;
}
