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
import { Trends } from '../pages/Trends'
import JournalTemplates from '../pages/JournalTemplates'
import { NewGoal } from '../pages/NewGoal'
import { Goals } from '../pages/Goals'
import { UpdateGoal } from '../pages/UpdateGoal'

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
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <motion.div {...pageTransition}><LandingPage /></motion.div>}
        />
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
        <Route path="/journal/new" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><NewJournalEntry /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/journal-templates" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><JournalTemplates /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/journals/:id" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><JournalView /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/trends" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><Trends /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/goals/new" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><NewGoal /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><Goals /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="/goals/:id/update" element={
          <ProtectedRoute>
            <motion.div {...pageTransition}><UpdateGoal /></motion.div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<motion.div {...pageTransition}><NotFoundPage /></motion.div>} />
      </Routes>
    </AnimatePresence>
  )
}
