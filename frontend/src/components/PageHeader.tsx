import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
};

/** Title block at the top of every screen, with optional actions (filters, buttons…). */
export function PageHeader({ title, lead, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
}
