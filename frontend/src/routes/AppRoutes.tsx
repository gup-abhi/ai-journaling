import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LandingPage } from '../components/LandingPage'
import { SignUp } from '../components/SignUp'
import { SignIn } from '../components/SignIn'
import { Dashboard } from '../components/Dashboard'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Journals } from '../components/Journals'
import { NewJournalEntry } from '../components/NewJournalEntry'

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

export function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div {...pageTransition}><LandingPage /></motion.div>} />
        <Route path="/sign-up" element={<motion.div {...pageTransition}><SignUp /></motion.div>} />
        <Route path="/sign-in" element={<motion.div {...pageTransition}><SignIn /></motion.div>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><Dashboard /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/journals" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><Journals /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/journals/new" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><NewJournalEntry /></motion.div>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}
