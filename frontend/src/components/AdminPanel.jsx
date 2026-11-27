import { useLang } from './LangContext'
import StarBorder from './StarBorder'
import { roomsApi, adminApi, bookingsApi, getCurrentProfessorId } from '../services/api'
import { useState, useEffect } from 'react'

export default function AdminPanel() {
  const { lang } = useLang()
  const t = {
    adminPanel: { en: 'Admin Panel', fr: 'Panneau d\'Administration', ar: 'لوحة المسؤول' }[lang],
    adminToggleAccess: { en: 'Toggle Admin Access', fr: 'Activer l\'accès Admin', ar: 'تفعيل الوصول للمسؤول' }[lang],
    adminManageRooms: { en: 'Manage Rooms', fr: 'Gérer les salles', ar: 'إدارة الغرف' }[lang],
    adminViewStats: { en: 'View Statistics', fr: 'Voir les statistiques', ar: 'عرض الإحصائيات' }[lang],
    adminReports: { en: 'Reports', fr: 'Rapports', ar: 'التقارير' }[lang],
  }

  const [isAdmin, setIsAdmin] = useState(false)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [insights, setInsights] = useState(null)

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [roomsData, metricsData] = await Promise.all([
        roomsApi.listRooms(),
        adminApi.metrics(),
      ])
      setRooms(roomsData.rooms)
      setMetrics(metricsData.metrics)
      setInsights(metricsData.insights)
      setError('')
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError('Failed to load admin data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadInsights = async () => {
    try {
      setLoading(true)
      const data = await adminApi.insights()
      setInsights(data)
      setError('')
    } catch (err) {
      console.error('Failed to load insights:', err)
      setError('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleCreateRoom = async () => {
    const newRoom = {
      room_id: 'E401',
      room_name: 'New Classroom E401',
      capacity: 20,
      room_type: 'classroom',
      building: 'Block E',
      equipment: ['projector'],
      active: true,
    }
    try {
      await roomsApi.createRoom(newRoom)
      const updated = await roomsApi.listRooms()
      setRooms(updated.rooms)
      alert('Room E401 created successfully')
    } catch (err) {
      console.error('Create room failed:', err)
      alert(`Failed to create room: ${err.message}`)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm(`Deactivate room ${roomId}?`)) return
    try {
      await roomsApi.deleteRoom(roomId)
      const updated = await roomsApi.listRooms()
      setRooms(updated.rooms)
      alert(`Room ${roomId} deactivated`)
    } catch (err) {
      console.error('Delete room failed:', err)
      alert(`Failed to deactivate room: ${err.message}`)
    }
  }

  return (
    <section className="section admin-section" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="section-title">{t.adminPanel}</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="admin-actions">
        <button className="btn-admin" onClick={() => setIsAdmin(!isAdmin)}>
          {t.adminToggleAccess}
        </button>
        <StarBorder color="#7dd3fc">
          <button className="btn-admin-secondary" onClick={loadAdminData}>
            {t.adminManageRooms}
          </button>
        </StarBorder>
        <StarBorder color="#7dd3fc">
          <button className="btn-admin-secondary" onClick={handleLoadInsights}>
            {t.adminViewStats}
          </button>
        </StarBorder>
        <StarBorder color="#7dd3fc">
          <button className="btn-admin-secondary" onClick={loadAdminData}>
            {t.adminReports}
          </button>
        </StarBorder>
      </div>

      {loading && <p className="loading-message">Loading admin data...</p>}

      {metrics && (
        <div className="admin-metrics" style={{ marginTop: '32px' }}>
          <h3>Statistics</h3>
          <div className="stats-grid" style={{ marginTop: '16px' }}>
            <div className="stat-card">
              <span className="counter">{metrics.total_rooms}</span>
              <p>Total Rooms</p>
            </div>
            <div className="stat-card">
              <span className="counter">{metrics.booking_status_counts.confirmed}</span>
              <p>Confirmed Bookings</p>
            </div>
            <div className="stat-card">
              <span className="counter">{metrics.booking_status_counts.pending}</span>
              <p>Pending Bookings</p>
            </div>
            <div className="stat-card">
              <span className="counter">{metrics.booking_status_counts.cancelled}</span>
              <p>Cancelled Bookings</p>
            </div>
          </div>

          <h4>Room Utilization (Scheduled Hours)</h4>
          <ul>
            {Object.entries(metrics.scheduled_hours_by_room).map(([roomId, hours]) => (
              <li key={roomId}>{roomId}: {hours.toFixed(1)}h</li>
            ))}
          </ul>

          <h4>Building Hours</h4>
          <ul>
            {Object.entries(metrics.building_hours).map(([building, hours]) => (
              <li key={building}>{building}: {hours.toFixed(1)}h</li>
            ))}
          </ul>
        </div>
      )}

      {insights && (
        <div className="admin-insights" style={{ marginTop: '32px' }}>
          <h3>AI-Generated Insights</h3>
          {insights.summary_llm && (
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {insights.summary_llm}
            </p>
          )}
          <h4>Key Facts</h4>
          <ul>
            {insights.facts?.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
          {insights.method && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Method: {insights.method}</p>}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h3>Room Management</h3>
        <button className="btn-admin" onClick={handleCreateRoom} style={{ marginTop: '12px' }}>
          + Create Sample Room
        </button>

        <div className="rooms-grid" style={{ marginTop: '20px' }}>
          {rooms.map((room) => (
            <div key={room.room_id} className="ios-card">
              <h4>{room.room_name}</h4>
              <p>{room.building} · {room.capacity} seats</p>
              <p>{room.room_type}</p>
              <div className="room-features">
                {room.equipment.map((eq) => (
                  <span key={eq} className="room-feature-tag">{eq}</span>
                ))}
              </div>
              <button
                className="btn-book"
                onClick={() => handleDeleteRoom(room.room_id)}
                style={{ marginTop: '12px' }}
              >
                Deactivate
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}