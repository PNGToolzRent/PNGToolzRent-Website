import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logoutUser } from '../../firebase/auth'
import { LogoSVG, IconSun, IconMoon, IconMenu, IconX, IconGrid, IconList, IconUser, IconBox, IconLogout } from '../ui/Icons'
import toast from 'react-hot-toast'
import './SidebarLayout.css'

const DashboardLayout = () => {
  const { profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="sidebar-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <NavLink to="/" className="sidebar__logo"><LogoSVG height={22} /></NavLink>
          <button className="sidebar__close-btn" onClick={closeSidebar}><IconX size={18} /></button>
        </div>
        <nav className="sidebar__nav">
          {[
            { to: '/dashboard', end: true, icon: <IconGrid size={15} />, label: 'Overview' },
            { to: '/dashboard/orders', icon: <IconList size={15} />, label: 'My Orders' },
            { to: '/dashboard/profile', icon: <IconUser size={15} />, label: 'Profile' },
            { to: '/tools', icon: <IconBox size={15} />, label: 'Browse Tools' },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link" onClick={closeSidebar}>
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {profile?.profilePhoto
                ? <img src={profile.profilePhoto} alt={profile.name} />
                : <span>{profile?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{profile?.name}</span>
              <span className="sidebar__user-role">Client</span>
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
        <div className="mobile-topbar">
          <button className={`mobile-topbar__menu${sidebarOpen ? " mobile-topbar__menu--open" : ""}`} onClick={() => setSidebarOpen(true)}>
            <IconMenu size={20} />
          </button>
          <LogoSVG height={22} />
        </div>
        <main className="sidebar-layout__main"><Outlet /></main>
      </div>
    </div>
  )
}

export default DashboardLayout
