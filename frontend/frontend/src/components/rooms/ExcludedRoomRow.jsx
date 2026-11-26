import { useState } from 'react';
import { t } from '../../strings.js';
import StatusPill from '../common/StatusPill.jsx';
import Icon from '../common/Icon.jsx';
import DayStrip from './DayStrip.jsx';

export default function ExcludedRoomRow({ lang, item, criteria, meta }) {
  const [open, setOpen] = useState(false);
  const room = item.room || {};

  return (
    <div className="excluded-row">
      <div>
        <strong dir="auto" lang={lang}>{room.room_name || room.room_id}</strong>
        <span>{room.building} · {room.capacity}</span>
      </div>
      <StatusPill lang={lang} status={item.status} />
      {item.conflict && <span>{t(lang, 'search.conflictAt', { start: item.conflict.start_time, end: item.conflict.end_time })}</span>}
      <button className="btn btn-quiet btn-small" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Icon name={open ? 'close' : 'info'} size={14} />
        {t(lang, open ? 'common.hideDetails' : 'common.showDetails')}
      </button>
      {open && item.day_blocks?.length > 0 && (
        <DayStrip
          lang={lang}
          roomName={room.room_name || room.room_id}
          date={criteria?.date}
          blocks={item.day_blocks}
          requested={{ start_time: criteria?.start_time, end_time: criteria?.end_time }}
          workingHours={meta?.working_hours}
        />
      )}
    </div>
  );
}
