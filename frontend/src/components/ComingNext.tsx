import { Surface } from "./ui/Surface";
import styles from "./ComingNext.module.css";

/** Temporary stand-in for a screen that is built in a later step. */
export function ComingNext({ children }: { children: string }) {
  return (
    <Surface tone="solid" className={styles.note}>
      <h2>Coming in a later step</h2>
      <p>{children}</p>
    </Surface>
  );
}
