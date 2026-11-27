import { t, uiLanguage } from '../../strings.js';
import Icon from '../common/Icon.jsx';

export default function DateRangeForm({ from, to, onChange, onSubmit, submitLabel, submitting }) {
  const lang = uiLanguage();
  return (
    <form className="date-range-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="range-from">{t(lang, 'admin.dateFrom')}</label>
        <input className="input" id="range-from" type="date" value={from} onChange={(event) => onChange({ from: event.target.value, to })} />
      </div>
      <div className="field">
        <label htmlFor="range-to">{t(lang, 'admin.dateTo')}</label>
        <input className="input" id="range-to" type="date" value={to} onChange={(event) => onChange({ from, to: event.target.value })} />
      </div>
      {onSubmit && (
        <button className="btn btn-dark" type="submit" disabled={submitting}>
          <Icon name="info" size={15} />
          {submitting ? t(lang, 'admin.generating') : submitLabel}
        </button>
      )}
    </form>
  );
}
