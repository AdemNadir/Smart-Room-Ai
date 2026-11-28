import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Surface } from "./Surface";
import { cx } from "@/lib/cx";
import { useState, useRef, useEffect } from "react";
import styles from "./LanguageSelector.module.css";

const LOCALES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
] as const;

export function LanguageSelector() {
  const { locale, setLocale, t, dir } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((v) => !v);

  return (
    <div className={styles.wrapper} ref={rootRef}>
      <Surface
        as="button"
        tone="glass"
        padding="none"
        className={cx(styles.trigger, dir === "rtl" && styles.rtl)}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-label={t.common.language}
        aria-expanded={isOpen}
      >
        <Globe size={18} aria-hidden />
        <span className={styles.current}>
          {LOCALES.find((l) => l.code === locale)?.nativeLabel}
        </span>
        <ChevronDown size={16} aria-hidden className={styles.chevron} />
      </Surface>

      {isOpen && (
        <Surface
          tone="glass"
          padding="none"
          className={styles.dropdown}
          role="listbox"
          aria-label={t.common.language}
        >
          {LOCALES.map(({ code, nativeLabel }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              className={cx(styles.option, locale === code && styles.active)}
              onClick={() => {
                setLocale(code as "en" | "fr" | "ar");
                setIsOpen(false);
              }}
            >
              <span className={styles.label}>{nativeLabel}</span>
              {locale === code && <Check size={16} aria-hidden className={styles.check} />}
            </button>
          ))}
        </Surface>
      )}
    </div>
  );
}