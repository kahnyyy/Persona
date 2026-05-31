import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import menuVideo from './assets/Mainn.mp4'
import main1 from './assets/main1.mp4'
import main2 from './assets/main2.mp4'
import main3 from './assets/main3.mp4'
import sfxvideo from './assets/SFX VIDEO.mp4'
import P3Menu from './P3Menu'
import VideoPage from './VideoPage'
import PageTransition from './PageTransition'
import UserInterface from './UserInterface'
import Animation from './Animation'
import Sfx from './Sfx'
import Vfx from './Vfx'
import './App.css'


function MenuScreen() {
  const navigate = useNavigate()
  return (
    <div id="menu-screen">
      <video src={menuVideo} autoPlay loop muted playsInline />
      <P3Menu onNavigate={(page) => navigate(`/${page}`)} />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition><MenuScreen /></PageTransition>
        } />
        <Route path="/userinterface" element={
          <PageTransition variant="about"><UserInterface /></PageTransition>
        } />
        <Route path="/animation" element={
          <PageTransition><Animation src={main2} /></PageTransition>
        } />
        <Route
          path="/sfx"
          element={
            <PageTransition>
              <Vfx src={sfxvideo} />
            </PageTransition>
          }
        />
        <Route
          path="/vfx"
          element={
            <PageTransition>
              <Vfx src={main1} />
            </PageTransition>
          }
        />
        <Route path="/other" element={
          <PageTransition><VideoPage src={main3} /></PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return <AnimatedRoutes />
}