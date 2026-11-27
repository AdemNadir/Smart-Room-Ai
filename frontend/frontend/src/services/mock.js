import { ApiError } from './errors.js';

const ROOM_TYPES = ['lecture', 'classroom', 'lab', 'amphitheatre'];
const EQUIPMENT_OPTIONS = [
  'projector',
  'whiteboard',
  'computers',
  'air_conditioning',
  'sound_system',
  'smartboard',
  'power_outlets',
];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

let currentUser = null;
let expireNextRequest = false;
let nextImportId = 1;
const stagedImports = new Map();

const settings = {
  approval_mode: 'instant',
  pending_blocks_room: false,
  working_hours: { start: '08:00', end: '18:00' },
  working_days: ['sun', 'mon', 'tue', 'wed', 'thu'],
  min_booking_minutes: 30,
  max_booking_minutes: 240,
};

const rooms = [
  { room_id: 'A101', room_name: 'Classroom A101', capacity: 40, room_type: 'classroom', building: 'Block A', equipment: ['projector', 'whiteboard'], active: true },
  { room_id: 'A102', room_name: 'Classroom A102', capacity: 40, room_type: 'classroom', building: 'Block A', equipment: ['projector', 'whiteboard', 'sound_system'], active: true },
  { room_id: 'B204', room_name: 'Lecture Hall B204', capacity: 80, room_type: 'lecture', building: 'Block B', equipment: ['projector', 'sound_system', 'air_conditioning'], active: true },
  { room_id: 'C301', room_name: 'Laboratory C301', capacity: 40, room_type: 'lab', building: 'Block C', equipment: ['computers', 'smartboard', 'power_outlets'], active: true },
  { room_id: 'D105', room_name: 'Classroom D105', capacity: 55, room_type: 'classroom', building: 'Block D', equipment: ['whiteboard'], active: true },
  { room_id: 'E110', room_name: 'Amphitheatre E110', capacity: 120, room_type: 'amphitheatre', building: 'Block E', equipment: ['projector', 'sound_system'], active: false },
  { room_id: 'F120', room_name: 'Seminar Room F120', capacity: 20, room_type: 'classroom', building: 'Block F', equipment: ['whiteboard'], active: true },
  { room_id: 'G201', room_name: 'Computer Lab G201', capacity: 45, room_type: 'lab', building: 'Block G', equipment: ['computers'], active: true },
  { room_id: 'H205', room_name: 'Classroom H205', capacity: 60, room_type: 'classroom', building: 'Block H', equipment: ['whiteboard'], active: true },
];

const bookings = [];

function dateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
}

function mockError(status, code, message, extra = {}) {
  return new ApiError(code, message, status, null, extra);
}

function guardSession() {
  if (!expireNextRequest) return;
  expireNextRequest = false;
  currentUser = null;
  throw mockError(401, 'not_authenticated', 'Your session ended. Sign in again.');
}

function pause(options) {
  const wait = 200 + Math.floor(Math.random() * 400);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, wait);
    if (options?.signal) {
      if (options.signal.aborted) {
        clearTimeout(timer);
        reject(new ApiError('network_error', 'Request cancelled.'));
        return;
      }
      options.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new ApiError('network_error', 'Request cancelled.'));
        },
        { once: true },
      );
    }
  });
}

function roomById(roomId) {
  return rooms.find((room) => room.room_id === roomId);
}

function roomBlock(roomId, kind, startTime, endTime) {
  return { room: { ...roomById(roomId) }, status: statusFor(kind), day_blocks: [{ kind, start_time: startTime, end_time: endTime }] };
}

function statusFor(kind) {
  if (kind === 'official_session') return 'occupied_official';
  if (kind === 'extra_booking') return 'booked_extra';
  return 'pending';
}

