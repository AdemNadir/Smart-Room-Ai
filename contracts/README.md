# SMART ROOM AI — Parallel starter

## Start simultaneously; do not wait for another member
- **Member 1 (AI):** implement `POST /ai/parse-request`, room-ranking function, and `/admin/ai-insights`. Return the exact shapes in the contract.
- **Member 2 (Backend):** implement database, `/health`, `/rooms`, `/search/rooms`, `/bookings`, `/admin/overview`, and LAN/offline setup.
- **Member 3 (Frontend):** build React screens immediately using `mock-data.json`; later replace mock imports with real API calls. Do not wait for backend.

## Suggested repository
```
smart-room-ai/
  contracts/
    smart_room_api_contract.json
    mock-data.json
  backend/
  frontend/
  ai/
```

## Integration protocol
1. Agree to this contract and commit it first.
2. Each member works in their own folder/branch.
3. If you need a different field or endpoint, discuss it and update the contract together.
4. Day 1 integration: AI text -> criteria JSON; backend criteria -> available rooms; frontend mocks -> working screens.
5. Day 2: connect AI + backend + frontend.
6. Day 3: test double-booking, LAN/offline operation, and demo.

**Critical:** AI never decides availability. Backend checks the timetable and existing bookings, and re-checks inside a database transaction when the professor presses Book. Return HTTP 409 if another booking has taken the slot.
