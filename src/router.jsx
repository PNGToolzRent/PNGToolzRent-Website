import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts & Guards
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/layout/RouteGuards'

// Pages
import Home from './pages/Home'
import Tools from './pages/Tools'
import ToolDetail from './pages/Tools/ToolDetail'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/Admin'
import AdminUsers from './pages/Admin/Users'
// ... import other admin pages as before

// FIX: Always start at top on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// FIX: Mandatory Email Verification Guard
const EmailVerifyGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null;
  if (isAuthenticated && !user.emailVerified) {
    return (
      <div className="verify-screen section container">
        <h1>Please Verify Your Email</h1>
        <p>A verification link was sent to {user.email}. Please verify to continue.</p>
        <button className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>I've Verified</button>
      </div>
    )
  }
  return children;
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}><Route path="/" element={<Home />} /><Route path="/tools" element={<Tools />} /><Route path="/tools/:slug" element={<ToolDetail />} /></Route>
        <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><EmailVerifyGuard><DashboardLayout /></EmailVerifyGuard></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          {/* ... other admin routes ... */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
