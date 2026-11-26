import { useEffect, useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { getMetrics } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { useInsights } from '../../hooks/useInsights.js';
import { addDays } from '../../utils/format.js';
import DateRangeForm from '../../components/admin/DateRangeForm.jsx';
import MetricsPanel from '../../components/admin/MetricsPanel.jsx';
import InsightsPanel from '../../components/admin/InsightsPanel.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function AdminDashboardPage({ meta }) {
  const lang = uiLanguage();
  const [range, setRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (meta?.today) setRange({ from: addDays(meta.today, -5), to: meta.today });
  }, [meta]);

  const metrics = useResource(
    (signal) => (range.from && range.to ? getMetrics(range, { signal }) : Promise.resolve(null)),
    [range.from, range.to],
  );
  const insights = useInsights(range.from, range.to);

  return (
    <>
      <section className="admin-masthead">
        <div>
          <span className="section-kicker">{t(lang, 'admin.opsLabel')}</span>
          <h1>{t(lang, 'admin.pageTitle')}</h1>
          <p>{t(lang, 'admin.pageIntro')}</p>
        </div>
        <span className="crest" aria-hidden="true">A</span>
      </section>

      <section className="panel plain" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="panel-body tight">
          <DateRangeForm
            from={range.from}
            to={range.to}
            onChange={setRange}
            onSubmit={(event) => { event.preventDefault(); insights.generate(); }}
            submitLabel={t(lang, 'admin.generateSummary')}
            submitting={insights.loading}
          />
        </div>
      </section>

      <section>
        <div className="section-kicker">{t(lang, 'admin.metricsTitle')}</div>
        <MetricsPanel metrics={metrics.data} status={metrics.status} error={metrics.error} onRetry={metrics.reload} />
      </section>

      <section className="panel gold-top" style={{ marginTop: 'var(--space-6)' }}>
        <div className="panel-header">
          <div>
            <h2>{t(lang, 'admin.insightsTitle')}</h2>
            <p>{t(lang, 'admin.insightsIntro')}</p>
          </div>
          <Icon name="info" size={18} />
        </div>
        <div className="panel-body">
          <InsightsPanel state={insights} onGenerate={insights.generate} />
          <p className="small muted" style={{ marginTop: 'var(--space-5)' }}>{t(lang, 'admin.dataSynthetic')}</p>
        </div>
      </section>
    </>
  );
}
