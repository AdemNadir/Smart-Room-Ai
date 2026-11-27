import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from './LangContext'

export default function Navbar() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)

  const t = {
    brand: { en: 'SMART ROOM AI', fr: 'SMART ROOM AI', ar: 'الغرفة الذكية' }[lang],
    rooms: { en: 'Rooms', fr: 'Salles', ar: 'الغرف' }[lang],
    bookings: { en: 'Bookings', fr: 'Réservations', ar: 'الحجوزات' }[lang],
    stats: { en: 'Stats', fr: 'Statistiques', ar: 'الإحصائيات' }[lang],
    features: { en: 'Features', fr: 'Fonctionnalités', ar: 'المميزات' }[lang],
    admin: { en: 'Admin', fr: 'Admin', ar: 'المسؤول' }[lang],
    teacher: { en: 'Teacher', fr: 'Enseignant', ar: 'المدرس' }[lang],
  }

  return (
    <nav className="navbar ios-style" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="nav-bar">
        <Link to="/" className="nav-brand">
          {t.brand}
        </Link>

        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/rooms')}>
            {t.rooms}
          </button>
          <button className="nav-link" onClick={() => navigate('/teacher')}>
            {t.bookings}
          </button>
          <button className="nav-link" onClick={() => navigate('/stats')}>
            {t.stats}
          </button>
          <button className="nav-link" onClick={() => navigate('/features')}>
            {t.features}
          </button>
        </div>

        <div className="nav-actions">
          <button
            className={`nav-toggle ${isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(!isAdmin)}
            title={t.admin}
          >
            {t.admin}
          </button>
          <button
            className={`nav-toggle ${isTeacher ? 'active' : ''}`}
            onClick={() => setIsTeacher(!isTeacher)}
            title={t.teacher}
          >
            {t.teacher}
          </button>

          <div className="nav-lang-group">
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
              onClick={() => setLang('fr')}
            >
              FR
            </button>
            <button
              className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
              onClick={() => setLang('ar')}
            >
              AR
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}