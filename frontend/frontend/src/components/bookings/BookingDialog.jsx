import { useState } from 'react';
import { t } from '../../strings.js';
import { createBooking } from '../../services/api.js';
import { errorMessage, fieldError, formatScore } from '../../utils/format.js';
import { validateBooking } from '../../utils/validation.js';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import StatusPill from '../common/StatusPill.jsx';
import { Field } from '../forms/Fields.jsx';

export default function BookingDialog({ lang, result, criteria, meta, onClose, onSuccess }) {
  const [active, setActive] = useState(result);
  const [form, setForm] = useState({ course: '', group_code: '', student_count: criteria?.student_count ?? '' });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [alternatives, setAlternatives] = useState([]);

  const room = active?.room || {};
  const roomType = room.room_type || null;
  const requiredEquipment = criteria?.required_equipment || [];

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const localErrors = validateBooking(form, form.student_count);
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setPhase('form');
      return;
    }

    setSubmitting(true);
    setErrors({});
    setError(null);
    try {
      const response = await createBooking({
        room_id: room.room_id,
        date: criteria.date,
        start_time: criteria.start_time,
        end_time: criteria.end_time,
        course: form.course.trim(),
        group_code: form.group_code.trim(),
        student_count: Number(form.student_count),
        required_equipment: requiredEquipment,
        room_type: roomType,
      });
      setBooking(response.booking);
      setPhase('success');
      onSuccess?.(response.booking);
    } catch (requestError) {
      setError(requestError);
      if (requestError.fields) {
        setErrors(requestError.fields);
        setPhase('form');
      } else if (requestError.code === 'booking_conflict') {
        setAlternatives(requestError.extra?.alternatives || []);
        setPhase('conflict');
      } else if (requestError.code === 'room_not_eligible') {
        setAlternatives(requestError.extra?.alternatives || []);
        setPhase('eligible');
      } else {
        setPhase('requestError');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function bookAlternative(alternative) {
    setActive(alternative);
    setAlternatives([]);
    setError(null);
    setErrors({});
    setPhase('form');
  }

  const footer = phase === 'success'
    ? <button className="btn btn-primary" type="button" onClick={onClose}>{t(lang, 'booking.close')}</button>
    : phase === 'form'
      ? (
        <>
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={submitting}>{t(lang, 'common.cancel')}</button>
          <button className="btn btn-primary" type="submit" form="booking-form" disabled={submitting}>
            <Icon name="book" size={16} />
            {submitting ? t(lang, 'booking.submitting') : t(lang, 'booking.submit')}
          </button>
        </>
      )
      : (
        <>
          <button className="btn btn-secondary" type="button" onClick={onClose}>{t(lang, 'booking.close')}</button>
          <button className="btn btn-primary" type="button" onClick={() => setPhase('form')}>{t(lang, 'booking.changeTime')}</button>
        </>
      );

  return (
    <Modal lang={lang} title={t(lang, 'booking.title')} onClose={onClose} footer={footer}>
      {phase === 'form' && (
        <form id="booking-form" onSubmit={submit} noValidate>
          <div className="summary-card">
            <dl>
              <dt>{t(lang, 'common.room')}</dt>
              <dd dir="auto">{room.room_name || room.room_id} · {room.building}</dd>
              <dt>{t(lang, 'common.date')}</dt>
              <dd>{criteria?.date}</dd>
              <dt>{t(lang, 'common.startTime')}</dt>
              <dd>{criteria?.start_time}–{criteria?.end_time}</dd>
              <dt>{t(lang, 'common.capacity')}</dt>
              <dd>{room.capacity}</dd>
            </dl>
          </div>

          <div className="criteria-grid" style={{ marginTop: 'var(--space-5)' }}>
            <Field id="booking-course" label={t(lang, 'booking.course')} error={errors.course ? fieldError(lang, errors.course) : null} className="span-all">
              <input
                className="input"
                id="booking-course"
                value={form.course}
                maxLength={120}
                aria-invalid={Boolean(errors.course)}
                onChange={(event) => setForm({ ...form, course: event.target.value })}
              />
            </Field>
            <Field id="booking-group" label={t(lang, 'booking.groupCode')} hint={t(lang, 'booking.groupPlaceholder')} error={errors.group_code ? fieldError(lang, errors.group_code) : null}>
              <input
                className="input"
                id="booking-group"
                value={form.group_code}
                maxLength={30}
                aria-invalid={Boolean(errors.group_code)}
                onChange={(event) => setForm({ ...form, group_code: event.target.value })}
              />
            </Field>
            <Field id="booking-students" label={t(lang, 'booking.students')} error={errors.student_count ? fieldError(lang, errors.student_count) : null}>
              <input
                className="input"
                id="booking-students"
                type="number"
                min="1"
                max="1000"
                value={form.student_count}
                aria-invalid={Boolean(errors.student_count)}
                onChange={(event) => setForm({ ...form, student_count: event.target.value })}
              />
            </Field>
          </div>
          <p className="small muted" style={{ marginTop: 'var(--space-4)' }}>{t(lang, 'search.detailsFromServer')}</p>
        </form>
      )}

      {phase === 'success' && (
        <div>
          <div className="inline-alert success">
            <Icon name="check" size={16} />
            <span>{booking?.status === 'pending' ? t(lang, 'booking.pendingTitle') : t(lang, 'booking.successTitle')}</span>
          </div>
          <p>{booking?.status === 'pending' ? t(lang, 'booking.pendingBody') : t(lang, 'booking.successBody', {
            room: booking?.room_name,
            date: booking?.session_date,
            start: booking?.start_time,
            end: booking?.end_time,
          })}</p>
          <StatusPill lang={lang} status={booking?.status} />
        </div>
      )}

      {(phase === 'conflict' || phase === 'eligible') && (
        <div>
          <div className="inline-alert error">
            <Icon name="alert" size={16} />
            <span>{t(lang, phase === 'conflict' ? 'booking.conflictTitle' : 'booking.eligibleTitle')}</span>
          </div>
          <p>{t(lang, phase === 'conflict' ? 'booking.conflictBody' : 'booking.eligibleBody')}</p>
          {error?.extra?.reason && <StatusPill lang={lang} status={error.extra.reason} />}
          {alternatives.length > 0 ? (
            <div className="result-list" style={{ marginTop: 'var(--space-4)' }}>
              {alternatives.map((alternative) => (
                <div className="room-card plain" key={alternative.room?.room_id}>
                  <div className="room-card-head">
                    <div className="room-title">
                      <h3 dir="auto">{alternative.room?.room_name}</h3>
                      <div className="room-meta">
                        <span>{alternative.room?.building}</span>
                        <span>{alternative.room?.capacity}</span>
                        <span>{t(lang, 'search.matchScore', { score: formatScore(alternative.score) })}</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => bookAlternative(alternative)}>
                      {t(lang, 'booking.bookInstead')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">{t(lang, 'booking.noAlternatives')}</p>
          )}
        </div>
      )}

      {phase === 'requestError' && (
        <div className="inline-alert error" role="alert">
          <Icon name="alert" size={16} />
          <span>{errorMessage(lang, error)}</span>
        </div>
      )}
    </Modal>
  );
}
