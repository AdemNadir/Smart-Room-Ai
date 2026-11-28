import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "ghost" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xs";
  block?: boolean;
  /** Shows a spinner and blocks further clicks while an action is running. */
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  icon,
  className,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        size === "lg" && styles.lg,
        size === "sm" && styles.sm,
        size === "xs" && styles.xs,
        block && styles.block,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
