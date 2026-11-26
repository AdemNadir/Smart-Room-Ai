import { t } from '../../strings.js';
import { dayStripPosition, displayDate, hourTicks } from '../../utils/format.js';

export default function DayStrip({ lang, roomName, date, blocks = [], requested, freeWindow, workingHours }) {
  const dayStart = workingHours?.start || '08:00';
  const dayEnd = workingHours?.end || '18:00';
  const ticks = hourTicks(dayStart, dayEnd);
  const requestedPosition = requested ? dayStripPosition(requested.start_time, requested.end_time, dayStart, dayEnd) : null;
  const freePosition = freeWindow ? dayStripPosition(freeWindow.start_time, freeWindow.end_time, dayStart, dayEnd) : null;

  const visibleBlocks = blocks
    .map((block) => ({ ...block, position: dayStripPosition(block.start_time, block.end_time, dayStart, dayEnd) }))
    .filter((block) => block.position);

  const description = [
    t(lang, 'search.dayStripLabel', { room: roomName, date: displayDate(date, lang) }),
    ...visibleBlocks.map((block) => `${t(lang, `search.legend.${block.kind}`)} ${block.start_time} to ${block.end_time}`),
    requested ? `${t(lang, 'search.legend.requested')} ${requested.start_time} to ${requested.end_time}` : '',
  ].filter(Boolean).join('. ');

  return (
    <div className="day-strip-wrap">
      <div className="day-strip-head">
        <span>{displayDate(date, lang)}</span>
        <span>{dayStart}–{dayEnd}</span>
      </div>
      <div className="day-strip" role="img" aria-label={description}>
        <div className="day-strip-track" />
        {ticks.map((tick) => {
          const position = dayStripPosition(tick, tick, dayStart, dayEnd);
          return position ? <span className="day-strip-tick" key={tick} style={{ left: `${position.left}%` }} /> : null;
        })}
        {freePosition && (
          <span
            className="day-strip-block"
            style={{ left: `${freePosition.left}%`, width: `${freePosition.width}%`, background: 'var(--success-bg)', borderColor: 'var(--success)' }}
          />
        )}
        {visibleBlocks.map((block) => (
          <span
            className={`day-strip-block ${block.kind}`}
            key={`${block.kind}-${block.start_time}-${block.end_time}`}
            style={{ left: `${block.position.left}%`, width: `${block.position.width}%` }}
          />
        ))}
        {requestedPosition && (
          <span
            className="day-strip-request"
            style={{ left: `${requestedPosition.left}%`, width: `${requestedPosition.width}%` }}
          />
        )}
      </div>
      <div className="day-strip-legend" aria-hidden="true">
        <span className="legend-item"><i className="legend-swatch official_session" />{t(lang, 'search.legend.official_session')}</span>
        <span className="legend-item"><i className="legend-swatch extra_booking" />{t(lang, 'search.legend.extra_booking')}</span>
        <span className="legend-item"><i className="legend-swatch pending_booking" />{t(lang, 'search.legend.pending_booking')}</span>
        <span className="legend-item"><i className="legend-swatch requested" />{t(lang, 'search.legend.requested')}</span>
      </div>
    </div>
  );
}
