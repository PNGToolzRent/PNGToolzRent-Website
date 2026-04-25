import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logoutUser } from '../../firebase/auth'
import { useAdminBadges } from '../../hooks/useAdminBadges'
import { LogoSVG, IconSun, IconMoon, IconMenu, IconX, IconGrid, IconBox, IconList, IconUser, IconStar, IconMail, IconBarChart, IconSettings, IconActivity, IconLogout } from '../ui/Icons'
import toast from 'react-hot-toast'
import './SidebarLayout.css'
import './AdminLayout.css'

const AdminLayout = () => {
  const { profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { badges } = useAdminBadges()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="sidebar-layout sidebar-layout--admin">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar sidebar--admin ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <NavLink to="/" className="sidebar__logo"><LogoSVG height={22} /></NavLink>
          <span className="sidebar__admin-tag">ADMIN</span>
          <button className="sidebar__close-btn" onClick={closeSidebar}><IconX size={18} /></button>
        </div>

        <nav className="sidebar__nav">
          {[
            { to: '/admin', end: true, icon: <IconGrid size={15} />, label: 'Dashboard' },
            { to: '/admin/bookings', icon: <IconList size={15} />, label: 'Bookings', badge: badges.pendingBookings },
            { to: '/admin/tools', icon: <IconBox size={15} />, label: 'Tools' },
            { to: '/admin/users', icon: <IconUser size={15} />, label: 'Users' },
            { to: '/admin/reviews', icon: <IconStar size={15} />, label: 'Reviews', badge: badges.pendingReviews },
            { to: '/admin/messages', icon: <IconMail size={15} />, label: 'Messages' },
            { to: '/admin/analytics', icon: <IconBarChart size={15} />, label: 'Analytics' },
            { to: '/admin/settings', icon: <IconSettings size={15} />, label: 'Settings' },
            { to: '/admin/activity', icon: <IconActivity size={15} />, label: 'Activity Log' },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link" onClick={closeSidebar}>
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="sidebar__badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar sidebar__avatar--admin">
              <span>{profile?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{profile?.name}</span>
              <span className="sidebar__user-role sidebar__user-role--admin">Admin</span>
            </div>
          </div>
          <button className="sidebar__theme-btn" onClick={toggleTheme}>
            {isDark ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>
          <button className="sidebar__logout" onClick={handleLogout}>
            <IconLogout size={14} /> Logout
          </button>
        </div>
      </aside>

      <div className="sidebar-layout__content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className={`mobile-topbar__menu${sidebarOpen ? " mobile-topbar__menu--open" : ""}`} onClick={() => setSidebarOpen(true)}>
            <IconMenu size={20} />
          </button>
          <LogoSVG height={22} />
          <span className="sidebar__admin-tag">ADMIN</span>
        </div>
        <main className="sidebar-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
