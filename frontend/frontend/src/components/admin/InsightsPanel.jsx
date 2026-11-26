import { t, uiLanguage } from '../../strings.js';
import StatePanel from '../common/StatePanel.jsx';

export default function InsightsPanel({ state, onGenerate }) {
  const lang = uiLanguage();
  if (!state.generated) {
    return <StatePanel lang={lang} icon="info" title={t(lang, 'admin.insightsTitle')} message={t(lang, 'admin.generateFirst')} onAction={onGenerate} actionLabel={t(lang, 'admin.generateSummary')} />;
  }
  if (state.loading) {
    return <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'admin.generating')} />;
  }
  if (state.error) {
    return <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={state.error.message} onAction={onGenerate} />;
  }
  if (!state.data?.insights?.length) {
    return <StatePanel lang={lang} icon="info" title={t(lang, 'admin.insightsTitle')} message={t(lang, 'admin.noBreakdown')} />;
  }

  return (
    <div>
      {state.data.engine && <p className="small muted">{t(lang, 'admin.engine', { engine: state.data.engine })}</p>}
      <ul className="insight-list">
        {state.data.insights.map((insight) => (
          <li className={`insight-item ${insight.kind}`} key={insight.id}>
            <div className="insight-head">
              <span className="chip">{t(lang, `admin.insight.${insight.kind}`)}</span>
              <span className="small muted">{insight.id}</span>
            </div>
            <p className="insight-text" dir="auto" lang={state.data.lang || lang}>{insight.text}</p>
            <div className="chip-row" aria-label={t(lang, 'admin.evidence')}>
              {(insight.evidence || []).map((item) => (
                <span className="chip evidence" key={item.metric}>
                  <strong>{item.label}</strong>: {item.display}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