function resultList() {
  return [
    {
      room: { ...roomById('A102') },
      status: 'available',
      free_window: { start_time: '08:00', end_time: '14:00' },
      day_blocks: [{ kind: 'official_session', start_time: '14:00', end_time: '16:00' }],
      rank: 1,
      score: 0.87,
      reasons: [
        { code: 'available_full_interval', text: 'Available for the full requested interval.' },
        { code: 'capacity_fit', text: '40 seats for 35 students.' },
        { code: 'has_required_equipment', text: 'Has the requested projector.' },
        { code: 'low_utilization', text: 'Less busy than other suitable rooms.' },
      ],
    },
    {
      room: { ...roomById('B204') },
      status: 'available',
      free_window: { start_time: '09:00', end_time: '18:00' },
      day_blocks: [{ kind: 'extra_booking', start_time: '08:00', end_time: '09:00' }],
      rank: 2,
      score: 0.79,
      reasons: [
        { code: 'available_full_interval', text: 'Available for the full requested interval.' },
        { code: 'capacity_generous', text: '80 seats give room to grow.' },
        { code: 'has_preferred_equipment', text: 'Includes sound system and air conditioning.' },
      ],
    },
    {
      room: { ...roomById('C301') },
      status: 'available',
      free_window: { start_time: '08:00', end_time: '16:00' },
      day_blocks: [{ kind: 'pending_booking', start_time: '16:00', end_time: '17:00' }],
      rank: 3,
      score: 0.71,
      reasons: [
        { code: 'available_full_interval', text: 'Available for the full requested interval.' },
        { code: 'capacity_tight', text: '40 seats are close to the requested group size.' },
        { code: 'type_match', text: 'Matches the laboratory requirement.' },
      ],
    },
  ];
}

function excludedList() {
  return [
    {
      ...roomBlock('A101', 'official_session', '10:00', '12:00'),
      conflict: { kind: 'official_session', start_time: '10:00', end_time: '12:00' },
    },
    {
      ...roomBlock('D105', 'extra_booking', '09:30', '11:00'),
      conflict: { kind: 'extra_booking', start_time: '09:30', end_time: '11:00' },
    },
    roomBlock('E110', 'official_session', '13:00', '15:00'),
    { room: { ...roomById('F120') }, status: 'capacity_too_small', day_blocks: [] },
    { room: { ...roomById('G201') }, status: 'wrong_room_type', day_blocks: [] },
    { room: { ...roomById('H205') }, status: 'missing_equipment', day_blocks: [] },
  ];
}

function metricsFor(range) {
  return {
    range,
    working_hours: { start: '08:00', end: '18:00' },
    working_days: ['sun', 'mon', 'tue', 'wed', 'thu'],
    totals: {
      active_rooms: 12,
      scheduled_hours: 410.5,
      extra_hours: 18.0,
      capacity_hours: 600.0,
      utilization_rate: 0.714,
      bookings: { confirmed: 9, cancelled: 2, pending: 0, rejected: 0 },
    },
    by_building: [
      { building: 'Block A', rooms: 5, scheduled_hours: 180.0, extra_hours: 6.5, capacity_hours: 250.0, utilization_rate: 0.746 },
      { building: 'Block B', rooms: 4, scheduled_hours: 140.5, extra_hours: 5.0, capacity_hours: 200.0, utilization_rate: 0.728 },
      { building: 'Block C', rooms: 3, scheduled_hours: 90.0, extra_hours: 6.5, capacity_hours: 150.0, utilization_rate: 0.643 },
    ],
    by_room: [
      { room_id: 'A102', room_name: 'Classroom A102', building: 'Block A', capacity: 40, scheduled_hours: 62.0, extra_hours: 4.0, capacity_hours: 50.0, utilization_rate: 1.0, idle_hours: 0.0 },
      { room_id: 'B204', room_name: 'Lecture Hall B204', building: 'Block B', capacity: 80, scheduled_hours: 36.5, extra_hours: 2.0, capacity_hours: 50.0, utilization_rate: 0.77, idle_hours: 11.5 },
      { room_id: 'C301', room_name: 'Laboratory C301', building: 'Block C', capacity: 40, scheduled_hours: 11.0, extra_hours: 0.0, capacity_hours: 50.0, utilization_rate: 0.22, idle_hours: 39.0 },
    ],
    by_weekday: [
      { weekday: 'sun', scheduled_hours: 82.0, extra_hours: 3.0, utilization_rate: 0.7 },
      { weekday: 'mon', scheduled_hours: 92.5, extra_hours: 5.0, utilization_rate: 0.78 },
      { weekday: 'tue', scheduled_hours: 88.0, extra_hours: 4.0, utilization_rate: 0.74 },
      { weekday: 'wed', scheduled_hours: 79.5, extra_hours: 3.5, utilization_rate: 0.66 },
      { weekday: 'thu', scheduled_hours: 68.5, extra_hours: 2.5, utilization_rate: 0.57 },
    ],
    by_hour: [
      { hour: '08:00', occupied_room_hours: 5.0, utilization_rate: 0.42 },
      { hour: '09:00', occupied_room_hours: 8.0, utilization_rate: 0.67 },
      { hour: '10:00', occupied_room_hours: 10.0, utilization_rate: 0.83 },
      { hour: '11:00', occupied_room_hours: 9.0, utilization_rate: 0.75 },
      { hour: '14:00', occupied_room_hours: 7.0, utilization_rate: 0.58 },
      { hour: '15:00', occupied_room_hours: 6.0, utilization_rate: 0.5 },
    ],
    top_requested_rooms: [
      { room_id: 'A102', bookings: 4 },
      { room_id: 'B204', bookings: 3 },
      { room_id: 'C301', bookings: 2 },
    ],
  };
}

