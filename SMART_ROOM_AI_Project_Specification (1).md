# SMART ROOM AI

## Offline-first intelligent university classroom discovery, booking, and space intelligence platform

**Tagline:** Find the right room. Avoid conflicts. Use campus space intelligently.  
**Project type:** AI-powered university room discovery and booking system with administrative space intelligence.  
**Hackathon context:** Lightweight AI for the Algerian university; three-person team; three-day prototype.  
**Deployment target:** Local university server accessible over campus Wi-Fi/LAN. Core features and selected AI capabilities must work without an internet connection.

---

## 1. Executive summary

At some universities, professors who need an additional session may look for an empty classroom themselves. This informal process wastes time and can create conflicts: one professor may occupy a room while another professor independently assumes that the same room is still available.

**SMART ROOM AI** provides a shared, offline-first platform where professors can describe the classroom they need, discover suitable available rooms, and register an additional session. Once a booking is confirmed, the room is immediately marked as occupied for that period for every other user connected to the local network.

The platform combines three AI capabilities selected for the hackathon:

1. **Natural-language classroom search:** understand requests such as “Find a room tomorrow from 10 to 12 for 35 students with a projector.”
2. **Intelligent room recommendation:** rank genuinely available rooms according to capacity, equipment, room type, location preferences, and utilization, and explain the ranking.
3. **AI-generated administrative insights:** turn verified room-usage statistics into concise explanations and recommendations for administrators.

The platform also includes deterministic room-availability checks, booking-conflict prevention, schedule import, and a management dashboard. These core operations must never depend on AI guesses.

SMART ROOM AI does not need a cloud API or continuous internet access. A local server hosts the application and database; professors and administrators access it through the university LAN/Wi-Fi. The prototype can use synthetic or anonymized room and timetable data.

## 2. Problem and beneficiaries

### 2.1 The observed problem

- Professors sometimes need an additional session outside the regular timetable.
- They may search for an apparently empty classroom informally.
- Other professors may independently select the same room and time.
- There may be no shared, up-to-date record of these additional sessions.
- A room may be technically free but unsuitable because of capacity, room type, or equipment.
- Administrators may lack a clear overview of room demand and utilization.

### 2.2 Beneficiaries

- **Professors:** find and reserve suitable classrooms without walking around or relying on informal communication.
- **Department and faculty administrators:** see additional bookings, manage room data, and understand utilization patterns.
- **Students:** benefit indirectly from fewer scheduling disruptions and better use of available rooms.
- **University facilities/room managers:** obtain a clearer view of demand and room usage.

### 2.3 Important assumptions to validate

Before deployment, the university must confirm who is allowed to reserve rooms, whether some rooms require approval, which timetable is authoritative, and whether the campus network is available in the relevant buildings. The prototype should support a configurable approval mode rather than assuming every professor can reserve every room without restriction.

## 3. Product goals and boundaries

### Goals

- Provide one shared source of truth for room availability.
- Combine the official timetable with additional sessions registered in SMART ROOM.
- Let professors search using normal filters or natural language.
- Recommend the most suitable available rooms and explain why.
- Prevent two users from confirming overlapping bookings for the same room.
- Give administrators understandable room-usage insights.
- Work on a local network without requiring internet access.
- Keep the system usable even if the optional local language model is unavailable.

### Out of scope for the three-day MVP

- Replacing the university's official timetable or student information system.
- Automatically changing official classes.
- Predicting actual attendance without reliable attendance data.
- Automatic whole-semester timetable optimization.
- Cloud synchronization or external AI APIs.
- Mobile native applications, IoT occupancy sensors, or camera-based room occupancy detection.
- Complex integrations with university identity systems.

## 4. MVP scope and priorities

