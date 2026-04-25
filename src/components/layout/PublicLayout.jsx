import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logoutUser } from '../../firebase/auth'
import { LogoSVG, IconSun, IconMoon, IconMenu, IconX } from '../ui/Icons'
import toast from 'react-hot-toast'
import './PublicLayout.css'

const PublicLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="public-layout">
      <header className="navbar">
        <div className="container navbar__inner">
          <NavLink to="/" className="navbar__logo">
            <LogoSVG height={28} />
          </NavLink>
          <nav className="navbar__links">
            <a href="/#hero" className="navbar__link">Home</a>
            <NavLink to="/about" className="navbar__link">About Us</NavLink>
            <NavLink to="/tools" className="navbar__link">Available Tools</NavLink>
            <NavLink to="/how-to-rent" className="navbar__link">How to Rent</NavLink>
            <a href="/#contact" className="navbar__link">Contact</a>
          </nav>
          <div className="navbar__actions">
            <button className="navbar__theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
            {isAuthenticated ? (
              <>
                <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="btn btn--ghost btn--sm">
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </NavLink>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/auth" className="btn btn--ghost btn--sm">Login</NavLink>
                <NavLink to="/auth?mode=register" className="btn btn--primary btn--sm">Register</NavLink>
              </>
            )}
          </div>
          <button className={`navbar__hamburger${mobileOpen ? " navbar__hamburger--open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </header>

      <div className={`mobile-nav ${mobileOpen ? 'mobile-nav--open' : ''}`}>
        <a href="/#hero" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Home</a>
        <NavLink to="/about" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>About Us</NavLink>
        <NavLink to="/tools" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Available Tools</NavLink>
        <NavLink to="/how-to-rent" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>How to Rent</NavLink>
        <a href="/#contact" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Contact</a>
        {isAuthenticated ? (
          <>
            <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="mobile-nav__link" onClick={() => setMobileOpen(false)}>
              {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </NavLink>
            <button className="mobile-nav__link mobile-nav__logout" onClick={() => { handleLogout(); setMobileOpen(false) }}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/auth" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Login</NavLink>
            <NavLink to="/auth?mode=register" className="mobile-nav__link" onClick={() => setMobileOpen(false)}>Register</NavLink>
          </>
        )}
      </div>

      <main className="public-layout__main"><Outlet /></main>

      <footer className="footer">
        <div className="container footer__inner">
          <LogoSVG height={20} />
          <nav className="footer__links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/tools">Tools</NavLink>
            <NavLink to="/how-to-rent">How to Rent</NavLink>
          </nav>
          <span className="footer__copy">© {new Date().getFullYear()} PNG Toolz. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