export async function health(options) {
  await pause(options);
  return { status: 'ok', offline_mode: true };
}

export async function login(body, options) {
  await pause(options);
  if (!body?.username?.trim() || !body?.password) {
    throw mockError(422, 'validation_error', 'Enter your username and password.', {
      fields: { username: 'required', password: 'required' },
    });
  }
  const username = body.username.trim();
  const normalized = username.toLowerCase();
  if (/rate.?limit|throttl/.test(normalized)) {
    throw mockError(429, 'too_many_requests', 'Too many attempts. Wait a few minutes, then try again.');
  }
  if (/offline|network/.test(normalized)) {
    throw mockError(0, 'network_error', 'The server cannot be reached.');
  }
  if (normalized.includes('expire')) expireNextRequest = true;
  const role = normalized.includes('admin') ? 'admin' : 'professor';
  currentUser = {
    id: newId(),
    username,
    display_name: username,
    role,
  };
  return { user: { ...currentUser } };
}

export async function logout(options) {
  await pause(options);
  currentUser = null;
  return { ok: true };
}

export async function me(options) {
  await pause(options);
  if (!currentUser) {
    throw mockError(401, 'not_authenticated', 'Your session ended. Sign in again.');
  }
  return { user: { ...currentUser } };
}

export async function meta(options) {
  await pause(options);
  return {
    today: dateString(0),
    timezone: 'Africa/Algiers',
    room_types: [...ROOM_TYPES],
    equipment: [...EQUIPMENT_OPTIONS],
    buildings: [...new Set(rooms.map((room) => room.building))],
    working_hours: { ...settings.working_hours },
    min_booking_minutes: settings.min_booking_minutes,
    max_booking_minutes: settings.max_booking_minutes,
    approval_mode: settings.approval_mode,
    ai: { parser: 'rules', insights: 'template' },
  };
}

export async function getRooms(options) {
  await pause(options);
  return { rooms: rooms.map((room) => ({ ...room, equipment: [...room.equipment] })) };
}

export async function parseRequest(text, options) {
  await pause(options);
  guardSession();
  if (!text?.trim()) {
    throw mockError(422, 'validation_error', 'Write the room you need.', { fields: { text: 'required' } });
  }
  if (text.length > 500) {
    throw mockError(422, 'validation_error', 'The request is too long.', { fields: { text: 'too_many_characters' } });
  }

  const language = /[\u0600-\u06FF]/.test(text) ? 'ar' : /\b(je|salle|étudiant|etudiant|demain|projecteur)\b/i.test(text) ? 'fr' : 'en';
  const hasAfternoon = /afternoon|après-midi|apres-midi|بعد الظهر/.test(text);
  const clarifications = hasAfternoon
    ? [{ field: 'start_time', code: 'time_assumed_pm', message: 'I read the times as afternoon, because classes run from 08:00 to 18:00.' }]
    : [];

  return {
    criteria: {
      date: dateString(1),
      start_time: '10:00',
      end_time: '12:00',
      student_count: 35,
      required_equipment: ['projector'],
      preferred_equipment: [],
      room_type: null,
      preferred_building: null,
    },
    missing: [],
    clarifications,
    language,
    engine: 'rules',
    parse_ms: 6,
  };
}

