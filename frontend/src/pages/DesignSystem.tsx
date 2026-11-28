import { useState } from "react";
import { Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { StatusPill, type RoomStatus } from "@/components/ui/StatusPill";
import { Surface } from "@/components/ui/Surface";
import styles from "./DesignSystem.module.css";

const SWATCHES = [
  ["Accent", "--c-accent"],
  ["Ink", "--c-ink"],
  ["Ink 2", "--c-ink-2"],
  ["Canvas", "--c-canvas"],
  ["Surface", "--c-surface"],
  ["Available", "--s-available"],
  ["Occupied", "--s-occupied"],
  ["Booked", "--s-booked"],
  ["Pending", "--s-pending"],
  ["Danger", "--c-danger"],
] as const;

const STATUSES: RoomStatus[] = ["available", "occupied", "booked", "pending", "inactive"];

/** Temporary review page for the design foundation. Removed once real screens exist. */
export function DesignSystem() {
  const [rtl, setRtl] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleDirection() {
    const next = !rtl;
    setRtl(next);
    document.documentElement.dir = next ? "rtl" : "ltr";
    document.documentElement.lang = next ? "ar" : "en";
  }

  function fakeSubmit() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  }

  return (
    <div className={styles.page}>
      <Surface as="header" className={styles.bar} padding="none">
        <div className={styles.brand}>
          <Logo size={30} />
          Smart Room
        </div>
        <Button variant="quiet" icon={<Languages size={18} aria-hidden />} onClick={toggleDirection}>
          {rtl ? "English" : "العربية"}
        </Button>
      </Surface>

      <section className={styles.hero}>
        <h1>{rtl ? "اعثر على القاعة المناسبة." : "Find the right room."}</h1>
        <p>
          {rtl
            ? "تحقق من التوفر الفعلي، واحجز حصة إضافية دون تعارض."
            : "See what is genuinely free, book an extra session, and never double-book a classroom."}
        </p>
      </section>

      <section className={styles.section} aria-labelledby="h-colour">
        <h2 id="h-colour">Colour</h2>
        <p>One accent. Status colours are reserved for room state only.</p>
        <div className={styles.swatches}>
          {SWATCHES.map(([name, token]) => (
            <div key={token} className={styles.swatch}>
              <div className={styles.chip} style={{ background: `var(${token})` }} />
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="h-actions">
        <h2 id="h-actions">Actions</h2>
        <div className={styles.row}>
          <Button icon={<Search size={18} aria-hidden />}>Find rooms</Button>
          <Button variant="secondary">Edit request</Button>
          <Button variant="quiet">Cancel</Button>
          <Button variant="danger">Cancel booking</Button>
          <Button disabled>Unavailable</Button>
          <Button loading={loading} onClick={fakeSubmit}>
            {loading ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="h-fields">
        <h2 id="h-fields">Fields</h2>
        <Surface padding="md" className={styles.grid2}>
          <Field label="Email" type="email" placeholder="name@university.dz" hint="Use your university address." />
          <Field label="Students" type="number" defaultValue={500} error="This room seats at most 40." />
        </Surface>
      </section>

      <section className={styles.section} aria-labelledby="h-status">
        <h2 id="h-status">Room status</h2>
        <p>Every status has a label and its own shape, so it reads correctly without colour.</p>
        <div className={styles.row}>
          {STATUSES.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="h-card">
        <h2 id="h-card">In context</h2>
        <p>Room details sit on a solid surface so they stay easy to read. Glass is kept for the layer above.</p>
        <Surface tone="solid" className={styles.room}>
          <div className={styles.roomHead}>
            <div>
              <h3>A102</h3>
              <p className={styles.meta}>Block A · Classroom · 40 seats</p>
            </div>
            <StatusPill status="available" />
          </div>
          <ul className={styles.facts}>
            <li>Projector</li>
            <li>Whiteboard</li>
            <li>10:00 – 12:00 free</li>
          </ul>
          <p className={styles.why}>
            Best match: free for the whole slot, 40 seats for 35 students, and it has the projector you asked for.
          </p>
          <div className={styles.row}>
            <Button>Book this room</Button>
            <Button variant="secondary">Details</Button>
          </div>
        </Surface>
      </section>
    </div>
  );
}
