import { ApiError, errorFromPayload } from './errors.js';
import * as mock from './mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === '1';
const REQUEST_TIMEOUT_MS = 30000;
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function runMock(call) {
  try {
    return await call();
  } catch (error) {
    if (error?.status === 401 && error.code === 'not_authenticated' && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw error;
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(method, path, options = {}) {
  const { body, signal, isForm = false, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abortFromCaller, { once: true });
    }
  }

  const headers = {};
  if (method !== 'GET') {
    headers['X-SmartRoom-Client'] = 'web';
  }
  if (body !== undefined && !isForm) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      credentials: 'same-origin',
      signal: controller.signal,
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const error = errorFromPayload(response.status, payload);
      if (response.status === 401 && error.code === 'not_authenticated' && unauthorizedHandler) {
        unauthorizedHandler();
      }
      throw error;
    }

    return payload ?? { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (controller.signal.aborted) {
      const code = timedOut ? 'timeout' : 'network_error';
      throw new ApiError(code, code === 'timeout' ? 'The server took too long to answer.' : 'The server cannot be reached.');
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new ApiError('offline', 'You appear to be offline.');
    }
    throw new ApiError('network_error', 'The server cannot be reached.');
  } finally {
    clearTimeout(timer);
    if (signal) {
      signal.removeEventListener('abort', abortFromCaller);
    }
  }
}

export async function health(options) {
  if (USE_MOCK) return runMock(() => mock.health(options));
  return request('GET', '/api/health', options);
}

export async function login(body, options) {
  if (USE_MOCK) return runMock(() => mock.login(body, options));
  return request('POST', '/api/auth/login', { body, ...options });
}

export async function logout(options) {
  if (USE_MOCK) return runMock(() => mock.logout(options));
  return request('POST', '/api/auth/logout', options);
}

export async function me(options) {
  if (USE_MOCK) return runMock(() => mock.me(options));
  return request('GET', '/api/auth/me', options);
}

export async function meta(options) {
  if (USE_MOCK) return runMock(() => mock.meta(options));
  return request('GET', '/api/meta', options);
}

export async function getRooms(options) {
  if (USE_MOCK) return runMock(() => mock.getRooms(options));
  return request('GET', '/api/rooms', options);
}

export async function parseRequest(text, options) {
  if (USE_MOCK) return runMock(() => mock.parseRequest(text, options));
  return request('POST', '/api/assistant/parse', { body: { text }, ...options });
}

export async function searchRooms(criteria, options) {
  if (USE_MOCK) return runMock(() => mock.searchRooms(criteria, options));
  return request('POST', '/api/rooms/search', { body: criteria, ...options });
}

export async function createBooking(body, options) {
  if (USE_MOCK) return runMock(() => mock.createBooking(body, options));
  return request('POST', '/api/bookings', { body, ...options });
}

export async function myBookings(scope = 'upcoming', options) {
  if (USE_MOCK) return runMock(() => mock.myBookings(scope, options));
  return request('GET', `/api/bookings/mine${buildQuery({ scope })}`, options);
}

export async function cancelBooking(bookingId, body = {}, options) {
  if (USE_MOCK) return runMock(() => mock.cancelBooking(bookingId, body, options));
  return request('POST', `/api/bookings/${encodeURIComponent(bookingId)}/cancel`, { body, ...options });
}

export async function adminBookings(params = {}, options) {
  if (USE_MOCK) return runMock(() => mock.adminBookings(params, options));
  return request('GET', `/api/admin/bookings${buildQuery(params)}`, options);
}

export async function approveBooking(bookingId, options) {
  if (USE_MOCK) return runMock(() => mock.approveBooking(bookingId, options));
  return request('POST', `/api/admin/bookings/${encodeURIComponent(bookingId)}/approve`, options);
}

export async function rejectBooking(bookingId, body, options) {
  if (USE_MOCK) return runMock(() => mock.rejectBooking(bookingId, body, options));
  return request('POST', `/api/admin/bookings/${encodeURIComponent(bookingId)}/reject`, { body, ...options });
}

export async function audit(params = {}, options) {
  if (USE_MOCK) return runMock(() => mock.audit(params, options));
  return request('GET', `/api/admin/audit${buildQuery(params)}`, options);
}

export async function getSettings(options) {
  if (USE_MOCK) return runMock(() => mock.getSettings(options));
  return request('GET', '/api/admin/settings', options);
}

export async function patchSettings(body, options) {
  if (USE_MOCK) return runMock(() => mock.patchSettings(body, options));
  return request('PATCH', '/api/admin/settings', { body, ...options });
}

export async function importPreview(kind, file, options) {
  if (USE_MOCK) return runMock(() => mock.importPreview(kind, file, options));
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  return request('POST', '/api/admin/import/preview', { body: form, isForm: true, ...options });
}

export async function importPublish(importId, options) {
  if (USE_MOCK) return runMock(() => mock.importPublish(importId, options));
  return request('POST', `/api/admin/import/${encodeURIComponent(importId)}/publish`, options);
}

export async function getMetrics(params = {}, options) {
  if (USE_MOCK) return runMock(() => mock.getMetrics(params, options));
  return request('GET', `/api/admin/metrics${buildQuery(params)}`, options);
}

export async function getInsights(body, options) {
  if (USE_MOCK) return runMock(() => mock.getInsights(body, options));
  return request('POST', '/api/admin/insights', { body, ...options });
}

export async function patchRoom(roomId, body, options) {
  if (USE_MOCK) return runMock(() => mock.patchRoom(roomId, body, options));
  return request('PATCH', `/api/admin/rooms/${encodeURIComponent(roomId)}`, { body, ...options });
}

export const isMockMode = USE_MOCK;
