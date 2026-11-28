import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { Surface } from "./Surface";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Surface
      as="button"
      tone="glass"
      padding="none"
      className={styles.button}
      onClick={toggleTheme}
      aria-label={theme === "light" ? t.common.darkMode : t.common.lightMode}
      aria-pressed={theme === "dark"}
    >
      {theme === "light" ? <Moon size={20} aria-hidden /> : <Sun size={20} aria-hidden />}
    </Surface>
  );
}