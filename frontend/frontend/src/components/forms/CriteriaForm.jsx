import { t } from '../../strings.js';
import { fieldError } from '../../utils/format.js';
import { Field, EquipmentPicker } from './Fields.jsx';

function timeOptions(start, end) {
  const values = [];
  const [startHour, startMinute] = (start || '08:00').split(':').map(Number);
  const [endHour, endMinute] = (end || '18:00').split(':').map(Number);
  for (let minutes = startHour * 60 + startMinute; minutes <= endHour * 60 + endMinute; minutes += 5) {
    values.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return values;
}

function notesFor(field, clarifications) {
  return (clarifications || []).filter((item) => item.field === field);
}

export default function CriteriaForm({ lang, value, onChange, errors = {}, meta, missing = [], clarifications = [], language = 'en' }) {
  const equipment = meta?.equipment ?? [];
  const roomTypes = meta?.room_types ?? [];
  const buildings = meta?.buildings ?? [];
  const times = timeOptions(meta?.working_hours?.start, meta?.working_hours?.end);
  const maxDate = meta?.today ? new Date(`${meta.today}T00:00:00Z`) : null;
  if (maxDate) maxDate.setUTCDate(maxDate.getUTCDate() + 90);
  const maxDateText = maxDate ? maxDate.toISOString().slice(0, 10) : undefined;

  function update(key, nextValue) {
    onChange({ ...value, [key]: nextValue });
  }

  function renderNotes(field) {
    const notes = notesFor(field, clarifications);
    if (notes.length === 0) return null;
    return (
      <ul className="note-list">
        {notes.map((note, index) => (
          <li key={`${note.code}-${index}`} dir="auto" lang={language}>
            <span aria-hidden="true">·</span>
            <span>{note.message || t(lang, `clarification.${note.code}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  function errorFor(field) {
    if (errors[field]) return fieldError(lang, errors[field]);
    if (missing.includes(field)) return fieldError(lang, 'required');
    return null;
  }

  return (
    <div className="criteria-grid">
      <Field id="criteria-date" label={t(lang, 'criteria.date')} error={errorFor('date')}>
        <input
          className="input"
          id="criteria-date"
          type="date"
          min={meta?.today}
          max={maxDateText}
          value={value.date || ''}
          aria-invalid={Boolean(errorFor('date'))}
          onChange={(event) => update('date', event.target.value)}
        />
      </Field>

      <Field id="criteria-students" label={t(lang, 'criteria.student_count')} error={errorFor('student_count')}>
        <input
          className="input"
          id="criteria-students"
          type="number"
          min="1"
          max="1000"
          value={value.student_count ?? ''}
          aria-invalid={Boolean(errorFor('student_count'))}
          onChange={(event) => update('student_count', event.target.value === '' ? '' : Number(event.target.value))}
        />
      </Field>

      <Field id="criteria-start" label={t(lang, 'criteria.start_time')} error={errorFor('start_time')}>
        <select
          className="select"
          id="criteria-start"
          value={value.start_time || ''}
          aria-invalid={Boolean(errorFor('start_time'))}
          onChange={(event) => update('start_time', event.target.value)}
        >
          <option value="">{t(lang, 'common.startTime')}</option>
          {times.map((time) => <option key={time} value={time}>{time}</option>)}
        </select>
      </Field>

      <Field id="criteria-end" label={t(lang, 'criteria.end_time')} error={errorFor('end_time')}>
        <select
          className="select"
          id="criteria-end"
          value={value.end_time || ''}
          aria-invalid={Boolean(errorFor('end_time'))}
          onChange={(event) => update('end_time', event.target.value)}
        >
          <option value="">{t(lang, 'common.endTime')}</option>
          {times.map((time) => <option key={time} value={time}>{time}</option>)}
        </select>
      </Field>

      <Field id="criteria-type" label={t(lang, 'criteria.room_type')}>
        <select
          className="select"
          id="criteria-type"
          value={value.room_type || ''}
          onChange={(event) => update('room_type', event.target.value || null)}
        >
          <option value="">{t(lang, 'criteria.anyRoomType')}</option>
          {roomTypes.map((type) => <option key={type} value={type}>{t(lang, `roomType.${type}`)}</option>)}
        </select>
      </Field>

      <Field id="criteria-building" label={t(lang, 'criteria.preferred_building')}>
        <select
          className="select"
          id="criteria-building"
          value={value.preferred_building || ''}
          onChange={(event) => update('preferred_building', event.target.value || null)}
        >
          <option value="">{t(lang, 'criteria.anyBuilding')}</option>
          {buildings.map((building) => <option key={building} value={building}>{building}</option>)}
        </select>
      </Field>

      <EquipmentPicker
        lang={lang}
        id="criteria-required-equipment"
        label={t(lang, 'criteria.required_equipment')}
        options={equipment}
        value={value.required_equipment || []}
        onChange={(next) => update('required_equipment', next)}
      />

      <EquipmentPicker
        lang={lang}
        id="criteria-preferred-equipment"
        label={t(lang, 'criteria.preferred_equipment')}
        options={equipment}
        value={value.preferred_equipment || []}
        onChange={(next) => update('preferred_equipment', next)}
      />

      {['date', 'start_time', 'end_time', 'student_count'].map((field) => (
        <div className="span-all" key={field}>{renderNotes(field)}</div>
      ))}
    </div>
  );
}
