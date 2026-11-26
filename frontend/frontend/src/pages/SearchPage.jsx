import { useEffect, useRef, useState } from 'react';
import { t, uiLanguage } from '../strings.js';
import { parseRequest, searchRooms } from '../services/api.js';
import { errorMessage, isOfflineError } from '../utils/format.js';
import { validateCriteria } from '../utils/validation.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatePanel from '../components/common/StatePanel.jsx';
import Icon from '../components/common/Icon.jsx';
import CriteriaForm from '../components/forms/CriteriaForm.jsx';
import RoomCard from '../components/rooms/RoomCard.jsx';
import ExcludedRoomRow from '../components/rooms/ExcludedRoomRow.jsx';
import BookingDialog from '../components/bookings/BookingDialog.jsx';

const EMPTY_CRITERIA = {
  date: '',
  start_time: '',
  end_time: '',
  student_count: '',
  required_equipment: [],
  preferred_equipment: [],
  room_type: null,
  preferred_building: null,
};

function apiCriteria(form, language) {
  return {
    date: form.date,
    start_time: form.start_time,
    end_time: form.end_time,
    student_count: Number(form.student_count),
    required_equipment: form.required_equipment || [],
    preferred_equipment: form.preferred_equipment || [],
    room_type: form.room_type || null,
    preferred_building: form.preferred_building || null,
    lang: language || 'en',
  };
}

