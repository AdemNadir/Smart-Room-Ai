import { equipmentLabel } from '../../utils/format.js';

export function Field({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function EquipmentPicker({ lang, id, label, options, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  return (
    <fieldset className="field">
      <legend className="field-label">{label}</legend>
      <div className="equipment-picker" id={id}>
        {options.map((item) => (
          <label className="equipment-option" key={item}>
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={(event) => {
                const next = event.target.checked ? [...selected, item] : selected.filter((entry) => entry !== item);
                onChange(next);
              }}
            />
            <span>{equipmentLabel(lang, item)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
