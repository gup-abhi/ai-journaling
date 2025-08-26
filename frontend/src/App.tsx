import { ThemeProvider } from './components/ui/theme-provider'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes/AppRoutes'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground scroll-smooth">
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          toastOptions={{
            duration: 3000,
            position: 'top-center',
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
            success: {
              iconTheme: {
                primary: 'var(--primary)',
                secondary: 'var(--primary-foreground)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--destructive)',
                secondary: 'var(--destructive-foreground)',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
