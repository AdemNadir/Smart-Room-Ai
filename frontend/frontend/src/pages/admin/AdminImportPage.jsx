import { useRef, useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { importPreview, importPublish } from '../../services/api.js';
import { errorMessage } from '../../utils/format.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Icon from '../../components/common/Icon.jsx';
import StatusPill from '../../components/common/StatusPill.jsx';

export default function AdminImportPage() {
  const lang = uiLanguage();
  const [kind, setKind] = useState('rooms');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function chooseFile(event) {
    const chosen = event.target.files?.[0] || null;
    setFile(chosen);
    setPreview(null);
    setPublishResult(null);
    setError(null);
    if (!chosen) return;
    if (chosen.size > 5 * 1024 * 1024) {
      setError(new Error(t(lang, 'admin.fileTooLarge')));
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (!/\.(csv|xlsx)$/i.test(chosen.name)) {
      setError(new Error(t(lang, 'admin.wrongFileType')));
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function review(event) {
    event.preventDefault();
    if (!file || reviewing) return;
    setReviewing(true);
    setError(null);
    try {
      setPreview(await importPreview(kind, file));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setReviewing(false);
    }
  }

  async function publish() {
    if (!preview || !preview.publishable || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      setPublishResult(await importPublish(preview.import_id));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setPublishing(false);
    }
  }

  const step = publishResult ? 3 : preview ? 2 : 1;

  return (
    <>
      <PageHeader kicker={t(lang, 'admin.opsLabel')} title={t(lang, 'admin.importTitle')} lede={t(lang, 'admin.importIntro')} />

      <ol className="import-stepper" aria-label={t(lang, 'admin.importTitle')}>
        {[t(lang, 'admin.chooseFile'), t(lang, 'admin.reviewFile'), t(lang, 'admin.publishImport')].map((label, index) => {
          const number = index + 1;
          return (
            <li className={step === number ? 'active' : ''} key={label} aria-current={step === number ? 'step' : undefined}>
              <span className="step-number">{number}</span>
              {label}
            </li>
          );
        })}
      </ol>

      {error && <div className="inline-alert error" role="alert">{errorMessage(lang, error)}</div>}
      {publishResult && (
        <div className="inline-alert success" role="status">
          {t(lang, 'admin.importSuccess', { n: publishResult.rows_published })}
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{t(lang, 'admin.chooseFile')}</h2>
            <p>{t(lang, 'admin.importTip')}</p>
          </div>
        </div>
        <div className="panel-body">
          <form className="admin-filter-row" onSubmit={review}>
            <div className="field">
              <label htmlFor="import-kind">{t(lang, 'admin.importKind')}</label>
              <select className="select" id="import-kind" value={kind} onChange={(event) => { setKind(event.target.value); setPreview(null); }}>
                <option value="rooms">{t(lang, 'admin.importKind.rooms')}</option>
                <option value="schedule">{t(lang, 'admin.importKind.schedule')}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="import-file">{t(lang, 'admin.chooseFile')}</label>
              <input className="input" id="import-file" ref={inputRef} type="file" accept=".csv,.xlsx" onChange={chooseFile} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={!file || reviewing}>
              <Icon name="upload" size={15} />
              {reviewing ? t(lang, 'admin.reviewing') : t(lang, 'admin.reviewFile')}
            </button>
          </form>
          {file && <p className="small muted">{t(lang, 'admin.fileReady')} <span dir="auto">{file.name}</span></p>}
        </div>
      </section>

      {preview && (
        <section className="panel gold-top" style={{ marginTop: 'var(--space-5)' }}>
          <div className="panel-header">
            <div>
              <h2>{t(lang, 'admin.previewTitle')}</h2>
              <p dir="auto">{preview.filename}</p>
            </div>
            <StatusPill lang={lang} status={preview.publishable ? 'confirmed' : 'rejected'} />
          </div>
          <div className="panel-body">
            <div className="metric-grid">
              <article className="metric-card"><span className="metric-value">{preview.total_rows}</span><span className="metric-label">{t(lang, 'admin.totalRows')}</span></article>
              <article className="metric-card"><span className="metric-value">{preview.valid_rows}</span><span className="metric-label">{t(lang, 'admin.validRows')}</span></article>
              <article className="metric-card"><span className="metric-value">{preview.errors.length}</span><span className="metric-label">{t(lang, 'admin.errorsTitle')}</span></article>
            </div>

            <h3>{t(lang, 'admin.errorsTitle')}</h3>
            {preview.errors.length === 0 ? (
              <p className="small muted">{t(lang, 'admin.noErrors')}</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>{t(lang, 'common.from')}</th><th>{t(lang, 'admin.previewRowsTitle')}</th><th>{t(lang, 'common.status')}</th></tr></thead>
                  <tbody>
                    {preview.errors.map((entry, index) => (
                      <tr key={`${entry.row}-${entry.code}-${index}`}>
                        <td className="number">{entry.row}</td>
                        <td><strong>{entry.field}</strong>: <span dir="auto">{entry.message}</span></td>
                        <td><code>{entry.code}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {preview.warnings?.length > 0 && (
              <>
                <h3 style={{ marginTop: 'var(--space-5)' }}>{t(lang, 'admin.warningsTitle')}</h3>
                <ul className="note-list">
                  {preview.warnings.map((warning, index) => (
                    <li key={`${warning.code}-${index}`} dir="auto"><Icon name="alert" size={14} /><span>{warning.message}</span></li>
                  ))}
                </ul>
              </>
            )}

            <h3 style={{ marginTop: 'var(--space-5)' }}>{t(lang, 'admin.previewRowsTitle')}</h3>
            {preview.preview?.length > 0 ? (
              <div className="table-scroll">
                <table className="data-table">
                  <tbody>
                    {preview.preview.map((row, index) => (
                      <tr key={`${row.room_id || row.session_id || index}`}>
                        <td><strong>{row.room_id || row.session_id}</strong></td>
                        <td dir="auto">{row.room_name || row.course || ''}</td>
                        <td>{row.building || row.session_date || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="small muted">{t(lang, 'admin.noPreviewRows')}</p>}

            <button className="btn btn-dark" type="button" style={{ marginTop: 'var(--space-5)' }} onClick={publish} disabled={!preview.publishable || publishing || Boolean(publishResult)}>
              <Icon name="check" size={15} />
              {publishing ? t(lang, 'admin.publishing') : t(lang, 'admin.publishImport')}
            </button>
            {!preview.publishable && <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t(lang, 'admin.importHasErrors')}</p>}
          </div>
        </section>
      )}
    </>
  );
}
