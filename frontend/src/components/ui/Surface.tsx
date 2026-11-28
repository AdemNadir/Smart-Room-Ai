import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cx } from "@/lib/cx";
import styles from "./Surface.module.css";

type Tone = "default" | "glass" | "solid" | "accent";
type Padding = "none" | "sm" | "md" | "lg";

type SurfaceProps<T extends ElementType> = {
  as?: T;
  tone?: Tone;
  padding?: Padding;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * A container with a visual material.
 * - `glass`: translucent, for floating chrome and panels.
 * - `solid`: opaque, for dense content that must stay easy to read.
 */
export function Surface<T extends ElementType = "div">({
  as,
  tone = "glass",
  padding = "md",
  className,
  ...rest
}: SurfaceProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cx(styles.surface, styles[tone], styles[`pad-${padding}`], className)}
      {...rest}
    />
  );
}
