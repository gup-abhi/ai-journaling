import { motion } from 'framer-motion'

interface LoaderProps {
  className?: string; // Add className prop
}

export function Loader({ className }: LoaderProps) { // Destructure className
  return (
    <motion.div
      className={`flex items-center justify-center ${className || 'min-h-screen'}`} // Apply className
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-12 h-12 border-4 border-t-4 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  )
}
