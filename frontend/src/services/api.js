/**
 * Frontend API service for SMART ROOM AI
 * Connects React frontend to FastAPI backend endpoints
 * All endpoints use relative paths - Vite proxy routes /api to http://localhost:8000
 */

const API_BASE = '/api';

export const roomsApi = {
  /** GET /api/rooms - List all active rooms */
  list: async () => {
    const resp = await fetch(`${API_BASE}/rooms`);
    if (!resp.ok) throw new Error('Failed to fetch rooms');
    return resp.json();
  },

  /** GET /api/rooms/{id} - Get a single room */
  get: async (roomId) => {
    const resp = await fetch(`${API_BASE}/rooms/${roomId}`);
    if (!resp.ok) throw new Error('Failed to fetch room');
    return resp.json();
  },

  /** POST /api/rooms/search - Search available rooms */
  search: async (req) => {
    const resp = await fetch(`${API_BASE}/rooms/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Search failed: ${err}`);
    }
    return resp.json();
  },

  /** POST /api/rooms/ai-parse - Parse natural language search */
  aiParse: async (req) => {
    const resp = await fetch(`${API_BASE}/rooms/ai-parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`AI parse failed: ${err}`);
    }
    return resp.json();
  },

  /** POST /api/rooms/ai-search - AI-powered room search */
  aiSearch: async (req) => {
    const resp = await fetch(`${API_BASE}/rooms/ai-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`AI search failed: ${err}`);
    }
    return resp.json();
  },
};

export const bookingsApi = {
  /** POST /api/bookings - Create a booking */
  create: async (req) => {
    const resp = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Booking failed: ${err}`);
    }
    return resp.json();
  },

  /** DELETE /api/bookings - Cancel a booking */
  cancel: async (req) => {
    const resp = await fetch(`${API_BASE}/bookings`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Cancel booking failed: ${err}`);
    }
    return resp.json();
  },

  /** GET /api/bookings/my - Get current user's bookings */
  my: async (professorId) => {
    const resp = await fetch(`${API_BASE}/bookings/my?professorId=${professorId}`);
    if (!resp.ok) throw new Error('Failed to fetch my bookings');
    return resp.json();
  },

  /** GET /api/bookings/room/{room_id} - Get bookings for a room */
  room: async (roomId, sessionDate) => {
    const resp = await fetch(`${API_BASE}/bookings/room/${roomId}?sessionDate=${sessionDate}`);
    if (!resp.ok) throw new Error('Failed to fetch room bookings');
    return resp.json();
  },
};

export const adminApi = {
  /** GET /api/admin/metrics - Get admin metrics */
  metrics: async (startDate, endDate) => {
    let url = `${API_BASE}/admin/metrics`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch metrics');
    return resp.json();
  },

  /** GET /api/admin/insights - Get admin insights */
  insights: async (startDate, endDate) => {
    let url = `${API_BASE}/admin/insights`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch insights');
    return resp.json();
  },

  /** GET /api/admin/rooms - List all rooms (with details) */
  listRooms: async () => {
    const resp = await fetch(`${API_BASE}/admin/rooms`);
    if (!resp.ok) throw new Error('Failed to fetch admin rooms');
    return resp.json();
  },

  /** POST /api/admin/rooms - Create a room */
  createRoom: async (roomData) => {
    const resp = await fetch(`${API_BASE}/admin/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Create room failed: ${err}`);
    }
    return resp.json();
  },

  /** DELETE /api/admin/rooms/{room_id} - Deactivate a room */
  deleteRoom: async (roomId) => {
    const resp = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      method: 'DELETE',
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Delete room failed: ${err}`);
    }
    return resp.json();
  },
};

// Utility function for professor ID (would come from auth in production)
export const getCurrentProfessorId = () => {
  // In a real app, this would come from authentication/session
  // For now, return a default professor ID
  const stored = localStorage.getItem('smart_room_professor_id');
  if (stored) return stored;
  const id = 'prof_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('smart_room_professor_id', id);
  return id;
};