import { useState, useEffect } from 'react'
import { useLang } from './LangContext'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StarBorder from './StarBorder'
import { roomsApi, bookingsApi, getCurrentProfessorId } from '../services/api'

gsap.registerPlugin(ScrollTrigger)

const Rooms = () => {
  const { lang, setLang } = useLang()

  const t = {
    roomsTitle: { en: 'Available Rooms', fr: 'Salles Disponibles', ar: 'الغرف المتاحة' }[lang],
    roomsSearchPlaceholder: { en: 'Search rooms...', fr: 'Rechercher des salles...', ar: 'البحث عن الغرف...' }[lang],
    roomStatus: {
      available: { en: 'Available', fr: 'Disponible', ar: 'متاح' },
      occupied: { en: 'Occupied', fr: 'Occupée', ar: 'مشغول' },
    },
    bookBtn: { en: 'Book Room', fr: 'Réserver la salle', ar: 'احجز الغرفة' }[lang],
  }

  const [search, setSearch] = useState('')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState(getCurrentProfessorId())

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const resp = await roomsApi.list()
        setRooms(resp.rooms)
        setError('')
      } catch (err) {
        console.error('Failed to load rooms:', err)
        setError('Failed to load rooms. Is the backend running?')
        setRooms([])
      } finally {
        setLoading(false)
      }
    }
    loadRooms()
  }, [])

  const handleBook = async (roomId) => {
    const today = new Date().toISOString().split('T')[0]
    const startTime = '09:00'
    const endTime = '10:00'
    const course = 'General Course'
    const studentCount = 20

    try {
      const resp = await bookingsApi.create({
        room_id: roomId,
        professor_id: currentUserId,
        session_date: today,
        start_time: startTime,
        end_time: endTime,
        course: course,
        student_count: studentCount,
      })
      alert(`Booking confirmed! Room ${roomId}, Booking ID: ${resp.booking_id}`)
      const resp2 = await roomsApi.list()
      setRooms(resp2.rooms)
    } catch (err) {
      console.error('Booking failed:', err)
      alert(`Booking failed: ${err.message}`)
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.room_name.toLowerCase().includes(search.toLowerCase()) ||
      room.building.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="ios-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="section-title">{t.roomsTitle}</h2>
      <div className="rooms-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.roomsSearchPlaceholder}
          className="rooms-input"
        />
      </div>

      {loading && <p>Loading rooms...</p>}
      {error && <p className="error">{error}</p>}

      <div className="rooms-grid">
        {filteredRooms.map((room) => (
          <div key={room.room_id} className="ios-card">
            <h3>{room.room_name}</h3>
            <p>{room.building}</p>
            <p>Capacity: {room.capacity}</p>
            <div className="room-features">
              {room.equipment.map((f) => (
                <span key={f} className="room-feature-tag">{f}</span>
              ))}
            </div>
            <button
              className="btn-book"
              onClick={() => handleBook(room.room_id)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Rooms