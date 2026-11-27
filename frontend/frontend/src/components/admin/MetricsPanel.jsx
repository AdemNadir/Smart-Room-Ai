import { t, uiLanguage } from '../../strings.js';
import { displayDate, formatHours, formatRate, weekdayLabel } from '../../utils/format.js';
import StatePanel from '../common/StatePanel.jsx';

function BarRow({ label, value, display, tone = '' }) {
  const width = Math.max(0, Math.min(100, Number(value) * 100 || 0));
  return (
    <li className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar-track"><span className={`bar-fill ${tone}`} style={{ width: `${width}%` }} /></span>
      <span className="bar-value">{display}</span>
    </li>
  );
}

export default function MetricsPanel({ metrics, status, error, onRetry }) {
  const lang = uiLanguage();
  if (status === 'loading' || status === 'refreshing') {
    return <StatePanel lang={lang} tone="loading" icon="chart" title={t(lang, status === 'loading' ? 'common.loading' : 'common.refreshing')} />;
  }
  if (status === 'error') {
    return <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={error?.message} onAction={onRetry} />;
  }
  if (!metrics) {
    return <StatePanel lang={lang} icon="chart" title={t(lang, 'admin.noMetrics')} />;
  }

  const totals = metrics.totals || {};
  const bookings = totals.bookings || {};

  return (
    <div>
      <div className="metric-grid">
        <article className="metric-card primary">
          <span className="metric-value">{formatRate(totals.utilization_rate, true)}</span>
          <span className="metric-label">{t(lang, 'admin.metric.utilization_rate')}</span>
          <div className="metric-sub">{formatHours(totals.capacity_hours)} {t(lang, 'admin.metric.capacity_hours').toLowerCase()}</div>
        </article>
        <article className="metric-card">
          <span className="metric-value">{totals.active_rooms ?? '—'}</span>
          <span className="metric-label">{t(lang, 'admin.metric.active_rooms')}</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">{formatHours(totals.scheduled_hours)}</span>
          <span className="metric-label">{t(lang, 'admin.metric.scheduled_hours')}</span>
          <div className="metric-sub">{formatHours(totals.extra_hours)} {t(lang, 'admin.metric.extra_hours').toLowerCase()}</div>
        </article>
        <article className="metric-card">
          <span className="metric-value">{bookings.confirmed ?? 0}</span>
          <span className="metric-label">{t(lang, 'admin.metric.confirmed')}</span>
          <div className="booking-metrics">
            <span>{t(lang, 'admin.metric.pending')}: {bookings.pending ?? 0}</span>
            <span>{t(lang, 'admin.metric.cancelled')}: {bookings.cancelled ?? 0}</span>
            <span>{t(lang, 'admin.metric.rejected')}: {bookings.rejected ?? 0}</span>
          </div>
        </article>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header"><h2>{t(lang, 'admin.byBuilding')}</h2></div>
          <div className="panel-body">
            {(metrics.by_building || []).length > 0 ? (
              <ul className="bar-list">
                {metrics.by_building.map((entry) => (
                  <BarRow key={entry.building} label={entry.building} value={entry.utilization_rate} display={formatRate(entry.utilization_rate, true)} tone="gold" />
                ))}
              </ul>
            ) : <p className="muted">{t(lang, 'admin.noBreakdown')}</p>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h2>{t(lang, 'admin.byWeekday')}</h2></div>
          <div className="panel-body">
            {(metrics.by_weekday || []).length > 0 ? (
              <ul className="bar-list">
                {metrics.by_weekday.map((entry) => (
                  <BarRow key={entry.weekday} label={weekdayLabel(lang, entry.weekday)} value={entry.utilization_rate} display={formatRate(entry.utilization_rate, true)} />
                ))}
              </ul>
            ) : <p className="muted">{t(lang, 'admin.noBreakdown')}</p>}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <div className="panel-header"><h2>{t(lang, 'admin.byRoom')}</h2></div>
        <div className="panel-body">
          {(metrics.by_room || []).length > 0 ? (
            <div className="table-scroll utilization-table">
              <ul className="bar-list">
                {metrics.by_room.map((entry) => (
                  <li className="bar-row" key={entry.room_id}>
                    <span className="bar-label" dir="auto">{entry.room_name}</span>
                    <span className="bar-track"><span className="bar-fill blue" style={{ width: `${Math.max(0, Math.min(100, entry.utilization_rate * 100 || 0))}%` }} /></span>
                    <span className="bar-value">{formatRate(entry.utilization_rate, true)}</span>
                    <span className="bar-value hour-cell">{formatHours(entry.idle_hours)} {t(lang, 'admin.idleHours').toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : <p className="muted">{t(lang, 'admin.noBreakdown')}</p>}
        </div>
      </section>

      <div className="two-column" style={{ marginTop: 'var(--space-5)' }}>
        <section className="panel">
          <div className="panel-header"><h2>{t(lang, 'admin.byHour')}</h2></div>
          <div className="panel-body">
            {(metrics.by_hour || []).length > 0 ? (
              <ul className="bar-list">
                {metrics.by_hour.map((entry) => (
                  <BarRow key={entry.hour} label={entry.hour} value={entry.utilization_rate} display={formatRate(entry.utilization_rate, true)} />
                ))}
              </ul>
            ) : <p className="muted">{t(lang, 'admin.noBreakdown')}</p>}
          </div>
        </section>
        <section className="panel">
          <div className="panel-header"><h2>{t(lang, 'admin.topRequested')}</h2></div>
          <div className="panel-body">
            {(metrics.top_requested_rooms || []).length > 0 ? (
              <ul className="bar-list">
                {metrics.top_requested_rooms.map((entry) => (
                  <li className="bar-row" key={entry.room_id}>
                    <span className="bar-label">{entry.room_id}</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width: `${Math.min(100, (entry.bookings / Math.max(1, metrics.top_requested_rooms[0].bookings)) * 100)}%` }} /></span>
                    <span className="bar-value">{entry.bookings}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">{t(lang, 'admin.noBreakdown')}</p>}
            <p className="small muted" style={{ marginTop: 'var(--space-4)' }}>
              {displayDate(metrics.range?.from, lang)} — {displayDate(metrics.range?.to, lang)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
