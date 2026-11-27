import { useEffect } from 'react';
import { useAuth } from './auth/AuthContext.jsx';
import { meta } from './services/api.js';
import { useResource } from './hooks/useResource.js';
import { useHashRoute, navigate } from './utils/router.js';
import { t, uiLanguage } from './strings.js';
import AppShell from './components/layout/AppShell.jsx';
import StatePanel from './components/common/StatePanel.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminRoomsPage from './pages/admin/AdminRoomsPage.jsx';
import AdminImportPage from './pages/admin/AdminImportPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';
import AdminInsightsPage from './pages/admin/AdminInsightsPage.jsx';
import AdminAuditPage from './pages/admin/AdminAuditPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';

export default function App() {
  const lang = uiLanguage();
  const { user, status, signOut } = useAuth();
  const route = useHashRoute();
  const metaResource = useResource(
    (signal) => (status === 'authenticated' ? meta({ signal }) : Promise.resolve(null)),
    [status],
  );
  const metaData = metaResource.status === 'success' ? metaResource.data : null;

  useEffect(() => {
    if (status === 'authenticated' && route.path === '/login') navigate('/search');
  }, [status, route.path]);

  if (status === 'loading') {
    return (
      <div className="centered-page">
        <StatePanel lang={lang} tone="loading" icon="refresh" title={t(lang, 'common.loading')} />
      </div>
    );
  }

  if (status === 'anonymous' || route.path === '/login') {
    return <LoginPage />;
  }

  const adminArea = route.path.startsWith('/admin');
  if (adminArea && user?.role !== 'admin') {
    return (
      <AppShell user={user} route={route} meta={metaData} onSignOut={signOut}>
        <StatePanel
          lang={lang}
          tone="error"
          icon="shield"
          title={t(lang, 'error.forbidden')}
          message={t(lang, 'error.forbidden')}
          actionLabel={t(lang, 'nav.search')}
          onAction={() => navigate('/search')}
        />
      </AppShell>
    );
  }

  let page;
  switch (route.path) {
    case '/my-bookings':
      page = <MyBookingsPage />;
      break;
    case '/admin':
      page = <AdminDashboardPage meta={metaData} />;
      break;
    case '/admin/rooms':
      page = <AdminRoomsPage meta={metaData} />;
      break;
    case '/admin/import':
      page = <AdminImportPage />;
      break;
    case '/admin/bookings':
      page = <AdminBookingsPage />;
      break;
    case '/admin/insights':
      page = <AdminInsightsPage meta={metaData} />;
      break;
    case '/admin/audit':
      page = <AdminAuditPage />;
      break;
    case '/admin/settings':
      page = <AdminSettingsPage />;
      break;
    case '/search':
    default:
      page = <SearchPage meta={metaData} />;
      break;
  }

  return (
    <AppShell user={user} route={route} meta={metaData} onSignOut={signOut}>
      {page}
    </AppShell>
  );
}
