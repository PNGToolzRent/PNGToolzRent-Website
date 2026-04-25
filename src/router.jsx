import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/layout/RouteGuards'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Tools from './pages/Tools'
import ToolDetail from './pages/Tools/ToolDetail'
import HowToRent from './pages/HowToRent'
import NotFound from './pages/NotFound'

// Auth
import Auth from './pages/Auth'

// Client dashboard
import Dashboard from './pages/Dashboard'
import OrderHistory from './pages/Dashboard/OrderHistory'
import OrderDetail from './pages/Dashboard/OrderDetail'
import NewOrder from './pages/Dashboard/NewOrder'
import Profile from './pages/Dashboard/Profile'

// Admin panel
import AdminDashboard from './pages/Admin'
import AdminTools from './pages/Admin/Tools'
import AdminSlots from './pages/Admin/Slots'
import AdminBookings from './pages/Admin/Bookings'
import AdminUsers from './pages/Admin/Users'
import AdminReviews from './pages/Admin/Reviews'
import AdminMessages from './pages/Admin/Messages'
import AdminAnalytics from './pages/Admin/Analytics'
import AdminSettings from './pages/Admin/Settings'
import AdminActivityLog from './pages/Admin/ActivityLog'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolDetail />} />
          <Route path="/how-to-rent" element={<HowToRent />} />
        </Route>

        {/* Auth route */}
        <Route path="/auth" element={
          <PublicOnlyRoute>
            <Auth />
          </PublicOnlyRoute>
        } />

        {/* Client dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="tools" element={<AdminTools />} />
          <Route path="tools/:toolId/slots" element={<AdminSlots />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="activity" element={<AdminActivityLog />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
