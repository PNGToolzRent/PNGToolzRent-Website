import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Spinner shown while auth is loading
const LoadingScreen = () => (
  <div className="route-loading">
    <div className="route-loading__spinner" />
  </div>
)

// Only authenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />

  return children
}

// Only admin
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}

// Redirect authenticated users away from auth page
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />

  return children
}