| Feature | Priority | Notes |
|---|---|---|
| Room and timetable import (CSV/XLSX) | Must | Admin imports existing data using a documented template |
| Room search by date and time | Must | Deterministic availability engine |
| Combine official schedule and extra bookings | Must | Both sources block the room |
| Register and cancel an extra session | Must | Permission/approval mode configurable |
| Prevent overlapping bookings | Must | Enforced by backend transaction/constraint logic |
| Natural-language room search | Must | AI extracts search criteria; backend verifies results |
| Explainable room recommendations | Must | Ranked only after hard availability filters |
| Administrative usage dashboard | Must | Uses verified booking and schedule data |
| AI-generated administrative insights | Must | Grounded only in computed metrics |
| Role-based access (professor/admin) | Must | Simple authentication for prototype |
| Export summary/report | Should | CSV or printable HTML if time allows |
| Arabic/French/English requests | Should | Demonstrate at least two languages reliably; three if feasible |
| Offline local-network operation | Must | Tested with internet disconnected |
| Forecasting, anomaly detection, local LLM chat | Later | Not part of the committed MVP |

## 5. Main user workflows

### 5.1 Professor: find and book a room

1. Professor opens SMART ROOM from a device connected to the campus LAN/Wi-Fi.
2. Professor chooses either structured search filters or the AI request box.
3. Example natural-language request: “I need a classroom tomorrow from 10:00 to 12:00 for 35 students, preferably with a projector.”
4. The AI parser extracts the date, start time, end time, expected student count, equipment, and preferences. The interface shows the extracted criteria so the professor can correct them.
5. The availability engine checks the official timetable and all confirmed additional bookings.
6. Rooms that fail hard constraints (occupied, too small, wrong required type/equipment) are excluded.
7. The recommendation engine ranks the remaining rooms and explains each match.
8. Professor selects a room, enters the course/group/session details, and submits the booking.
9. Backend rechecks availability at confirmation time and records the booking atomically. If another user has just booked the room, the request is rejected and fresh alternatives are shown.
10. The confirmed booking immediately appears as occupied to every connected user.

### 5.2 Professor: view or cancel a booking

- Professor can view their own upcoming registered sessions.
- Cancellation is permitted according to the configured policy and recorded in booking history.
- A cancelled booking releases the room only after the backend confirms the cancellation.

### 5.3 Administrator: manage rooms and official schedule

1. Admin imports or updates room details and official timetable data.
2. System validates columns, room IDs, time ranges, room capacities, and duplicate records.
3. Admin reviews import errors before publishing the data.
4. Admin can inspect additional bookings, approve them if approval mode is enabled, cancel invalid entries, and view audit history.
5. Admin opens the intelligence dashboard and generates a grounded summary of room usage.

### 5.4 Booking approval modes

Support one configuration setting:

- **Instant confirmation:** an authorized professor's valid booking is confirmed immediately.
- **Admin approval:** a professor submits a request; it blocks the room only after approval, or can be marked as a temporary pending hold if the university chooses that policy.

For the hackathon demo, use instant confirmation to keep the workflow simple, while showing that approval mode can be added/configured.

## 6. Data model

Use a relational database. SQLite is acceptable for a single-machine prototype; PostgreSQL is preferred if the team can configure it quickly for multi-user LAN use.

### 6.1 `rooms`

| Field | Type | Description | Example |
|---|---|---|---|
| room_id | string, primary key | Unique room code | A101 |
| room_name | string | Display name | Classroom A101 |
| capacity | integer | Maximum seats | 40 |
| room_type | string | lecture/classroom/lab/amphitheatre | classroom |
| building | string | Building/block | Block A |
| equipment | JSON or related table | Available equipment | projector, whiteboard |
| active | boolean | Whether room can be booked | true |

### 6.2 `official_sessions`

| Field | Type | Description |
|---|---|---|
| session_id | string, primary key | Official session identifier |
| day/date | date or recurring weekday | Session date or timetable day |
| start_time | time | Start |
| end_time | time | End |
| room_id | foreign key | Assigned room |
| course | string | Course/module |
| group_code | string | Anonymous group code |
| student_count | integer | Expected group size |
| session_type | string | lecture/TD/TP/exam |

### 6.3 `bookings`

