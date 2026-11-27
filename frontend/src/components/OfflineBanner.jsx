import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#dc2626',
      color: 'white',
      textAlign: 'center',
      padding: '8px',
      fontSize: '0.9rem',
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    }}>
      You appear to be offline. Some features may not work until you reconnect to the local backend.
    </div>
  )
}