export async function searchRooms(criteria, options) {
  await pause(options);
  guardSession();
  const empty = Number(criteria?.student_count) > 80;
  return {
    criteria: {
      date: criteria?.date ?? dateString(0),
      start_time: criteria?.start_time ?? '08:00',
      end_time: criteria?.end_time ?? '09:00',
      student_count: Number(criteria?.student_count) || 1,
      required_equipment: criteria?.required_equipment ?? [],
      preferred_equipment: criteria?.preferred_equipment ?? [],
      room_type: criteria?.room_type ?? null,
      preferred_building: criteria?.preferred_building ?? null,
    },
    results: empty ? [] : resultList(),
    excluded: excludedList(),
    hints: empty ? ['relax_equipment', 'try_other_times'] : [],
    search_ms: 14,
    lang: criteria?.lang || 'en',
  };
}

export async function createBooking(body, options) {
  await pause(options);
  guardSession();
  if (!body?.course?.trim() || !body?.group_code?.trim() || !body?.student_count) {
    throw mockError(422, 'validation_error', 'Check the booking details.', {
      fields: { course: 'required', group_code: 'required', student_count: 'required' },
    });
  }
  if (['A101', 'B204'].includes(body.room_id)) {
    throw mockError(409, 'booking_conflict', 'Someone just booked this room. Here are rooms that are still free for the same time.', {
      alternatives: resultList().filter((item) => item.room?.room_id !== body.room_id),
    });
  }
  if (/eligib/i.test(body.course || '') || Number(body.student_count) > 80) {
    throw mockError(409, 'room_not_eligible', 'This room is no longer suitable. Choose another option.', {
      reason: 'capacity_too_small',
      alternatives: resultList().slice(1),
    });
  }

  const room = roomById(body.room_id) ?? roomById('A102');
  const booking = {
    booking_id: newId(),
    room_id: room.room_id,
    room_name: room.room_name,
    building: room.building,
    professor_id: currentUser?.id ?? 'sample-professor',
    professor_name: currentUser?.display_name ?? 'Sample Professor',
    session_date: body.date,
    start_time: body.start_time,
    end_time: body.end_time,
    course: body.course,
    group_code: body.group_code,
    student_count: Number(body.student_count),
    status: settings.approval_mode === 'instant' ? 'confirmed' : 'pending',
    created_at: new Date().toISOString(),
  };
  bookings.unshift(booking);
  return { booking: { ...booking } };
}

export async function myBookings(scope = 'upcoming', options) {
  await pause(options);
  guardSession();
  const mine = bookings.filter((booking) => !currentUser || booking.professor_id === currentUser.id);
  const visible = scope === 'all' ? mine : mine.filter((booking) => booking.session_date >= dateString(0) && booking.status !== 'cancelled' && booking.status !== 'rejected');
  return { bookings: visible.map((booking) => ({ ...booking })) };
}

export async function cancelBooking(bookingId, body = {}, options) {
  await pause(options);
  const booking = bookings.find((item) => item.booking_id === bookingId);
  if (!booking) throw mockError(404, 'booking_not_found', 'That booking could not be found.');
  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    throw mockError(409, 'invalid_state', 'This booking has already changed status. Refresh the list.');
  }
  if (booking.session_date < dateString(0)) {
    throw mockError(409, 'cancellation_not_allowed', 'This session already started, so it cannot be cancelled.');
  }
  booking.status = 'cancelled';
  booking.updated_at = new Date().toISOString();
  booking.reason = body.reason || null;
  return { booking: { ...booking } };
}

