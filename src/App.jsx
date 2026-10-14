import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Skills from './sections/Skills.jsx'
import Experience from './sections/Experience.jsx'
import Projects from './sections/Projects.jsx'
import Analytics from './sections/Analytics.jsx'
import Automation from './sections/Automation.jsx'
import ImmersiveTech from './sections/ImmersiveTech.jsx'
import Contact from './sections/Contact.jsx'
import { ScrollTrigger } from './hooks/useGSAPAnimations.js'

export default function App() {
  // Fonts and lazy content change layout after first paint — recalc trigger positions.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <Navbar />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Analytics />
        <Automation />
        <ImmersiveTech />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