export default function SearchPage({ meta }) {
  const lang = uiLanguage();
  const [mode, setMode] = useState('describe');
  const [requestText, setRequestText] = useState('');
  const [criteria, setCriteria] = useState({ ...EMPTY_CRITERIA, date: meta?.today || '' });
  const [criteriaErrors, setCriteriaErrors] = useState({});
  const [parseNotes, setParseNotes] = useState({ language: 'en', engine: null, clarifications: [], missing: [] });
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsed, setParsed] = useState(false);
  const [searchState, setSearchState] = useState({ status: 'idle', data: null, error: null });
  const [selected, setSelected] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const parseController = useRef(null);
  const searchController = useRef(null);
  const lastCriteria = useRef(null);

  useEffect(() => {
    if (meta?.today && !criteria.date) {
      setCriteria((previous) => ({ ...previous, date: meta.today }));
    }
  }, [meta, criteria.date]);

  useEffect(() => () => {
    parseController.current?.abort();
    searchController.current?.abort();
  }, []);

  async function runSearch(criteriaToSend, quiet = false) {
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    lastCriteria.current = criteriaToSend;
    if (!quiet) setSearchState({ status: 'loading', data: null, error: null });

    try {
      const data = await searchRooms(criteriaToSend, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setSearchState({ status: 'success', data, error: null });
        setUpdatedAt(Date.now());
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setSearchState({ status: 'error', data: null, error });
      }
    }
  }

  useEffect(() => {
    if (searchState.status !== 'success') return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && lastCriteria.current) {
        runSearch(lastCriteria.current, true);
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [searchState.status]);

  async function readRequest(event) {
    event.preventDefault();
    if (!requestText.trim()) return;
    parseController.current?.abort();
    const controller = new AbortController();
    parseController.current = controller;
    setParsing(true);
    setParseError(null);
    try {
      const response = await parseRequest(requestText.trim(), { signal: controller.signal });
      if (controller.signal.aborted) return;
      setCriteria({
        date: response.criteria.date ?? '',
        start_time: response.criteria.start_time ?? '',
        end_time: response.criteria.end_time ?? '',
        student_count: response.criteria.student_count ?? '',
        required_equipment: response.criteria.required_equipment ?? [],
        preferred_equipment: response.criteria.preferred_equipment ?? [],
        room_type: response.criteria.room_type || null,
        preferred_building: response.criteria.preferred_building || null,
      });
      setParseNotes({
        language: response.language || 'en',
        engine: response.engine,
        clarifications: response.clarifications || [],
        missing: response.missing || [],
      });
      setCriteriaErrors({});
      setParsed(true);
    } catch (error) {
      if (!controller.signal.aborted) setParseError(error);
    } finally {
      if (!controller.signal.aborted) setParsing(false);
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    const localErrors = validateCriteria(criteria, meta);
    setCriteriaErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;
    runSearch(apiCriteria(criteria, parseNotes.language));
  }

  const criteriaComplete = Object.keys(validateCriteria(criteria, meta)).length === 0;
  const results = searchState.data?.results ?? [];
  const excluded = searchState.data?.excluded ?? [];
  const hints = searchState.data?.hints ?? [];

  return (
    <>
      <PageHeader
        kicker={t(lang, 'nav.search')}
        title={t(lang, 'search.pageTitle')}
        lede={t(lang, 'search.pageIntro')}
      />

      <div className="search-layout">
        <div>
          <section className="panel request-box">
            <div className="panel-header">
              <div>
                <h2>{t(lang, 'search.describeTitle')}</h2>
                <p>{t(lang, 'search.describeHint')}</p>
              </div>
            </div>
            <div className="panel-body">
              <form onSubmit={readRequest}>
                <div className="field">
                  <label htmlFor="request-text">{t(lang, 'search.requestLabel')}</label>
                  <textarea
                    className="textarea"
                    id="request-text"
                    dir="auto"
                    maxLength={500}
                    placeholder={t(lang, 'search.example')}
                    value={requestText}
                    onChange={(event) => setRequestText(event.target.value)}
                  />
                  <span className={`counter ${requestText.length > 450 ? 'near-limit' : ''}`}>{t(lang, 'search.characters', { n: requestText.length })}</span>
                </div>
                {parseError && <div className="inline-alert error" role="alert">{errorMessage(lang, parseError)}</div>}
                <button className="btn btn-dark btn-block" type="submit" style={{ marginTop: 'var(--space-3)' }} disabled={parsing || !requestText.trim()}>
                  <Icon name="search" size={15} />
                  {parsing ? t(lang, 'search.reading') : t(lang, 'search.readRequest')}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-5) 0 var(--space-3)' }}>
                <span className="section-kicker" style={{ margin: 0 }}>{t(lang, 'search.useFilters')}</span>
                <div className="segmented" role="group" aria-label={t(lang, 'search.useFilters')}>
                  <button className={mode === 'describe' ? 'active' : ''} type="button" onClick={() => setMode('describe')}>{t(lang, 'search.describeTitle')}</button>
                  <button className={mode === 'filters' ? 'active' : ''} type="button" onClick={() => setMode('filters')}>{t(lang, 'search.useFilters')}</button>
                </div>
              </div>
            </div>
          </section>

          {(mode === 'filters' || parsed) && (
            <section className="panel gold-top" style={{ marginTop: 'var(--space-4)' }}>
              <div className="panel-header">
                <div>
                  <h2>{parsed ? t(lang, 'search.parsedTitle') : t(lang, 'search.useFilters')}</h2>
                  <p>{parsed ? t(lang, 'search.parsedIntro') : t(lang, 'search.filtersIntro')}</p>
                </div>
              </div>
              <div className="panel-body">
                {parsed && (
                  <>
                    <div className="chip-row" style={{ marginBottom: 'var(--space-4)' }}>
                      <span className="chip solid" lang={parseNotes.language}>{t(lang, 'search.requestLanguage', { language: t(lang, `language.${parseNotes.language}`) })}</span>
                      {parseNotes.engine && <span className="chip">{t(lang, 'search.engineRules')}</span>}
                    </div>
                    {parseNotes.missing.length > 0 && (
                      <div className="inline-alert" role="status">
                        {t(lang, 'search.missingFields', { fields: parseNotes.missing.map((field) => t(lang, `criteria.${field}`)).join(', ') })}
                      </div>
                    )}
                  </>
                )}
                <form onSubmit={submitSearch} noValidate>
                  <CriteriaForm
                    lang={lang}
                    value={criteria}
                    onChange={(next) => { setCriteria(next); setCriteriaErrors({}); }}
                    errors={criteriaErrors}
                    meta={meta}
                    missing={parsed ? parseNotes.missing : []}
                    clarifications={parseNotes.clarifications}
                    language={parseNotes.language}
                  />
                  {Object.keys(criteriaErrors).length > 0 && (
                    <div className="inline-alert error" role="alert">{t(lang, 'validation.requiredField')}</div>
                  )}
                  <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 'var(--space-5)' }} disabled={!criteriaComplete || searchState.status === 'loading'}>
                    <Icon name="search" size={15} />
                    {searchState.status === 'loading' ? t(lang, 'search.searching') : t(lang, 'search.searchAction')}
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>

        <section aria-live="polite" aria-busy={searchState.status === 'loading'}>
          <div className="results-bar">
            <div>
              <span className="section-kicker">{t(lang, 'search.resultsTitle')}</span>
              <h2>{searchState.status === 'success' ? t(lang, 'search.resultsCount', { n: results.length }) : t(lang, 'search.resultsTitle')}</h2>
            </div>
            {updatedAt && <span className="small muted">{t(lang, 'common.updatedJustNow')}</span>}
          </div>

          {searchState.status === 'idle' && (
            <StatePanel lang={lang} icon="search" title={t(lang, 'search.resultsTitle')} message={t(lang, 'search.noResultsYet')} />
          )}
          {searchState.status === 'loading' && (
            <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'common.loading')} message={t(lang, 'search.searching')} />
          )}
          {searchState.status === 'error' && (
            <StatePanel
              lang={lang}
              tone="error"
              icon="alert"
              title={isOfflineError(searchState.error) ? t(lang, 'shell.offlineBanner') : t(lang, 'error.unexpected')}
              message={errorMessage(lang, searchState.error)}
              actionLabel={t(lang, 'common.retry')}
              onAction={() => lastCriteria.current && runSearch(lastCriteria.current)}
            />
          )}
          {searchState.status === 'success' && results.length === 0 && (
            <StatePanel lang={lang} icon="room" title={t(lang, 'search.emptyTitle')} message={t(lang, 'search.emptyIntro')}>
              {hints.length > 0 && (
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <strong className="small">{t(lang, 'search.hintsTitle')}</strong>
                  <ul className="hint-list">
                    {hints.map((hint) => <li key={hint}>{t(lang, `search.hint.${hint}`)}</li>)}
                  </ul>
                </div>
              )}
            </StatePanel>
          )}
          {searchState.status === 'success' && results.length > 0 && (
            <div className="result-list">
              {results.map((result) => (
                <RoomCard
                  key={result.room?.room_id || result.rank}
                  lang={lang}
                  result={result}
                  criteria={searchState.data.criteria}
                  meta={meta}
                  responseLang={searchState.data.lang}
                  onBook={setSelected}
                />
              ))}
            </div>
          )}

          {searchState.status === 'success' && excluded.length > 0 && (
            <details className="panel plain" style={{ marginTop: 'var(--space-5)' }}>
              <summary className="panel-header" style={{ cursor: 'pointer', listStyle: 'none' }}>
                <strong>{t(lang, 'search.excludedTitle', { n: excluded.length })}</strong>
                <Icon name="info" size={16} />
              </summary>
              <div className="panel-body tight">
                <div className="excluded-list">
                  {excluded.map((item, index) => (
                    <ExcludedRoomRow key={`${item.room?.room_id}-${index}`} lang={lang} item={item} criteria={searchState.data.criteria} meta={meta} />
                  ))}
                </div>
              </div>
            </details>
          )}
        </section>
      </div>

      {selected && (
        <BookingDialog
          lang={lang}
          result={selected}
          criteria={searchState.data?.criteria || apiCriteria(criteria, parseNotes.language)}
          meta={meta}
          onClose={() => setSelected(null)}
          onSuccess={() => lastCriteria.current && runSearch(lastCriteria.current, true)}
        />
      )}
    </>
  );
}
