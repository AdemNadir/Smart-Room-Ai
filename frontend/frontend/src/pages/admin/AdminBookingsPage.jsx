import { useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { adminBookings, approveBooking, cancelBooking, rejectBooking } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { errorMessage } from '../../utils/format.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatePanel from '../../components/common/StatePanel.jsx';
import Modal from '../../components/common/Modal.jsx';
import Icon from '../../components/common/Icon.jsx';
import BookingCard from '../../components/bookings/BookingCard.jsx';
import { Field } from '../../components/forms/Fields.jsx';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'rejected'];

export default function AdminBookingsPage() {
  const lang = uiLanguage();
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [overrides, setOverrides] = useState({});
  const [pendingId, setPendingId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState('');

  const resource = useResource((signal) => adminBookings(filters, { signal }), [filters.status, filters.from, filters.to]);
  const bookings = (resource.data?.bookings || []).map((booking) => overrides[booking.booking_id] || booking);

  function remember(booking) {
    setOverrides((previous) => ({ ...previous, [booking.booking_id]: booking }));
  }

  async function approve(booking) {
    if (pendingId) return;
    setPendingId(booking.booking_id);
    setActionError(null);
    try {
      const response = await approveBooking(booking.booking_id);
      remember(response.booking);
      setNotice(t(lang, 'admin.approveSuccess'));
    } catch (error) {
      setActionError(error);
    } finally {
      setPendingId(null);
    }
  }

  async function reject(event) {
    event.preventDefault();
    if (!rejecting || pendingId) return;
    if (!reason.trim()) {
      setActionError(new Error(t(lang, 'dialog.requiredReason')));
      return;
    }
    setPendingId(rejecting.booking_id);
    setActionError(null);
    try {
      const response = await rejectBooking(rejecting.booking_id, { reason: reason.trim() });
      remember(response.booking);
      setRejecting(null);
      setReason('');
      setNotice(t(lang, 'admin.rejectSuccess'));
    } catch (error) {
      setActionError(error);
    } finally {
      setPendingId(null);
    }
  }

  async function cancel(booking) {
    if (pendingId) return;
    setPendingId(booking.booking_id);
    setActionError(null);
    try {
      const response = await cancelBooking(booking.booking_id, { reason: 'Cancelled by administrator' });
      remember(response.booking);
      setNotice(t(lang, 'booking.cancelledBody'));
    } catch (error) {
      setActionError(error);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <PageHeader kicker={t(lang, 'admin.opsLabel')} title={t(lang, 'admin.bookingsTitle')} lede={t(lang, 'admin.bookingsIntro')} />

      {notice && <div className="inline-alert success" role="status">{notice}</div>}
      {actionError && <div className="inline-alert error" role="alert">{errorMessage(lang, actionError)}</div>}

      <section className="panel">
        <div className="panel-body tight">
          <div className="admin-filter-row">
            <div className="field">
              <label htmlFor="admin-booking-status">{t(lang, 'admin.statusFilter')}</label>
              <select className="select" id="admin-booking-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">{t(lang, 'admin.statusFilter')}</option>
                {STATUSES.map((status) => <option key={status} value={status}>{t(lang, `status.${status}`)}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="admin-booking-from">{t(lang, 'admin.dateFrom')}</label>
              <input className="input" id="admin-booking-from" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="admin-booking-to">{t(lang, 'admin.dateTo')}</label>
              <input className="input" id="admin-booking-to" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
            </div>
          </div>

          {(resource.status === 'loading' || resource.status === 'refreshing') && (
            <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'common.loading')} />
          )}
          {resource.status === 'error' && (
            <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={errorMessage(lang, resource.error)} onAction={resource.reload} />
          )}
          {resource.status === 'success' && bookings.length === 0 && (
            <StatePanel lang={lang} icon="book" title={t(lang, 'admin.noBookings')} />
          )}
          {resource.status === 'success' && bookings.length > 0 && (
            <div className="result-list">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.booking_id}
                  lang={lang}
                  booking={booking}
                  actions={
                    <>
                      {booking.status === 'pending' && (
                        <button className="btn btn-secondary btn-small" type="button" onClick={() => approve(booking)} disabled={Boolean(pendingId)}>
                          <Icon name="check" size={14} />
                          {pendingId === booking.booking_id ? t(lang, 'admin.approving') : t(lang, 'admin.approve')}
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button className="btn btn-danger btn-small" type="button" onClick={() => { setRejecting(booking); setReason(''); setActionError(null); }} disabled={Boolean(pendingId)}>
                          <Icon name="close" size={14} />
                          {t(lang, 'admin.reject')}
                        </button>
                      )}
                      {!['cancelled', 'rejected'].includes(booking.status) && (
                        <button className="btn btn-quiet btn-small" type="button" onClick={() => cancel(booking)} disabled={Boolean(pendingId)}>
                          {t(lang, 'booking.cancelAction')}
                        </button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {rejecting && (
        <Modal
          lang={lang}
          title={t(lang, 'admin.reject')}
          onClose={() => setRejecting(null)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setRejecting(null)} disabled={Boolean(pendingId)}>{t(lang, 'common.cancel')}</button>
              <button className="btn btn-danger" type="submit" form="reject-form" disabled={Boolean(pendingId)}>{t(lang, 'admin.rejectAction')}</button>
            </>
          }
        >
          <form id="reject-form" onSubmit={reject}>
            <p className="muted" dir="auto">{rejecting.course} — {rejecting.room_name}</p>
            <Field id="reject-reason" label={t(lang, 'admin.rejectReason')}>
              <textarea className="textarea" id="reject-reason" value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} />
            </Field>
            {actionError && <div className="inline-alert error" role="alert" style={{ marginTop: 'var(--space-3)' }}>{errorMessage(lang, actionError)}</div>}
          </form>
        </Modal>
      )}
    </>
  );
}