| Field | Type | Description |
|---|---|---|
| booking_id | UUID/string, primary key | Booking identifier |
| room_id | foreign key | Selected room |
| professor_id | foreign key/string | Authenticated user |
| session_date | date | Booking date |
| start_time | time | Start |
| end_time | time | End |
| course | string | Session subject |
| group_code | string | Group identifier |
| student_count | integer | Expected attendance |
| status | enum | pending/confirmed/cancelled/rejected |
| created_at | timestamp | Audit timestamp |

### 6.4 Supporting tables

- `users`: user ID, display name, role, password hash or prototype-safe credentials.
- `booking_history`: booking ID, actor, action, timestamp, optional reason.
- `room_equipment`: room ID and equipment item if not stored as JSON.
- `system_settings`: approval mode, working hours, default slot settings.

Do not store student personal information. Use group codes and synthetic professor accounts in the demo.

## 7. Availability and booking logic (deterministic)

### 7.1 Sources of unavailability

A room is unavailable if the requested interval overlaps either:

- an official session in `official_sessions`, or
- a confirmed additional booking in `bookings`.

Pending bookings block a room only if the configured policy explicitly enables temporary holds.

### 7.2 Time overlap rule

Two intervals overlap when:

`start1 < end2 AND start2 < end1`

Intervals are treated as half-open `[start, end)`. Therefore, a session ending at 10:00 does not conflict with another beginning at 10:00.

### 7.3 Hard constraints

A room is eligible only if:

1. It is active.
2. It has no overlapping official session.
3. It has no overlapping confirmed additional booking.
4. Its capacity is at least the requested student count.
5. It satisfies any mandatory room-type or equipment requirements.

### 7.4 Concurrency and double-booking prevention

Availability shown in the search results can become stale if another professor books the room at the same time. Therefore, the backend MUST recheck availability during booking confirmation inside a database transaction. Use an appropriate transaction/locking strategy and, where supported, a database constraint or serialized booking operation. If a conflict is found, reject the booking and return updated alternatives. Never rely only on frontend checks.

### 7.5 Booking state transitions

`requested → confirmed` for instant-confirmation mode, or `requested → pending → confirmed/rejected` for approval mode. A confirmed booking may become `cancelled`. All state changes must be validated and logged.

## 8. The three selected AI capabilities

The committed AI scope is a combination of feature 1 (natural-language search), feature 2 (intelligent recommendations), and feature 5 (AI-generated administrative insights). Forecasting and anomaly detection are deliberately postponed to protect the three-day delivery.

### 8.1 AI capability 1: natural-language classroom search

**User experience:** A professor can type or paste a request in ordinary language instead of manually filling every filter.

Example inputs:

- English: “Find a room tomorrow from 10 to 12 for 35 students with a projector.”
- French: “Je cherche une salle demain de 10h à 12h pour 35 étudiants avec un projecteur.”
- Arabic: “أحتاج قاعة غداً من العاشرة إلى منتصف النهار لـ 35 طالباً وبها جهاز عرض.”

**AI output:** structured search criteria, for example:

```json
{
  "date": "resolved-local-date",
  "start_time": "10:00",
  "end_time": "12:00",
  "student_count": 35,
  "required_equipment": ["projector"],
  "room_type": null,
  "preferences": []
}
```

The date placeholder above is illustrative: the application must resolve relative dates using its configured local date/time and ask for clarification if the request is ambiguous.

**Implementation approach:**

- Use a small multilingual local model or lightweight NLP pipeline to identify intent and extract entities/slots.
- Keep a deterministic validation layer for date, time, capacity, and supported equipment names.
- Show the extracted criteria to the professor for confirmation/editing.
- Send only validated structured parameters to the availability engine.
- If the model is unavailable or uncertain, fall back to normal search filters and ask the user to clarify missing details.

**Critical safety rule:** the language model does not decide whether a room is free. It only interprets the request. The database-backed availability engine is the sole source of truth.

### 8.2 AI capability 2: intelligent, explainable room recommendation

After deterministic filtering, rank eligible rooms by suitability.

Potential ranking signals:

- Capacity fit: enough seats without excessive unused capacity.
- Required and preferred equipment match.
- Room-type match (lecture, classroom, lab, etc.).
- Building/location preference if reliable location data exists.
- Lower scheduled utilization as a secondary preference, not as a reason to override availability or mandatory constraints.

