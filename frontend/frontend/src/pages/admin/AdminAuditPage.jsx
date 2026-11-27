import { useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { audit } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { errorMessage } from '../../utils/format.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatePanel from '../../components/common/StatePanel.jsx';
import Icon from '../../components/common/Icon.jsx';

const LIMIT = 20;

export default function AdminAuditPage() {
  const lang = uiLanguage();
  const [offset, setOffset] = useState(0);
  const resource = useResource((signal) => audit({ limit: LIMIT, offset }, { signal }), [offset]);
  const entries = resource.data?.entries || [];

  return (
    <>
      <PageHeader kicker={t(lang, 'admin.opsLabel')} title={t(lang, 'admin.auditTitle')} lede={t(lang, 'admin.auditIntro')} />

      <section className="panel">
        <div className="panel-body tight">
          {(resource.status === 'loading' || resource.status === 'refreshing') && (
            <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'common.loading')} />
          )}
          {resource.status === 'error' && (
            <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={errorMessage(lang, resource.error)} onAction={resource.reload} />
          )}
          {resource.status === 'success' && entries.length === 0 && (
            <StatePanel lang={lang} icon="shield" title={t(lang, 'admin.noEntries')} />
          )}
          {resource.status === 'success' && entries.length > 0 && (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t(lang, 'common.createdAt')}</th>
                    <th>{t(lang, 'common.actor')}</th>
                    <th>{t(lang, 'common.action')}</th>
                    <th>{t(lang, 'common.detail')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="number">{entry.created_at}</td>
                      <td dir="auto">{entry.actor || t(lang, 'common.noValue')}</td>
                      <td><code>{entry.action}</code></td>
                      <td dir="auto">{entry.detail || t(lang, 'common.noValue')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pagination-row">
            <span>{t(lang, 'common.page', { n: Math.floor(offset / LIMIT) + 1 })}</span>
            <span>
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setOffset((value) => Math.max(0, value - LIMIT))} disabled={offset === 0}>
                <Icon name="arrowLeft" size={14} />
                {t(lang, 'common.previous')}
              </button>
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setOffset((value) => value + LIMIT)} disabled={entries.length < LIMIT} style={{ marginLeft: 'var(--space-2)' }}>
                {t(lang, 'common.next')}
                <Icon name="arrowRight" size={14} />
              </button>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
