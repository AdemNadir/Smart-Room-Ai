import { t } from '../../strings.js';
import { equipmentLabel, formatScore, roomTypeLabel } from '../../utils/format.js';
import Icon from '../common/Icon.jsx';
import DayStrip from './DayStrip.jsx';

export default function RoomCard({ lang, result, criteria, meta, responseLang, onBook }) {
  const room = result.room || {};
  const requested = { start_time: criteria?.start_time, end_time: criteria?.end_time };
  const score = typeof result.score === 'number' ? formatScore(result.score) : null;

  return (
    <article className={`room-card ${result.rank === 1 ? 'top' : ''}`}>
      <div className="room-card-head">
        <div className="rank-marker" aria-label={`${t(lang, 'search.resultsTitle')} ${result.rank}`}>
          {result.rank}
        </div>
        <div className="room-title">
          <h3 dir="auto" lang={lang}>{room.room_name || t(lang, 'search.noRoomName')}</h3>
          <div className="room-meta">
            <span>{room.room_id}</span>
            <span>{room.building}</span>
            <span>{room.capacity} {t(lang, 'common.capacity').toLowerCase()}</span>
            <span>{roomTypeLabel(lang, room.room_type)}</span>
          </div>
        </div>
        {score && (
          <div className="score-block">
            <span className="score-value">{score}</span>
            <span className="score-label">{t(lang, 'search.matchScore', { score })}</span>
          </div>
        )}
      </div>

      <div className="room-card-body">
        <p className="small muted">{t(lang, 'search.matchScoreMeaning')}</p>

        {room.equipment?.length > 0 && (
          <div className="chip-row" aria-label={t(lang, 'common.equipment')}>
            {room.equipment.map((item) => <span className="chip" key={item}>{equipmentLabel(lang, item)}</span>)}
          </div>
        )}

        {result.reasons?.length > 0 && (
          <>
            <h4 className="visually-hidden">{t(lang, 'search.reasonsTitle')}</h4>
            <ul className="reason-grid">
              {result.reasons.map((reason, index) => (
                <li key={`${reason.code}-${index}`} dir="auto" lang={responseLang || lang}>{reason.text}</li>
              ))}
            </ul>
          </>
        )}

        {result.free_window && (
          <p className="small muted">{t(lang, 'search.freeWindow', { start: result.free_window.start_time, end: result.free_window.end_time })}</p>
        )}

        <DayStrip
          lang={lang}
          roomName={room.room_name || room.room_id}
          date={criteria?.date}
          blocks={result.day_blocks || []}
          requested={requested}
          freeWindow={result.free_window}
          workingHours={meta?.working_hours}
        />

        <div className="room-card-actions">
          <span className="small muted">{result.status ? t(lang, `status.${result.status}`) : ''}</span>
          <button className="btn btn-primary btn-small" type="button" onClick={() => onBook(result)}>
            <Icon name="book" size={15} />
            {t(lang, 'booking.submit')}
          </button>
        </div>
      </div>
    </article>
  );
}
