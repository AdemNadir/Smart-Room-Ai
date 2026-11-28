import { cx } from "@/lib/cx";
import styles from "./StatusPill.module.css";

/** The five room states defined in the project specification (section 11). */
export type RoomStatus = "available" | "occupied" | "booked" | "pending" | "inactive";

const DEFAULT_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied (official timetable)",
  booked: "Booked (additional session)",
  pending: "Pending approval",
  inactive: "Inactive",
};

type StatusPillProps = {
  status: RoomStatus;
  /** Override the text (for translation or a shorter form). */
  label?: string;
  className?: string;
  /** Compact variant for dense rows and inline metadata. */
  size?: "sm" | "md";
  /** Neutral tint used outside the room-state vocabulary (e.g. impact levels). */
  tone?: "default" | "glass" | "solid" | "accent";
};

export function StatusPill({ status, label, className, size = "md", tone }: StatusPillProps) {
  return (
    <span
      className={cx(
        styles.pill,
        styles[status],
        size === "sm" && styles.sm,
        tone && styles[tone],
        className,
      )}
    >
      <span className={styles.mark} aria-hidden="true" />
      {label ?? DEFAULT_LABELS[status]}
    </span>
  );
}