export async function adminBookings(params = {}, options) {
  await pause(options);
  guardSession();
  const visible = bookings.filter((booking) => {
    if (params.status && booking.status !== params.status) return false;
    if (params.from && booking.session_date < params.from) return false;
    if (params.to && booking.session_date > params.to) return false;
    return true;
  });
  return { bookings: visible.map((booking) => ({ ...booking })) };
}

export async function approveBooking(bookingId, options) {
  await pause(options);
  const booking = bookings.find((item) => item.booking_id === bookingId);
  if (!booking) throw mockError(404, 'booking_not_found', 'That booking could not be found.');
  booking.status = 'confirmed';
  return { booking: { ...booking } };
}

export async function rejectBooking(bookingId, body, options) {
  await pause(options);
  const booking = bookings.find((item) => item.booking_id === bookingId);
  if (!booking) throw mockError(404, 'booking_not_found', 'That booking could not be found.');
  if (!body?.reason?.trim()) {
    throw mockError(422, 'validation_error', 'Enter a reason before rejecting the booking.', { fields: { reason: 'required' } });
  }
  booking.status = 'rejected';
  booking.reason = body.reason.trim();
  return { booking: { ...booking } };
}

export async function audit(params = {}, options) {
  await pause(options);
  const limit = Number(params.limit) || 100;
  const offset = Number(params.offset) || 0;
  const entries = [
    { id: 7, actor: 'Amine B.', action: 'settings_updated', entity_type: 'system_settings', entity_id: 'approval_mode', detail: 'instant', created_at: '2026-11-26T08:12:00' },
    { id: 6, actor: 'SARAH K.', action: 'booking_confirmed', entity_type: 'booking', entity_id: 'bk-004', detail: 'A102, 10:00-12:00', created_at: '2026-11-26T07:48:00' },
    { id: 5, actor: null, action: 'login_failed', entity_type: 'user', entity_id: 'unknown', detail: 'Invalid password', created_at: '2026-11-26T07:20:00' },
    { id: 4, actor: 'Amine B.', action: 'schedule_imported', entity_type: 'import', entity_id: 'imp-002', detail: '118 valid rows', created_at: '2026-11-25T16:05:00' },
    { id: 3, actor: 'SARAH K.', action: 'booking_requested', entity_type: 'booking', entity_id: 'bk-003', detail: 'B204, 14:00-15:00', created_at: '2026-11-25T11:30:00' },
    { id: 2, actor: 'Amine B.', action: 'room_updated', entity_type: 'room', entity_id: 'C301', detail: 'capacity set to 32', created_at: '2026-11-24T13:15:00' },
    { id: 1, actor: 'SARAH K.', action: 'booking_cancelled', entity_type: 'booking', entity_id: 'bk-001', detail: 'A101, 09:00-10:00', created_at: '2026-11-23T09:40:00' },
  ];
  return { entries: entries.slice(offset, offset + limit) };
}

export async function getSettings(options) {
  await pause(options);
  return { settings: structuredClone(settings) };
}

export async function patchSettings(body, options) {
  await pause(options);
  if (body.approval_mode !== undefined) settings.approval_mode = body.approval_mode;
  if (body.pending_blocks_room !== undefined) settings.pending_blocks_room = Boolean(body.pending_blocks_room);
  if (body.working_hours) settings.working_hours = { ...body.working_hours };
  if (body.working_days) settings.working_days = [...body.working_days];
  if (body.min_booking_minutes !== undefined) settings.min_booking_minutes = Number(body.min_booking_minutes);
  if (body.max_booking_minutes !== undefined) settings.max_booking_minutes = Number(body.max_booking_minutes);
  return { settings: structuredClone(settings) };
}

