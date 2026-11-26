import { t } from '../../strings.js';
import StatusPill from '../common/StatusPill.jsx';

function dateParts(value, lang) {
  if (!value) return { day: '--', month: '' };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: value, month: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', { month: 'short' }).format(date),
  };
}

export default function BookingCard({ lang, booking, actions }) {
  const parts = dateParts(booking.session_date, lang);
  return (
    <article className="booking-card">
      <div className="booking-date">
        <strong>{parts.day}</strong>
        <span>{parts.month}</span>
      </div>
      <div className="booking-details">
        <h3 dir="auto" lang={lang}>{booking.course}</h3>
        <p>{booking.room_name} · {booking.building}</p>
        <p>{booking.start_time}–{booking.end_time} · {t(lang, 'common.groupCode')}: {booking.group_code} · {booking.student_count} {t(lang, 'common.students').toLowerCase()}</p>
        <StatusPill lang={lang} status={booking.status} />
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </article>
  );
}
