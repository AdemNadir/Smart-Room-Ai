import { useLang } from './LangContext'
import StarBorder from './StarBorder'
import { useState, useEffect } from 'react'
import { bookingsApi, getCurrentProfessorId } from '../services/api'

export default function TeacherPanel() {
  const { lang } = useLang()
  const t = {
    teacherPanel: { en: 'Teacher Panel', fr: 'Panneau Enseignant', ar: 'لوحة المعلم' }[lang],
    teacherToggleAccess: { en: 'Toggle Teacher Access', fr: 'Activer l\'accès Enseignant', ar: 'تفعيل الوصول للمعلم' }[lang],
    teacherMyBookings: { en: 'My Bookings', fr: 'Mes réservations', ar: 'حجزاتي' }[lang],
    teacherApproveRequests: { en: 'Approve Requests', fr: 'Approuver les demandes', ar: 'الموافقة على الطلبات' }[lang],
    teacherViewRooms: { en: 'View Rooms', fr: 'Voir les salles', ar: 'عرض الغرف' }[lang],
    noBookings: { en: 'No bookings yet', fr: 'Aucune réservation', ar: 'لا توجد حجوزات' }[lang],
    cancelBtn: { en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' }[lang],
  }

  const [isTeacher, setIsTeacher] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUserId = getCurrentProfessorId()

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await bookingsApi.my(currentUserId)
      setBookings(data.bookings || [])
      setError('')
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Failed to load bookings. Is the backend running?')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId}?`)) return
    try {
      await bookingsApi.cancel({ booking_id: bookingId, professor_id: currentUserId })
      await loadBookings()
      alert('Booking cancelled')
    } catch (err) {
      console.error('Cancel booking failed:', err)
      alert(`Failed to cancel booking: ${err.message}`)
    }
  }

  useEffect(() => {
    if (isTeacher) loadBookings()
  }, [isTeacher])

  return (
    <section className="section teacher-section" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="section-title">{t.teacherPanel}</h2>

      <div className="teacher-actions">
        <button className="btn-teacher" onClick={() => setIsTeacher(!isTeacher)}>
          {t.teacherToggleAccess}
        </button>
      </div>

      {isTeacher && (
        <>
          {error && <p className="error-message">{error}</p>}
          {loading && <p className="loading-message">Loading your bookings...</p>}

          {!loading && bookings.length === 0 && (
            <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>{t.noBookings}</p>
          )}

          {!loading && bookings.length > 0 && (
            <div className="bookings-list" style={{ marginTop: '24px' }}>
              <h3>{t.teacherMyBookings}</h3>
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="ios-card" style={{ margin: '12px 0' }}>
                  <h4>Booking #{booking.booking_id}</h4>
                  <p>Room: {booking.room_id}</p>
                  <p>Date: {booking.session_date} | Time: {booking.start_time} - {booking.end_time}</p>
                  <p>Course: {booking.course} | Students: {booking.student_count}</p>
                  <p>Status: <span style={{ color: booking.status === 'confirmed' ? 'green' : 'orange' }}>{booking.status}</span></p>
                  <button
                    className="btn-book"
                    onClick={() => handleCancelBooking(booking.booking_id)}
                    style={{ marginTop: '12px', background: '#dc2626' }}
                  >
                    {t.cancelBtn}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}