**Three-day implementation:** begin with a transparent weighted ranking model. Normalize each feature and calculate a score only for eligible rooms. Display both the score and human-readable reasons. Example: “Recommended because it is available for the full interval, has 40 seats for 35 students, includes a projector, and matches the requested classroom type.”

Do not claim that the ranking is a trained machine-learning model unless it is actually trained and evaluated. A weighted recommender is a valid intelligent decision-support component and is explainable. A learned ranking model can be a later improvement if real preference/selection data becomes available.

### 8.3 AI capability 5: AI-generated administrative insights

The admin dashboard calculates verified metrics first. The AI then converts those metrics into concise natural-language explanations and possible actions.

Example insight:

> “During the selected week, Building A had the highest scheduled room utilization. Room B204 had several unused time windows that could be considered when assigning additional sessions, provided its equipment and capacity match the requested class.”

Potential dashboard metrics:

- Number of active rooms.
- Scheduled hours and registered extra-booking hours per room/building.
- Utilization rate for a clearly specified date range and working-hours definition.
- Most frequently requested rooms and time periods.
- Number of confirmed, cancelled, and pending additional bookings.
- Available capacity by building and time slot.

**Implementation approach:**

1. Compute all counts, rates, comparisons, and candidate findings using Python/SQL.
2. Pass only these structured facts to a local language model or controlled natural-language generation layer.
3. Ask it to summarize the facts and suggest cautious actions.
4. Display the evidence/metric behind each generated statement.
5. If the local model is unavailable, display deterministic template-based insights.

**Grounding rule:** the AI must not invent statistics, room IDs, utilization rates, or booking events. Every statement must be traceable to calculated metrics. Label recommendations as suggestions, not decisions.

### 8.4 What is not AI

The following are ordinary deterministic software functions and should be described honestly:

- Checking time overlaps.
- Verifying capacity.
- Confirming a room booking.
- Preventing double bookings.
- Counting bookings and calculating utilization percentages.

AI adds value by interpreting natural-language requests, ranking eligible choices, and explaining aggregated information. The deterministic engine guarantees correctness.

## 9. Offline-first architecture

### 9.1 Deployment model

Run the backend, database, frontend assets, and required AI models on one computer or local server inside the university network. Users connect using a browser and the server's local IP/hostname. Internet access is not required after dependencies and model files have been installed.

```text
Professor A browser ----\
Professor B browser -----+---- University Wi-Fi / LAN ---- Local SMART ROOM server
Admin browser ----------/                                  |
                                                            +-- Web frontend
                                                            +-- FastAPI backend
                                                            +-- Availability/booking engine
                                                            +-- AI service (local model)
                                                            +-- Database
                                                            +-- Imported timetable and room data
```

This is offline with respect to the internet, but it still requires the local network to connect multiple devices. A single laptop running the app without a LAN supports only local access from that machine unless it creates a hotspot/network.

### 9.2 Suggested stack

| Component | Suggested technology | Reason |
|---|---|---|
| Frontend | React + Vite, or Streamlit if speed is critical | Responsive professor/admin interfaces |
| Backend | FastAPI | Python APIs and AI integration |
| Database | SQLite for quickest prototype; PostgreSQL for multi-user deployment | Shared persistent data |
| Data import | pandas + openpyxl | CSV/XLSX timetable import |
| Analytics | pandas + SQL | Verified room-usage metrics |
| NLP | Small multilingual model/pipeline downloaded before demo | Offline request parsing |
| Recommendation | Python weighted ranking | Explainable room ranking |
| Insight generation | Local model with structured facts; template fallback | Offline administrative summaries |
| Testing | pytest | Booking and AI-output validation |

Do not add a local LLM runtime unless the team has tested that the chosen model loads and responds quickly on the actual demo laptop. A small local NLP model plus grounded templates is safer than depending on a large model.

### 9.3 Offline preparation checklist

- Install all Python and frontend dependencies before the event/demo.
- Download model weights in advance and store them locally.
- Disable external API calls in the application configuration.
- Test the application after disconnecting internet access.
- Ensure frontend assets are bundled locally and do not depend on remote CDNs/fonts/scripts.
- Keep sample data and database backups on the demo machine.
- Record hardware specifications and actual response times.

