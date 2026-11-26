import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { t } from '../../strings.js';

export default function Modal({ lang, title, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const titleId = `dialog-title-${title.replace(/\W+/g, '-').toLowerCase()}`;

  useEffect(() => {
    const previous = document.activeElement;
    const firstControl = dialogRef.current?.querySelector('input, select, textarea, button');
    firstControl?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]') ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="btn btn-quiet btn-small" type="button" onClick={onClose} aria-label={t(lang, 'common.close')}>
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
