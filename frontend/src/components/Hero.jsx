import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import BlurText from './BlurText'
import LightRays from './LightRays'
import StarBorder from './StarBorder'
import { roomsApi } from '../services/api'
import { useLang } from './LangContext'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { lang } = useLang()
  const t = {
    heroTitle: {
      en: 'SMART ROOM AI',
      fr: 'SMART ROOM AI',
      ar: 'الغرفة الذكية',
    }[lang],
    heroSubtitle: {
      en: 'Find the right room. Avoid conflicts. Use campus space intelligently.',
      fr: 'Trouvez la bonne salle. Évitez les conflits. Utilisez l\'espace du campus intelligemment.',
      ar: 'ابحث عن الغرفة المناسبة. تجنب التعارضات. استخدم مساحة الحرم الجامعي بذكاء.',
    }[lang],
    heroFindRoom: {
      en: 'Find a Room',
      fr: 'Trouver une salle',
      ar: 'ابحث عن غرفة',
    }[lang],
    heroBookRoom: {
      en: 'Book Now',
      fr: 'Réserver maintenant',
      ar: 'احجز الآن',
    }[lang],
    heroAI: {
      en: 'AI-Powered Search',
      fr: 'Recherche IA',
      ar: 'بحث ذكي',
    }[lang],
  }

  const [aiInput, setAiInput] = useState('')
  const [aiResults, setAiResults] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    // Initial rooms fetch
    roomsApi.list().then(() => {}) .catch(() => {})

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      lenis.destroy()
    }
  }, [])

  const handleAISubmit = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiResults([])

    try {
      const resp = await roomsApi.aiSearch({
        text: aiInput.trim()
      })
      setAiResults(resp.available_rooms)
    } catch (err) {
      console.error('AI search failed:', err)
      setAiError('Search failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="lenis-wrapper">
      <div className="hero">
        {/* Animated light rays background */}
        <LightRays
          className="hero-light-rays"
          color="#ffffff"
          speed={0.8}
          opacity={0.35}
          raysColor="rgba(125, 211, 252, 0.3)"
        />

        <div className="hero-content">
          {/* Blur Text for homepage title */}
          <h1 className="hero-title">
            <BlurText text={t.heroTitle} as="h1" speed={40} initialBlurValue="10px" />
          </h1>

          <p className="hero-subtitle">
            {t.heroSubtitle}
          </p>

          {/* AI Search Feature */}
          <div className="hero-ai-search" style={{ margin: '24px 0', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <h2 className="section-title" style={{ marginBottom: '8px' }}>
              {t.heroAI}
            </h2>
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AI to find a room (e.g., 'I need a room for 25 students for a math lecture next Monday')"
              className="rooms-input"
              style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button
              className="btn-primary"
              onClick={handleAISubmit}
              disabled={aiLoading}
              style={{
                marginTop: '12px',
                padding: '12px 24px',
                background: aiLoading ? '#999' : '#38bdf8',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                cursor: aiLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {aiLoading ? 'Searching...' : 'Search with AI'}
            </button>
            {aiError && <p className="error-message" style={{ color: 'red', marginTop: '8px' }}>{aiError}</p>}
            {aiResults.length > 0 && (
              <div className="ai-results" style={{ marginTop: '12px' }}>
                <p>Found {aiResults.length} rooms:</p>
                {aiResults.map((room) => (
                  <div key={room.room_id} className="ai-room-card" style={{
                    border: '1px solid var(--border)',
                    padding: '8px',
                    margin: '4px 0',
                    borderRadius: '6px',
                    background: '#f8f9ff'
                  }}>
                    <strong>{room.room_name}</strong> ({room.capacity} seats) - {room.building}
                    <div className="ai-room-score" style={{
                      color: 'var(--accent)',
                      fontSize: '0.85rem',
                      marginTop: '4px'
                    }}>
                      Score: {room.score.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main CTA */}
          <div className="hero-cta">
            {/* Star Border primary button */}
            <StarBorder className="btn-primary" color="#7dd3fc">
              <a href="#search" style={{ textDecoration: 'none', color: 'inherit' }}>
                {t.heroFindRoom}
              </a>
            </StarBorder>
          </div>
        </div>
      </div>
    </div>
  )
}