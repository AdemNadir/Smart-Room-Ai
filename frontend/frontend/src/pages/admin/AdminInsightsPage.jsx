import { useEffect, useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { useInsights } from '../../hooks/useInsights.js';
import { addDays } from '../../utils/format.js';
import DateRangeForm from '../../components/admin/DateRangeForm.jsx';
import InsightsPanel from '../../components/admin/InsightsPanel.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function AdminInsightsPage({ meta }) {
  const lang = uiLanguage();
  const [range, setRange] = useState({ from: '', to: '' });
  const insights = useInsights(range.from, range.to);

  useEffect(() => {
    if (meta?.today) setRange({ from: addDays(meta.today, -5), to: meta.today });
  }, [meta]);

  return (
    <>
      <section className="admin-masthead">
        <div>
          <span className="section-kicker">{t(lang, 'admin.opsLabel')}</span>
          <h1>{t(lang, 'admin.insightsTitle')}</h1>
          <p>{t(lang, 'admin.insightsIntro')}</p>
        </div>
        <span className="crest" aria-hidden="true">I</span>
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

      <section className="panel gold-top">
        <div className="panel-header">
          <h2>{t(lang, 'admin.insightsTitle')}</h2>
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
