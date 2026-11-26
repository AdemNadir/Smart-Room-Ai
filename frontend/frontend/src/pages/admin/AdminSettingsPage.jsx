import { useEffect, useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { getSettings, patchSettings } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { errorMessage, fieldError, weekdayLabel } from '../../utils/format.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatePanel from '../../components/common/StatePanel.jsx';
import { Field } from '../../components/forms/Fields.jsx';
import Icon from '../../components/common/Icon.jsx';

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function AdminSettingsPage() {
  const lang = uiLanguage();
  const resource = useResource((signal) => getSettings({ signal }), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (resource.data?.settings && !form) setForm({ ...resource.data.settings, working_hours: { ...resource.data.settings.working_hours } });
  }, [resource.data, form]);

  async function save(event) {
    event.preventDefault();
    if (!form || saving) return;
    if (Number(form.min_booking_minutes) < 5 || Number(form.max_booking_minutes) < Number(form.min_booking_minutes)) {
      setError(new Error(fieldError(lang, 'invalid_value')));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await patchSettings({
        approval_mode: form.approval_mode,
        pending_blocks_room: Boolean(form.pending_blocks_room),
        working_hours: form.working_hours,
        working_days: form.working_days,
        min_booking_minutes: Number(form.min_booking_minutes),
        max_booking_minutes: Number(form.max_booking_minutes),
      });
      setForm({ ...response.settings, working_hours: { ...response.settings.working_hours } });
      setNotice(t(lang, 'admin.settingsSaved'));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day) {
    const selected = form.working_days || [];
    setForm({
      ...form,
      working_days: selected.includes(day) ? selected.filter((item) => item !== day) : [...selected, day],
    });
  }

  return (
    <>
      <PageHeader kicker={t(lang, 'admin.opsLabel')} title={t(lang, 'admin.settingsTitle')} lede={t(lang, 'admin.settingsIntro')} />

      {(resource.status === 'loading' || resource.status === 'refreshing') && (
        <StatePanel lang={lang} tone="loading" icon="settings" title={t(lang, 'common.loading')} />
      )}
      {resource.status === 'error' && (
        <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={errorMessage(lang, resource.error)} onAction={resource.reload} />
      )}

      {form && (
        <section className="panel">
          <form onSubmit={save}>
            <div className="panel-header">
              <div>
                <h2>{t(lang, 'admin.approvalMode')}</h2>
                <p>{t(lang, 'admin.settingsIntro')}</p>
              </div>
            </div>
            <div className="panel-body">
              {notice && <div className="inline-alert success" role="status">{notice}</div>}
              {error && <div className="inline-alert error" role="alert">{errorMessage(lang, error)}</div>}

              <div className="mode-cards">
                <label className="mode-card">
                  <input type="radio" name="approval_mode" value="instant" checked={form.approval_mode === 'instant'} onChange={(event) => setForm({ ...form, approval_mode: event.target.value })} />
                  <strong>{t(lang, 'admin.approvalInstant')}</strong>
                  <span>{t(lang, 'admin.approvalInstantHint')}</span>
                </label>
                <label className="mode-card">
                  <input type="radio" name="approval_mode" value="approval" checked={form.approval_mode === 'approval'} onChange={(event) => setForm({ ...form, approval_mode: event.target.value })} />
                  <strong>{t(lang, 'admin.approvalManual')}</strong>
                  <span>{t(lang, 'admin.approvalManualHint')}</span>
                </label>
              </div>
              {!['instant', 'approval'].includes(form.approval_mode) && (
                <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t(lang, 'admin.unknownMode', { mode: form.approval_mode })}</p>
              )}

              <div className="checkbox-row" style={{ marginTop: 'var(--space-5)' }}>
                <input id="pending-blocks" type="checkbox" checked={Boolean(form.pending_blocks_room)} onChange={(event) => setForm({ ...form, pending_blocks_room: event.target.checked })} />
                <div>
                  <label htmlFor="pending-blocks">{t(lang, 'admin.pendingBlocks')}</label>
                  <span className="field-hint">{t(lang, 'admin.pendingBlocksHint')}</span>
                </div>
              </div>

              <div className="settings-grid" style={{ marginTop: 'var(--space-5)' }}>
                <Field id="settings-start" label={t(lang, 'admin.workingHoursStart')}>
                  <input className="input" id="settings-start" type="time" step="300" value={form.working_hours?.start || ''} onChange={(event) => setForm({ ...form, working_hours: { ...form.working_hours, start: event.target.value } })} />
                </Field>
                <Field id="settings-end" label={t(lang, 'admin.workingHoursEnd')}>
                  <input className="input" id="settings-end" type="time" step="300" value={form.working_hours?.end || ''} onChange={(event) => setForm({ ...form, working_hours: { ...form.working_hours, end: event.target.value } })} />
                </Field>
                <Field id="settings-min" label={t(lang, 'admin.minMinutes')}>
                  <input className="input" id="settings-min" type="number" min="5" step="5" value={form.min_booking_minutes} onChange={(event) => setForm({ ...form, min_booking_minutes: event.target.value })} />
                </Field>
                <Field id="settings-max" label={t(lang, 'admin.maxMinutes')}>
                  <input className="input" id="settings-max" type="number" min="30" step="5" value={form.max_booking_minutes} onChange={(event) => setForm({ ...form, max_booking_minutes: event.target.value })} />
                </Field>

                <fieldset className="field span-all">
                  <legend className="field-label">{t(lang, 'admin.workingDays')}</legend>
                  <div className="weekday-picker">
                    {WEEKDAYS.map((day) => (
                      <label className="weekday-option" key={day}>
                        <input type="checkbox" checked={(form.working_days || []).includes(day)} onChange={() => toggleDay(day)} />
                        {weekdayLabel(lang, day)}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <button className="btn btn-dark" type="submit" style={{ marginTop: 'var(--space-5)' }} disabled={saving}>
                <Icon name="check" size={15} />
                {saving ? t(lang, 'admin.savingSettings') : t(lang, 'admin.saveSettings')}
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