## 10. Suggested project structure

```text
smart-room-ai/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── rooms.py
│   │   │   ├── bookings.py
│   │   │   ├── admin.py
│   │   │   └── assistant.py
│   │   ├── services/
│   │   │   ├── availability.py
│   │   │   ├── booking_service.py
│   │   │   ├── timetable_import.py
│   │   │   ├── request_parser.py
│   │   │   ├── room_recommender.py
│   │   │   └── insight_generator.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── requirements.txt
│   └── data/
│       ├── sample_rooms.csv
│       └── sample_schedule.csv
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── index.html
├── models/                 # locally stored model files; do not commit large weights unnecessarily
├── tests/
│   ├── test_availability.py
│   ├── test_booking_conflicts.py
│   ├── test_recommendations.py
│   └── test_request_parser.py
├── README.md
└── .gitignore
```

Keep the repository small. Do not create unnecessary layers or commit large model weights unless the hackathon submission requires them; document how to place the pre-downloaded model locally.

## 11. Interface requirements

### Professor interface

1. Login page with professor/admin roles.
2. Search page with both:
   - Standard filters: date, start/end time, student count, room type, equipment.
   - Natural-language request field.
3. Parsed request preview with editable fields.
4. Available room cards showing capacity, building, equipment, and availability interval.
5. Recommendation explanation and score.
6. Booking confirmation page showing session details and status.
7. “My bookings” page with cancellation where permitted.

### Administrator interface

1. Room management and room status.
2. Timetable import, preview, validation errors, and publish action.
3. Booking list with status filters and approval controls if enabled.
4. Utilization dashboard with date-range selection.
5. AI-generated insights with supporting metrics/evidence.
6. Booking history/audit log.

Use clear status labels: Available, Occupied (official timetable), Booked (additional session), Pending approval, and Inactive. Do not show a room as available if the status is uncertain.

## 12. Demo scenario for judges

Prepare synthetic data for several rooms, an official timetable, and multiple professor accounts. Demonstrate the following connected story:

### Demo 1: Natural-language request

Professor A types: “I need a room tomorrow from 10 to 12 for 35 students with a projector.” Show the extracted fields and allow the professor to correct them.

### Demo 2: Intelligent recommendation

Show the genuinely available rooms after hard filtering. Rank the suitable rooms and explain why the first option is the best match.

### Demo 3: Shared booking and conflict prevention

Professor A confirms Room A102. Professor B immediately searches for the same time. A102 must now appear as booked/unavailable. Attempting a simultaneous or stale booking must be rejected by the backend with updated alternatives.

### Demo 4: Administrative intelligence

Admin opens the dashboard and requests a summary. Show computed metrics and a generated explanation that refers only to those metrics. Explain that the data is synthetic if it is synthetic.

### Demo 5: Offline proof

Disconnect internet access while keeping the local LAN active. Repeat a search and booking from two devices connected to the local server. Show that the system remains functional.

## 13. Three-day execution plan

### Day 1 — Shared data and booking foundation

- Create repository, environment, database, and room/user models.
- Prepare synthetic room and timetable data.
- Implement timetable import and validation.
- Implement deterministic availability checks.
- Implement booking creation/cancellation and backend conflict prevention.
- Build the first basic search and booking interface.

**End-of-day deliverable:** professors can search rooms and register additional sessions; overlapping bookings are rejected.

### Day 2 — AI search and recommendation

- Implement natural-language request parsing for the selected languages.
- Show extracted criteria and allow manual correction.
- Connect parsed requests to the deterministic search API.
- Implement hard filtering and explainable room ranking.
- Build the professor booking flow and “My bookings” view.

**End-of-day deliverable:** a professor can describe a request in natural language, receive real available-room results, understand the ranking, and book a room.

### Day 3 — Admin intelligence, offline test, and presentation

