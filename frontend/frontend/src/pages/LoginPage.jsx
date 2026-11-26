import { useState } from 'react';
import { t, uiLanguage } from '../strings.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { errorMessage } from '../utils/format.js';
import { isMockMode } from '../services/api.js';
import Icon from '../components/common/Icon.jsx';

export default function LoginPage() {
  const lang = uiLanguage();
  const { signIn, pending } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setLocalError(t(lang, 'auth.requiredFields'));
      return;
    }
    setLocalError('');
    await signIn(username.trim(), password);
  }

  return (
    <div className="login-page">
      <section className="login-aside">
        <div>
          <span className="section-kicker">{t(lang, 'auth.professorArea')} / {t(lang, 'auth.adminArea')}</span>
          <h1>{t(lang, 'auth.signInTitle')}</h1>
          <p>{t(lang, 'auth.signInIntro')}</p>
        </div>
        <ul className="login-features">
          <li>{t(lang, 'auth.featureOne')}</li>
          <li>{t(lang, 'auth.featureTwo')}</li>
          <li>{t(lang, 'auth.featureThree')}</li>
        </ul>
        <div className="login-aside-footer">
          <span>{t(lang, 'app.name')}</span>
          <span>{t(lang, 'app.tagline')}</span>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit} noValidate>
          <span className="section-kicker">{t(lang, 'app.shortName')}</span>
          <h2>{t(lang, 'auth.signIn')}</h2>
          <p className="muted">{t(lang, 'auth.signInIntro')}</p>

          {localError && <div className="inline-alert error" role="alert">{localError}</div>}
          <SignInError />

          <div className="field" style={{ marginTop: 'var(--space-5)' }}>
            <label htmlFor="login-username">{t(lang, 'auth.username')}</label>
            <input
              className="input"
              id="login-username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="login-password">{t(lang, 'auth.password')}</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                className="input"
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword}>
                <Icon name={showPassword ? 'close' : 'key'} size={14} />
                {t(lang, showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
              </button>
            </div>
          </div>

          {isMockMode && <p className="small muted" style={{ marginTop: 'var(--space-4)' }}>{t(lang, 'auth.mockHint')}</p>}

          <button className="btn btn-dark btn-block" type="submit" style={{ marginTop: 'var(--space-5)' }} disabled={pending}>
            <Icon name="signout" size={16} />
            {pending ? t(lang, 'auth.signingIn') : t(lang, 'auth.signInAction')}
          </button>
        </form>
      </section>
    </div>
  );
}

function SignInError() {
  const { error } = useAuth();
  if (!error) return null;
  let message = errorMessage(uiLanguage(), error);
  if (error.code === 'invalid_credentials') message = t(uiLanguage(), 'auth.invalidCredentials');
  if (error.code === 'too_many_requests') message = t(uiLanguage(), 'auth.throttled');
  return <div className="inline-alert error" role="alert">{message}</div>;
}
