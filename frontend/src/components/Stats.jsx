import { useLang } from './LangContext'
import CountUp from './CountUp'
import StarBorder from './StarBorder'

export default function Stats() {
  const { lang } = useLang()

  const t = {
    statsRooms: { en: 'Smart Rooms', fr: 'Salles Intelligentes', ar: 'غرف ذكية' }[lang],
    statsConflictFree: { en: 'Conflict-Free', fr: 'Sans Conflit', ar: 'بدون تعارض' }[lang],
    statsSupport: { en: '7x24 Support', fr: 'Support 7x24', ar: 'دعم 7x24' }[lang],
  }

  return (
    <section className="section stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <CountUp end={12} className="counter" />
          <p>{t.statsRooms}</p>
        </div>
        <div className="stat-card">
          <CountUp end={98} className="counter" />
          <p>{t.statsConflictFree}</p>
        </div>
        <div className="stat-card">
          <CountUp end={24} className="counter" />
          <p>{t.statsSupport}</p>
        </div>
      </div>
    </section>
  )
}