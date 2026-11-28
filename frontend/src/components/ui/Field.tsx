import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Field.module.css";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label?: string;
  hint?: string;
  /** When set, the field is marked invalid and the message is announced to screen readers. */
  error?: string;
  /** Optional control shown inside the end of the input (e.g. a show-password button). */
  trailing?: ReactNode;
};

/** A labelled text input. Label, hint and error are wired up for assistive technology. */
export function Field({ label, hint, error, trailing, className, ...rest }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.wrap}>
        <input
          id={id}
          className={cx(styles.control, trailing ? styles.hasTrailing : false, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