- Build admin dashboard and verified usage metrics.
- Add grounded AI-generated summaries with a template fallback.
- Complete role/permission checks and audit history.
- Test two-user booking conflicts.
- Test with internet disconnected and LAN available.
- Prepare a reliable demo dataset and presentation.
- Record actual response time and hardware specifications.

**End-of-day deliverable:** integrated offline-first prototype with three visible AI capabilities and a complete end-to-end demo.

## 14. Three-person task distribution

| Team member | Primary ownership | Shared integration responsibilities |
|---|---|---|
| Member 1 — AI | Natural-language parsing, multilingual tests, recommendation scoring, grounded insight generation | Agree on API schemas with backend; test AI outputs against known cases |
| Member 2 — Backend | Database, authentication/roles, timetable import, availability engine, transactional booking and conflict prevention, APIs | Provide stable endpoints and test simultaneous bookings |
| Member 3 — Frontend | Professor search/booking UI, parsed-request preview, room cards, admin dashboard and visualizations | Integrate APIs, test usability, prepare demo flow |

All members should integrate from Day 1. Do not leave integration until the final day. Member 1 should not spend the entire hackathon searching for a large model; build a reliable small-model or fallback path early.

## 15. Testing and success criteria

| Test | Expected result |
|---|---|
| Search overlaps official session | Room is excluded |
| Search overlaps confirmed additional booking | Room is excluded |
| Session ends at 10:00, next starts at 10:00 | No conflict |
| Requested capacity exceeds room capacity | Room is excluded |
| Required projector is missing | Room is excluded if projector is mandatory |
| Two professors try to book same room/time | Only one booking is confirmed |
| Booking is cancelled | Room becomes available if no other block exists |
| Natural-language request has valid details | Correct structured criteria are extracted |
| Natural-language request is ambiguous | System asks for clarification or shows editable parsed fields |
| AI parser unavailable | Standard filters still work |
| Recommendation result | Only eligible rooms are ranked, with valid reasons |
| Admin insight | Every numeric claim matches computed dashboard metrics |
| No rooms satisfy request | System clearly says no suitable room was found and may suggest changing constraints |
| Internet disconnected, LAN active | Multiple devices can still use the system |
| Internet and LAN disconnected | Local machine can still run the app for single-device demo, but shared access is unavailable |

Measure and record:

- Timetable import time.
- Availability search response time.
- Booking confirmation response time.
- NLP parsing response time.
- Number of rooms and timetable entries tested.
- Memory use and hardware specifications.
- Number of passing tests.

Do not invent performance figures or claim real university-wide usage based on synthetic data.

## 16. Privacy, security, and reliability

- Use synthetic or anonymized data for the hackathon.
- Do not store student names, registration numbers, phone numbers, or sensitive academic data.
- Use role-based access: professors manage their own bookings; administrators manage rooms, official schedules, and all bookings.
- Store password hashes if using password authentication; never store plaintext passwords.
- Validate all imported files and user input.
- Keep an audit trail for booking creation, approval, cancellation, and admin changes.
- Do not expose the local server to the public internet for the prototype.
- Keep model inference and data processing local.
- AI-generated summaries must be grounded in verified metrics.
- Human administrators retain authority over policy and room allocation.
- The booking engine, not the AI model, decides whether a booking can be confirmed.

## 17. Risks and mitigations

| Risk | Mitigation |
|---|---|
| No reliable official timetable file | Use a documented CSV/XLSX template and clearly label demo data |
| Professors have different booking permissions | Configurable approval mode and role-based permissions |
| Two professors book simultaneously | Transactional backend recheck and conflict tests |
| Campus Wi-Fi unavailable in some buildings | Host on wired LAN or a local access point for demo; document deployment requirement |
| Local AI model too slow or too large | Use a small pre-downloaded multilingual model and a deterministic fallback |
| AI extracts wrong date/time/capacity | Show parsed fields for confirmation; validate before search |
| AI invents room availability | AI cannot access or fabricate availability; it only calls the deterministic API |
| AI summary hallucinates statistics | Generate facts with SQL/Python and require every summary to cite displayed metrics |
| Imported timetable has inconsistent room IDs | Validate and map room identifiers during import |
| Demo internet outage | Preinstall dependencies, bundle frontend assets, store models locally, test offline |
| SQLite concurrency limitations | Use PostgreSQL for multi-user deployment if feasible; test actual simultaneous requests |

