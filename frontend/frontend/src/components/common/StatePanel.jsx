import Icon from './Icon.jsx';
import { t } from '../../strings.js';

export default function StatePanel({ lang, tone = 'empty', icon = 'info', title, message, actionLabel, onAction, children }) {
  return (
    <div className={`state-panel ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="state-icon">
        <Icon name={icon} size={20} />
      </span>
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {children}
      {onAction && (
        <button className="btn btn-secondary btn-small" type="button" onClick={onAction}>
          {actionLabel || t(lang, 'common.retry')}
        </button>
      )}
    </div>
  );
}
