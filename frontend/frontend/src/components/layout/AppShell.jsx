import { useEffect, useState } from 'react';
import { t, uiLanguage } from '../../strings.js';
import { isActivePath, navigate } from '../../utils/router.js';
import { isMockMode } from '../../services/api.js';
import Icon from '../common/Icon.jsx';

const PROFESSOR_LINKS = [
  { path: '/search', key: 'nav.search', icon: 'search' },
  { path: '/my-bookings', key: 'nav.myBookings', icon: 'calendar' },
];

const ADMIN_LINKS = [
  { path: '/admin', key: 'nav.dashboard', icon: 'chart' },
  { path: '/admin/rooms', key: 'nav.rooms', icon: 'room' },
  { path: '/admin/import', key: 'nav.import', icon: 'upload' },
  { path: '/admin/bookings', key: 'nav.adminBookings', icon: 'book' },
  { path: '/admin/insights', key: 'nav.insights', icon: 'info' },
  { path: '/admin/audit', key: 'nav.audit', icon: 'shield' },
  { path: '/admin/settings', key: 'nav.settings', icon: 'settings' },
];

export default function AppShell({ user, route, meta, onSignOut, children }) {
  const lang = uiLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const goOnline = () => setBrowserOffline(false);
    const goOffline = () => setBrowserOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const links = user?.role === 'admin' ? [...PROFESSOR_LINKS, ...ADMIN_LINKS] : PROFESSOR_LINKS;
  const navLabel = user?.role === 'admin' ? t(lang, 'shell.adminNav') : t(lang, 'shell.professorNav');

  function go(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <button className="brand" type="button" onClick={() => go('/search')}>
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>
              <span className="brand-name">{t(lang, 'app.name')}</span>
              <span className="brand-tagline">{t(lang, 'app.tagline')}</span>
            </span>
          </button>
          <div className="header-actions">
            <div className="user-chip">
              <strong dir="auto">{user?.display_name || t(lang, 'shell.userFallback')}</strong>
              <span>{t(lang, `shell.role.${user?.role || 'professor'}`)}</span>
            </div>
            <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="main-navigation">
              <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
              {t(lang, menuOpen ? 'nav.closeMenu' : 'nav.menu')}
            </button>
            <button className="btn btn-secondary btn-small" type="button" onClick={() => { onSignOut(); navigate('/login'); }}>
              <Icon name="signout" size={15} />
              {t(lang, 'nav.signOut')}
            </button>
          </div>
        </div>
      </header>

      {isMockMode && <div className="banner mock">{t(lang, 'shell.mockBanner')}</div>}
      {browserOffline && <div className="banner offline" role="status">{t(lang, 'shell.offlineBanner')}</div>}

      <nav className="nav-bar" aria-label={navLabel}>
        <div className={`nav-inner ${menuOpen ? 'open' : ''}`} id="main-navigation">
          {links.map((link) => (
            <button
              className={`nav-link ${isActivePath(route.path, link.path) ? 'active' : ''}`}
              type="button"
              key={link.path}
              onClick={() => go(link.path)}
              aria-current={isActivePath(route.path, link.path) ? 'page' : undefined}
            >
              <Icon name={link.icon} size={14} />
              {t(lang, link.key)}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main" id="main-content">{children}</main>

      <footer className="app-footer">
        <span>{t(lang, 'app.shortName')} — {t(lang, 'app.tagline')}</span>
        <span>
          {meta?.ai?.parser && `${t(lang, 'shell.rulesReader')} · `}
          {meta?.ai?.insights && t(lang, 'shell.templateInsights')}
        </span>
      </footer>
    </div>
  );
}
