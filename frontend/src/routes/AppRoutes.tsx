import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LandingPage } from '../pages/LandingPage'
import { SignUp } from '../pages/SignUp'
import { SignIn } from '../pages/SignIn'
import { Dashboard } from '../pages/Dashboard'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Journals } from '../pages/Journals'
import { NewJournalEntry } from '../pages/NewJournalEntry'
import { JournalView } from '../pages/JournalView'
import { NotFoundPage } from '../pages/NotFoundPage'

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

export function AppRoutes() {
  const location = useLocation()
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div {...pageTransition}><LandingPage /></motion.div>} />
        <Route
          path="/sign-up"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <motion.div {...pageTransition}><SignUp /></motion.div>}
        />
        <Route
          path="/sign-in"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <motion.div {...pageTransition}><SignIn /></motion.div>}
        />
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
        <Route path="/journals/:id" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><JournalView /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<motion.div {...pageTransition}><NotFoundPage /></motion.div>} />
      </Routes>
    </AnimatePresence>
  )
}
