import { useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { getRooms, patchRoom } from '../../services/api.js';
import { useResource } from '../../hooks/useResource.js';
import { equipmentLabel, errorMessage, roomTypeLabel } from '../../utils/format.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatePanel from '../../components/common/StatePanel.jsx';
import Modal from '../../components/common/Modal.jsx';
import Icon from '../../components/common/Icon.jsx';
import StatusPill from '../../components/common/StatusPill.jsx';
import { Field, EquipmentPicker } from '../../components/forms/Fields.jsx';

export default function AdminRoomsPage({ meta }) {
  const lang = uiLanguage();
  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [toggleError, setToggleError] = useState(null);

  const resource = useResource((signal) => getRooms({ signal }), []);
  const allRooms = (resource.data?.rooms || []).map((room) => overrides[room.room_id] || room);
  const buildings = [...new Set(allRooms.map((room) => room.building))];
  const visibleRooms = allRooms.filter((room) => {
    const matchesQuery = `${room.room_id} ${room.room_name}`.toLowerCase().includes(query.toLowerCase());
    const matchesBuilding = !building || room.building === building;
    return matchesQuery && matchesBuilding;
  });

  function openEditor(room) {
    setSaveError(null);
    setEditing({ ...room, equipment: [...(room.equipment || [])] });
  }

  async function toggleActive(room) {
    if (togglingId) return;
    setTogglingId(room.room_id);
    setToggleError(null);
    try {
      const response = await patchRoom(room.room_id, { active: !room.active });
      setOverrides((previous) => ({ ...previous, [response.room.room_id]: response.room }));
    } catch (error) {
      setToggleError(error);
    } finally {
      setTogglingId(null);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!editing) return;
    if (!editing.room_name.trim() || Number(editing.capacity) < 1) {
      setSaveError(new Error(t(lang, 'validation.required')));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const response = await patchRoom(editing.room_id, {
        room_name: editing.room_name.trim(),
        capacity: Number(editing.capacity),
        room_type: editing.room_type,
        building: editing.building,
        equipment: editing.equipment,
        active: Boolean(editing.active),
      });
      setOverrides((previous) => ({ ...previous, [response.room.room_id]: response.room }));
      setEditing(null);
    } catch (error) {
      setSaveError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader kicker={t(lang, 'admin.opsLabel')} title={t(lang, 'admin.roomsTitle')} lede={t(lang, 'admin.roomsIntro')} />

      <section className="panel">
        <div className="panel-body tight">
          <div className="admin-filter-row">
            <div className="field">
              <label htmlFor="room-search">{t(lang, 'admin.roomsSearch')}</label>
              <input className="input" id="room-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="room-building">{t(lang, 'admin.buildingFilter')}</label>
              <select className="select" id="room-building" value={building} onChange={(event) => setBuilding(event.target.value)}>
                <option value="">{t(lang, 'admin.buildingFilter')}</option>
                {buildings.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>
          {toggleError && <div className="inline-alert error" role="alert">{errorMessage(lang, toggleError)}</div>}

          {(resource.status === 'loading' || resource.status === 'refreshing') && (
            <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'common.loading')} />
          )}
          {resource.status === 'error' && (
            <StatePanel lang={lang} tone="error" icon="alert" title={t(lang, 'error.unexpected')} message={errorMessage(lang, resource.error)} onAction={resource.reload} />
          )}
          {resource.status === 'success' && visibleRooms.length === 0 && (
            <StatePanel lang={lang} icon="room" title={t(lang, 'admin.noRooms')} />
          )}
          {resource.status === 'success' && visibleRooms.length > 0 && (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t(lang, 'admin.roomId')}</th>
                    <th>{t(lang, 'admin.roomName')}</th>
                    <th>{t(lang, 'common.building')}</th>
                    <th className="number">{t(lang, 'admin.capacity')}</th>
                    <th>{t(lang, 'admin.roomType')}</th>
                    <th>{t(lang, 'common.equipment')}</th>
                    <th>{t(lang, 'common.status')}</th>
                    <th>{t(lang, 'admin.activeRoom')}</th>
                    <th><span className="visually-hidden">{t(lang, 'common.edit')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRooms.map((room) => (
                    <tr key={room.room_id}>
                      <td><strong>{room.room_id}</strong></td>
                      <td dir="auto">{room.room_name}</td>
                      <td>{room.building}</td>
                      <td className="number">{room.capacity}</td>
                      <td>{roomTypeLabel(lang, room.room_type)}</td>
                      <td>{(room.equipment || []).map((item) => equipmentLabel(lang, item)).join(', ') || t(lang, 'common.none')}</td>
                      <td><StatusPill lang={lang} status={room.active ? 'available' : 'inactive'} /></td>
                      <td>
                        <div className="checkbox-row">
                          <input
                            id={`room-active-${room.room_id}`}
                            type="checkbox"
                            checked={Boolean(room.active)}
                            disabled={togglingId === room.room_id}
                            onChange={() => toggleActive(room)}
                          />
                          <label className="visually-hidden" htmlFor={`room-active-${room.room_id}`}>
                            {t(lang, 'admin.activeRoom')}: {room.room_id}
                          </label>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-quiet btn-small" type="button" onClick={() => openEditor(room)}>
                          <Icon name="edit" size={14} />
                          {t(lang, 'admin.editRoom')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editing && (
        <Modal
          lang={lang}
          title={`${t(lang, 'admin.editRoom')}: ${editing.room_id}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)} disabled={saving}>{t(lang, 'common.cancel')}</button>
              <button className="btn btn-primary" type="submit" form="room-form" disabled={saving}>
                {saving ? t(lang, 'admin.savingRoom') : t(lang, 'admin.saveRoom')}
              </button>
            </>
          }
        >
          <form id="room-form" onSubmit={save} className="criteria-grid">
            <Field id="room-name" label={t(lang, 'admin.roomName')} className="span-all">
              <input className="input" id="room-name" value={editing.room_name} onChange={(event) => setEditing({ ...editing, room_name: event.target.value })} />
            </Field>
            <Field id="room-capacity" label={t(lang, 'admin.capacity')}>
              <input className="input" id="room-capacity" type="number" min="1" value={editing.capacity} onChange={(event) => setEditing({ ...editing, capacity: event.target.value })} />
            </Field>
            <Field id="room-type" label={t(lang, 'admin.roomType')}>
              <select className="select" id="room-type" value={editing.room_type} onChange={(event) => setEditing({ ...editing, room_type: event.target.value })}>
                {(meta?.room_types || []).map((type) => <option key={type} value={type}>{roomTypeLabel(lang, type)}</option>)}
              </select>
            </Field>
            <Field id="room-building" label={t(lang, 'common.building')} className="span-all">
              <input className="input" id="room-building" value={editing.building} onChange={(event) => setEditing({ ...editing, building: event.target.value })} />
            </Field>
            <EquipmentPicker
              lang={lang}
              id="room-equipment"
              label={t(lang, 'admin.equipment')}
              options={meta?.equipment || []}
              value={editing.equipment}
              onChange={(equipment) => setEditing({ ...editing, equipment })}
            />
            <div className="checkbox-row span-all">
              <input id="room-active" type="checkbox" checked={Boolean(editing.active)} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} />
              <label htmlFor="room-active">{t(lang, 'admin.activeRoom')}</label>
            </div>
            {saveError && <div className="inline-alert error span-all" role="alert">{errorMessage(lang, saveError)}</div>}
          </form>
        </Modal>
      )}
    </>
  );
}