## 18. What makes SMART ROOM AI distinctive

1. It solves a real, observable classroom coordination problem rather than offering a generic campus chatbot.
2. It combines official timetable occupancy with professor-registered extra sessions in one shared source of truth.
3. It supports natural-language search while retaining ordinary filters for users who prefer them.
4. It does not merely list free rooms; it recommends the most suitable room and explains why.
5. It turns room-use data into understandable administrative insights.
6. It prevents booking conflicts through backend transaction logic.
7. It is designed to run on the university's local network without cloud services or continuous internet.
8. It can start as a departmental prototype and later expand to more buildings, faculties, and room types.

## 19. Future development (not required for the hackathon MVP)

- Forecast demand by day and time after enough reliable historical booking data is collected.
- Detect unusual utilization patterns and unexpected booking behavior.
- Learn ranking preferences from anonymized professor selections.
- Add a local conversational assistant for broader room-management questions.
- Add QR check-in or optional room occupancy confirmation, subject to university policy.
- Add maps and walking distance between buildings.
- Add equipment and laboratory resource booking.
- Integrate with the official university timetable or identity provider with authorization.
- Support multiple faculties and campuses.
- Add Arabic, French, and English interface localization.

## 20. Suggested README contents

Keep the repository README concise and include:

1. Project name and short description.
2. Problem and intended beneficiaries.
3. Three AI capabilities: natural-language search, explainable recommendations, grounded admin insights.
4. Main features: shared room availability, extra-session booking, conflict prevention, offline LAN deployment.
5. Architecture and technology stack.
6. Installation and local run instructions.
7. Required room/timetable data format.
8. How to run without internet after dependencies/models are installed.
9. Demo credentials and sample data description (never use real credentials).
10. Hardware specifications, measured performance, known limitations, and whether the data is synthetic.

Example backend setup (adapt to the actual repository and tested commands):

```bash
python -m venv .venv
```

Windows activation:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Run the API (example):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The frontend should be built and served locally. Document the actual commands that the team tests successfully; do not leave placeholder commands in the final README.

## 21. Short French project pitch

> Dans notre université, lorsqu'un enseignant a besoin d'une séance supplémentaire, il peut chercher lui-même une salle libre. Cette méthode informelle peut faire perdre du temps et provoquer des conflits lorsque plusieurs enseignants choisissent la même salle au même moment.
>
> Nous avons développé **SMART ROOM AI**, une plateforme intelligente et utilisable sur le réseau local de l'université, même sans connexion Internet. L'enseignant peut rechercher une salle avec des filtres classiques ou en langage naturel. Le système vérifie les emplois du temps officiels et les réservations supplémentaires, recommande les salles les plus adaptées et empêche les doubles réservations.
>
> Pour l'administration, SMART ROOM AI transforme les données d'utilisation des salles en indicateurs et en synthèses compréhensibles afin d'améliorer la gestion des espaces.
>
> L'intelligence artificielle interprète les demandes, explique les recommandations et résume les indicateurs. La disponibilité réelle et la confirmation des réservations restent contrôlées par un moteur fiable basé sur la base de données.

## 22. Final MVP definition

The three-day prototype is complete when:

1. An administrator can import room details and an official timetable.
2. A professor can search by normal filters.
3. A professor can describe a request in natural language and review the extracted criteria.
4. The system checks both official sessions and confirmed additional bookings.
5. The system recommends and explains suitable available rooms.
6. A professor can register an additional session.
7. Another professor immediately sees that room as unavailable for the booked period.
8. Simultaneous conflicting bookings cannot both be confirmed.
9. The admin dashboard displays verified utilization metrics and grounded AI-generated insights.
10. The application works without internet when accessed through the local university network.

**Final priority:** correctness of room availability and booking first; then natural-language search and recommendations; then administrative insights and visual polish. The project should demonstrate three meaningful AI capabilities without allowing AI to compromise booking correctness.
