import { useState } from 'react';
import { t, uiLanguage } from '../strings.js';
import { cancelBooking, myBookings } from '../services/api.js';
import { useResource } from '../hooks/useResource.js';
import { errorMessage, isOfflineError } from '../utils/format.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatePanel from '../components/common/StatePanel.jsx';
import Modal from '../components/common/Modal.jsx';
import Icon from '../components/common/Icon.jsx';
import BookingCard from '../components/bookings/BookingCard.jsx';

export default function MyBookingsPage() {
  const lang = uiLanguage();
  const [scope, setScope] = useState('upcoming');
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [overrides, setOverrides] = useState({});

  const resource = useResource((signal) => myBookings(scope, { signal }), [scope]);
  const bookings = (resource.data?.bookings || []).map((booking) => overrides[booking.booking_id] || booking);

  async function confirmCancel() {
    if (!selected || cancelling) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const response = await cancelBooking(selected.booking_id, {});
      setOverrides((previous) => ({ ...previous, [selected.booking_id]: response.booking }));
      setCancelSuccess(t(lang, 'booking.cancelledBody'));
      setSelected(null);
    } catch (error) {
      setCancelError(error);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <PageHeader
        kicker={t(lang, 'nav.myBookings')}
        title={t(lang, 'my.pageTitle')}
        lede={t(lang, 'my.pageIntro')}
        actions={
          <div className="segmented" role="group" aria-label={t(lang, 'nav.myBookings')}>
            <button className={scope === 'upcoming' ? 'active' : ''} type="button" onClick={() => setScope('upcoming')}>{t(lang, 'my.upcoming')}</button>
            <button className={scope === 'all' ? 'active' : ''} type="button" onClick={() => setScope('all')}>{t(lang, scope === 'all' ? 'my.all' : 'my.showPast')}</button>
          </div>
        }
      />

      {cancelSuccess && <div className="inline-alert success" role="status">{cancelSuccess}</div>}

      <section aria-live="polite" aria-busy={resource.status === 'loading'}>
        {(resource.status === 'loading' || resource.status === 'refreshing') && (
          <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, resource.status === 'loading' ? 'common.loading' : 'common.refreshing')} />
        )}
        {resource.status === 'error' && (
          <StatePanel
            lang={lang}
            tone="error"
            icon="alert"
            title={isOfflineError(resource.error) ? t(lang, 'shell.offlineBanner') : t(lang, 'error.unexpected')}
            message={errorMessage(lang, resource.error)}
            onAction={resource.reload}
          />
        )}
        {resource.status === 'success' && bookings.length === 0 && (
          <StatePanel lang={lang} icon="calendar" title={t(lang, scope === 'upcoming' ? 'my.emptyUpcoming' : 'my.emptyAll')} />
        )}
        {resource.status === 'success' && bookings.length > 0 && (
          <div className="result-list">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.booking_id}
                lang={lang}
                booking={booking}
                actions={
                  !['cancelled', 'rejected'].includes(booking.status) && (
                    <button className="btn btn-danger btn-small" type="button" onClick={() => { setCancelError(null); setSelected(booking); }}>
                      <Icon name="close" size={14} />
                      {t(lang, 'booking.cancelAction')}
                    </button>
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <Modal
          lang={lang}
          title={t(lang, 'booking.cancelConfirmTitle')}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setSelected(null)} disabled={cancelling}>{t(lang, 'booking.keepBooking')}</button>
              <button className="btn btn-danger" type="button" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? t(lang, 'booking.cancelling') : t(lang, 'booking.cancelAction')}
              </button>
            </>
          }
        >
          <p>{t(lang, 'booking.cancelConfirmBody')}</p>
          <div className="summary-card">
            <dl>
              <dt>{t(lang, 'common.room')}</dt>
              <dd dir="auto">{selected.room_name}</dd>
              <dt>{t(lang, 'common.course')}</dt>
              <dd dir="auto">{selected.course}</dd>
              <dt>{t(lang, 'common.date')}</dt>
              <dd>{selected.session_date} {selected.start_time}–{selected.end_time}</dd>
            </dl>
          </div>
          {cancelError && <div className="inline-alert error" role="alert" style={{ marginTop: 'var(--space-4)' }}>{errorMessage(lang, cancelError)}</div>}
        </Modal>
      )}
    </>
  );
}
