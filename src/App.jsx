import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRouter from './router'
import './styles/globals.css'

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '0px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: {
                  primary: 'var(--accent-primary)',
                  secondary: 'var(--bg-elevated)',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