export async function importPreview(kind, file, options) {
  await pause(options);
  if (!file) throw mockError(422, 'validation_error', 'Choose a file.', { fields: { file: 'required' } });
  if (file.size > 5 * 1024 * 1024) throw mockError(413, 'file_too_large', 'This file is over 5 MB. Split it or remove unused rows.');
  if (!/\.(csv|xlsx)$/i.test(file.name)) throw mockError(415, 'unsupported_file_type', 'Use a .csv or .xlsx file.');

  const importId = `imp-${nextImportId++}`;
  const invalid = /invalid|error/i.test(file.name);
  const errors = invalid
    ? [
        { row: 7, field: 'room_id', code: 'unknown_room', message: 'Room Z999 is not in the room register.' },
        { row: 12, field: 'start_time', code: 'invalid_time_range', message: 'End time must be after start time.' },
      ]
    : [];
  const warnings = invalid
    ? []
    : [{ row: 0, code: 'booking_conflict', message: 'One imported official session overlaps an existing confirmed booking.' }];
  const preview = [
    { room_id: 'A101', room_name: 'Classroom A101', capacity: 40, room_type: 'classroom', building: 'Block A', equipment: ['projector'], active: true },
    { room_id: 'A102', room_name: 'Classroom A102', capacity: 40, room_type: 'classroom', building: 'Block A', equipment: ['projector'], active: true },
  ];
  const record = {
    import_id: importId,
    kind,
    filename: file.name,
    total_rows: 120,
    valid_rows: invalid ? 118 : 120,
    errors,
    errors_truncated: false,
    warnings,
    preview,
    publishable: errors.length === 0,
  };
  stagedImports.set(importId, record);
  return record;
}

export async function importPublish(importId, options) {
  await pause(options);
  const record = stagedImports.get(importId);
  if (!record) throw mockError(404, 'import_not_found', 'That import has expired. Review the file again.');
  if (!record.publishable) throw mockError(409, 'import_has_errors', 'This file has errors. Fix them before publishing.');
  return { published: true, kind: record.kind, rows_published: record.valid_rows };
}

export async function getMetrics(params = {}, options) {
  await pause(options);
  const range = { from: params.from ?? dateString(-5), to: params.to ?? dateString(0) };
  return metricsFor(range);
}

export async function getInsights(body, options) {
  await pause(options);
  const range = { from: body?.from ?? dateString(-5), to: body?.to ?? dateString(0) };
  const metrics = metricsFor(range);
  const language = body?.lang || 'en';
  const texts = {
    en: {
      observation: 'Block A has the highest utilization in this range at 74.6%.',
      suggestion: 'Laboratory C301 has 39.0 idle hours; consider it for sessions that need computers.',
    },
    fr: {
      observation: 'Le bloc A affiche la plus forte utilisation de la période, à 74,6%.',
      suggestion: 'Le laboratoire C301 compte 39,0 heures libres ; envisagez-le pour les séances avec ordinateurs.',
    },
    ar: {
      observation: 'سجل مبنى A أعلى نسبة استخدام في هذه الفترة، وهي 74.6%.',
      suggestion: 'يحتوي مختبر C301 على 39.0 ساعة غير مستخدمة؛ يمكن التفكير فيه للحصص التي تحتاج حواسيب.',
    },
  };
  const localized = texts[language] ?? texts.en;
  return {
    range,
    metrics,
    insights: [
      {
        id: 'top_building_utilization',
        kind: 'observation',
        text: localized.observation,
        evidence: [
          { metric: 'by_building[Block A].utilization_rate', label: 'Block A utilization', value: 0.746, display: '74.6%' },
        ],
      },
      {
        id: 'idle_room_capacity',
        kind: 'suggestion',
        text: localized.suggestion,
        evidence: [
          { metric: 'by_room[C301].idle_hours', label: 'C301 idle hours', value: 39.0, display: '39.0' },
        ],
      },
    ],
    engine: 'template',
    generated_ms: 9,
  };
}

export async function patchRoom(roomId, body, options) {
  await pause(options);
  const room = roomById(roomId);
  if (!room) throw mockError(404, 'room_not_found', 'That room could not be found.');
  if (body.room_name !== undefined) room.room_name = body.room_name;
  if (body.capacity !== undefined) room.capacity = Number(body.capacity);
  if (body.room_type !== undefined) room.room_type = body.room_type;
  if (body.building !== undefined) room.building = body.building;
  if (body.equipment !== undefined) room.equipment = [...body.equipment];
  if (body.active !== undefined) room.active = Boolean(body.active);
  return { room: { ...room, equipment: [...room.equipment] } };
}

export const mockMetadata = {
  rooms,
  settings,
  weekdays: WEEKDAYS,
};
