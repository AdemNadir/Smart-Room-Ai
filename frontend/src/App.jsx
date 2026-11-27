import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { LangProvider } from './components/LangContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Features from './components/Features'
import Rooms from './components/Rooms'
import AdminPanel from './components/AdminPanel'
import TeacherPanel from './components/TeacherPanel'
import OfflineBanner from './components/OfflineBanner'
import './components/Pages.css'

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <div className="app">
          <OfflineBanner />
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/features" element={<Features />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/teacher" element={<TeacherPanel />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App