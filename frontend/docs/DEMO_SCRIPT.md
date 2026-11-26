# Demo script — mock mode

These scenarios were walked through in the browser against the Vite dev server with `VITE_USE_MOCK=1`. They use synthetic fixtures only; no backend is required.

## Start

```powershell
cd frontend
$env:VITE_USE_MOCK='1'; npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. The mock banner is visible on every screen. Any non-empty password works.

## 1. Professor search and booking (happy path)

1. Sign in as `prof.demo` / `demo`.
2. On **Search**, enter: `I need a lab for 35 students on Monday from 10:00 to 12:00 with computers and a projector.`
3. Select **Read my request**. The preview shows the parsed criteria and `Request language: English`.
4. Change any field if needed, then select **Search**.
5. Confirm the server-ordered results: A102 (0.87), B204 (0.79), C301 (0.71), plus the excluded-room count. Each card shows reasons, Day-Strip legend, and free window.
6. Select **Book this room** on A102. Enter course `CS 401`, group `L3-G2`, and 35 students.
7. Select **Book this room** in the dialog. Expect **Room booked.** with status **Confirmed**.
8. Open **My bookings**. Expect the new session. Open **Cancel booking**, confirm, and expect **Cancelled** with the release message.

## 2. Conflict recovery

1. Repeat scenario 1 steps 2–5 as `prof.demo`.
2. Open the booking dialog for **Lecture Hall B204** and submit any valid course/group.
3. Expect **Someone just booked this room.** and server-provided alternatives with **Book instead** actions.
4. Select **Book instead** on an alternative, or **Change time** to return to criteria.

Trigger: booking `A101` or `B204` always returns `booking_conflict` in mock mode.

## 3. Eligibility recovery

1. In the booking dialog, set course to a value containing `eligib`, for example `eligib check`.
2. Submit the booking.
3. Expect **This room is no longer suitable.**, the server reason, and alternative rooms.

Trigger: any course containing `eligib`, or more than 80 students, returns `room_not_eligible`.

## 4. Timetable import (clean and error preview)

1. Sign out and sign in as `admin.demo` / `demo`.
2. Open **Import** in the administration navigation.
3. Choose `docs/sample-schedule.csv` from the workspace and set **Data type** to **Official timetable**.
4. Select **Review file**. Expect 120 rows, 120 valid, 0 errors, a conflict warning, and two preview rows.
5. Select **Publish import**. Expect **Import published. 120 rows saved.** and the publish step marked complete.
6. Choose `docs/sample-schedule-errors.csv` and review it. Expect 118 valid rows, two row errors (`unknown_room`, `invalid_time_range`), status **Rejected**, and a disabled publish action with the error hint.

Trigger: any file name containing `invalid` or `error` produces the error preview.

## 5. Approval workflow, insights, and audit

1. As `admin.demo`, open **Settings**, choose **Administrator approval**, and save. Expect **Settings saved.**
2. Sign out, sign in as `prof.demo`, and create a booking through scenario 1 steps 2–7. Expect **Request sent.** and **Pending approval**.
3. Sign out, sign in as `admin.demo`, and open **Bookings**. Expect the pending row with **Approve** and **Reject**.
4. Select **Approve**. Expect **Booking approved.** and status **Confirmed**.
5. Create another pending booking as `prof.demo`, return to **Bookings**, select **Reject**, enter a reason, and submit. Expect **Booking rejected.** and status **Rejected**.
6. Open **Dashboard**, select **Generate summary**. Expect server metrics and insights with evidence chips.
7. Open **Insights**, generate a summary, then open **Audit log** to see the append-only entries.
8. Return to **Settings** and save **Instant confirmation** to restore the demo default.

## Error and session recovery lines

| Trigger (username) | Expected UI |
| --- | --- |
| `rate-limit-user` | Too-many-attempts error on the sign-in form |
| `network-user` | Offline/network error with retry guidance |
| `expire-user` | Sign-in succeeds; the next request returns to sign-in with **Your session ended. Sign in again.** |

`not_authenticated` is handled only as a session expiry. Invalid credentials remain on the sign-in form with their server message.

## Responsive check

- At 360px: the mobile menu button replaces the inline navigation; opening it reveals the role links. No horizontal overflow; headings and forms remain readable.
- At 1280px: navigation is inline, results use the wide layout, and no horizontal overflow occurs.

These checks used local preview wrappers around the running app because the browser tool has no viewport-resize control; the wrappers were removed after the check.
