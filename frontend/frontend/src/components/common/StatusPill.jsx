import { statusLabel } from '../../utils/format.js';

export default function StatusPill({ lang, status }) {
  return <span className={`status-pill ${status || 'unknown'}`}>{statusLabel(lang, status)}</span>;
}
