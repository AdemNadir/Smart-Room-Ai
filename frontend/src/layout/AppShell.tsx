import { NavLink, Outlet, Link, useNavigate } from "react-router";
import { CalendarCheck, LayoutDashboard, LogOut, Search, Calendar, BarChart2, MessageSquare, Users, type LucideIcon } from "lucide-react";
import type { Role } from "@/api";
import { useAuth } from "@/auth/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Surface } from "@/components/ui/Surface";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";
import styles from "./AppShell.module.css";

type NavItem = { to: string; labelKey: keyof Translations["nav"]; icon: LucideIcon; roles: Role[]; end?: boolean };

// Navigation items with translation keys
const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "findRoom", icon: Search, roles: ["professor", "admin"], end: true },
  { to: "/bookings", labelKey: "myBookings", icon: CalendarCheck, roles: ["professor"] },
  { to: "/scheduling", labelKey: "scheduling", icon: Calendar, roles: ["professor"] },
  { to: "/admin", labelKey: "administration", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/admin/statistics", labelKey: "statistics", icon: BarChart2, roles: ["admin"] },
  { to: "/admin/ai-reports", labelKey: "aiReports", icon: MessageSquare, roles: ["admin"] },
  { to: "/admin/users", labelKey: "users", icon: Users, roles: ["admin"] },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Chrome shared by every signed-in screen: brand, navigation, current user. */
export function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  if (!user) return null; // guarded by <RequireAuth>; keeps types honest

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  // Filter nav items for current user role
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Surface as={Link} to="/" padding="none" className={styles.brand} aria-label="Smart Room, home">
          <Logo size={34} />
          <span>Smart Room</span>
        </Surface>

        <Surface as="nav" padding="none" className={styles.nav} aria-label="Main">
          {visibleItems.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={styles.link}>
              <Icon size={19} aria-hidden />
              {t.nav[labelKey]}
            </NavLink>
          ))}
        </Surface>

        <div className={styles.end}>
          <Surface padding="none" className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(user.displayName)}
            </span>
            <span className={styles.who}>
              <span className={styles.name}>{user.displayName}</span>
              <span className={styles.role}>{t.user[user.role === "professor" ? "professor" : "administrator"]}</span>
            </span>
            <button type="button" className={styles.signOut} onClick={signOut} aria-label={t.auth.signOut}>
              <LogOut size={19} aria-hidden />
            </button>
          </Surface>

          <Surface padding="none" className={styles.actions}>
            <LanguageSelector />
            <ThemeToggle />
          </Surface>
        </div>
      </header>

      <main className={styles.main} id="main">
        <Outlet />
      </main>
    </div>
  );
}